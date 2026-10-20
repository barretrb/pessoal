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
            calendar_id=google_cfg.get("calendar_id", "primary")
        )

        llm_cfg = self.config.get("llm", {})
        self.classifier = TaskClassifier(
            groq_api_key=llm_cfg.get("groq_api_key"),
            model=llm_cfg.get("model", "llama-3.3-70b-versatile")
        )

        wa_cfg = self.config.get("whatsapp", {})
        self.whatsapp = WhatsAppService(
            phone=wa_cfg.get("phone", ""),
            apikey=wa_cfg.get("callmebot_apikey", ""),
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

    def run_morning_routine(self, force: bool = False) -> Dict[str, Any]:
        """Executa o ritual matinal das 08:15."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        day_state = self.state.get("daily_history", {}).get(today_str, {})

        if day_state.get("morning_briefing_sent") and not force:
            print(f"[ORCHESTRATOR] Briefing matinal já enviado hoje ({today_str}).")
            return day_state

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

        # 2. Busca contrapeso pessoal
        personal_tasks = self.tasks_service.fetch_active_tasks("personal")
        eligible_personal = [t for t in personal_tasks if not t.get("syntax_metadata", {}).get("is_blocked")]
        chosen_personal = eligible_personal[0] if eligible_personal else None

        # 3. Varredura de horários livres no Google Calendar
        now = datetime.now()
        slot_info = self.calendar_service.find_best_focus_slot(now, duration_minutes=90)

        # 4. Formata e envia mensagem via WhatsApp
        msg = self.whatsapp.format_morning_briefing(
            deep_task=chosen_deep,
            reserve_task=reserve_deep,
            personal_task=chosen_personal,
            shallow_tasks=shallow_candidates,
            slot_info=slot_info
        )
        sent = self.whatsapp.send_message(msg)

        # 5. Atualiza estado
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
            "calendar_event_created": False
        }
        self._save_state()
        return self.state["daily_history"][today_str]

    def confirm_focus_block(self) -> bool:
        """Processa a resposta 'OK' do usuário para bloquear o tempo no Google Calendar."""
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
        task_info = day_state.get("chosen_deep_task", {})
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

    def run_night_checkin(self) -> bool:
        """Dispara o ritual de fechamento das 18:00."""
        today_str = datetime.now().strftime("%Y-%m-%d")
        day_state = self.state.get("daily_history", {}).get(today_str, {})

        deep_title = day_state.get("chosen_deep_task", {}).get("clean_title", "")
        personal_title = day_state.get("chosen_personal_task", {}).get("clean_title", "")

        msg = self.whatsapp.format_night_checkin(deep_title, personal_title)
        sent = self.whatsapp.send_message(msg)

        if "daily_history" not in self.state:
            self.state["daily_history"] = {}
        if today_str not in self.state["daily_history"]:
            self.state["daily_history"][today_str] = {}

        self.state["daily_history"][today_str]["night_checkin_sent"] = sent
        self._save_state()
        return sent
