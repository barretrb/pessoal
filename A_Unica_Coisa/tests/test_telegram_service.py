# -*- coding: utf-8 -*-
import unittest
from unittest.mock import patch, MagicMock
from src.telegram_service import TelegramService

class TestTelegramService(unittest.TestCase):
    def test_mock_send_when_empty_chat_id(self):
        service = TelegramService(token="dummy_token", default_chat_id="")
        # Sem chat_id deve apenas rodar em mock/dry-run sem erro
        self.assertTrue(service.send_message("Teste de mensagem"))

    @patch("urllib.request.urlopen")
    def test_send_message_success(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        service = TelegramService(token="1234:ABC", default_chat_id="999999")
        result = service.send_message("Mensagem de teste", chat_id="999999")
        self.assertTrue(result)
        self.assertTrue(mock_urlopen.called)

if __name__ == "__main__":
    unittest.main()
