# -*- coding: utf-8 -*-
"""
Servidor Webhook HTTP (FastAPI).
Permite hospedar o agente em nuvem (Render / Railway / Docker) ou rodar localmente.
Recebe mensagens do WhatsApp, dispara crons e executa o processador de intenções.
"""

import os
import sys
import json
import traceback
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse

# Garante saída UTF-8 compatível sem quebras de encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from src.orchestrator import Orchestrator
from src.inbound_handler import InboundHandler

app = FastAPI(
    title="Agente A Única Coisa - Webhook API",
    description="Servidor de Mensageria e Orquestração do Priorizador A Única Coisa",
    version="1.0.0"
)

# Inicializa orchestrator e handler
orchestrator = Orchestrator()
inbound_handler = InboundHandler(orchestrator)

def safe_send_whatsapp(message: str):
    """Envia mensagem no WhatsApp em background capturando qualquer exceção."""
    try:
        orchestrator.whatsapp.send_message(message)
    except Exception as e:
        print(f"[BACKGROUND WHATSAPP ERROR] {e}")

def safe_send_telegram(message: str, chat_id: str = ""):
    """Envia mensagem no Telegram em background capturando qualquer exceção."""
    try:
        orchestrator.telegram.send_message(message, chat_id=chat_id)
    except Exception as e:
        print(f"[BACKGROUND TELEGRAM ERROR] {e}")

@app.get("/")
def root():
    return {
        "status": "online",
        "agent": "A Única Coisa",
        "description": "One Thing Prioritizer & Tracker Webhook"
    }

@app.api_route("/health", methods=["GET", "HEAD", "POST"])
def health():
    has_google = bool(orchestrator.auth_manager.get_credentials())
    has_groq = bool(getattr(orchestrator, "ai_coach", None) and getattr(orchestrator.ai_coach, "api_key", False))
    return {
        "status": "ok",
        "google_authenticated": has_google,
        "ai_coach_configured": has_groq
    }

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Recebe payloads de WhatsApp.
    Compatível com Evolution API, Z-API, Twilio e simuladores JSON simples.
    """
    try:
        body_bytes = await request.body()
        try:
            body_str = body_bytes.decode("utf-8")
        except UnicodeDecodeError:
            body_str = body_bytes.decode("latin-1", errors="replace")

        try:
            payload = json.loads(body_str) if body_str else {}
        except Exception:
            form = await request.form()
            payload = dict(form)

        # Extração flexível de mensagem de texto
        incoming_text = ""
        if isinstance(payload, dict):
            incoming_text = (
                payload.get("text") or
                payload.get("message") or
                payload.get("body") or
                payload.get("data", {}).get("message", {}).get("conversation") or
                payload.get("data", {}).get("message", {}).get("extendedTextMessage", {}).get("text") or
                payload.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}).get("messages", [{}])[0].get("text", {}).get("body") or
                ""
            )

        if not incoming_text:
            return JSONResponse(status_code=200, content={"status": "ignored", "reason": "No text content found"})

        # Processa a mensagem com o InboundHandler
        result = inbound_handler.process_incoming_message(incoming_text)

        # Envia a resposta de volta ao WhatsApp de forma segura
        reply_text = result.get("reply")
        if reply_text:
            background_tasks.add_task(safe_send_whatsapp, reply_text)

        return JSONResponse(status_code=200, content=result)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})

def handle_telegram_inbound(text: str, chat_id: str):
    """Processa a mensagem em background e envia resposta sem travar a conexao HTTP do Telegram."""
    try:
        result = inbound_handler.process_incoming_message(text)
        reply = result.get("reply")
        if reply:
            orchestrator.telegram.send_message(reply, chat_id=chat_id)
    except Exception as e:
        print(f"[BACKGROUND TELEGRAM PROCESSING ERROR] {e}")
        traceback.print_exc()

@app.post("/webhook/telegram")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Recebe mensagens enviadas pelo usuário no Telegram Bot.
    Responde 200 OK imediatamente para evitar timeout de 5s no Telegram e processa em background.
    """
    try:
        data = await request.json()
        message = data.get("message") or data.get("edited_message")
        if not message:
            return JSONResponse(status_code=200, content={"status": "ignored", "reason": "No message in update"})

        chat = message.get("chat", {})
        chat_id = str(chat.get("id"))
        user_text = message.get("text", "").strip()

        if not user_text:
            return JSONResponse(status_code=200, content={"status": "ignored", "reason": "Empty text"})

        # Comando /start
        if user_text == "/start":
            welcome_text = (
                "🎯 *Olá! Sou seu Agente 'A Única Coisa'.*\n\n"
                "Estou conectado e pronto para ajudar a blindar o seu foco e gerenciar suas prioridades diárias.\n\n"
                "💬 *O que você pode me dizer a qualquer momento:*\n"
                "• _'Amanhã preciso preparar a apresentação de diretoria às 10h'_\n"
                "• _'Minha Única Coisa hoje é fechar o relatório fiscal'_\n"
                "• _'Finalizei meu dominó de hoje!'_\n"
                "• _'Quais são minhas tarefas de hoje?'_\n\n"
                "Qual é o seu maior dominó para hoje?"
            )
            background_tasks.add_task(safe_send_telegram, welcome_text, chat_id)
            return JSONResponse(status_code=200, content={"status": "ok", "action": "welcome"})

        # Dispara processamento em background com latência zero para o webhook
        background_tasks.add_task(handle_telegram_inbound, user_text, chat_id)
        return JSONResponse(status_code=200, content={"status": "accepted"})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=200, content={"status": "error_handled", "error": str(e)})

@app.api_route("/cron/morning", methods=["GET", "POST"])
def trigger_morning_cron(force: bool = False):
    """Disparo do ritual matinal das 08:15."""
    try:
        result = orchestrator.run_morning_routine(force=force)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.api_route("/cron/lunch", methods=["GET", "POST"])
def trigger_lunch_cron():
    """Disparo da pílula do livro no horário do almoço (12:30)."""
    try:
        sent = orchestrator.run_lunch_pill()
        return {"status": "success", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.api_route("/cron/night", methods=["GET", "POST"])
def trigger_night_cron():
    """Disparo do fechamento noturno das 18:00."""
    try:
        sent = orchestrator.run_night_checkin()
        return {"status": "success", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.api_route("/cron/weekly", methods=["GET", "POST"])
def trigger_weekly_cron():
    """Disparo do planejamento semanal de segunda-feira."""
    try:
        msg = orchestrator.whatsapp.format_weekly_planning()
        sent = orchestrator.whatsapp.send_message(msg)
        return {"status": "success", "sent": sent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
