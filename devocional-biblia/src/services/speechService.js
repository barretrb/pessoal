// Serviço de Narração em Áudio da Bíblia via Web Speech API Nativa

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentVerseIndex = 0;
    this.versesList = [];
    this.onVerseHighlight = null;
    this.onStatusChange = null;

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  isSupported() {
    return !!this.synth;
  }

  loadVoices() {
    if (!this.synth) return [];
    const allVoices = this.synth.getVoices();
    // Priorizar vozes em Português do Brasil (pt-BR ou pt)
    const ptVoices = allVoices.filter(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt'));
    this.voices = ptVoices.length > 0 ? ptVoices : allVoices;
    
    // Escolher voz brasileira natural se disponível
    const preferredVoice = this.voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Luciana') || 
      v.name.includes('Daniel') || 
      v.name.includes('Maria') || 
      v.name.includes('Francisca')
    );
    this.selectedVoice = preferredVoice || this.voices[0] || null;
    return this.voices;
  }

  setRate(newRate) {
    this.rate = Math.min(2.0, Math.max(0.7, newRate));
    if (this.isPlaying && !this.isPaused) {
      // Reinicia o versículo atual na nova velocidade
      this.speakCurrentVerse();
    }
  }

  // Prepara e inicia a leitura de uma lista de versículos
  // verses: [ { number: 1, text: "No princípio...", title?: "..." } ]
  startReading(verses, startIndex = 0, onVerseHighlight = null, onStatusChange = null) {
    if (!this.synth) return false;
    this.stop();

    this.versesList = verses.filter(v => v && v.text);
    this.currentVerseIndex = Math.max(0, Math.min(startIndex, this.versesList.length - 1));
    this.onVerseHighlight = onVerseHighlight;
    this.onStatusChange = onStatusChange;
    this.isPlaying = true;
    this.isPaused = false;

    this.notifyStatus('playing');
    this.speakCurrentVerse();
    return true;
  }

  speakCurrentVerse() {
    if (!this.synth || !this.isPlaying || this.currentVerseIndex >= this.versesList.length) {
      this.stop();
      return;
    }

    this.synth.cancel();

    const verse = this.versesList[this.currentVerseIndex];
    if (this.onVerseHighlight) {
      this.onVerseHighlight(verse.number, this.currentVerseIndex);
    }

    // Montar texto com entonação bíblica clara
    const textToSpeak = `Versículo ${verse.number}. ${verse.text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onend = () => {
      if (!this.isPlaying || this.isPaused) return;

      if (this.currentVerseIndex + 1 < this.versesList.length) {
        this.currentVerseIndex++;
        // Pequena pausa natural de 250ms entre versículos
        setTimeout(() => {
          if (this.isPlaying && !this.isPaused) {
            this.speakCurrentVerse();
          }
        }, 250);
      } else {
        // Chegou ao fim do capítulo
        this.stop();
      }
    };

    utterance.onerror = (e) => {
      // Ignora erro de 'interrupted' ou 'canceled' ao pausar/trocar
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn("Erro no sintetizador de voz:", e);
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (!this.synth || !this.isPlaying) return;
    this.synth.cancel(); // Mais confiável em browsers mobile que synth.pause()
    this.isPaused = true;
    this.notifyStatus('paused');
  }

  resume() {
    if (!this.synth || !this.isPlaying || !this.isPaused) return;
    this.isPaused = false;
    this.notifyStatus('playing');
    this.speakCurrentVerse();
  }

  nextVerse() {
    if (this.currentVerseIndex + 1 < this.versesList.length) {
      this.currentVerseIndex++;
      this.speakCurrentVerse();
    } else {
      this.stop();
    }
  }

  prevVerse() {
    if (this.currentVerseIndex > 0) {
      this.currentVerseIndex--;
      this.speakCurrentVerse();
    } else {
      this.speakCurrentVerse();
    }
  }

  jumpToVerse(verseNumber) {
    const idx = this.versesList.findIndex(v => v.number === verseNumber);
    if (idx >= 0) {
      this.currentVerseIndex = idx;
      this.isPaused = false;
      this.isPlaying = true;
      this.notifyStatus('playing');
      this.speakCurrentVerse();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    if (this.onVerseHighlight) {
      this.onVerseHighlight(null, -1);
    }
    this.notifyStatus('stopped');
  }

  notifyStatus(status) {
    if (this.onStatusChange) {
      this.onStatusChange({
        status,
        isPlaying: this.isPlaying && !this.isPaused,
        isPaused: this.isPaused,
        currentVerse: this.versesList[this.currentVerseIndex]?.number || null,
        rate: this.rate
      });
    }
  }
}

export const speechService = new SpeechService();
