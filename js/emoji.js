/*
 * Reading Kingdom — Emoji maps
 * =============================================================================
 * v1 uses emoji instead of image files so nothing can go missing. Two maps:
 *
 *   window.WORD_EMOJI    word  -> the "reward picture" shown AFTER a word is
 *                        blended (never before — see BUILD-SPEC §1.3).
 *   window.LETTER_EMOJI  letter -> a keyword picture for the optional sound
 *                        warm-up (a is for 🍎, etc.).
 *
 * Plus window.Emoji helpers with safe fallbacks so a missing entry never breaks
 * the UI:
 *   Emoji.forWord(word)     -> mapped emoji, else ⭐
 *   Emoji.forLetter(letter) -> mapped emoji, else the uppercase letter itself
 *
 * Abstract words (at, am, got, his, set, …) intentionally have no entry; a happy
 * ⭐ is a perfectly good confirmation reward for those. Add entries freely later.
 */
(function () {
  'use strict';

  // ---- Word confirmation pictures -----------------------------------------
  // Only words with a genuinely recognizable emoji are listed. Everything else
  // falls back to ⭐. Some emoji repeat across near-synonyms — that's fine.
  var WORD_EMOJI = {
    // Level 1
    mat: '🟫', sam: '🧒', tam: '🧢',
    // Level 2
    dad: '👨', mad: '😠', sad: '😢', pad: '📝', pat: '✋', tap: '🚰',
    map: '🗺️', dam: '🦫',
    // Level 3
    man: '🧑', pan: '🍳', tan: '🟤', nap: '😴', tag: '🏷️', gap: '🕳️',
    gas: '⛽',
    // Level 4
    cat: '🐱', can: '🥫', cap: '🧢', cot: '🛏️', cop: '👮', cod: '🐟',
    cog: '⚙️', dot: '⚫', dog: '🐶', pot: '🍲', top: '🪀', mop: '🧹',
    pod: '🫛',
    // Level 5
    hat: '🎩', ham: '🍖', hop: '🐇', hot: '🔥', hog: '🐷', rat: '🐀',
    ram: '🐏', ran: '🏃‍♂️', rap: '🎤', rod: '🎣', car: '🚗', par: '⛳',
    // Level 6
    big: '🐘', bib: '👶', bin: '🗑️', bat: '🦇', bag: '🎒', bar: '🍫',
    cab: '🚕', rib: '🦴', rig: '🚛', tin: '🥫', dig: '⛏️', hit: '🥊',
    sit: '🪑', sip: '🥤', pig: '🐷', pin: '📌', pit: '🕳️',
    // Level 7
    fan: '🪭', fit: '💪', fin: '🦈', fog: '🌫️', log: '🪵', lit: '💡',
    lip: '👄', lap: '🏁', lad: '👦', pal: '🧑‍🤝‍🧑', gal: '👧',
    // Level 8
    jug: '🫙', jam: '🍓', jog: '🏃‍♀️', jab: '🥊', cub: '🐻', cup: '🥤',
    cut: '✂️', hug: '🤗', hut: '🛖', hum: '🎵', bug: '🐛', bun: '🍞',
    bus: '🚌', gum: '🍬', mud: '🟤', mug: '☕', nut: '🥜', pup: '🐕',
    run: '🏃', sun: '☀️', tub: '🛁', tug: '🪢', fun: '🎉', rug: '🟫',
    // Level 9
    kid: '🧒', kit: '🧰', kin: '👪', wig: '💇', win: '🏆', wok: '🥘',
    box: '📦', fox: '🦊', fix: '🔧', six: '6️⃣', mix: '🥣', fax: '📠',
    ox: '🐂', wax: '🕯️',
    // Level 10
    bed: '🛏️', beg: '🙏', gem: '💎', hen: '🐔', hem: '🧵', jet: '✈️',
    leg: '🦵', men: '👬', net: '🥅', pen: '🖊️', pet: '🐾', peg: '🪝',
    red: '🔴', ten: '🔟', vet: '🩺', wet: '💧', web: '🕸️', wed: '💍',
    van: '🚐', vat: '🛢️',
    // Level 11
    yes: '👍', yak: '🐃', yam: '🍠', yum: '😋', zap: '⚡', zip: '🤐',
    biz: '💼'
    // Level 12 is review — its words reuse the entries above.
  };

  // ---- Per-letter keyword pictures (optional sound warm-up) ----------------
  // Classic phonics keywords. Short-vowel pictures for the vowels.
  var LETTER_EMOJI = {
    a: '🍎', b: '🎈', c: '🥕', d: '🐶', e: '🥚', f: '🐟', g: '🍇',
    h: '🏠', i: '🧊', j: '🧃', k: '🔑', l: '🦁', m: '🌙', n: '👃',
    o: '🐙', p: '🐷', r: '🌈', s: '🐍', t: '🐯', u: '☂️', v: '🌋',
    w: '🐺', x: '🦊', y: '🪀', z: '🦓'
    // No 'q' — this curriculum skips it.
  };

  window.WORD_EMOJI = WORD_EMOJI;
  window.LETTER_EMOJI = LETTER_EMOJI;

  window.Emoji = {
    forWord: function (word) {
      return WORD_EMOJI[String(word).toLowerCase()] || '⭐';
    },
    forLetter: function (letter) {
      var l = String(letter).toLowerCase();
      return LETTER_EMOJI[l] || l.toUpperCase();
    }
  };
})();
