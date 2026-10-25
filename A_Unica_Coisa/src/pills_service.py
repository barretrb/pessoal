# -*- coding: utf-8 -*-
"""
Serviço de Pílulas de Conhecimento do livro "A Única Coisa" (Gary Keller).
Gera ensinamentos diários aprofundados para o horário do almoço (12:30).
"""

from datetime import datetime
from typing import Dict, Any, List

PILLS: List[Dict[str, str]] = [
    {
        "concept": "A Pergunta-Foco",
        "quote": "Qual é a ÚNICA coisa que posso fazer hoje, de tal modo que, ao fazê-la, o restante se torne mais fácil ou desnecessário?",
        "action": "Não comece o dia com uma lista de 10 pendências. Encontre a que desmorona as outras."
    },
    {
        "concept": "O Efeito Dominó",
        "quote": "O sucesso é construído sequencialmente, um dominó por vez, não todos de uma vez.",
        "action": "Um dominó de 5 cm pode derrubar outro 50% maior. Pequenos focos consistentes geram avalanches de resultados."
    },
    {
        "concept": "O Mito do Multitasking",
        "quote": "Fazer duas coisas ao mesmo tempo é simplesmente a oportunidade de fazer as duas pela metade.",
        "action": "Ao entrar no seu bloco de foco, feche abas irrelevantes e silencie notificações por 90 minutos."
    },
    {
        "concept": "O Conceito de Contrapeso",
        "quote": "O equilíbrio perfeito entre vida e trabalho é uma ilusão. O segredo é o contrapeso: foco intenso no trabalho, e presença total na vida pessoal.",
        "action": "Quando estiver no trabalho profundo, mergulhe. Quando for a hora da corrida, academia ou família, não leve o laptop."
    },
    {
        "concept": "A Regra 80/20 ao Extremo",
        "quote": "Vá além do 80/20 tradicional: encontre os 20% dos 20% até chegar a UMA entrega crucial.",
        "action": "Se você tem 5 tarefas importantes hoje, apenas UMA é a mais alavancada de todas. Comece por ela."
    },
    {
        "concept": "Protegendo o Bloco de Foco",
        "quote": "Seu bloco de tempo com a sua Única Coisa é o compromisso mais importante da sua agenda.",
        "action": "Se alguém pedir uma reunião no seu horário de foco, responda com elegância: 'Já tenho um compromisso inadiável nesse horário, podemos às 14h?'"
    },
    {
        "concept": "A Regra dos 66 Dias",
        "quote": "A disciplina dura não precisa ser eterna: são necessários em média 66 dias para instalar um hábito.",
        "action": "Não exija perfeição em tudo. Dedique sua força de vontade apenas para manter o ritual matinal e noturno."
    },
    {
        "concept": "O Primeiro Ladrão: Dizer 'Sim' Demais",
        "quote": "Dizer 'sim' para a sua Única Coisa exige dizer 'não' para centenas de outras boas oportunidades.",
        "action": "Proteger seu tempo exige a coragem de recusar demandas secundárias de terceiros pela manhã."
    },
    {
        "concept": "O Segundo Ladrão: O Medo do Caos",
        "quote": "Quando você foca no que realmente importa, coisas secundárias vão acumular temporariamente. Isso é normal.",
        "action": "Deixe o lote operacional (emails, mensagens rápidas, alinhamentos) para o bloco da tarde."
    },
    {
        "concept": "Propósito e Prioridade",
        "quote": "Quem não define sua prioridade do dia vira prioridade na agenda de outra pessoa.",
        "action": "Defina o dominó antes de abrir a caixa de entrada ou o chat da squad."
    }
]

class KnowledgePillsService:
    """Gerencia a seleção e formatação das pílulas de conhecimento."""

    @staticmethod
    def get_daily_pill(target_date: datetime = None) -> Dict[str, str]:
        """Seleciona a pílula do dia com base no dia do ano para rotação natural e consistente."""
        dt = target_date or datetime.now()
        day_of_year = dt.timetuple().tm_yday
        index = day_of_year % len(PILLS)
        return PILLS[index]

    @staticmethod
    def format_lunch_pill(pill: Dict[str, str]) -> str:
        """Formata a pílula para leitura tranquila durante o almoço (12:30)."""
        return (
            f"🍽️ 🧠 *Pausa do Almoço: A Única Coisa*\n\n"
            f"📌 *{pill['concept']}*\n\n"
            f"_{pill['quote']}_\n\n"
            f"💡 *Dica prática para a tarde:* {pill['action']}\n\n"
            f"*(Aproveite o almoço e recarregue a energia para fechar o dia em alta!)*"
        )
