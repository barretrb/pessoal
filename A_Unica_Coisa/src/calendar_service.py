# -*- coding: utf-8 -*-
"""
Serviço de Integração com Google Calendar API e iCal corporativo.
Realiza a varredura de horários livres e criação de blocos de foco (Time Blocking).
"""

import urllib.request
from datetime import datetime, time, timedelta, timezone
from typing import List, Dict, Optional, Any

class CalendarService:
    """Interface para verificação de agenda e agendamento de blocos de foco."""

    def __init__(
        self,
        google_auth_manager,
        calendar_id: str = "primary",
        professional_ical_url: Optional[str] = None,
        invite_email: Optional[str] = None
    ):
        self.auth_manager = google_auth_manager
        self.calendar_id = calendar_id
        self.professional_ical_url = professional_ical_url
        self.invite_email = invite_email
        self._service = None

    @property
    def service(self):
        if self._service is None:
            self._service = self.auth_manager.get_calendar_service()
        return self._service

    def _fetch_ical_events_for_day(self, target_date: datetime, tz) -> List[Dict[str, Any]]:
        """Baixa o feed iCal público/privado (ex: agenda Blip) e filtra os eventos do dia."""
        if not self.professional_ical_url:
            return []

        try:
            req = urllib.request.Request(
                self.professional_ical_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                text = resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"[CALENDAR] Aviso ao consultar iCal: {e}")
            return []

        target_day = target_date.date()
        events_blocks = []
        current = []
        in_event = False

        for line in text.splitlines():
            sline = line.strip()
            if sline == "BEGIN:VEVENT":
                in_event = True
                current = []
            elif sline == "END:VEVENT":
                in_event = False
                events_blocks.append(current)
            elif in_event:
                current.append(sline)

        ical_events = []
        for ev in events_blocks:
            summary = "Compromisso Profissional"
            dtstart_raw = ""
            dtend_raw = ""
            for l in ev:
                if l.startswith("SUMMARY:"):
                    summary = l.split(":", 1)[1]
                elif l.startswith("DTSTART"):
                    dtstart_raw = l.split(":")[-1].strip()
                elif l.startswith("DTEND"):
                    dtend_raw = l.split(":")[-1].strip()

            if not dtstart_raw:
                continue

            dt_start = self._parse_ical_datetime(dtstart_raw, default_tz=tz)
            if not dt_start:
                continue

            dt_start_local = dt_start.astimezone(tz)
            if dt_start_local.date() != target_day:
                continue

            if dtend_raw:
                dt_end = self._parse_ical_datetime(dtend_raw, default_tz=tz)
            else:
                dt_end = dt_start + timedelta(hours=1)

            dt_end_local = (dt_end or (dt_start + timedelta(hours=1))).astimezone(tz)

            ical_events.append({
                "summary": summary,
                "start": {"dateTime": dt_start_local.isoformat()},
                "end": {"dateTime": dt_end_local.isoformat()}
            })

        return ical_events

    def _parse_ical_datetime(self, dt_str: str, default_tz) -> Optional[datetime]:
        """Converte strings no padrão iCal (UTC ou local) para datetime com timezone."""
        try:
            if dt_str.endswith("Z"):
                return datetime.strptime(dt_str, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
            elif len(dt_str) == 8 and dt_str.isdigit():
                d = datetime.strptime(dt_str, "%Y%m%d").date()
                return datetime.combine(d, time(0, 0), tzinfo=default_tz)
            elif "T" in dt_str:
                clean_str = dt_str[:15]
                return datetime.strptime(clean_str, "%Y%m%dT%H%M%S").replace(tzinfo=default_tz)
        except Exception:
            return None
        return None

    def get_events_for_day(self, target_date: datetime) -> List[Dict[str, Any]]:
        """Busca compromissos agendados no dia mesclando Google Calendar API e iCal."""
        tz = target_date.tzinfo or datetime.now().astimezone().tzinfo
        start_of_day = datetime.combine(target_date.date(), time(8, 0), tzinfo=tz).isoformat()
        end_of_day = datetime.combine(target_date.date(), time(19, 0), tzinfo=tz).isoformat()

        api_events = []
        try:
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=start_of_day,
                timeMax=end_of_day,
                singleEvents=True,
                orderBy="startTime"
            ).execute()
            api_events = events_result.get("items", [])
        except Exception as e:
            # Em ambientes sem API ou offline, prossegue com os outros métodos
            pass

        ical_events = self._fetch_ical_events_for_day(target_date, tz)
        return api_events + ical_events

    def find_best_focus_slot(
        self,
        target_date: datetime,
        duration_minutes: int = 90
    ) -> Dict[str, Any]:
        """
        Analisa a agenda do dia e localiza a melhor janela livre para Deep Work.
        Prioriza a manhã (08:30 às 12:30). Se não houver, busca na tarde (13:30 às 18:00).
        """
        tz = target_date.tzinfo or datetime.now().astimezone().tzinfo
        events = self.get_events_for_day(target_date)

        # Mapeia intervalos ocupados
        busy_intervals = []
        for ev in events:
            start_raw = ev.get("start", {}).get("dateTime")
            end_raw = ev.get("end", {}).get("dateTime")
            if not start_raw or not end_raw:
                continue

            dt_start = datetime.fromisoformat(start_raw.replace("Z", "+00:00")).astimezone(tz)
            dt_end = datetime.fromisoformat(end_raw.replace("Z", "+00:00")).astimezone(tz)
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
            collision = False
            for b_start, b_end in busy_intervals:
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
        """Cria o bloco de foco 'A Única Coisa' no Google Calendar com convite opcional para trabalho."""
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

        if self.invite_email:
            event_body["attendees"] = [{"email": self.invite_email}]

        if not self.service:
            print(f"[CALENDAR] Google Calendar offline. Evento simulado para {start_dt}.")
            return {"id": "mock_event_id", "summary": event_body["summary"]}

        return self.service.events().insert(
            calendarId=self.calendar_id,
            body=event_body
        ).execute()
