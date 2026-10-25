# -*- coding: utf-8 -*-
"""
Processador de Mensagens Recebidas (Inbound Handler).
Interpreta as mensagens de texto e áudio enviadas pelo usuário via WhatsApp:
- Respostas ao ritual matinal ("OK", "Trocar por X")
- Respostas ao check-in noturno ("concluí o dominó", "fiz o contrapeso")
- Captura contínua de novas tarefas ao longo do dia (ex.: "Amanhã preciso fechar...")
"""

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

class InboundHandler:
    """Interpreta intenções do usuário e executa ações correspondentes."""

    def __init__(self, orchestrator):
        self.orchestrator = orchestrator

    def process_incoming_message(self, text: str) -> Dict[str, Any]:
        """Recebe o texto puro da mensagem do usuário e decide a ação a tomar."""
        text_clean = text.strip()
        lower = text_clean.lower()

        # 1. Intenção: Confirmação do ritual matinal ("OK", "sim", "confirmo", "pode agendar")
        if lower in ["ok", "ok!", "sim", "confirmar", "confirmo", "pode agendar", "agenda", "beleza"]:
            success = self.orchestrator.confirm_focus_block()
            if success:
                return {
                    "action": "CONFIRM_FOCUS",
                    "status": "success",
                    "reply": "🎯 Bloco de foco agendado no seu Google Calendar com sucesso!"
                }
            else:
                return {
                    "action": "CONFIRM_FOCUS",
                    "status": "not_found",
                    "reply": "⚠️ Não encontrei uma janela de foco sugerida para hoje ou ela já foi agendada."
                }

        # 2. Intenção: Substituição rápida matinal ("Trocar por X")
        if lower.startswith("trocar por") or lower.startswith("mudar para"):
            new_title = re.sub(r"^(trocar por|mudar para)\s*", "", text_clean, flags=re.IGNORECASE).strip()
            # Registra no estado como novo foco
            today_str = datetime.now().strftime("%Y-%m-%d")
            day_state = self.orchestrator.state.setdefault("daily_history", {}).setdefault(today_str, {})
            day_state["chosen_deep_task"] = {
                "clean_title": new_title,
                "raw_title": new_title,
                "inferred_metadata": {"work_type": "DEEP_WORK", "leverage_score": 5}
            }
            self.orchestrator._save_state()
            return {
                "action": "SWAP_TASK",
                "status": "success",
                "reply": f"🔄 Foco do dia atualizado para: *{new_title}*! Responda *\"OK\"* se desejar bloquear a agenda."
            }

        # 3. Intenção: Resposta ao Fechamento Noturno
        if any(w in lower for w in ["concluí", "conclui", "derrubei", "terminei", "feito", "fiz"]):
            completed_pro = any(w in lower for w in ["dominó", "domino", "profissional", "1", "ambos", "tudo", "os dois", "ambas"])
            completed_pes = any(w in lower for w in ["pessoal", "contrapeso", "2", "ambos", "tudo", "os dois", "ambas"])

            today_str = datetime.now().strftime("%Y-%m-%d")
            day_state = self.orchestrator.state.get("daily_history", {}).get(today_str, {})
            replies = []

            if completed_pro:
                deep_info = day_state.get("chosen_deep_task", {})
                task_id = deep_info.get("task_id")
                if task_id:
                    try:
                        self.orchestrator.tasks_service.complete_task("professional", task_id)
                    except Exception as e:
                        print(f"[INBOUND] Falha ao marcar task no Google Tasks: {e}")
                replies.append("🏆 *Dominó Profissional Derrubado!* Excelente trabalho de alavancagem.")

            if completed_pes:
                pes_info = day_state.get("chosen_personal_task", {})
                task_id = pes_info.get("task_id")
                if task_id:
                    try:
                        self.orchestrator.tasks_service.complete_task("personal", task_id)
                    except Exception as e:
                        print(f"[INBOUND] Falha ao marcar task no Google Tasks: {e}")
                replies.append("⚖️ *Contrapeso Pessoal Cumprido!* Sua vida pessoal agradece.")

            if replies:
                day_state["completed_pro"] = completed_pro
                day_state["completed_pes"] = completed_pes
                self.orchestrator._save_state()
                return {
                    "action": "NIGHT_CHECKIN_RESPONSE",
                    "status": "success",
                    "reply": "\n".join(replies)
                }

        # 4. Intenção Padrão: Captura Contínua de Nova Tarefa (US05)
        # Exemplo: "Amanhã preciso fechar a criação dos vídeos de demonstração"
        parsed_task = self._parse_quick_capture(text_clean)
        
        # Insere a tarefa no Google Tasks
        domain_key = "personal" if parsed_task["domain"] == "PERSONAL" else "professional"
        created = None
        try:
            created = self.orchestrator.tasks_service.create_task(
                domain_key=domain_key,
                title=parsed_task["title"],
                notes=f"Capturado via WhatsApp em {datetime.now().strftime('%d/%m/%Y %H:%M')}",
                due_date=parsed_task.get("due_date")
            )
        except Exception as e:
            print(f"[INBOUND] Erro ao criar task no Google Tasks: {e}")

        domain_label = "🏠 Pessoal" if parsed_task["domain"] == "PERSONAL" else "💼 Profissional"
        due_info = f" para *{parsed_task['due_display']}*" if parsed_task.get("due_display") else ""
        
        reply_msg = (
            f"✅ Tarefa capturada e adicionada na lista {domain_label}{due_info}!\n"
            f"📌 *{parsed_task['title']}*\n"
            f"⚡ _Classificação:_ *{parsed_task['work_type']}* (Alavancagem: {parsed_task['leverage']}/5)"
        )

        return {
            "action": "CREATE_TASK",
            "status": "success",
            "parsed_task": parsed_task,
            "google_task_id": created.get("id") if created else None,
            "reply": reply_msg
        }

    def _parse_quick_capture(self, text: str) -> Dict[str, Any]:
        """Interpreta o texto capturado para extrair título limpo, data e domínio."""
        lower = text.lower()
        now = datetime.now()

        # Detecção de data relativa
        due_iso = None
        due_display = None

        if "amanhã" in lower or "amanha" in lower:
            target_dt = now + timedelta(days=1)
            due_iso = target_dt.replace(hour=18, minute=0, second=0).isoformat() + "Z"
            due_display = "amanhã"
        elif "hoje" in lower:
            due_iso = now.replace(hour=18, minute=0, second=0).isoformat() + "Z"
            due_display = "hoje"
        elif "segunda" in lower:
            days_ahead = (0 - now.weekday() + 7) % 7 or 7
            target_dt = now + timedelta(days=days_ahead)
            due_iso = target_dt.replace(hour=18, minute=0, second=0).isoformat() + "Z"
            due_display = "segunda-feira"

        # Detecção de Domínio (Pessoal vs Profissional)
        personal_keywords = ["comprar", "mercado", "treino", "academia", "médico", "consulta", "remédio", "casa", "esposa", "filho", "família", "carro", "pagar conta"]
        is_personal = any(k in lower for k in personal_keywords)
        domain = "PERSONAL" if is_personal else "PROFESSIONAL"

        # Limpeza do título (remove "amanhã preciso", "lembrar de", etc.)
        clean_title = re.sub(
            r"^(amanhã|amanha|hoje|lembrar de|preciso|favor|cadastrar|anotar|não esquecer de)\s*",
            "",
            text,
            flags=re.IGNORECASE
        ).strip()
        # Se começou com verbo de novo (ex.: "amanhã preciso fechar" -> "fechar...")
        clean_title = re.sub(r"^(preciso|lembrar de)\s*", "", clean_title, flags=re.IGNORECASE).strip()
        if clean_title:
            clean_title = clean_title[0].upper() + clean_title[1:]
        else:
            clean_title = text

        # Classificação básica do tipo de trabalho
        syntax_info = self.orchestrator.tasks_service.parse_micro_syntax(clean_title)
        temp_task = {
            "clean_title": clean_title,
            "raw_title": clean_title,
            "syntax_metadata": syntax_info
        }
        classified = self.orchestrator.classifier.classify_tasks([temp_task])[0]
        meta = classified.get("inferred_metadata", {})

        return {
            "title": clean_title,
            "domain": domain,
            "due_date": due_iso,
            "due_display": due_display,
            "work_type": meta.get("work_type", "DEEP_WORK"),
            "leverage": meta.get("leverage_score", 4)
        }
