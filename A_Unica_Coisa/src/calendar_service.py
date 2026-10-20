# -*- coding: utf-8 -*-
"""
Serviço de Integração com Google Calendar API.
Realiza a varredura de horários livres e criação de blocos de foco (Time Blocking).
"""

from datetime import datetime, time, timedelta, timezone
from typing import List, Dict, Optional, Any

class CalendarService:
    """Interface para verificação de agenda e agendamento de blocos de foco."""

    def __init__(self, google_auth_manager, calendar_id: str = "primary"):
        self.auth_manager = google_auth_manager
        self.calendar_id = calendar_id
        self.service = self.auth_manager.get_calendar_service()

    def get_events_for_day(self, target_date: datetime) -> List[Dict[str, Any]]:
        """Busca todos os compromissos agendados no dia especificado (08:00 às 19:00)."""
        tz = target_date.tzinfo or timezone.utc
        start_of_day = datetime.combine(target_date.date(), time(8, 0), tzinfo=tz).isoformat()
        end_of_day = datetime.combine(target_date.date(), time(19, 0), tzinfo=tz).isoformat()

        events_result = self.service.events().list(
            calendarId=self.calendar_id,
            timeMin=start_of_day,
            timeMax=end_of_day,
            singleEvents=True,
            orderBy="startTime"
        ).execute()

        return events_result.get("items", [])

    def find_best_focus_slot(
        self,
        target_date: datetime,
        duration_minutes: int = 90
    ) -> Dict[str, Any]:
        """
        Analisa a agenda do dia e localiza a melhor janela livre para Deep Work.
        Prioriza a manhã (08:30 às 12:00). Se não houver, busca na tarde (13:30 às 18:00).
        """
        tz = target_date.tzinfo or timezone.utc
        events = self.get_events_for_day(target_date)

        # Mapeia intervalos ocupados
        busy_intervals = []
        for ev in events:
            # Ignora eventos de dia inteiro sem horário específico
            start_raw = ev.get("start", {}).get("dateTime")
            end_raw = ev.get("end", {}).get("dateTime")
            if not start_raw or not end_raw:
                continue

            dt_start = datetime.fromisoformat(start_raw.replace("Z", "+00:00"))
            dt_end = datetime.fromisoformat(end_raw.replace("Z", "+00:00"))
            busy_intervals.append((dt_start, dt_end))

        # Ordena intervalos ocupados por início
        busy_intervals.sort(key=lambda x: x[0])

        # Define janelas candidatas: 1. Manhã (08:30 - 12:30), 2. Tarde (13:30 - 18:00)
        morning_start = datetime.combine(target_date.date(), time(8, 30), tzinfo=tz)
        morning_end = datetime.combine(target_date.date(), time(12, 30), tzinfo=tz)

        afternoon_start = datetime.combine(target_date.date(), time(13, 30), tzinfo=tz)
        afternoon_end = datetime.combine(target_date.date(), time(18, 0), tzinfo=tz)

        needed_delta = timedelta(minutes=duration_minutes)

        # Tenta encontrar primeiro na manhã
        slot = self._scan_window(morning_start, morning_end, busy_intervals, needed_delta)
        if slot:
            return {
                "period": "morning",
                "start": slot[0],
                "end": slot[1],
                "duration_minutes": duration_minutes,
                "is_fallback_afternoon": False
            }

        # Fallback para a tarde
        slot_tarde = self._scan_window(afternoon_start, afternoon_end, busy_intervals, needed_delta)
        if slot_tarde:
            return {
                "period": "afternoon",
                "start": slot_tarde[0],
                "end": slot_tarde[1],
                "duration_minutes": duration_minutes,
                "is_fallback_afternoon": True
            }

        # Se não achou de 90m, tenta um bloco reduzido de 60 minutos na tarde
        reduced_delta = timedelta(minutes=60)
        slot_reduzido = self._scan_window(afternoon_start, afternoon_end, busy_intervals, reduced_delta)
        if slot_reduzido:
            return {
                "period": "afternoon_reduced",
                "start": slot_reduzido[0],
                "end": slot_reduzido[1],
                "duration_minutes": 60,
                "is_fallback_afternoon": True
            }

        return {
            "period": "none",
            "start": None,
            "end": None,
            "duration_minutes": 0,
            "is_fallback_afternoon": False
        }

    def _scan_window(
        self,
        win_start: datetime,
        win_end: datetime,
        busy_intervals: List[Any],
        needed_delta: timedelta
    ) -> Optional[tuple]:
        """Varre uma janela temporal e retorna o primeiro bloco contínuo disponível."""
        current_cursor = win_start

        while current_cursor + needed_delta <= win_end:
            candidate_end = current_cursor + needed_delta
            # Verifica colisão com qualquer intervalo ocupado
            collision = False
            for b_start, b_end in busy_intervals:
                # Há sobreposição se candidato começa antes do fim e termina depois do início do evento
                if max(current_cursor, b_start) < min(candidate_end, b_end):
                    collision = True
                    current_cursor = max(current_cursor + timedelta(minutes=15), b_end)
                    break

            if not collision:
                return (current_cursor, candidate_end)

        return None

    def create_focus_block(
        self,
        start_dt: datetime,
        end_dt: datetime,
        task_title: str,
        notes: str = ""
    ) -> Dict[str, Any]:
        """Cria o bloco de foco 'A Única Coisa' no Google Calendar."""
        event_body = {
            "summary": f"🎯 A Única Coisa: {task_title}",
            "description": f"Bloco de foco Deep Work reservado pelo Agente 'A Única Coisa'.\n\nNotas:\n{notes}",
            "start": {
                "dateTime": start_dt.isoformat()
            },
            "end": {
                "dateTime": end_dt.isoformat()
            },
            "colorId": "11", # Vermelho tomate / destaque visual no Google Calendar
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 10}
                ]
            }
        }

        return self.service.events().insert(
            calendarId=self.calendar_id,
            body=event_body
        ).execute()
