/*
 * Reading Kingdom — Progress  (window.Progress)
 * =============================================================================
 * Saves the child's journey in localStorage so it survives closing/reopening
 * the app (BUILD-SPEC §10). Single child for v1; the shape leaves room for a
 * future "who's playing?" picker without a migration.
 *
 * Stored shape:
 *   {
 *     version: 1,
 *     buddy: "puppy" | null,        // chosen buddy id
 *     unlockedLevel: 1,             // highest unlocked level (starts at 1)
 *     completedBooks: ["1-1", ...], // finished book ids
 *     rewards: [ { emoji, name, bookId, ts }, ... ]
 *   }
 *
 * Everything is wrapped in try/catch so Private Browsing (where localStorage can
 * throw) degrades to an in-memory session instead of crashing.
 */
window.Progress = (function () {
  'use strict';

  var KEY = 'reading-kingdom:v1';

  var state = {
    version: 1,
    buddy: null,
    unlockedLevel: 1,
    completedBooks: [],
    rewards: []
  };

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        state.buddy = parsed.buddy || null;
        state.unlockedLevel = Math.max(1, parsed.unlockedLevel || 1);
        state.completedBooks = Array.isArray(parsed.completedBooks) ? parsed.completedBooks.slice() : [];
        state.rewards = Array.isArray(parsed.rewards) ? parsed.rewards.slice() : [];
      }
    } catch (e) {
      // Corrupt or unavailable storage — carry on with defaults in memory.
    }
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Storage unavailable (e.g. Private mode) — progress stays for this session only.
    }
  }

  load();

  return {
    // --- whole-state access ---
    data: function () { return state; },

    // --- buddy ---
    getBuddy: function () { return state.buddy; },
    hasBuddy: function () { return !!state.buddy; },
    setBuddy: function (id) { state.buddy = id; save(); },

    // --- level unlocking ---
    getUnlockedLevel: function () { return state.unlockedLevel; },
    isLevelUnlocked: function (level) { return level <= state.unlockedLevel; },
    unlockLevel: function (level) {
      if (level > state.unlockedLevel) {
        state.unlockedLevel = level;
        save();
        return true;   // signals "newly unlocked" to the caller
      }
      return false;
    },

    // --- books ---
    isBookComplete: function (bookId) {
      return state.completedBooks.indexOf(bookId) !== -1;
    },
    markBookComplete: function (bookId) {
      if (state.completedBooks.indexOf(bookId) === -1) {
        state.completedBooks.push(bookId);
        save();
      }
    },
    completedCount: function () { return state.completedBooks.length; },

    // --- rewards ---
    getRewards: function () { return state.rewards.slice(); },
    rewardCount: function () { return state.rewards.length; },
    addReward: function (reward) {
      state.rewards.push(reward);
      save();
    },

    // --- parent reset (wired to a long-press on the trophy shelf) ---
    reset: function () {
      state.buddy = null;
      state.unlockedLevel = 1;
      state.completedBooks = [];
      state.rewards = [];
      try { window.localStorage.removeItem(KEY); } catch (e) {}
    }
  };
})();
