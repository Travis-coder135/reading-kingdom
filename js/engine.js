/*
 * Reading Kingdom — Engine  (window.Engine)
 * =============================================================================
 * The rules brain: derives what letters are "known" at each level, runs the
 * decodability validator (the key correctness check, BUILD-SPEC §9), tracks a
 * single book's word-by-word session, and owns level-unlock logic.
 *
 * It reads window.CURRICULUM and window.Progress; it holds no DOM. main.js
 * drives the screens and calls into here.
 */
window.Engine = (function () {
  'use strict';

  var C = window.CURRICULUM;
  var VOWELS = {};
  (C.vowelOrder || ['a', 'o', 'i', 'u', 'e']).forEach(function (v) { VOWELS[v] = true; });

  // ---- derived lookups -----------------------------------------------------

  var levelsById = {};
  var bookIndex = {};   // bookId -> { book, levelId }
  C.levels.forEach(function (lvl) {
    levelsById[lvl.id] = lvl;
    (lvl.books || []).forEach(function (book) {
      bookIndex[book.id] = { book: book, levelId: lvl.id };
    });
  });

  function getLevel(id) { return levelsById[id] || null; }
  function getBookEntry(bookId) { return bookIndex[bookId] || null; }
  function getBook(bookId) {
    var e = bookIndex[bookId];
    return e ? e.book : null;
  }
  function levelOfBook(bookId) {
    var e = bookIndex[bookId];
    return e ? e.levelId : null;
  }
  function booksForLevel(levelId) {
    var lvl = levelsById[levelId];
    return lvl ? (lvl.books || []) : [];
  }
  function newLettersForLevel(levelId) {
    var lvl = levelsById[levelId];
    return lvl ? (lvl.newLetters || []) : [];
  }
  function levelCount() { return C.levels.length; }

  // Union of newLetters for levels 1..levelId, as a plain object set.
  function lettersKnownThrough(levelId) {
    var known = {};
    C.levels.forEach(function (lvl) {
      if (lvl.id <= levelId) {
        (lvl.newLetters || []).forEach(function (l) { known[l] = true; });
      }
    });
    return known;
  }

  // Vowels introduced by (<=) levelId.
  function introducedVowelsThrough(levelId) {
    var known = lettersKnownThrough(levelId);
    return Object.keys(known).filter(function (l) { return VOWELS[l]; });
  }

  function isVowel(letter) { return !!VOWELS[String(letter).toLowerCase()]; }

  // ---- decodability validator (BUILD-SPEC §1.1 & §9) -----------------------
  // A word is decodable at its level iff (a) every letter is known by that level
  // and (b) it contains at least one vowel introduced by that level.
  function validateCurriculum() {
    var violations = [];
    C.levels.forEach(function (lvl) {
      var known = lettersKnownThrough(lvl.id);
      var vowelsKnown = {};
      introducedVowelsThrough(lvl.id).forEach(function (v) { vowelsKnown[v] = true; });

      (lvl.books || []).forEach(function (book) {
        (book.words || []).forEach(function (word) {
          var chars = String(word).toLowerCase().split('');

          var unknown = chars.filter(function (ch) { return !known[ch]; });
          if (unknown.length) {
            violations.push({
              level: lvl.id, bookId: book.id, word: word,
              reason: 'uses letter(s) not yet introduced: ' + unknown.join(', ')
            });
          }

          var hasIntroducedVowel = chars.some(function (ch) { return vowelsKnown[ch]; });
          if (!hasIntroducedVowel) {
            violations.push({
              level: lvl.id, bookId: book.id, word: word,
              reason: 'contains no introduced vowel'
            });
          }
        });
      });
    });
    return { ok: violations.length === 0, violations: violations };
  }

  // ---- level / book status (reads Progress) --------------------------------

  function isLevelComplete(levelId) {
    var books = booksForLevel(levelId);
    if (!books.length) return false;
    return books.every(function (b) { return window.Progress.isBookComplete(b.id); });
  }

  function lastBookOfLevel(levelId) {
    var books = booksForLevel(levelId);
    return books.length ? books[books.length - 1] : null;
  }

  // First book in a level the child hasn't finished; if all are done, the first
  // book (so a completed level is freely replayable).
  function firstUnfinishedBook(levelId) {
    var books = booksForLevel(levelId);
    for (var i = 0; i < books.length; i++) {
      if (!window.Progress.isBookComplete(books[i].id)) return books[i];
    }
    return books[0] || null;
  }

  // The stop the map should gently pulse: lowest unlocked level still having an
  // unfinished book; if every unlocked level is done, the highest unlocked one.
  function nextPlayableLevel() {
    var top = window.Progress.getUnlockedLevel();
    for (var id = 1; id <= top; id++) {
      if (!isLevelComplete(id)) return id;
    }
    return top;
  }

  // Called when a book's celebration finishes. Marks it complete and, if it was
  // the level's last book, unlocks the next level. Returns what happened so the
  // UI can celebrate an unlock.
  function completeBook(bookId) {
    window.Progress.markBookComplete(bookId);
    var levelId = levelOfBook(bookId);
    var result = { levelId: levelId, unlockedNewLevel: false, newLevel: null, levelFinished: false };

    if (isLevelComplete(levelId)) {
      result.levelFinished = true;
      var next = levelId + 1;
      if (next <= levelCount() && window.Progress.unlockLevel(next)) {
        result.unlockedNewLevel = true;
        result.newLevel = next;
      }
    }
    return result;
  }

  // ---- book session (one book, word by word — BUILD-SPEC §7) ---------------

  function makeSession(bookId) {
    var entry = getBookEntry(bookId);
    if (!entry) return null;
    var words = (entry.book.words || []).slice();
    var index = 0;

    return {
      bookId: bookId,
      levelId: entry.levelId,
      words: words,
      total: words.length,

      indexNow: function () { return index; },
      currentWord: function () { return words[index]; },
      currentLetters: function () { return String(words[index] || '').split(''); },
      wordsDone: function () { return index; },              // words completed before the current one
      isLastWord: function () { return index >= words.length - 1; },
      isFinished: function () { return index >= words.length; },

      // Advance to the next word. Returns true if the book is now finished.
      advance: function () {
        index += 1;
        return index >= words.length;
      }
    };
  }

  return {
    // curriculum access
    levels: C.levels,
    levelCount: levelCount,
    getLevel: getLevel,
    getBook: getBook,
    levelOfBook: levelOfBook,
    booksForLevel: booksForLevel,
    newLettersForLevel: newLettersForLevel,

    // derived
    lettersKnownThrough: lettersKnownThrough,
    introducedVowelsThrough: introducedVowelsThrough,
    isVowel: isVowel,

    // validation
    validateCurriculum: validateCurriculum,

    // status
    isLevelComplete: isLevelComplete,
    lastBookOfLevel: lastBookOfLevel,
    firstUnfinishedBook: firstUnfinishedBook,
    nextPlayableLevel: nextPlayableLevel,
    completeBook: completeBook,

    // session
    makeSession: makeSession
  };
})();
