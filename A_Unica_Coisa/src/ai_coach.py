# -*- coding: utf-8 -*-
"""
Motor de Inteligência e Coach do Agente "A Única Coisa".
Baseado nos princípios do livro The ONE Thing (Gary Keller e Jay Papasan).
Avalia mensagens recebidas, filtra entradas inválidas ou fora de contexto,
responde como mentor de foco e direciona novas tarefas legítimas.
"""

import os
import json
import requests
from typing import Dict, Any, Optional

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"

def _load_groq_key() -> str:
    """Busca a chave Groq via variável de ambiente ou configuração local."""
    key = os.environ.get("GROQ_API_KEY")
    if key:
        return key
    
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "Inglês", "Automacao", "config_ia.json"),
        os.path.join(os.path.dirname(__file__), "..", "config", "config.json"),
        os.path.join(os.path.expanduser("~"), ".groq", "credentials.json")
    ]
    for p in candidates:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            try:
                with open(abs_p, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                    val = cfg.get("GROQ_API_KEY") or cfg.get("groq_api_key")
                    if val:
                        return val
            except Exception:
                pass
    return ""

SYSTEM_PROMPT = """Você é o motor de inteligência e Coach do Agente "A Única Coisa" (The ONE Thing, de Gary Keller e Jay Papasan).
Sua missão é avaliar a mensagem do usuário (Rafael) e classificá-la rigorosamente em UMA destas 3 categorias:

1. "TASK": O usuário quer cadastrar ou lembrar de uma tarefa/ação a fazer (ex: "comprar café", "enviar proposta para o cliente", "preciso pagar o boleto do condomínio amanhã", "estudar capítulo 4 de inglês", "agendar dentista").
2. "COACH_QUESTION": O usuário está fazendo uma pergunta, reflexão ou pedindo orientação sobre foco, priorização, o efeito dominó, time blocking (bloqueio de agenda), contrapeso, hábitos, Deep Work ou princípios do livro "A Única Coisa".
3. "INVALID_OR_OFF_TOPIC": Qualquer mensagem fora do escopo de foco e produtividade (ex: perguntas gerais tipo "qual a capital da França", conversa fiada, piadas, futebol, política, notícias gerais, "bom dia tudo bem", frases desconexas ou sem sentido).

Diretrizes de resposta:
- Se "TASK": no campo "reply", retorne null. Extraia o título limpo em "clean_title" e o domínio ("PERSONAL" ou "PROFESSIONAL") em "domain".
- Se "COACH_QUESTION": dê uma resposta afiada, direta e prática fundamentada nos ensinamentos do livro (máximo 2 a 3 frases) e OBRIGATORIAMENTE termine fazendo uma pergunta reflexiva de foco estritamente dentro do contexto.
- Se "INVALID_OR_OFF_TOPIC": explique gentilmente e com firmeza que você é um agente de foco exclusivo da metodologia A Única Coisa e gestão de tarefas/agenda, e faça uma pergunta de foco trazendo o usuário de volta para o dominó dele.

Responda SEMPRE em formato JSON válido:
{
  "category": "TASK" | "COACH_QUESTION" | "INVALID_OR_OFF_TOPIC",
  "clean_title": "string ou null",
  "domain": "PERSONAL" | "PROFESSIONAL" | null,
  "reply": "string ou null"
}
"""

class AICoach:
    """Classificador de intenções e Mentor de foco baseado em LLM."""

    def __init__(self, api_key: Optional[str] = None, model: str = DEFAULT_MODEL):
        self.api_key = api_key or _load_groq_key()
        self.model = model

    def evaluate_input(self, text: str) -> Dict[str, Any]:
        """Classifica a entrada do usuário e gera resposta de coaching ou invalidação contextual."""
        text_clean = text.strip()
        if not text_clean:
            return {
                "category": "INVALID_OR_OFF_TOPIC",
                "clean_title": None,
                "domain": None,
                "reply": "🎯 Qual é A Única Coisa que você pode fazer hoje de modo que, ao fazê-la, tudo o mais se torne mais fácil ou desnecessário?"
            }

        if not self.api_key:
            return self._heuristic_fallback(text_clean)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text_clean}
            ],
            "temperature": 0.2
        }

        try:
            resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return {
                    "category": parsed.get("category", "TASK"),
                    "clean_title": parsed.get("clean_title"),
                    "domain": parsed.get("domain"),
                    "reply": parsed.get("reply")
                }
        except Exception as e:
            print(f"[AI_COACH] Aviso: Falha na chamada da Groq ({e}). Usando fallback heurístico.")

        # Fallback Heurístico Robusto caso a API esteja indisponível
        return self._heuristic_fallback(text_clean)

    def _heuristic_fallback(self, text: str) -> Dict[str, Any]:
        """Classificação heurística caso a LLM esteja offline."""
        lower = text.lower()

        # Palavras-chave típicas de perguntas/curiosidades fora de escopo
        off_topic_triggers = ["capital", "piada", "futebol", "tempo hoje", "clima", "política", "presidente"]
        if any(t in lower for t in off_topic_triggers):
            return {
                "category": "INVALID_OR_OFF_TOPIC",
                "clean_title": None,
                "domain": None,
                "reply": "🎯 Meu papel é te ajudar a manter o foco absoluto no método *A Única Coisa* e gerenciar suas tarefas e agenda. Não consigo responder sobre outros temas.\n\n👉 *Qual é a prioridade ou dominó que você quer destravar hoje?*"
            }

        # Palavras-chave de perguntas sobre o método
        coach_triggers = ["contrapeso", "dominó", "única coisa", "unica coisa", "hábito", "habito", "time block", "bloco de foco", "gary keller"]
        if any(t in lower for t in coach_triggers) and ("?" in text or "como" in lower or "o que" in lower or "qual" in lower):
            return {
                "category": "COACH_QUESTION",
                "clean_title": None,
                "domain": None,
                "reply": "🎯 *Princípio d'A Única Coisa:* Sucesso não é fazer tudo, é fazer o que realmente importa primeiro. Quando você derruba o dominó prioritário, o resto fica mais fácil ou desnecessário.\n\n👉 *Qual é a única ação que você precisa proteger hoje no seu calendário?*"
            }

        # Default: Tarefa
        return {
            "category": "TASK",
            "clean_title": text,
            "domain": "PERSONAL" if any(k in lower for k in ["pessoal", "casa", "comprar", "remédio"]) else "PROFESSIONAL",
            "reply": None
        }
