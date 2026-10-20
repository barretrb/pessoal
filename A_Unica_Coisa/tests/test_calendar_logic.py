# -*- coding: utf-8 -*-
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock
from src.calendar_service import CalendarService

class TestCalendarLogic(unittest.TestCase):

    def setUp(self):
        self.mock_auth = MagicMock()
        self.service = CalendarService(self.mock_auth)

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

if __name__ == "__main__":
    unittest.main()
