# -*- coding: utf-8 -*-
import unittest
from unittest.mock import MagicMock, patch
from src.ai_coach import AICoach
from src.inbound_handler import InboundHandler

class TestAICoachAndContextValidation(unittest.TestCase):

    def setUp(self):
        self.orchestrator = MagicMock()
        self.orchestrator.state = {"daily_history": {}}
        self.orchestrator.tasks_service.parse_micro_syntax.return_value = {
            "clean_title": "Tarefa Teste",
            "is_domino": False,
            "is_blocked": False,
            "estimated_minutes": 30
        }
        self.orchestrator.tasks_service.create_task.return_value = {"id": "task_123"}
        self.orchestrator.classifier.classify_tasks.return_value = [{
            "clean_title": "Tarefa Teste",
            "inferred_metadata": {"work_type": "SHALLOW_WORK", "leverage_score": 2}
        }]

    def test_off_topic_heuristic_fallback(self):
        coach = AICoach(api_key="mock_invalid")
        # Força fallback
        res = coach._heuristic_fallback("qual a capital da França?")
        self.assertEqual(res["category"], "INVALID_OR_OFF_TOPIC")
        self.assertIn("A Única Coisa", res["reply"])
        self.assertIn("?", res["reply"])

    def test_coach_question_heuristic_fallback(self):
        coach = AICoach(api_key="mock_invalid")
        res = coach._heuristic_fallback("como posso aplicar o contrapeso se estou sobrecarregado?")
        self.assertEqual(res["category"], "COACH_QUESTION")
        self.assertIn("Única Coisa", res["reply"])
        self.assertIn("?", res["reply"])

    def test_inbound_handler_rejects_off_topic_and_asks_context_question(self):
        mock_coach = MagicMock()
        mock_coach.evaluate_input.return_value = {
            "category": "INVALID_OR_OFF_TOPIC",
            "clean_title": None,
            "domain": None,
            "reply": "🎯 Sou focado no método A Única Coisa. Qual é o seu dominó de hoje?"
        }

        handler = InboundHandler(self.orchestrator, ai_coach=mock_coach)
        result = handler.process_incoming_message("me conte uma piada sobre papagaios")

        self.assertEqual(result["action"], "INVALID_INPUT")
        self.assertEqual(result["category"], "INVALID_OR_OFF_TOPIC")
        self.assertIn("dominó", result["reply"])
        # Garante que NÃO chamou create_task por engano
        self.orchestrator.tasks_service.create_task.assert_not_called()

    def test_inbound_handler_answers_coach_question_within_context(self):
        mock_coach = MagicMock()
        mock_coach.evaluate_input.return_value = {
            "category": "COACH_QUESTION",
            "clean_title": None,
            "domain": None,
            "reply": "O segredo do efeito dominó é focar na primeira peça. Qual é a sua ação prioritária hoje?"
        }

        handler = InboundHandler(self.orchestrator, ai_coach=mock_coach)
        result = handler.process_incoming_message("qual o segredo do efeito dominó?")

        self.assertEqual(result["action"], "COACH_RESPONSE")
        self.assertEqual(result["category"], "COACH_QUESTION")
        self.assertIn("dominó", result["reply"])
        # Garante que NÃO criou task para a pergunta
        self.orchestrator.tasks_service.create_task.assert_not_called()

    def test_inbound_handler_processes_valid_task(self):
        mock_coach = MagicMock()
        mock_coach.evaluate_input.return_value = {
            "category": "TASK",
            "clean_title": "Comprar ração para cachorro",
            "domain": "PERSONAL",
            "reply": None
        }

        handler = InboundHandler(self.orchestrator, ai_coach=mock_coach)
        result = handler.process_incoming_message("preciso comprar ração para cachorro")

        self.assertEqual(result["action"], "CREATE_TASK")
        self.assertEqual(result["parsed_task"]["domain"], "PERSONAL")
        self.orchestrator.tasks_service.create_task.assert_called_once()

    def test_inbound_handler_queries_tasks_tomorrow(self):
        from datetime import datetime, timedelta
        tmrw_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        self.orchestrator.tasks_service.fetch_active_tasks.side_effect = lambda domain: [
            {"clean_title": "Tarefa Pro 1", "due_date": f"{tmrw_str}T00:00:00Z"}
        ] if domain == "professional" else []

        handler = InboundHandler(self.orchestrator)
        result = handler.process_incoming_message("quantas tarefas eu tenho para amanhã?")

        self.assertEqual(result["action"], "QUERY_AGENDA_TASKS")
        self.assertIn("Tarefa Pro 1", result["reply"])
        self.assertIn("1 tarefa(s)", result["reply"])

    def test_inbound_handler_queries_agenda_tomorrow(self):
        self.orchestrator.calendar_service.get_events_for_day.return_value = [
            {"summary": "Reunião de Alinhamento", "start": {"dateTime": "2026-11-03T10:00:00-03:00"}, "end": {"dateTime": "2026-11-03T11:00:00-03:00"}}
        ]
        handler = InboundHandler(self.orchestrator)
        result = handler.process_incoming_message("como está minha agenda para amanhã?")

        self.assertEqual(result["action"], "QUERY_AGENDA_TASKS")
        self.assertIn("Reunião de Alinhamento", result["reply"])
        self.assertIn("10:00 - 11:00", result["reply"])

if __name__ == "__main__":
    unittest.main()
