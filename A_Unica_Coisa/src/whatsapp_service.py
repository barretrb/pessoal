# -*- coding: utf-8 -*-
"""
Serviço de Mensageria (WhatsApp).
Implementa o envio de mensagens utilizando CallMeBot (mesmo padrão do projeto Inglês)
e a formatação dos templates definidos na especificação do agente 'A Única Coisa'.
"""

import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

class WhatsAppService:
    """Responsável pela montagem e entrega das mensagens no WhatsApp."""

    def __init__(self, phone: str = "", apikey: str = "", provider: str = "callmebot"):
        self.phone = phone
        self.apikey = apikey
        self.provider = provider

    def send_message(self, message: str) -> bool:
        """Envia mensagem de texto para o WhatsApp configurado via CallMeBot ou mock local."""
        if not self.phone or not self.apikey or self.apikey.startswith("YOUR_"):
            print(f"[WHATSAPP MOCK/DRY-RUN]\n{message}\n------------------------------")
            return True

        try:
            encoded_text = urllib.parse.quote(message)
            url = f"https://api.callmebot.com/whatsapp.php?phone={self.phone}&text={encoded_text}&apikey={self.apikey}"
            req = urllib.request.Request(url, headers={"User-Agent": "A-Unica-Coisa-Agent/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.status
                return 200 <= status < 300
        except Exception as e:
            print(f"[WHATSAPP] Erro ao enviar mensagem via CallMeBot: {e}")
            return False

    @staticmethod
    def format_morning_briefing(
        deep_task: Optional[Dict[str, Any]],
        reserve_task: Optional[Dict[str, Any]],
        personal_task: Optional[Dict[str, Any]],
        shallow_tasks: List[Dict[str, Any]],
        slot_info: Dict[str, Any]
    ) -> str:
        """Formata o briefing matinal (Seção 7.2 da spec)."""
        lines = ["🎯 *A ÚNICA COISA DE HOJE*\n"]

        # 1. Dominó Profissional
        lines.append("💼 *Dominó Profissional (Manhã):*")
        if deep_task:
            title_display = deep_task.get("inferred_metadata", {}).get("suggested_slice") or deep_task.get("clean_title")
            lines.append(f"📌 *{title_display}*")
            lines.append("💡 _Por quê:_ Trabalho profundo de alta alavancagem.")
        else:
            lines.append("📌 _Nenhuma tarefa Deep Work encontrada no backlog!_")

        # Janela de foco sugerida
        if slot_info.get("start") and slot_info.get("end"):
            st_str = slot_info["start"].strftime("%H:%M")
            et_str = slot_info["end"].strftime("%H:%M")
            period_note = " (tarde)" if slot_info.get("is_fallback_afternoon") else ""
            lines.append(f"⏰ *Melhor janela hoje:* {st_str} às {et_str}{period_note}.")
        else:
            lines.append("⏰ *Aviso:* Sem janelas livres de 60m+ na agenda de hoje.")

        if reserve_task:
            lines.append(f"*(Reserva se esta estiver travada: {reserve_task.get('clean_title')})*")

        # 2. Contrapeso Pessoal
        lines.append("\n⚖️ 🏠 *Contrapeso Pessoal (Inegociável):*")
        if personal_task:
            lines.append(f"📌 *{personal_task.get('clean_title')}*")
        else:
            lines.append("📌 _Nenhum contrapeso cadastrado na lista Pessoal hoje._")

        # 3. Lote Operacional
        lines.append("\n📦 *Lote Operacional (Agrupar após as 14h):*")
        if shallow_tasks:
            for st in shallow_tasks[:3]:
                lines.append(f"  • {st.get('clean_title')}")
        else:
            lines.append("  • _Lista operacional limpa._")

        lines.append("\n👉 _Responda *\"OK\"* para eu bloquear sua agenda, ou *\"Trocar por X\"*._")
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
