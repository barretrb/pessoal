# -*- coding: utf-8 -*-
"""
Utilitário de Fuso Horário Oficial (Brasília / UTC-3).
Garante consistência de datas e horários em servidores na nuvem (Render, Docker, AWS)
que rodam nativamente em UTC (GMT+0).
"""

from datetime import datetime, timezone, timedelta

# Fuso horário padrão de Brasília (America/Sao_Paulo: UTC-3)
BR_TIMEZONE = timezone(timedelta(hours=-3))

def get_now_br() -> datetime:
    """Retorna o datetime atual garantidamente no fuso de Brasília (UTC-3)."""
    return datetime.now(BR_TIMEZONE)

def get_today_str_br() -> str:
    """Retorna a data de hoje em Brasília no formato YYYY-MM-DD."""
    return get_now_br().strftime("%Y-%m-%d")
