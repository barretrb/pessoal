# -*- coding: utf-8 -*-
"""
Módulo de Classificação Semântica de Tarefas ("A Única Coisa").
Utiliza Groq (Llama 3.3 70B) ou heurística com verbos de ação para inferir Deep Work vs Shallow Work.
"""

import json
import re
from typing import List, Dict, Any, Optional

DEEP_WORK_VERBS = [
    "estruturar", "criar", "arquitetar", "definir", "escrever", "desenvolver",
    "planejar", "resolver", "construir", "implementar", "analisar", "modelar",
    "pesquisar", "redigir", "programar", "conectar", "orquestrar", "otimizar"
]

SHALLOW_WORK_VERBS = [
    "responder", "enviar", "cobrar", "pagar", "agendar", "revisar", "alinhar",
    "comprar", "encaminhar", "preencher", "ligar", "notificar", "lembrar", "pedir"
]

class TaskClassifier:
    """Classifica tarefas entre Deep Work e Shallow Work e infere alavancagem."""

    def __init__(self, groq_api_key: Optional[str] = None, model: str = "llama-3.3-70b-versatile"):
        self.groq_api_key = groq_api_key
        self.model = model
        self.groq_client = None

        if self.groq_api_key:
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=self.groq_api_key)
            except Exception as e:
                print(f"[CLASSIFIER] Aviso: Groq client indisponível ({e}). Usando modo heurístico.")

    def classify_tasks(self, tasks: List[Dict[str, Any]], weekly_domino: str = "") -> List[Dict[str, Any]]:
        """Classifica uma lista de tarefas enriquecendo-as com work_type, leverage_score e recorte se épico."""
        if not tasks:
            return []

        # Se houver Groq configurado, tenta classificação semântica com IA
        if self.groq_client:
            try:
                return self._classify_with_llm(tasks, weekly_domino)
            except Exception as e:
                print(f"[CLASSIFIER] Falha na chamada da Groq ({e}). Fazendo fallback heurístico.")

        # Fallback heurístico inteligente
        return [self._classify_heuristic(t, weekly_domino) for t in tasks]

    def _classify_heuristic(self, task: Dict[str, Any], weekly_domino: str = "") -> Dict[str, Any]:
        """Aplica regras heurísticas de parsing léxico caso a LLM esteja offline."""
        title = task.get("clean_title", task.get("raw_title", "")).strip().lower()
        syntax = task.get("syntax_metadata", {})

        is_domino_forced = syntax.get("is_domino", False)
        is_blocked = syntax.get("is_blocked", False)
        est_min = syntax.get("estimated_minutes")

        first_word = title.split()[0] if title else ""
        
        is_deep = any(title.startswith(v) or f" {v} " in f" {title} " for v in DEEP_WORK_VERBS)
        is_shallow = any(title.startswith(v) or f" {v} " in f" {title} " for v in SHALLOW_WORK_VERBS)

        if is_domino_forced:
            work_type = "DEEP_WORK"
            leverage = 5
        elif is_deep and not is_shallow:
            work_type = "DEEP_WORK"
            leverage = 4
        elif is_shallow:
            work_type = "SHALLOW_WORK"
            leverage = 2
        else:
            work_type = "DEEP_WORK" if len(title) > 25 else "SHALLOW_WORK"
            leverage = 3

        final_min = est_min or (90 if work_type == "DEEP_WORK" else 30)
        suggested_slice = None
        if final_min > 120:
            suggested_slice = f"Fatiar: 1ª etapa de 90 min de '{task.get('clean_title')}'"

        aligns_weekly = bool(weekly_domino and any(w in title for w in weekly_domino.lower().split() if len(w) > 4))

        task["inferred_metadata"] = {
            "work_type": work_type,
            "is_blocked": is_blocked,
            "leverage_score": leverage,
            "aligns_with_weekly_domino": aligns_weekly,
            "estimated_minutes": final_min,
            "suggested_slice": suggested_slice
        }
        return task

    def _classify_with_llm(self, tasks: List[Dict[str, Any]], weekly_domino: str = "") -> List[Dict[str, Any]]:
        """Classifica em lote usando Groq para alta precisão de alavancagem."""
        prompt_items = []
        for idx, t in enumerate(tasks):
            prompt_items.append({
                "id": idx,
                "title": t.get("clean_title", t.get("raw_title")),
                "notes": t.get("raw_notes", ""),
                "forced_domino": t.get("syntax_metadata", {}).get("is_domino", False),
                "is_blocked": t.get("syntax_metadata", {}).get("is_blocked", False),
                "explicit_minutes": t.get("syntax_metadata", {}).get("estimated_minutes")
            })

        system_prompt = (
            "Você é o motor de priorização do agente 'A Única Coisa' baseado no livro de Gary Keller.\n"
            "Sua missão é classificar cada tarefa em DEEP_WORK (tarefas de alavancagem, criação, raciocínio) "
            "ou SHALLOW_WORK (operacionais, rápidas, manutenção, comunicação).\n"
            "Retorne APENAS um JSON válido contendo um array de objetos correspondentes a cada item com os campos:\n"
            "{\n"
            '  "id": int,\n'
            '  "work_type": "DEEP_WORK" | "SHALLOW_WORK",\n'
            '  "leverage_score": int (1 a 5),\n'
            '  "estimated_minutes": int (ex: 30, 60, 90, 120),\n'
            '  "suggested_slice": string | null (se estimated_minutes > 120, sugerir recorte de 90 min)\n'
            "}"
        )

        user_content = f"Grande Dominó da Semana: '{weekly_domino}'\nTarefas:\n{json.dumps(prompt_items, ensure_ascii=False)}"

        chat_completion = self.groq_client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        resp_text = chat_completion.choices[0].message.content
        data = json.loads(resp_text)
        items_res = data if isinstance(data, list) else data.get("tasks", data.get("items", []))
        
        res_map = {item["id"]: item for item in items_res if "id" in item}

        for idx, t in enumerate(tasks):
            info = res_map.get(idx)
            if info:
                t["inferred_metadata"] = {
                    "work_type": info.get("work_type", "DEEP_WORK"),
                    "is_blocked": t.get("syntax_metadata", {}).get("is_blocked", False),
                    "leverage_score": info.get("leverage_score", 3),
                    "aligns_with_weekly_domino": False,
                    "estimated_minutes": info.get("estimated_minutes", 90),
                    "suggested_slice": info.get("suggested_slice")
                }
            else:
                self._classify_heuristic(t, weekly_domino)

        return tasks
