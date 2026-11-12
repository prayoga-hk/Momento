/* Memento — a small Vue 3 memory game. No build step, no database. */
const { createApp } = Vue;

const SYMBOLS = ["★", "♥", "◆", "☠", "⚡", "☾", "♫", "♠", "♣", "✿"];

const SYMBOL_COLORS = {
  "★": "#ffd23f",
  "♥": "#ff4f9a",
  "◆": "#55e7ff",
  "☠": "#d8d4ff",
  "⚡": "#ffe66d",
  "☾": "#9ca8ff",
  "♫": "#b388ff",
  "♠": "#7cffb2",
  "♣": "#63ffb0",
  "✿": "#ff7ad9"
};

const STICKERS = [
  "stickers/jb-blue.webp",
  "stickers/jb-red.webp",
  "stickers/jb-purple.webp",
  "stickers/jb-green.webp",
  "stickers/jb-pink.webp"
];

const DIFFICULTIES = {
  easy: { label: "Easy", pairs: 6, cols: 4 },
  medium: { label: "Medium", pairs: 8, cols: 4 },
  hard: { label: "Hard", pairs: 10, cols: 5 }
};

const STORAGE_KEY = "memento.best.v1";

createApp({
  data() {
    return {
      difficulties: DIFFICULTIES,
      difficulty: "medium",
      deck: [],
      flippedIds: [],
      wrongIds: [],
      matchedCount: 0,
      moves: 0,
      elapsed: 0,
      running: false,
      lock: false,
      best: {},
      isNewRecord: false,
      startedAt: 0,
      tickHandle: null,
      matchHandle: null
    };
  },

  computed: {
    config() {
      return DIFFICULTIES[this.difficulty];
    },

    difficultyLabel() {
      return this.config.label;
    },

    progressPercent() {
      return (this.matchedCount / this.config.pairs) * 100;
    },

    timeLabel() {
      return this.formatTime(this.elapsed);
    },

    isWon() {
      return this.deck.length > 0 && this.matchedCount === this.config.pairs;
    },

    bestForLevel() {
      return this.best[this.difficulty] || null;
    },

    statusLabel() {
      if (this.isWon) return "All pairs found — lovely work";
      if (this.running) return "Clock is running — stay sharp";
      if (this.matchedCount > 0) return "Keep going, you’re on a roll";
      return "Ready when you are";
    }
  },

  mounted() {
    this.loadBest();
    this.startGame();
  },

  beforeUnmount() {
    this.clearTimers();
  },

  methods: {
    loadBest() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (!saved || typeof saved !== "object") return;

        const clean = {};
        Object.keys(DIFFICULTIES).forEach((key) => {
          const entry = saved[key];
          if (
            entry &&
            Number.isFinite(entry.moves) &&
            Number.isFinite(entry.seconds)
          ) {
            clean[key] = {
              moves: Math.max(1, Math.round(entry.moves)),
              seconds: Math.max(0, Math.round(entry.seconds))
            };
          }
        });
        this.best = clean;
      } catch (error) {
        this.best = {};
      }
    },

    persistBest() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.best));
      } catch (error) {
        /* Private browsing or storage disabled — the game still works. */
      }
    },

    setDifficulty(key) {
      if (!DIFFICULTIES[key] || key === this.difficulty) return;
      this.difficulty = key;
      this.startGame();
    },

    startGame() {
      this.clearTimers();

      const selectedSymbols = this.shuffle([...SYMBOLS]).slice(0, this.config.pairs);
      const useStickers = this.difficulty === "hard";
      const stickerBySymbol = useStickers
        ? new Map(
            selectedSymbols.map((symbol, index) => [symbol, STICKERS[index % STICKERS.length]])
          )
        : null;
      const cards = selectedSymbols.flatMap((symbol) => [symbol, symbol]);
      this.deck = this.shuffle(cards).map((symbol, index) => {
        return {
          id: `${this.difficulty}-${index}-${symbol}`,
          symbol,
          color: SYMBOL_COLORS[symbol] || "#7cffb2",
          sticker: useStickers ? stickerBySymbol.get(symbol) || STICKERS[0] : null,
          matched: false
        };
      });

      this.flippedIds = [];
      this.wrongIds = [];
      this.matchedCount = 0;
      this.moves = 0;
      this.elapsed = 0;
      this.running = false;
      this.lock = false;
      this.startedAt = 0;
      this.isNewRecord = false;
    },

    shuffle(items) {
      for (let i = items.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    },

    flipCard(card) {
      if (
        this.lock ||
        this.isWon ||
        card.matched ||
        this.flippedIds.includes(card.id)
      ) {
        return;
      }

      if (!this.running) this.startTimer();
      this.flippedIds.push(card.id);

      if (this.flippedIds.length < 2) return;

      this.moves += 1;
      this.lock = true;

      const [firstId, secondId] = this.flippedIds;
      const first = this.deck.find((item) => item.id === firstId);
      const second = this.deck.find((item) => item.id === secondId);

      if (!first || !second) {
        this.flippedIds = [];
        this.lock = false;
        return;
      }

      if (first.symbol === second.symbol) {
        this.matchHandle = setTimeout(() => {
          first.matched = true;
          second.matched = true;
          this.matchedCount += 1;
          this.flippedIds = [];
          this.lock = false;
          this.matchHandle = null;

          if (this.matchedCount === this.config.pairs) this.finishGame();
        }, 430);
      } else {
        this.wrongIds = [first.id, second.id];
        this.matchHandle = setTimeout(() => {
          this.flippedIds = [];
          this.wrongIds = [];
          this.lock = false;
          this.matchHandle = null;
        }, 850);
      }
    },

    startTimer() {
      this.running = true;
      this.startedAt = Date.now() - this.elapsed * 1000;
      this.tickHandle = setInterval(() => {
        this.elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
      }, 250);
    },

    finishGame() {
      if (this.running) {
        this.elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
        clearInterval(this.tickHandle);
        this.tickHandle = null;
        this.running = false;
      }

      const result = { moves: this.moves, seconds: this.elapsed };
      const previous = this.bestForLevel;

      if (!previous || this.isBetter(result, previous)) {
        this.best = { ...this.best, [this.difficulty]: result };
        this.persistBest();
        this.isNewRecord = true;
      } else {
        this.isNewRecord = false;
      }
    },

    isBetter(candidate, previous) {
      if (candidate.moves !== previous.moves) {
        return candidate.moves < previous.moves;
      }
      return candidate.seconds < previous.seconds;
    },

    clearTimers() {
      if (this.tickHandle) {
        clearInterval(this.tickHandle);
        this.tickHandle = null;
      }
      if (this.matchHandle) {
        clearTimeout(this.matchHandle);
        this.matchHandle = null;
      }
    },

    isFlipped(card) {
      return card.matched || this.flippedIds.includes(card.id);
    },

    cardLabel(card, index) {
      if (card.matched) return `Matched card showing ${card.symbol}`;
      if (this.flippedIds.includes(card.id)) return `Card showing ${card.symbol}`;
      return `Hidden card ${index + 1}`;
    },

    formatTime(totalSeconds) {
      const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
      const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
      const seconds = String(safeSeconds % 60).padStart(2, "0");
      return `${minutes}:${seconds}`;
    }
  }
}).mount("#app");
