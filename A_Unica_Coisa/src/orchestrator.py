# -*- coding: utf-8 -*-
"""
Orquestrador Principal do Agente "A Única Coisa".
Conecta Google Tasks, Google Calendar, Classificador LLM e WhatsApp
gerenciando estado e idempotência diária.
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from src.google_auth import GoogleAuthManager
from src.tasks_service import TasksService
from src.calendar_service import CalendarService
from src.task_classifier import TaskClassifier
from src.whatsapp_service import WhatsAppService
from src.pills_service import KnowledgePillsService

class Orchestrator:
    """Coordena o fluxo de execução dos rituais diários e semanais."""

    def __init__(self, config_path: str = "config/config.json", state_path: str = "state/state.json"):
        self.config_path = config_path
        self.state_path = state_path
        self.config = self._load_json(self.config_path, default={})
        self.state = self._load_json(self.state_path, default={})

        # Inicialização dos serviços
        google_cfg = self.config.get("google", {})
        self.auth_manager = GoogleAuthManager(
            credentials_path=google_cfg.get("credentials_path", "credentials.json"),
            token_path=google_cfg.get("token_path", "token.json")
        )

        self.tasks_service = TasksService(
            self.auth_manager,
            list_names=google_cfg.get("tasks_lists", {
                "professional": "💼 Profissional",
                "personal": "🏠 Pessoal"
            })
        )

        self.calendar_service = CalendarService(
            self.auth_manager,
            calendar_id=google_cfg.get("calendar_id", "primary"),
            professional_ical_url=google_cfg.get("professional_ical_url"),
            invite_email=google_cfg.get("invite_professional_email")
        )

        llm_cfg = self.config.get("llm", {})
        groq_key = os.environ.get("GROQ_API_KEY") or llm_cfg.get("groq_api_key")
        llm_model = os.environ.get("GROQ_MODEL") or llm_cfg.get("model", "llama-3.3-70b-versatile")
        self.classifier = TaskClassifier(
            groq_api_key=groq_key,
            model=llm_model
        )

        wa_cfg = self.config.get("whatsapp", {})
        phone = os.environ.get("WHATSAPP_PHONE") or wa_cfg.get("phone", "")
        callmebot_key = os.environ.get("CALLMEBOT_APIKEY") or wa_cfg.get("callmebot_apikey", "")
        self.whatsapp = WhatsAppService(
            phone=phone,
            apikey=callmebot_key,
            provider=wa_cfg.get("provider", "callmebot")
        )

    def _load_json(self, path: str, default: Any) -> Any:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ORCHESTRATOR] Erro ao carregar {path}: {e}")
        return default

    def _save_state(self):
        os.makedirs(os.path.dirname(os.path.abspath(self.state_path)), exist_ok=True)
        with open(self.state_path, "w", encoding="utf-8") as f:
            json.dump(self.state, f, indent=2, ensure_ascii=False)

    def run_morning_routine(self, force: bool = False, auto_book: Optional[bool] = None) -> Dict[str, Any]:
        """Executa o ritual matinal das 08:15 com suporte a Auto-Booking."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        day_state = self.state.get("daily_history", {}).get(today_str, {})

        if day_state.get("morning_briefing_sent") and not force:
            print(f"[ORCHESTRATOR] Briefing matinal já enviado hoje ({today_str}).")
            return day_state

        if auto_book is None:
            auto_book = self.config.get("preferences", {}).get("auto_book", True)

        print("[ORCHESTRATOR] Iniciando ritual matinal...")

        # 1. Busca e classifica tarefas profissionais
        pro_tasks = self.tasks_service.fetch_active_tasks("professional")
        weekly_domino = self.state.get("current_week", {}).get("domino_title", "")
        classified_pro = self.classifier.classify_tasks(pro_tasks, weekly_domino=weekly_domino)

        # Filtra bloqueadas
        eligible_pro = [t for t in classified_pro if not t.get("inferred_metadata", {}).get("is_blocked")]

        # Separa Deep e Shallow
        deep_candidates = [t for t in eligible_pro if t.get("inferred_metadata", {}).get("work_type") == "DEEP_WORK"]
        shallow_candidates = [t for t in eligible_pro if t.get("inferred_metadata", {}).get("work_type") == "SHALLOW_WORK"]

        # Ordena candidatos por leverage_score decrescente
        deep_candidates.sort(key=lambda x: x.get("inferred_metadata", {}).get("leverage_score", 0), reverse=True)

        chosen_deep = deep_candidates[0] if deep_candidates else None
        reserve_deep = deep_candidates[1] if len(deep_candidates) > 1 else None

        # 2. Busca contrapeso pessoal (Google Tasks + Hábitos Âncora no Calendar)
        now = datetime.now()
        personal_tasks = self.tasks_service.fetch_active_tasks("personal")
        eligible_personal = [t for t in personal_tasks if not t.get("syntax_metadata", {}).get("is_blocked")]
        chosen_personal = eligible_personal[0] if eligible_personal else None

        # Detecta hábitos âncora pessoais no Calendar com horários dinâmicos (Rafa - EF, Corrida, Academia)
        try:
            anchor_events = self.calendar_service.detect_personal_anchor_events(now)
            if anchor_events:
                anchor = anchor_events[0]
                if not chosen_personal:
                    chosen_personal = {
                        "clean_title": anchor["display_text"],
                        "display_text": anchor["display_text"],
                        "is_calendar_anchor": True
                    }
                else:
                    comb_text = f"{chosen_personal.get('clean_title')} + {anchor['display_text']}"
                    chosen_personal["display_text"] = comb_text
        except Exception as e:
            print(f"[ORCHESTRATOR] Aviso ao detectar hábitos âncora: {e}")

        # 3. Varredura de horários livres no Google Calendar (combinando pessoal + corporativo)
        slot_info = self.calendar_service.find_best_focus_slot(now, duration_minutes=90)

        # 4. Auto-booking proativo (se habilitado e slot disponível)
        calendar_event_created = False
        calendar_event_id = None
        if auto_book and slot_info.get("start") and slot_info.get("end"):
            task_info = chosen_deep or {}
            task_title = task_info.get("clean_title", "Deep Work")
            try:
                event = self.calendar_service.create_focus_block(
                    start_dt=slot_info["start"],
                    end_dt=slot_info["end"],
                    task_title=task_title,
                    notes=task_info.get("raw_notes", "")
                )
                calendar_event_created = True
                calendar_event_id = event.get("id")
                print(f"[ORCHESTRATOR] Auto-Booking realizado: evento ID {calendar_event_id}")
            except Exception as e:
                print(f"[ORCHESTRATOR] Aviso no auto-booking: {e}")

        # 5. Formata e envia mensagem via WhatsApp (Briefing Ultracompacto)
        msg = self.whatsapp.format_morning_briefing(
            deep_task=chosen_deep,
            reserve_task=reserve_deep,
            personal_task=chosen_personal,
            shallow_tasks=shallow_candidates,
            slot_info=slot_info,
            auto_booked=calendar_event_created
        )
        sent = self.whatsapp.send_message(msg)

        # 6. Atualiza estado
        if "daily_history" not in self.state:
            self.state["daily_history"] = {}

        self.state["daily_history"][today_str] = {
            "morning_briefing_sent": sent,
            "morning_timestamp": datetime.now().isoformat(),
            "chosen_deep_task": chosen_deep,
            "chosen_personal_task": chosen_personal,
            "suggested_slot": {
                "start": slot_info["start"].isoformat() if slot_info.get("start") else None,
                "end": slot_info["end"].isoformat() if slot_info.get("end") else None,
                "duration_minutes": slot_info.get("duration_minutes", 0),
                "is_fallback_afternoon": slot_info.get("is_fallback_afternoon", False)
            },
            "calendar_event_created": calendar_event_created,
            "calendar_event_id": calendar_event_id
        }
        self._save_state()
        return self.state["daily_history"][today_str]

    def confirm_focus_block(self) -> bool:
        """Processa a confirmação manual do bloco de foco no Google Calendar."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        day_state = self.state.get("daily_history", {}).get(today_str)
        if not day_state:
            print("[ORCHESTRATOR] Nenhum ritual matinal registrado para hoje.")
            return False

        if day_state.get("calendar_event_created"):
            print("[ORCHESTRATOR] Bloco de foco já agendado anteriormente.")
            return True

        slot_data = day_state.get("suggested_slot", {})
        if not slot_data.get("start") or not slot_data.get("end"):
            print("[ORCHESTRATOR] Não há janela sugerida válida para agendar.")
            return False

        start_dt = datetime.fromisoformat(slot_data["start"])
        end_dt = datetime.fromisoformat(slot_data["end"])
        task_info = day_state.get("chosen_deep_task") or {}
        task_title = task_info.get("clean_title", "Deep Work")

        event = self.calendar_service.create_focus_block(
            start_dt=start_dt,
            end_dt=end_dt,
            task_title=task_title,
            notes=task_info.get("raw_notes", "")
        )

        day_state["calendar_event_created"] = True
        day_state["calendar_event_id"] = event.get("id")
        self._save_state()

        conf_msg = f"✅ Bloco de foco reservado na sua agenda das {start_dt.strftime('%H:%M')} às {end_dt.strftime('%H:%M')} para: *{task_title}*!"
        self.whatsapp.send_message(conf_msg)
        return True

    def run_lunch_pill(self) -> bool:
        """Dispara a pílula de conhecimento completa no horário do almoço (12:30)."""
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")

        pill = KnowledgePillsService.get_daily_pill(now)
        msg = KnowledgePillsService.format_lunch_pill(pill)
        sent = self.whatsapp.send_message(msg)

        if "daily_history" not in self.state:
            self.state["daily_history"] = {}
        if today_str not in self.state["daily_history"]:
            self.state["daily_history"][today_str] = {}

        self.state["daily_history"][today_str]["lunch_pill_sent"] = sent
        self._save_state()
        return sent

    def run_night_checkin(self) -> bool:
        """Dispara o ritual de fechamento das 18:00."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        day_state = self.state.get("daily_history", {}).get(today_str, {})

        deep_title = (day_state.get("chosen_deep_task") or {}).get("clean_title", "")
        personal_title = (day_state.get("chosen_personal_task") or {}).get("clean_title", "")

        msg = self.whatsapp.format_night_checkin(deep_title, personal_title)
        sent = self.whatsapp.send_message(msg)

        if "daily_history" not in self.state:
            self.state["daily_history"] = {}
        if today_str not in self.state["daily_history"]:
            self.state["daily_history"][today_str] = {}

        self.state["daily_history"][today_str]["night_checkin_sent"] = sent
        self._save_state()
        return sent
