# -*- coding: utf-8 -*-
import unittest
from src.tasks_service import TasksService

class TestTasksParsing(unittest.TestCase):

    def test_domino_detection(self):
        result = TasksService.parse_micro_syntax("[D] Estruturar arquitetura de dados")
        self.assertTrue(result["is_domino"])
        self.assertFalse(result["is_blocked"])
        self.assertEqual(result["clean_title"], "Estruturar arquitetura de dados")

    def test_blocked_detection(self):
        result = TasksService.parse_micro_syntax("[B] Aguardar retorno jurídico sobre contrato")
        self.assertFalse(result["is_domino"])
        self.assertTrue(result["is_blocked"])
        self.assertEqual(result["clean_title"], "Aguardar retorno jurídico sobre contrato")

    def test_duration_parsing(self):
        result_min = TasksService.parse_micro_syntax("Escrever artigo técnico #90m")
        self.assertEqual(result_min["estimated_minutes"], 90)
        self.assertEqual(result_min["clean_title"], "Escrever artigo técnico")

        result_hours = TasksService.parse_micro_syntax("Planejar sprint trimestral #2h")
        self.assertEqual(result_hours["estimated_minutes"], 120)
        self.assertEqual(result_hours["clean_title"], "Planejar sprint trimestral")

    def test_combined_syntax(self):
        result = TasksService.parse_micro_syntax("[D] Finalizar MVP do agente #90min", notes="Prioridade máxima")
        self.assertTrue(result["is_domino"])
        self.assertFalse(result["is_blocked"])
        self.assertEqual(result["estimated_minutes"], 90)
        self.assertEqual(result["clean_title"], "Finalizar MVP do agente")

if __name__ == "__main__":
    unittest.main()
