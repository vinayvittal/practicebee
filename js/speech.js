// Text-to-Speech functionality using Web Speech API

class SpeechManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.supported = 'speechSynthesis' in window;
    this.voice = null;
    this.rate = 0.85; // Slightly slower for kids
    this.pitch = 1;

    if (this.supported) {
      this.loadVoices();
      // Voices may load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    const voices = this.synth.getVoices();
    // Prefer English voices, particularly US English
    this.voice = voices.find(v => v.lang === 'en-US') ||
                 voices.find(v => v.lang.startsWith('en')) ||
                 voices[0];
  }

  speak(text, onEnd = null) {
    if (!this.supported) {
      console.warn('Speech synthesis not supported');
      if (onEnd) onEnd();
      return false;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
    return true;
  }

  speakWord(word) {
    return this.speak(word);
  }

  speakDefinition(definition) {
    return this.speak(definition);
  }

  speakWordInSentence(word, onEnd = null) {
    // Spell it out like in a spelling bee
    return this.speak(`Your word is: ${word}`, onEnd);
  }

  speakWordSlowly(word, onEnd = null) {
    if (!this.supported) {
      console.warn('Speech synthesis not supported');
      if (onEnd) onEnd();
      return false;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Speak the word 3 times at a very slow rate with pauses
    const utterance = new SpeechSynthesisUtterance(`${word} ... ${word} ... ${word}`);
    utterance.voice = this.voice;
    utterance.rate = 0.5; // Very slow for maximum clarity
    utterance.pitch = this.pitch;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
    return true;
  }

  stop() {
    if (this.supported) {
      this.synth.cancel();
    }
  }

  isSupported() {
    return this.supported;
  }
}

export const speechManager = new SpeechManager();
