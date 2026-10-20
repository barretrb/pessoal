# -*- coding: utf-8 -*-
"""
Ponto de Entrada Principal (CLI) do Agente "A Única Coisa".
"""

import sys
import argparse
from datetime import datetime
from src.orchestrator import Orchestrator

def main():
    parser = argparse.ArgumentParser(description="Agente A Única Coisa - Priorizador e Rastreador Proativo")
    parser.add_argument("--morning", action="store_true", help="Dispara o ritual matinal das 08:15")
    parser.add_argument("--confirm", action="store_true", help="Confirma o bloco de foco no Google Calendar (ação 'OK')")
    parser.add_argument("--night", action="store_true", help="Dispara o check-in noturno das 18:00")
    parser.add_argument("--weekly", action="store_true", help="Dispara o planejamento semanal de segunda-feira")
    parser.add_argument("--test-auth", action="store_true", help="Testa a autenticação com Google Tasks e Calendar")

    args = parser.parse_args()
    orchestrator = Orchestrator()

    if args.morning:
        orchestrator.run_morning_routine()
    elif args.confirm:
        orchestrator.confirm_focus_block()
    elif args.night:
        orchestrator.run_night_checkin()
    elif args.weekly:
        msg = orchestrator.whatsapp.format_weekly_planning()
        orchestrator.whatsapp.send_message(msg)
    elif args.test_auth:
        print("[AUTH TEST] Testando autenticação com Google Tasks e Calendar...")
        try:
            pro_id = orchestrator.tasks_service.get_or_create_list_id("professional")
            pes_id = orchestrator.tasks_service.get_or_create_list_id("personal")
            print(f"[AUTH TEST] Sucesso no Google Tasks! Lista Profissional ID: {pro_id}, Pessoal ID: {pes_id}")
            events = orchestrator.calendar_service.get_events_for_day(datetime.now())
            print(f"[AUTH TEST] Sucesso no Google Calendar! {len(events)} eventos encontrados para hoje.")
        except Exception as e:
            print(f"[AUTH TEST] Falha na autenticação: {e}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
