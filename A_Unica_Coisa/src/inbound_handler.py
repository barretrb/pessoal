# -*- coding: utf-8 -*-
"""
Processador de Mensagens Recebidas (Inbound Handler).
Interpreta as mensagens de texto e áudio enviadas pelo usuário via WhatsApp e Telegram:
- Correção de lista / troca ("esse não é da lista profissional é do pessoal")
- Definição explícita de foco / dominó ("meu dominó de hoje é X")
- Respostas ao ritual matinal ("OK", "Trocar por X")
- Respostas ao check-in noturno ("concluí o dominó", "fiz o contrapeso")
- Captura contínua de novas tarefas ao longo do dia (ex.: "Amanhã preciso fechar...")
"""

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List
from src.ai_coach import AICoach

class InboundHandler:
    """Interpreta intenções do usuário e executa ações correspondentes."""

    def __init__(self, orchestrator, ai_coach: Optional[AICoach] = None):
        self.orchestrator = orchestrator
        if ai_coach is not None:
            self.ai_coach = ai_coach
        elif hasattr(orchestrator, "ai_coach") and isinstance(getattr(orchestrator, "ai_coach"), AICoach):
            self.ai_coach = orchestrator.ai_coach
        else:
            self.ai_coach = AICoach()

    def process_incoming_message(self, text: str) -> Dict[str, Any]:
        """Recebe o texto puro da mensagem do usuário e decide a ação a tomar."""
        text_clean = text.strip()
        lower = text_clean.lower()

        # 1. Intenção: Correção de Lista (Troca de Profissional <-> Pessoal)
        # Ex: "esse não é da lista profissional é do pessoal", "muda para pessoal", "é no pessoal"
        correction_match = re.search(
            r"\b(esse\s+n[aã]o\s+[eé]|n[aã]o\s+[eé]|n[aã]o\s+era|mudar\s+para|mover\s+para|trocar\s+para|colocar\s+n[oa]|coloca\s+n[oa]|[eé]\s+d[oa]|[eé]\s+n[oa]|muda\s+pr[oa]|move\s+pr[oa])\b.*?\b(pessoal|profissional)\b",
            lower
        )
        is_short_correction = lower in [
            "é pessoal", "e pessoal", "no pessoal", "na pessoal", "pessoal", 
            "na verdade é pessoal", "mude para pessoal", "move para pessoal",
            "é profissional", "e profissional", "no profissional", "na profissional", "profissional"
        ]

        if correction_match or is_short_correction:
            target_domain = "personal" if "pessoal" in lower else "professional"
            source_domain = "professional" if target_domain == "personal" else "personal"
            return self._handle_list_correction(target_domain, source_domain, text_clean)

        # 2. Intenção: Confirmação do ritual matinal ("OK", "sim", "confirmo", "pode agendar")
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

        # 3. Intenção: Substituição rápida matinal ("Trocar por X")
        if lower.startswith("trocar por") or lower.startswith("mudar para"):
            new_title = re.sub(r"^(trocar por|mudar para)\s*", "", text_clean, flags=re.IGNORECASE).strip()
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

        # 4. Intenção: Declaração Explícita de Dominó ("Meu dominó de hoje é X", "Minha única coisa é X")
        domino_match = re.search(
            r"^(me\s+domin[oó]|meu\s+domin[oó]|meu\s+foco|minha\s+[uú]nica\s+coisa|minha\s+meta|meu\s+objetivo)\s*(de\s+hoje)?\s*([eé]|\:)\s*",
            text_clean,
            flags=re.IGNORECASE
        )
        if domino_match:
            clean_domino_title = text_clean[domino_match.end():].strip()
            if clean_domino_title:
                clean_domino_title = clean_domino_title[0].upper() + clean_domino_title[1:]
            return self._handle_set_one_thing(clean_domino_title, text_clean)

        # 5. Intenção: Resposta ao Fechamento Noturno (usando \b para não confundir 'feito' com 'efeito')
        if re.search(r"\b(conclu[íi]|derrubei|terminei|feito|fiz)\b", lower):
            completed_pro = bool(re.search(r"\b(domin[oó]|profissional|1|ambos|tudo|os dois|ambas)\b", lower))
            completed_pes = bool(re.search(r"\b(pessoal|contrapeso|2|ambos|tudo|os dois|ambas)\b", lower))

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

        # 6. Intenção: Consulta de Tarefas ou Agenda (Google Tasks / Google Calendar)
        is_query_tasks = bool(re.search(
            r"\b(quantas?|quais|qual|listar|ver|me\s+mostre|o\s+que\s+eu\s+tenho|o\s+que\s+tenho|tenho\s+alguma)\b.*\b(tarefas?|tasks?|pend[eê]ncias?|afazeres)\b",
            lower
        ) or re.search(r"^(minhas\s+tarefas|minhas\s+tasks|meus\s+afazeres|tarefas\s+de\s+hoje|tarefas\s+de\s+amanh[aã])\b", lower))

        is_query_calendar = bool(re.search(
            r"\b(como\s+est[aá]|quais|quantas?|que\s+horas?|me\s+mostre|ver|tenho\s+tempo)\b.*\b(agenda|calend[aá]rio|reuni[aã]o|reuni[oõ]es|compromissos?|eventos?)\b",
            lower
        ) or re.search(r"^(minha\s+agenda|meu\s+calend[aá]rio|minhas\s+reuni[oõ]es|meus\s+compromissos)\b", lower))

        if is_query_tasks or is_query_calendar:
            return self._handle_query(text_clean, is_tasks=is_query_tasks, is_calendar=is_query_calendar)

        # 7. Avaliação Inteligente de Intenção via IA (Coach vs Tarefa vs Consulta vs Inválido)
        ai_eval = self.ai_coach.evaluate_input(text_clean)
        category = ai_eval.get("category", "TASK")

        if category == "QUERY_AGENDA_TASKS":
            return self._handle_query(text_clean, is_tasks=True, is_calendar=True)

        # Se for dúvida/pergunta de coaching ou entrada inválida/fora de contexto:
        if category in ["COACH_QUESTION", "INVALID_OR_OFF_TOPIC"]:
            return {
                "action": "COACH_RESPONSE" if category == "COACH_QUESTION" else "INVALID_INPUT",
                "status": "success",
                "category": category,
                "reply": ai_eval.get("reply")
            }

        # 8. Intenção: Captura de Nova Tarefa Legítima
        parsed_task = self._parse_quick_capture(text_clean, ai_suggested=ai_eval)
        
        domain_key = "personal" if parsed_task["domain"] == "PERSONAL" else "professional"
        created = None
        try:
            created = self.orchestrator.tasks_service.create_task(
                domain_key=domain_key,
                title=parsed_task["title"],
                notes=f"Capturado via mensagem em {datetime.now().strftime('%d/%m/%Y %H:%M')}",
                due_date=parsed_task.get("due_date")
            )
        except Exception as e:
            print(f"[INBOUND] Erro ao criar task no Google Tasks: {e}")

        # Salva referência no estado para permitir correção imediata
        task_id = created.get("id") if created else None
        self._record_last_task(task_id=task_id, domain=domain_key, title=parsed_task["title"])

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
            "google_task_id": task_id,
            "reply": reply_msg
        }

    def _handle_query(self, raw_text: str, is_tasks: bool = True, is_calendar: bool = False) -> Dict[str, Any]:
        """Consulta tarefas ativas no Google Tasks e compromissos no Google Calendar."""
        lower = raw_text.lower()
        now = datetime.now()

        # Define data alvo
        if "amanhã" in lower or "amanha" in lower:
            target_dt = now + timedelta(days=1)
            target_label = f"amanhã ({target_dt.strftime('%d/%m')})"
        else:
            target_dt = now
            target_label = f"hoje ({target_dt.strftime('%d/%m')})"
        target_ymd = target_dt.strftime("%Y-%m-%d")

        replies = []

        # 1. Consulta de Tarefas no Google Tasks
        if is_tasks or any(w in lower for w in ["tarefa", "task", "pend", "afazer"]):
            try:
                pro_tasks = self.orchestrator.tasks_service.fetch_active_tasks("professional")
                pes_tasks = self.orchestrator.tasks_service.fetch_active_tasks("personal")

                pro_due = [t for t in pro_tasks if t.get("due_date", "").startswith(target_ymd)]
                pes_due = [t for t in pes_tasks if t.get("due_date", "").startswith(target_ymd)]

                total_due = len(pro_due) + len(pes_due)
                
                if total_due > 0:
                    replies.append(f"📋 *Você tem {total_due} tarefa(s) agendada(s) para {target_label}:*")
                    if pro_due:
                        replies.append("\n💼 *Profissional:*")
                        for t in pro_due:
                            replies.append(f"  • {t.get('clean_title')}")
                    if pes_due:
                        replies.append("\n🏠 *Pessoal:*")
                        for t in pes_due:
                            replies.append(f"  • {t.get('clean_title')}")
                else:
                    replies.append(f"📋 *Você não possui tarefas com vencimento marcado para {target_label}.*")

                other_pro = len(pro_tasks) - len(pro_due)
                other_pes = len(pes_tasks) - len(pes_due)
                if other_pro > 0 or other_pes > 0:
                    replies.append(f"\n_(Total ativo nas listas: {len(pro_tasks)} profissional(is), {len(pes_tasks)} pessoal(is))_")

            except Exception as e:
                print(f"[INBOUND] Erro ao consultar tarefas: {e}")
                replies.append("⚠️ Não consegui acessar o Google Tasks no momento.")

        # 2. Consulta de Agenda no Google Calendar
        if is_calendar or any(w in lower for w in ["agenda", "reuni", "compromisso", "evento", "calend"]):
            try:
                events = self.orchestrator.calendar_service.get_events_for_day(target_dt)
                if events:
                    replies.append(f"\n📅 *Seus compromissos para {target_label}:*")
                    for ev in events:
                        start_str = ev.get("start", {}).get("dateTime", "")
                        end_str = ev.get("end", {}).get("dateTime", "")
                        time_display = ""
                        if start_str and end_str:
                            try:
                                s_dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
                                e_dt = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                                time_display = f"*{s_dt.strftime('%H:%M')} - {e_dt.strftime('%H:%M')}:* "
                            except Exception:
                                pass
                        summary = ev.get("summary", "Ocupado")
                        replies.append(f"  • {time_display}{summary}")
                else:
                    replies.append(f"\n📅 *Sua agenda está totalmente livre para {target_label}!*")
            except Exception as e:
                print(f"[INBOUND] Erro ao consultar calendário: {e}")
                replies.append("⚠️ Não consegui acessar o Google Calendar no momento.")

        # Pergunta de fechamento de foco
        replies.append("\n🎯 *Qual é A Única Coisa que você precisa garantir para esse dia?*")

        return {
            "action": "QUERY_AGENDA_TASKS",
            "status": "success",
            "reply": "\n".join(replies)
        }

    def _handle_set_one_thing(self, clean_title: str, raw_text: str) -> Dict[str, Any]:
        """Processa a definição de dominó do dia com detecção refinada de lista."""
        domain = self._detect_domain(clean_title + " " + raw_text)
        domain_key = "personal" if domain == "PERSONAL" else "professional"
        domain_label = "🏠 Pessoal" if domain == "PERSONAL" else "💼 Profissional"

        today_str = datetime.now().strftime("%Y-%m-%d")
        day_state = self.orchestrator.state.setdefault("daily_history", {}).setdefault(today_str, {})

        created = None
        try:
            created = self.orchestrator.tasks_service.create_task(
                domain_key=domain_key,
                title=clean_title,
                notes=f"Dominó do dia definido em {datetime.now().strftime('%d/%m/%Y %H:%M')}"
            )
        except Exception as e:
            print(f"[INBOUND] Erro ao registrar dominó no Google Tasks: {e}")

        task_id = created.get("id") if created else None
        self._record_last_task(task_id=task_id, domain=domain_key, title=clean_title)

        day_state["chosen_deep_task"] = {
            "task_id": task_id,
            "clean_title": clean_title,
            "raw_title": clean_title,
            "domain": domain_key,
            "inferred_metadata": {"work_type": "DEEP_WORK", "leverage_score": 5}
        }
        self.orchestrator._save_state()

        reply_msg = (
            f"🎯 *Dominó Definido com Sucesso!*\n\n"
            f"Adicionado como seu foco de hoje na lista {domain_label}:\n"
            f"📌 *{clean_title}*\n\n"
            f"⚡ _Classificação:_ *DEEP_WORK* (Alavancagem Máxima: 5/5)\n"
            f"*(Responda \"OK\" a qualquer momento se desejar bloquear a agenda)*"
        )

        return {
            "action": "SET_ONE_THING",
            "status": "success",
            "title": clean_title,
            "domain": domain_key,
            "google_task_id": task_id,
            "reply": reply_msg
        }

    def _handle_list_correction(self, target_domain: str, source_domain: str, raw_text: str) -> Dict[str, Any]:
        """Corrige a lista de uma tarefa recém-criada, removendo duplicidades ou mensagens de correção criadas por engano."""
        target_label = "🏠 Pessoal" if target_domain == "personal" else "💼 Profissional"
        source_label = "💼 Profissional" if target_domain == "personal" else "🏠 Pessoal"

        last_task = self.orchestrator.state.get("last_created_task")
        task_history = self.orchestrator.state.get("task_capture_history", [])

        # Se a última tarefa capturada foi a própria frase de correção (ex: "esse não é da lista...")
        if last_task and any(w in last_task.get("title", "").lower() for w in ["não é da", "nao e da", "não é profissional", "nao e profissional", "é do pessoal"]):
            accidental_id = last_task.get("id")
            if accidental_id:
                try:
                    self.orchestrator.tasks_service.delete_task(last_task.get("domain", source_domain), accidental_id)
                except Exception as e:
                    print(f"[INBOUND] Erro ao deletar task acidental: {e}")

            # Busca a tarefa anterior real
            if len(task_history) >= 2:
                last_task = task_history[-2]
            else:
                last_task = None

        if not last_task:
            # Tenta buscar nas tarefas ativas da lista de origem
            active = self.orchestrator.tasks_service.fetch_active_tasks(source_domain)
            if active:
                last_task = {
                    "id": active[-1].get("task_id"),
                    "title": active[-1].get("clean_title"),
                    "domain": source_domain
                }

        if last_task and last_task.get("id"):
            task_id = last_task["id"]
            clean_title = last_task.get("title", "Tarefa")

            # Remove prefixos estranhos se houverem
            clean_title = re.sub(
                r"^(me\s+domin[oó]\s+de\s+hoje\s+[eé]|meu\s+domin[oó]\s+de\s+hoje\s+[eé])\s*",
                "",
                clean_title,
                flags=re.IGNORECASE
            ).strip()
            if clean_title:
                clean_title = clean_title[0].upper() + clean_title[1:]

            moved = self.orchestrator.tasks_service.move_task(
                from_domain=source_domain,
                to_domain=target_domain,
                task_id=task_id,
                new_title=clean_title
            )

            # Atualiza estado do foco do dia se era o dominó
            today_str = datetime.now().strftime("%Y-%m-%d")
            day_state = self.orchestrator.state.get("daily_history", {}).get(today_str, {})
            if day_state.get("chosen_deep_task"):
                day_state["chosen_deep_task"]["clean_title"] = clean_title
                day_state["chosen_deep_task"]["domain"] = target_domain
                if moved and moved.get("id"):
                    day_state["chosen_deep_task"]["task_id"] = moved.get("id")

            self._record_last_task(
                task_id=moved.get("id") if moved else task_id,
                domain=target_domain,
                title=clean_title
            )

            reply_msg = (
                f"🔄 *Corrigido com sucesso!*\n\n"
                f"Movi a tarefa para a lista {target_label}:\n"
                f"📌 *{clean_title}*\n\n"
                f"*(Ela foi removida da lista {source_label})*"
            )
            return {
                "action": "MOVE_TASK",
                "status": "success",
                "target_domain": target_domain,
                "title": clean_title,
                "reply": reply_msg
            }
        else:
            return {
                "action": "MOVE_TASK",
                "status": "not_found",
                "reply": f"⚠️ Não localizei a tarefa anterior para mover. Pode digitar o nome dela que adiciono direto na lista {target_label}!"
            }

    def _record_last_task(self, task_id: Optional[str], domain: str, title: str):
        """Armazena histórico das últimas tarefas capturadas para auditoria e correções."""
        record = {
            "id": task_id,
            "domain": domain,
            "title": title,
            "timestamp": datetime.now().isoformat()
        }
        self.orchestrator.state["last_created_task"] = record
        if "task_capture_history" not in self.orchestrator.state:
            self.orchestrator.state["task_capture_history"] = []
        self.orchestrator.state["task_capture_history"].append(record)
        if len(self.orchestrator.state["task_capture_history"]) > 10:
            self.orchestrator.state["task_capture_history"] = self.orchestrator.state["task_capture_history"][-10:]
        self.orchestrator._save_state()

    def _detect_domain(self, text: str) -> str:
        """Determina com precisão se a tarefa pertence ao domínio PESSOAL ou PROFISSIONAL."""
        lower = text.lower()

        # Palavras-chave explícitas
        if "profissional" in lower or "trabalho" in lower or "reunião" in lower or "squad" in lower or "cliente" in lower:
            return "PROFESSIONAL"

        personal_keywords = [
            "pessoal", "pessoais", "meus agentes", "agente", "agentes", 
            "bíblia", "biblia", "devocional", "estudo", "estudos", "inglês", "ingles", 
            "corrida", "treino", "academia", "saúde", "saude", "médico", "medico", 
            "consulta", "remédio", "remedio", "casa", "esposa", "marido", "filho", "filha", 
            "família", "familia", "carro", "supermercado", "mercado", "feira", "pagar conta"
        ]
        if any(k in lower for k in personal_keywords):
            return "PERSONAL"

        return "PROFESSIONAL"

    def _parse_quick_capture(self, text: str, ai_suggested: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
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

        # Detecção de Domínio (IA sugerida com fallback léxico)
        ai_domain = ai_suggested.get("domain") if ai_suggested else None
        if ai_domain in ["PERSONAL", "PROFESSIONAL"]:
            domain = ai_domain
        else:
            domain = self._detect_domain(text)

        # Se a IA sugeriu um clean_title conciso, usa preferencialmente
        ai_title = ai_suggested.get("clean_title") if ai_suggested else None
        if ai_title and len(ai_title.strip()) > 2:
            clean_title = ai_title.strip()
            clean_title = clean_title[0].upper() + clean_title[1:]
        else:
            # Limpeza robusta de prefixos de intenção
            clean_title = re.sub(
                r"^(me\s+domin[oó]|meu\s+domin[oó]|meu\s+foco|minha\s+[uú]nica\s+coisa|minha\s+meta|meu\s+objetivo)\s*(de\s+hoje)?\s*([eé]|\:)\s*",
                "",
                text,
                flags=re.IGNORECASE
            ).strip()

            clean_title = re.sub(
                r"^(amanhã|amanha|hoje|segunda|terça|quarta|quinta|sexta|lembrar de|preciso|favor|cadastrar|anotar|não esquecer de|adiciona|adicionar|cria|criar)\s*",
                "",
                clean_title,
                flags=re.IGNORECASE
            ).strip()

            clean_title = re.sub(r"^(preciso|lembrar de|que preciso)\s*", "", clean_title, flags=re.IGNORECASE).strip()

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
