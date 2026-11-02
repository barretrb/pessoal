# -*- coding: utf-8 -*-
"""
Serviço de Mensageria (Telegram).
Implementa o envio e recebimento de mensagens bidirecionais via Telegram Bot API.
Suporta fallback seguro de Markdown e chamadas assíncronas/síncronas.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from typing import Optional

# Garante suporte seguro a emojis e UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

class TelegramService:
    """Responsável pelo envio e formatação de mensagens no Telegram."""

    def __init__(self, token: str = "", default_chat_id: str = ""):
        self.token = token or os.environ.get("TELEGRAM_BOT_TOKEN", "9093211511:AAEedA_icwCOlAe_yVYD7vzvhCQpz0SZ1Ss")
        self.default_chat_id = default_chat_id or os.environ.get("TELEGRAM_CHAT_ID", "")

    def send_message(self, message: str, chat_id: Optional[str] = None, parse_mode: str = "Markdown") -> bool:
        """
        Envia mensagem de texto para o chat especificado via Telegram Bot API.
        Caso o Telegram rejeite por sintaxe de Markdown, faz retry automático em texto puro.
        """
        target_chat = str(chat_id or self.default_chat_id).strip()
        if not self.token or not target_chat:
            try:
                print(f"[TELEGRAM MOCK/DRY-RUN to {target_chat}]\n{message}\n------------------------------")
            except Exception:
                pass
            return True

        url = f"https://api.telegram.org/bot{self.token}/sendMessage"

        # Tentativa 1: Com Markdown
        payload = {
            "chat_id": target_chat,
            "text": message,
            "disable_web_page_preview": True
        }
        if parse_mode:
            payload["parse_mode"] = parse_mode

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "A-Unica-Coisa-Telegram/1.0"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                return 200 <= resp.status < 300
        except urllib.error.HTTPError as he:
            # Fallback seguro: se falhar por erro de Markdown (400), tenta enviar sem formatação
            if he.code == 400 and parse_mode:
                try:
                    payload.pop("parse_mode", None)
                    fallback_data = json.dumps(payload).encode("utf-8")
                    fallback_req = urllib.request.Request(
                        url,
                        data=fallback_data,
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(fallback_req, timeout=12) as fallback_resp:
                        return 200 <= fallback_resp.status < 300
                except Exception as fb_err:
                    print(f"[TELEGRAM FALLBACK ERROR] {fb_err}")
                    return False
            print(f"[TELEGRAM HTTP ERROR] {he.code}: {he.read().decode('utf-8', errors='replace')}")
            return False
        except Exception as e:
            print(f"[TELEGRAM CONNECTION ERROR] {e}")
            return False
