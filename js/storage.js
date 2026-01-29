// LocalStorage management for progress tracking

const STORAGE_KEY = 'spellingBeeProgress';

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load progress from localStorage:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      // Track each word: { attempts: number, correct: number, lastPracticed: timestamp }
      wordStats: {},
      // Session stats
      totalAttempts: 0,
      totalCorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
      // Last position for sequential mode
      lastPosition: 1,
      // Preferred mode
      mode: 'sequential'
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }

  recordAttempt(wordId, isCorrect) {
    // Update word-specific stats
    if (!this.data.wordStats[wordId]) {
      this.data.wordStats[wordId] = { attempts: 0, correct: 0, lastPracticed: null };
    }
    this.data.wordStats[wordId].attempts++;
    if (isCorrect) {
      this.data.wordStats[wordId].correct++;
    }
    this.data.wordStats[wordId].lastPracticed = Date.now();

    // Update global stats
    this.data.totalAttempts++;
    if (isCorrect) {
      this.data.totalCorrect++;
      this.data.currentStreak++;
      if (this.data.currentStreak > this.data.bestStreak) {
        this.data.bestStreak = this.data.currentStreak;
      }
    } else {
      this.data.currentStreak = 0;
    }

    this.save();
  }

  getWordStats(wordId) {
    return this.data.wordStats[wordId] || { attempts: 0, correct: 0, lastPracticed: null };
  }

  getOverallStats() {
    return {
      totalAttempts: this.data.totalAttempts,
      totalCorrect: this.data.totalCorrect,
      currentStreak: this.data.currentStreak,
      bestStreak: this.data.bestStreak,
      accuracy: this.data.totalAttempts > 0
        ? Math.round((this.data.totalCorrect / this.data.totalAttempts) * 100)
        : 0
    };
  }

  setLastPosition(position) {
    this.data.lastPosition = position;
    this.save();
  }

  getLastPosition() {
    return this.data.lastPosition || 1;
  }

  setMode(mode) {
    this.data.mode = mode;
    this.save();
  }

  getMode() {
    return this.data.mode || 'sequential';
  }

  resetProgress() {
    this.data = this.getDefaultData();
    this.save();
  }
}

export const storage = new StorageManager();
