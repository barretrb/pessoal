# -*- coding: utf-8 -*-
import unittest
from unittest.mock import MagicMock
from src.inbound_handler import InboundHandler

class TestInboundHandler(unittest.TestCase):

    def setUp(self):
        self.mock_orch = MagicMock()
        self.mock_orch.state = {"daily_history": {}}
        self.mock_orch.tasks_service.parse_micro_syntax = MagicMock(return_value={
            "clean_title": "Fechar a criação dos vídeos de demonstração",
            "is_domino": False,
            "is_blocked": False,
            "estimated_minutes": 90
        })
        self.mock_orch.classifier.classify_tasks = MagicMock(return_value=[{
            "inferred_metadata": {"work_type": "DEEP_WORK", "leverage_score": 5}
        }])
        self.mock_orch.tasks_service.create_task = MagicMock(return_value={"id": "task_123"})
        self.handler = InboundHandler(self.mock_orch)

    def test_ok_confirmation(self):
        self.mock_orch.confirm_focus_block.return_value = True
        result = self.handler.process_incoming_message("OK")
        self.assertEqual(result["action"], "CONFIRM_FOCUS")
        self.assertEqual(result["status"], "success")

    def test_quick_capture_user_phrase(self):
        user_msg = "Amanhã preciso fechar a criação dos vídeos de demonstração"
        result = self.handler.process_incoming_message(user_msg)
        self.assertEqual(result["action"], "CREATE_TASK")
        self.assertEqual(result["status"], "success")
        self.assertIn("Fechar a criação dos vídeos de demonstração", result["reply"])
        self.assertEqual(result["parsed_task"]["domain"], "PROFESSIONAL")
        self.assertEqual(result["parsed_task"]["due_display"], "amanhã")

    def test_swap_task(self):
        result = self.handler.process_incoming_message("Trocar por Estruturar arquitetura de eventos")
        self.assertEqual(result["action"], "SWAP_TASK")
        self.assertIn("Estruturar arquitetura de eventos", result["reply"])

    def test_night_checkin_completion(self):
        result = self.handler.process_incoming_message("Derrubei o dominó com sucesso!")
        self.assertEqual(result["action"], "NIGHT_CHECKIN_RESPONSE")
        self.assertIn("Dominó Profissional Derrubado", result["reply"])

if __name__ == "__main__":
    unittest.main()
