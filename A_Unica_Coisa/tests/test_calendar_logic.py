# -*- coding: utf-8 -*-
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
from src.calendar_service import CalendarService

class TestCalendarLogic(unittest.TestCase):

    def setUp(self):
        self.mock_auth = MagicMock()
        self.service = CalendarService(
            self.mock_auth,
            professional_ical_url="https://fake.url/basic.ics",
            invite_email="rafael.barreto@blip.ai"
        )

    def test_find_morning_slot_when_empty(self):
        # Agenda completamente livre
        self.service.get_events_for_day = MagicMock(return_value=[])
        today = datetime(2026, 10, 21, 8, 0, tzinfo=timezone.utc)

        slot = self.service.find_best_focus_slot(today, duration_minutes=90)
        self.assertEqual(slot["period"], "morning")
        self.assertFalse(slot["is_fallback_afternoon"])
        self.assertEqual(slot["duration_minutes"], 90)
        self.assertEqual(slot["start"].hour, 8)
        self.assertEqual(slot["start"].minute, 30)

    def test_fallback_to_afternoon_when_morning_busy(self):
        # Manhã totalmente bloqueada por reunião das 08:30 às 12:30
        today = datetime(2026, 10, 21, 8, 0, tzinfo=timezone.utc)
        self.service.get_events_for_day = MagicMock(return_value=[
            {
                "start": {"dateTime": "2026-10-21T08:30:00+00:00"},
                "end": {"dateTime": "2026-10-21T12:30:00+00:00"}
            }
        ])

        slot = self.service.find_best_focus_slot(today, duration_minutes=90)
        self.assertEqual(slot["period"], "afternoon")
        self.assertTrue(slot["is_fallback_afternoon"])
        self.assertEqual(slot["start"].hour, 13)
        self.assertEqual(slot["start"].minute, 30)

    def test_parse_ical_datetime(self):
        tz = timezone.utc
        dt_utc = self.service._parse_ical_datetime("20261021T143000Z", tz)
        self.assertIsNotNone(dt_utc)
        self.assertEqual(dt_utc.year, 2026)
        self.assertEqual(dt_utc.month, 10)
        self.assertEqual(dt_utc.day, 21)
        self.assertEqual(dt_utc.hour, 14)
        self.assertEqual(dt_utc.minute, 30)

        dt_allday = self.service._parse_ical_datetime("20261021", tz)
        self.assertIsNotNone(dt_allday)
        self.assertEqual(dt_allday.day, 21)
        self.assertEqual(dt_allday.hour, 0)

    @patch("urllib.request.urlopen")
    def test_fetch_ical_events_for_day(self, mock_urlopen):
        fake_ics = (
            "BEGIN:VCALENDAR\n"
            "BEGIN:VEVENT\n"
            "SUMMARY:Reunião Alinhamento\n"
            "DTSTART:20261021T130000Z\n"
            "DTEND:20261021T140000Z\n"
            "END:VEVENT\n"
            "END:VCALENDAR\n"
        )
        mock_response = MagicMock()
        mock_response.read.return_value = fake_ics.encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        today = datetime(2026, 10, 21, 0, 0, tzinfo=timezone.utc)
        events = self.service._fetch_ical_events_for_day(today, timezone.utc)
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["summary"], "Reunião Alinhamento")

if __name__ == "__main__":
    unittest.main()
