/*
 * Reading Kingdom — Curriculum (SOURCE OF TRUTH)
 * =============================================================================
 * The 12 leveled "books" of decodable, short-vowel phonics content.
 *
 * Loaded as a plain <script> (no modules, no fetch) so the app runs from a
 * file:// path as well as a server. Attaches to window.CURRICULUM.
 *
 * SHAPE
 *   window.CURRICULUM = {
 *     vowelOrder: ["a","o","i","u","e"],   // the order vowels are introduced
 *     levels: [
 *       {
 *         id: 1,
 *         newLetters: ["m","a","t","s"],   // letters FIRST introduced this level
 *         sightWords: [],                  // whole-word (not blended); keep minimal
 *         books: [ { id: "1-1", words: ["at","am","mat","sat"] }, ... ]
 *       },
 *       ...
 *     ]
 *   }
 *
 * RULES (enforced by the validator in engine.js — see BUILD-SPEC §1 & §9):
 *   - Every letter of every word must be introduced by that word's level or earlier.
 *   - Every word must contain a vowel introduced by that level or earlier.
 *   - Lowercase only. Alphabet minus "q". 2–3 letter words. Short vowels only.
 *
 * To add or edit content later: keep words lowercase, keep books short (4 words
 * early, up to ~6 later), and rely on the boot-time validator to catch mistakes.
 */
(function () {
  'use strict';

  window.CURRICULUM = {
    // The order in which vowels become "introduced". A word is only decodable
    // once at least one of its vowels has appeared at or before its level.
    vowelOrder: ['a', 'o', 'i', 'u', 'e'],

    levels: [
      {
        id: 1,
        newLetters: ['m', 'a', 't', 's'],
        sightWords: [],
        books: [
          { id: '1-1', words: ['at', 'am', 'mat', 'sat'] },
          { id: '1-2', words: ['sam', 'tam', 'as', 'mat'] }
        ]
      },
      {
        id: 2,
        newLetters: ['d', 'p'],
        sightWords: [],
        books: [
          { id: '2-1', words: ['dad', 'mad', 'sad', 'pat'] },
          { id: '2-2', words: ['tap', 'map', 'pad', 'sap'] }
        ]
      },
      {
        id: 3,
        newLetters: ['n', 'g'],
        sightWords: [],
        books: [
          { id: '3-1', words: ['man', 'pan', 'tan', 'nap'] },
          { id: '3-2', words: ['tag', 'nag', 'gap', 'gas'] }
        ]
      },
      {
        id: 4,
        newLetters: ['o', 'c'],
        sightWords: [],
        books: [
          { id: '4-1', words: ['dog', 'cat', 'cot', 'dot'] },
          { id: '4-2', words: ['pot', 'top', 'mop', 'got'] },
          { id: '4-3', words: ['cop', 'nod', 'cod', 'cap'] }
        ]
      },
      {
        id: 5,
        newLetters: ['h', 'r'],
        sightWords: [],
        books: [
          { id: '5-1', words: ['hat', 'ham', 'had', 'hop'] },
          { id: '5-2', words: ['rat', 'ran', 'rag', 'ram'] },
          { id: '5-3', words: ['hot', 'hog', 'rod', 'car'] }
        ]
      },
      {
        id: 6,
        newLetters: ['i', 'b'],
        sightWords: [],
        books: [
          { id: '6-1', words: ['pig', 'big', 'dig', 'pin'] },
          { id: '6-2', words: ['sit', 'sip', 'hit', 'bit'] },
          { id: '6-3', words: ['him', 'his', 'rib', 'bib'] }
        ]
      },
      {
        id: 7,
        newLetters: ['f', 'l'],
        sightWords: [],
        books: [
          { id: '7-1', words: ['fan', 'fat', 'fit', 'fig'] },
          { id: '7-2', words: ['lap', 'lad', 'lid', 'lip'] },
          { id: '7-3', words: ['log', 'lot', 'fog', 'fin'] }
        ]
      },
      {
        id: 8,
        newLetters: ['u', 'j'],
        sightWords: [],
        books: [
          { id: '8-1', words: ['sun', 'run', 'fun', 'bun'] },
          { id: '8-2', words: ['cup', 'cut', 'cub', 'bug'] },
          { id: '8-3', words: ['mug', 'mud', 'jug', 'hug'] },
          { id: '8-4', words: ['bus', 'nut', 'tub', 'pup'] }
        ]
      },
      {
        id: 9,
        newLetters: ['k', 'w', 'x'],
        sightWords: [],
        books: [
          { id: '9-1', words: ['box', 'fox', 'six', 'fix'] },
          { id: '9-2', words: ['mix', 'wax', 'tax', 'wig'] },
          { id: '9-3', words: ['win', 'wit', 'kid', 'kit'] }
        ]
      },
      {
        id: 10,
        newLetters: ['e', 'v'],
        sightWords: [],
        books: [
          { id: '10-1', words: ['bed', 'red', 'hen', 'pen'] },
          { id: '10-2', words: ['net', 'jet', 'pet', 'vet'] },
          { id: '10-3', words: ['leg', 'beg', 'peg', 'men'] },
          { id: '10-4', words: ['get', 'let', 'set', 'wet'] }
        ]
      },
      {
        id: 11,
        newLetters: ['y', 'z'],
        sightWords: [],
        books: [
          { id: '11-1', words: ['yes', 'yet', 'yam', 'yak'] },
          { id: '11-2', words: ['zip', 'zap', 'zig', 'zag'] }
        ]
      },
      {
        id: 12,
        // Review level — no new letters. Revisits all vowels with familiar words.
        newLetters: [],
        sightWords: [],
        books: [
          { id: '12-1', words: ['cat', 'dog', 'sun', 'pig'] },
          { id: '12-2', words: ['bed', 'box', 'jam', 'hat'] },
          { id: '12-3', words: ['run', 'six', 'web', 'mud'] }
        ]
      }
    ]
  };
})();
