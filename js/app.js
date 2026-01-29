// Main application logic for Spelling Bee Practice

import { words, TOTAL_WORDS } from './words.js';
import { speechManager } from './speech.js';
import { storage } from './storage.js';
import { sentences } from './sentences.js';

class SpellingBeeApp {
  constructor() {
    this.currentWord = null;
    this.currentIndex = 0;
    this.mode = 'sequential'; // 'sequential' or 'random'
    this.selectedLevel = 'all'; // 'all', 'One Bee', 'Two Bee', 'Three Bee'
    this.filteredWords = [...words]; // Words filtered by level
    this.shuffledIndices = [];
    this.hasAttempted = false;
    this.isShowingResult = false;

    // Encouraging messages
    this.correctMessages = [
      "Great job!",
      "You got it!",
      "Fantastic!",
      "Super spelling!",
      "Amazing!",
      "You're a star!",
      "Perfect!",
      "Wonderful!",
      "Keep it up!",
      "Excellent!"
    ];

    this.tryAgainMessages = [
      "Almost there!",
      "Good try!",
      "Keep practicing!",
      "You can do it!",
      "Nice effort!"
    ];

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadSavedState();
    this.updateStatsDisplay();

    // Show/hide speech button based on support
    if (!speechManager.isSupported()) {
      this.speakBtn.style.display = 'none';
    }
  }

  cacheElements() {
    // Main sections
    this.startScreen = document.getElementById('start-screen');
    this.practiceScreen = document.getElementById('practice-screen');
    this.resultScreen = document.getElementById('result-screen');

    // Start screen elements
    this.modeButtons = document.querySelectorAll('.mode-btn');
    this.levelButtons = document.querySelectorAll('.level-btn');
    this.startPositionInput = document.getElementById('start-position');
    this.maxPositionSpan = document.getElementById('max-position');
    this.startBtn = document.getElementById('start-btn');

    // Practice screen elements
    this.wordNumber = document.getElementById('word-number');
    this.wordLevel = document.getElementById('word-level');
    this.speakBtn = document.getElementById('speak-btn');
    this.sentenceBtn = document.getElementById('sentence-btn');
    this.hintBtn = document.getElementById('hint-btn');
    this.spellingInput = document.getElementById('spelling-input');
    this.checkBtn = document.getElementById('check-btn');
    this.skipBtn = document.getElementById('skip-btn');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

    // Result screen elements
    this.resultIcon = document.getElementById('result-icon');
    this.resultMessage = document.getElementById('result-message');
    this.correctSpelling = document.getElementById('correct-spelling');
    this.retryBtn = document.getElementById('retry-btn');
    this.nextBtn = document.getElementById('next-btn');

    // Stats elements
    this.streakCount = document.getElementById('streak-count');
    this.accuracyPercent = document.getElementById('accuracy-percent');

    // Set max position
    this.maxPositionSpan.textContent = TOTAL_WORDS;
    this.startPositionInput.max = TOTAL_WORDS;
  }

  bindEvents() {
    // Mode selection
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.selectMode(btn.dataset.mode));
    });

    // Level selection
    this.levelButtons.forEach(btn => {
      btn.addEventListener('click', () => this.selectLevel(btn.dataset.level));
    });

    // Start button
    this.startBtn.addEventListener('click', () => this.startPractice());

    // Position input - Enter key
    this.startPositionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.startPractice();
    });

    // Speak button
    this.speakBtn.addEventListener('click', () => this.speakWord());

    // Sentence button
    this.sentenceBtn.addEventListener('click', () => this.speakSentence());

    // Hint button
    this.hintBtn.addEventListener('click', () => this.showHint());

    // Check spelling
    this.checkBtn.addEventListener('click', () => this.checkSpelling());
    this.spellingInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkSpelling();
    });

    // Skip button
    this.skipBtn.addEventListener('click', () => this.skipWord());

    // Result screen buttons
    this.retryBtn.addEventListener('click', () => this.retryWord());
    this.nextBtn.addEventListener('click', () => this.nextWord());

    // Back/Home button
    document.getElementById('home-btn')?.addEventListener('click', () => this.goHome());
  }

  loadSavedState() {
    // Load saved mode
    this.mode = storage.getMode();
    this.selectMode(this.mode);

    // Load saved position
    const lastPos = storage.getLastPosition();
    this.startPositionInput.value = lastPos;
  }

  selectMode(mode) {
    this.mode = mode;
    storage.setMode(mode);

    this.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide position input based on mode
    const positionGroup = document.getElementById('position-group');
    if (mode === 'random') {
      positionGroup.style.opacity = '0.5';
      this.startPositionInput.disabled = true;
    } else {
      positionGroup.style.opacity = '1';
      this.startPositionInput.disabled = false;
    }
  }

  selectLevel(level) {
    this.selectedLevel = level;

    // Update button states
    this.levelButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === level);
    });

    // Filter words by level
    if (level === 'all') {
      this.filteredWords = [...words];
    } else {
      this.filteredWords = words.filter(w => w.level === level);
    }

    // Update max position display
    this.maxPositionSpan.textContent = this.filteredWords.length;
    this.startPositionInput.max = this.filteredWords.length;

    // Reset start position if it exceeds filtered count
    const currentPos = parseInt(this.startPositionInput.value) || 1;
    if (currentPos > this.filteredWords.length) {
      this.startPositionInput.value = 1;
    }
  }

  startPractice() {
    const totalFiltered = this.filteredWords.length;

    // Validate and get start position
    let startPos = parseInt(this.startPositionInput.value) || 1;
    startPos = Math.max(1, Math.min(startPos, totalFiltered));
    this.startPositionInput.value = startPos;

    if (this.mode === 'random') {
      // Shuffle all filtered word indices
      this.shuffledIndices = this.shuffleArray([...Array(totalFiltered).keys()]);
      this.currentIndex = 0;
    } else {
      // Sequential mode - start from specified position
      this.currentIndex = startPos - 1; // Convert to 0-based index
    }

    // Show practice screen
    this.startScreen.classList.add('hidden');
    this.practiceScreen.classList.remove('hidden');
    this.resultScreen.classList.add('hidden');

    // Load first word
    this.loadWord();
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  loadWord() {
    // Get the actual word index within filtered words
    let wordIndex;
    if (this.mode === 'random') {
      wordIndex = this.shuffledIndices[this.currentIndex];
    } else {
      wordIndex = this.currentIndex;
    }

    this.currentWord = this.filteredWords[wordIndex];
    this.hasAttempted = false;
    this.isShowingResult = false;

    // Update display
    this.wordNumber.textContent = `Word #${this.currentWord.id}`;
    this.wordLevel.textContent = this.currentWord.level;

    // Clear and focus input
    this.spellingInput.value = '';
    this.spellingInput.classList.remove('correct', 'incorrect');
    this.spellingInput.focus();

    // Reset hint button
    this.hintBtn.textContent = 'Show Hint';
    this.hintBtn.disabled = false;

    // Update progress
    this.updateProgress();

    // Save position for sequential mode
    if (this.mode === 'sequential') {
      storage.setLastPosition(this.currentWord.id);
    }

    // Auto-speak the word
    setTimeout(() => this.speakWord(), 300);
  }

  speakWord() {
    this.speakBtn.classList.add('speaking');
    speechManager.speakWordInSentence(this.currentWord.word, () => {
      this.speakBtn.classList.remove('speaking');
    });
  }

  speakSentence() {
    if (!this.currentWord) return;

    const sentence = sentences[this.currentWord.word];
    if (sentence) {
      this.sentenceBtn.classList.add('speaking');
      speechManager.speak(sentence, () => {
        this.sentenceBtn.classList.remove('speaking');
      });
    } else {
      // Fallback: just speak the word in context
      this.speakWord();
    }
  }

  showHint() {
    if (!this.currentWord) return;

    const word = this.currentWord.word;
    const hint = word[0] + '_'.repeat(word.length - 1);

    this.hintBtn.textContent = `Starts with "${word[0]}" (${word.length} letters)`;
    this.hintBtn.disabled = true;
  }

  checkSpelling() {
    if (this.isShowingResult) return;

    const userInput = this.spellingInput.value.trim();
    if (!userInput) {
      this.spellingInput.focus();
      return;
    }

    this.hasAttempted = true;

    // Check if correct (case-insensitive)
    const isCorrect = this.isSpellingCorrect(userInput);

    // Record the attempt
    storage.recordAttempt(this.currentWord.id, isCorrect);
    this.updateStatsDisplay();

    // Show result
    this.showResult(isCorrect, userInput);
  }

  isSpellingCorrect(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    const correctWord = this.currentWord.word.toLowerCase();

    // Check main spelling
    if (normalizedInput === correctWord) return true;

    // Check alternate spellings if available
    if (this.currentWord.alternates) {
      return this.currentWord.alternates.some(
        alt => normalizedInput === alt.toLowerCase()
      );
    }

    return false;
  }

  showResult(isCorrect, userInput) {
    this.isShowingResult = true;

    // Update input styling
    this.spellingInput.classList.add(isCorrect ? 'correct' : 'incorrect');

    // Show result screen
    this.practiceScreen.classList.add('hidden');
    this.resultScreen.classList.remove('hidden');

    if (isCorrect) {
      this.resultIcon.textContent = '';
      this.resultIcon.className = 'result-icon correct';
      this.resultMessage.textContent = this.getRandomMessage(this.correctMessages);
      this.correctSpelling.innerHTML = `<span class="correct-word">${this.currentWord.word}</span>`;
      this.retryBtn.classList.add('hidden');

      // Speak celebration
      setTimeout(() => {
        speechManager.speak("Correct!");
      }, 200);
    } else {
      this.resultIcon.textContent = '';
      this.resultIcon.className = 'result-icon incorrect';
      this.resultMessage.textContent = this.getRandomMessage(this.tryAgainMessages);
      this.correctSpelling.innerHTML = `
        <div class="spelling-comparison">
          <div class="user-attempt">You spelled: <span class="incorrect-word">${userInput}</span></div>
          <div class="correct-answer">Correct spelling: <span class="correct-word">${this.currentWord.word}</span></div>
        </div>
      `;
      this.retryBtn.classList.remove('hidden');

      // Speak the correct spelling
      setTimeout(() => {
        speechManager.speak(`The correct spelling is: ${this.currentWord.word}`);
      }, 500);
    }
  }

  getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  retryWord() {
    // Go back to practice the same word
    this.resultScreen.classList.add('hidden');
    this.practiceScreen.classList.remove('hidden');

    this.spellingInput.value = '';
    this.spellingInput.classList.remove('correct', 'incorrect');
    this.spellingInput.focus();
    this.isShowingResult = false;

    // Speak the word again
    setTimeout(() => this.speakWord(), 300);
  }

  nextWord() {
    // Move to next word
    this.currentIndex++;
    const totalFiltered = this.filteredWords.length;

    // Check if we've gone through all words
    if (this.mode === 'random' && this.currentIndex >= totalFiltered) {
      this.showCompletion();
      return;
    } else if (this.mode === 'sequential' && this.currentIndex >= totalFiltered) {
      // Wrap around to beginning
      this.currentIndex = 0;
    }

    // Show practice screen and load word
    this.resultScreen.classList.add('hidden');
    this.practiceScreen.classList.remove('hidden');
    this.loadWord();
  }

  skipWord() {
    // Skip without recording an attempt
    this.nextWord();
  }

  showCompletion() {
    const stats = storage.getOverallStats();
    const totalFiltered = this.filteredWords.length;
    const levelText = this.selectedLevel === 'all' ? 'all the words' : `all ${this.selectedLevel} words`;

    this.resultIcon.textContent = '';
    this.resultIcon.className = 'result-icon celebration';
    this.resultMessage.textContent = `Amazing! You've practiced ${levelText}!`;
    this.correctSpelling.innerHTML = `
      <div class="completion-stats">
        <p>Total attempts: ${stats.totalAttempts}</p>
        <p>Correct: ${stats.totalCorrect}</p>
        <p>Accuracy: ${stats.accuracy}%</p>
        <p>Best streak: ${stats.bestStreak}</p>
      </div>
    `;
    this.retryBtn.classList.add('hidden');
    this.nextBtn.textContent = 'Start Over';
    this.nextBtn.onclick = () => {
      this.currentIndex = 0;
      this.shuffledIndices = this.shuffleArray([...Array(totalFiltered).keys()]);
      this.nextBtn.textContent = 'Next Word';
      this.nextBtn.onclick = () => this.nextWord();
      this.nextWord();
    };

    this.resultScreen.classList.remove('hidden');
    this.practiceScreen.classList.add('hidden');
  }

  goHome() {
    speechManager.stop();
    this.practiceScreen.classList.add('hidden');
    this.resultScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');

    // Update start position to current position
    if (this.currentWord) {
      this.startPositionInput.value = this.currentWord.id;
    }
  }

  updateProgress() {
    const totalFiltered = this.filteredWords.length;
    let progress;
    if (this.mode === 'random') {
      progress = ((this.currentIndex + 1) / totalFiltered) * 100;
      this.progressText.textContent = `${this.currentIndex + 1} of ${totalFiltered}`;
    } else {
      progress = ((this.currentIndex + 1) / totalFiltered) * 100;
      this.progressText.textContent = `Word ${this.currentIndex + 1} of ${totalFiltered}`;
    }
    this.progressFill.style.width = `${progress}%`;
  }

  updateStatsDisplay() {
    const stats = storage.getOverallStats();
    this.streakCount.textContent = stats.currentStreak;
    this.accuracyPercent.textContent = `${stats.accuracy}%`;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SpellingBeeApp();
});
