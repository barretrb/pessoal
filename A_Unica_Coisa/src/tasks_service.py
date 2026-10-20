# -*- coding: utf-8 -*-
"""
Serviço de Integração com Google Tasks API.
Gerencia a leitura das listas (Profissional e Pessoal), parser de micro-sintaxe e conclusões.
"""

import re
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any

class TasksService:
    """Interface de alto nível para manipulação de listas e tarefas no Google Tasks."""

    def __init__(self, google_auth_manager, list_names: Optional[Dict[str, str]] = None):
        self.auth_manager = google_auth_manager
        self.service = self.auth_manager.get_tasks_service()
        self.list_names = list_names or {
            "professional": "💼 Profissional",
            "personal": "🏠 Pessoal"
        }
        self._list_cache: Dict[str, str] = {}

    def get_or_create_list_id(self, domain_key: str) -> str:
        """Localiza o ID da lista pelo nome configurado ou a cria se não existir."""
        target_title = self.list_names.get(domain_key, domain_key)

        if target_title in self._list_cache:
            return self._list_cache[target_title]

        # Busca listas existentes
        results = self.service.tasklists().list(maxResults=50).execute()
        items = results.get("items", [])

        # Match exato ou flexível (ignorando emojis e case)
        target_clean = re.sub(r"[^\w\s]", "", target_title).strip().lower()

        for item in items:
            title = item.get("title", "")
            clean_title = re.sub(r"[^\w\s]", "", title).strip().lower()
            if title == target_title or clean_title == target_clean:
                self._list_cache[target_title] = item["id"]
                return item["id"]

        # Se não encontrou, cria a lista com o título configurado
        created = self.service.tasklists().insert(body={"title": target_title}).execute()
        list_id = created["id"]
        self._list_cache[target_title] = list_id
        return list_id

    @staticmethod
    def parse_micro_syntax(title: str, notes: str = "") -> Dict[str, Any]:
        """
        Interpreta marcadores opcionais no título ou notas da tarefa:
          [D] ou !  -> Prioridade Dominó explícita
          [B] ou ⚠️  -> Bloqueada por terceiros (inelegível para foco do dia)
          #30m, #90m, #2h -> Duração estimada manual
        """
        combined = f"{title} {notes}".strip()

        # Detecção de Dominó forçado
        is_domino = bool(re.search(r"(\[D\]|\b!\b)", combined, re.IGNORECASE))

        # Detecção de Bloqueio
        is_blocked = bool(re.search(r"(\[B\]|\b\?\b|⚠️|\[BLOQUEADA?\])", combined, re.IGNORECASE))

        # Duração estimada em minutos
        estimated_minutes = None
        duration_match = re.search(r"#(\d+)\s*(mins?|horas?|min|h|m)\b", combined, re.IGNORECASE)
        if duration_match:
            val = int(duration_match.group(1))
            unit = duration_match.group(2).lower()
            if unit.startswith("h"):
                estimated_minutes = val * 60
            else:
                estimated_minutes = val

        # Limpeza do título para exibição amigável
        clean_title = re.sub(r"(\[D\]|\[B\]|⚠️|\[BLOQUEADA?\]|#\d+\s*(mins?|horas?|min|h|m)\b)", "", title, flags=re.IGNORECASE)
        clean_title = re.sub(r"\s+", " ", clean_title).strip()

        return {
            "clean_title": clean_title,
            "is_domino": is_domino,
            "is_blocked": is_blocked,
            "estimated_minutes": estimated_minutes
        }

    def fetch_active_tasks(self, domain_key: str) -> List[Dict[str, Any]]:
        """Busca todas as tarefas abertas (não concluídas) de uma lista específica."""
        list_id = self.get_or_create_list_id(domain_key)
        tasks_result = self.service.tasks().list(
            tasklist=list_id,
            showCompleted=False,
            showHidden=False,
            maxResults=100
        ).execute()

        raw_items = tasks_result.get("items", [])
        enriched = []

        for item in raw_items:
            title = item.get("title", "").strip()
            if not title:
                continue

            notes = item.get("notes", "")
            due = item.get("due")
            syntax = self.parse_micro_syntax(title, notes)

            enriched.append({
                "task_id": item["id"],
                "source_list": domain_key.upper(),
                "raw_title": title,
                "clean_title": syntax["clean_title"],
                "raw_notes": notes,
                "due_date": due,
                "syntax_metadata": {
                    "is_domino": syntax["is_domino"],
                    "is_blocked": syntax["is_blocked"],
                    "estimated_minutes": syntax["estimated_minutes"]
                }
            })

        return enriched

    def complete_task(self, domain_key: str, task_id: str) -> Dict[str, Any]:
        """Marca uma tarefa como concluída no Google Tasks."""
        list_id = self.get_or_create_list_id(domain_key)
        now_iso = datetime.now(timezone.utc).isoformat()
        body = {
            "status": "completed",
            "completed": now_iso
        }
        return self.service.tasks().patch(tasklist=list_id, task=task_id, body=body).execute()

    def create_task(self, domain_key: str, title: str, notes: str = "", due_date: Optional[str] = None) -> Dict[str, Any]:
        """Insere uma nova tarefa na lista especificada."""
        list_id = self.get_or_create_list_id(domain_key)
        body = {
            "title": title,
            "notes": notes
        }
        if due_date:
            body["due"] = due_date
        return self.service.tasks().insert(tasklist=list_id, body=body).execute()
