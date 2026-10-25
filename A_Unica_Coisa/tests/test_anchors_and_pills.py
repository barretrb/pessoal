# -*- coding: utf-8 -*-
import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from src.calendar_service import CalendarService
from src.pills_service import KnowledgePillsService

class TestAnchorsAndPills(unittest.TestCase):

    def test_dynamic_anchor_detection_changing_hours(self):
        # Simula eventos no Calendar em horários específicos
        mock_auth = MagicMock()
        service = CalendarService(mock_auth)

        # Caso 1: Aula de inglês remarcada para as 07:45 às 08:45
        service.get_events_for_day = MagicMock(return_value=[
            {
                "summary": "Rafa - EF",
                "start": {"dateTime": "2026-10-26T07:45:00-03:00"},
                "end": {"dateTime": "2026-10-26T08:45:00-03:00"}
            },
            {
                "summary": "Corrida na Orla",
                "start": {"dateTime": "2026-10-26T18:30:00-03:00"},
                "end": {"dateTime": "2026-10-26T19:30:00-03:00"}
            }
        ])

        today = datetime(2026, 10, 26, 8, 0, tzinfo=timezone.utc)
        anchors = service.detect_personal_anchor_events(today)

        self.assertEqual(len(anchors), 2)
        
        # Validação do primeiro evento (Rafa - EF)
        ef_event = anchors[0]
        self.assertEqual(ef_event["friendly_name"], "Aula de Inglês (Rafa - EF)")
        self.assertEqual(ef_event["start_str"], "07:45")
        self.assertEqual(ef_event["end_str"], "08:45")
        self.assertIn("07:45 às 08:45", ef_event["display_text"])

        # Validação do segundo evento (Corrida)
        run_event = anchors[1]
        self.assertEqual(run_event["friendly_name"], "Corrida")
        self.assertEqual(run_event["start_str"], "18:30")
        self.assertEqual(run_event["end_str"], "19:30")
        self.assertIn("18:30 às 19:30", run_event["display_text"])

    def test_knowledge_pill_generation(self):
        dt = datetime(2026, 10, 25)
        pill = KnowledgePillsService.get_daily_pill(dt)
        self.assertIn("concept", pill)
        self.assertIn("quote", pill)
        self.assertIn("action", pill)

        formatted = KnowledgePillsService.format_pill_for_whatsapp(pill)
        self.assertIn("Pílula do Livro (A Única Coisa)", formatted)
        self.assertIn(pill["concept"], formatted)

if __name__ == "__main__":
    unittest.main()
