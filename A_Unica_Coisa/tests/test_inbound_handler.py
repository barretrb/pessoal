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
        self.mock_orch.tasks_service.move_task = MagicMock(return_value={"id": "task_123_moved"})
        self.mock_orch.tasks_service.delete_task = MagicMock(return_value=True)
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

    def test_set_domino_personal(self):
        msg = "Me dominó de hoje é finalizar a configuração dos meus agentes única coisa e biblia devocional"
        result = self.handler.process_incoming_message(msg)
        self.assertEqual(result["action"], "SET_ONE_THING")
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["domain"], "personal")
        self.assertIn("Finalizar a configuração dos meus agentes única coisa e biblia devocional", result["title"])
        self.assertIn("🏠 Pessoal", result["reply"])

    def test_correction_move_to_personal(self):
        # 1. Cria tarefa simulada
        self.handler._record_last_task("task_999", "professional", "Finalizar agentes")
        # 2. Usuário corrige lista
        correction_msg = "esse não é da lista profissional é do pessoal"
        result = self.handler.process_incoming_message(correction_msg)
        self.assertEqual(result["action"], "MOVE_TASK")
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["target_domain"], "personal")
        self.assertIn("🏠 Pessoal", result["reply"])
        self.mock_orch.tasks_service.move_task.assert_called_with(
            from_domain="professional",
            to_domain="personal",
            task_id="task_999",
            new_title="Finalizar agentes"
        )

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
