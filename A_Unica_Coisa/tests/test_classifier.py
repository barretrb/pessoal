# -*- coding: utf-8 -*-
import unittest
from src.task_classifier import TaskClassifier

class TestTaskClassifier(unittest.TestCase):

    def setUp(self):
        # Inicializa sem chave de API para validar motor heurístico determinístico
        self.classifier = TaskClassifier()

    def test_deep_work_heuristic(self):
        tasks = [{
            "raw_title": "Arquitetar banco de dados relacional",
            "clean_title": "Arquitetar banco de dados relacional",
            "syntax_metadata": {"is_domino": False, "is_blocked": False, "estimated_minutes": None}
        }]
        result = self.classifier.classify_tasks(tasks)
        meta = result[0]["inferred_metadata"]
        self.assertEqual(meta["work_type"], "DEEP_WORK")
        self.assertGreaterEqual(meta["leverage_score"], 4)

    def test_shallow_work_heuristic(self):
        tasks = [{
            "raw_title": "Responder emails de fornecedores",
            "clean_title": "Responder emails de fornecedores",
            "syntax_metadata": {"is_domino": False, "is_blocked": False, "estimated_minutes": None}
        }]
        result = self.classifier.classify_tasks(tasks)
        meta = result[0]["inferred_metadata"]
        self.assertEqual(meta["work_type"], "SHALLOW_WORK")
        self.assertLessEqual(meta["leverage_score"], 3)

    def test_epic_task_slice(self):
        tasks = [{
            "raw_title": "Escrever livro técnico completo #4h",
            "clean_title": "Escrever livro técnico completo",
            "syntax_metadata": {"is_domino": False, "is_blocked": False, "estimated_minutes": 240}
        }]
        result = self.classifier.classify_tasks(tasks)
        meta = result[0]["inferred_metadata"]
        self.assertIsNotNone(meta["suggested_slice"])
        self.assertIn("Fatiar", meta["suggested_slice"])

if __name__ == "__main__":
    unittest.main()
