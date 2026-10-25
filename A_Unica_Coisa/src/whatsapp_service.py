# -*- coding: utf-8 -*-
"""
Serviço de Mensageria (WhatsApp).
Implementa o envio de mensagens utilizando CallMeBot (mesmo padrão do projeto Inglês)
e a formatação dos templates definidos na especificação do agente 'A Única Coisa'.
"""

import sys
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

# Garante suporte seguro a emojis e UTF-8 em qualquer ambiente/OS
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

class WhatsAppService:
    """Responsável pela montagem e entrega das mensagens no WhatsApp."""

    def __init__(self, phone: str = "", apikey: str = "", provider: str = "callmebot"):
        self.phone = phone
        self.apikey = apikey
        self.provider = provider

    def send_message(self, message: str) -> bool:
        """Envia mensagem de texto para o WhatsApp configurado via CallMeBot ou mock local."""
        if not self.phone or not self.apikey or self.apikey.startswith("YOUR_"):
            try:
                print(f"[WHATSAPP MOCK/DRY-RUN]\n{message}\n------------------------------")
            except Exception:
                pass
            return True

        try:
            encoded_text = urllib.parse.quote(message)
            url = f"https://api.callmebot.com/whatsapp.php?phone={self.phone}&text={encoded_text}&apikey={self.apikey}"
            req = urllib.request.Request(url, headers={"User-Agent": "A-Unica-Coisa-Agent/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.status
                return 200 <= status < 300
        except Exception as e:
            try:
                print(f"[WHATSAPP] Erro ao enviar mensagem via CallMeBot: {e}")
            except Exception:
                pass
            return False

    @staticmethod
    def format_morning_briefing(
        deep_task: Optional[Dict[str, Any]],
        reserve_task: Optional[Dict[str, Any]],
        personal_task: Optional[Any],
        shallow_tasks: List[Dict[str, Any]],
        slot_info: Dict[str, Any],
        auto_booked: bool = False
    ) -> str:
        """Formata o briefing matinal ultracompacto (foco e leitura em 4s)."""
        lines = ["🎯 *A ÚNICA COISA DE HOJE*\n"]

        # 1. Dominó Profissional
        if deep_task:
            title_display = deep_task.get("inferred_metadata", {}).get("suggested_slice") or deep_task.get("clean_title")
            lines.append(f"💼 *Dominó:* {title_display}")
        else:
            lines.append("💼 *Dominó:* _Nenhum dominó no backlog_")

        # Janela de foco sugerida
        if slot_info.get("start") and slot_info.get("end"):
            st_str = slot_info["start"].strftime("%H:%M")
            et_str = slot_info["end"].strftime("%H:%M")
            period_note = " (tarde)" if slot_info.get("is_fallback_afternoon") else ""
            status_tag = "🔒 Bloqueado:" if auto_booked else "⏰ Janela:"
            lines.append(f"{status_tag} {st_str} às {et_str}{period_note}")
        else:
            lines.append("⏰ Janela: _Sem janelas de 60m+ livres hoje_")

        # 2. Contrapeso Pessoal
        if personal_task:
            if isinstance(personal_task, dict):
                p_text = personal_task.get("display_text") or personal_task.get("clean_title") or personal_task.get("original_summary")
            else:
                p_text = str(personal_task)
            lines.append(f"⚖️ *Pessoal:* {p_text}")

        # 3. Lote Operacional (Máximo 2 itens para não poluir)
        if shallow_tasks:
            primeira = shallow_tasks[0].get("clean_title")
            extras = len(shallow_tasks) - 1
            extra_text = f" (+{extras} rápida{'s' if extras > 1 else ''})" if extras > 0 else ""
            lines.append(f"📦 *Tarde:* {primeira}{extra_text}")

        if not auto_booked:
            lines.append("\n👉 _Responda *\"OK\"* para bloquear sua agenda._")
        return "\n".join(lines)

    @staticmethod
    def format_night_checkin(
        deep_task_title: str,
        personal_task_title: str
    ) -> str:
        """Formata o check-in noturno das 18:00 (Seção 7.3 da spec)."""
        lines = [
            "🌙 *Fechamento do Dia:*",
            f"1. Derrubou o dominó profissional (*{deep_task_title or 'Não definido'}*)?",
            f"2. Cumpriu seu contrapeso pessoal (*{personal_task_title or 'Não definido'}*)?",
            "\n*(Responda quais concluiu para eu dar check no Google Tasks, ou mande áudio/texto se quiser adicionar algo para amanhã).*"
        ]
        return "\n".join(lines)

    @staticmethod
    def format_weekly_planning(suggested_domino: str = "") -> str:
        """Formata o ritual de planejamento semanal de segunda-feira (Seção 7.1 da spec)."""
        lines = [
            "🧭 *Planejamento da Semana - A Única Coisa*",
            "\nOlhando sua lista 💼 Profissional, qual será o *Grande Dominó da Semana*?",
        ]
        if suggested_domino:
            lines.append(f"💡 _Sugestão do seu backlog:_ *{suggested_domino}*")

        lines.append("\nE na lista 🏠 Pessoal, qual o foco inegociável da semana?")
        lines.append("*(Responda confirmando ou mande um áudio/texto com o foco da semana).*")
        return "\n".join(lines)
