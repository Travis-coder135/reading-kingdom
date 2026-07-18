/*
 * Reading Kingdom — Audio engine  (window.Audio2)
 * =============================================================================
 * She can't read, so EVERYTHING is spoken. This module is the single source of
 * sound. It prefers a real recorded clip when one exists and otherwise falls
 * back to the browser's Web Speech synthesizer — transparently, per sound — so
 * the game is fully playable before a single clip is recorded (BUILD-SPEC §8).
 *
 * PUBLIC API (all the play/say methods return a Promise that resolves when the
 * sound finishes, so callers can sequence them):
 *   Audio2.playLetter(letter)      -> the letter's SOUND (phoneme, "mmm"), not its name
 *   Audio2.playWord(word)          -> the whole word, spoken naturally
 *   Audio2.playBlend(word)         -> each letter slowly, a beat, then the word
 *   Audio2.say(text)               -> a spoken prompt/celebration (TTS)
 *   Audio2.sayUi(name, fallback)   -> prefer assets/audio/ui_<name>.mp3, else say(fallback)
 *   Audio2.stopAll()               -> cut any current speech/clips (e.g. on navigation)
 *   Audio2.unlock()                -> call once from a user gesture to satisfy autoplay rules
 *
 * CLIP FILES (all optional, dropped into assets/audio/ by the owner — see
 * AUDIO-CHECKLIST.md and the built-in recorder at record.html):
 *   letter_<l>.<ext>   word_<word>.<ext>   ui_<name>.<ext>
 * where <ext> is any of mp3 / m4a / ogg / wav / webm. The engine probes the
 * first time a sound is needed, trying each format, and remembers which file
 * won (or that none exist, in which case it uses TTS from then on).
 */
window.Audio2 = (function () {
  'use strict';

  var AUDIO_DIR = 'assets/audio/';

  // Recorded clips may be any of these formats; probed in this order (compressed
  // + universally-playable first, .webm last since iOS may not decode it).
  var CLIP_EXTS = ['mp3', 'm4a', 'ogg', 'wav', 'webm'];

  // Phoneme approximations fed to the synthesizer so TTS says the SOUND, not the
  // letter name. Tuned by ear at a slow rate / slightly higher pitch. Real
  // recordings (letter_<l>.mp3) are always preferred when present.
  var PHONEME = {
    a: 'ah',  b: 'buh', c: 'kuh', d: 'duh', e: 'eh',  f: 'fff', g: 'guh',
    h: 'huh', i: 'ih',  j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn',
    o: 'aw',  p: 'puh', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh',  v: 'vvv',
    w: 'wuh', x: 'ks',  y: 'yuh', z: 'zzz'
  };

  // Tunables
  var LETTER_RATE = 0.7,  LETTER_PITCH = 1.1;   // slow + a touch bright for phonemes
  var WORD_RATE   = 0.9,  WORD_PITCH   = 1.05;
  var SAY_RATE    = 0.95, SAY_PITCH    = 1.05;
  var GAP_BETWEEN_LETTERS = 150;                // ms pause between phonemes in a blend
  var GAP_BEFORE_WORD     = 220;                // ms pause before the whole word

  var speech = window.speechSynthesis || null;
  var clipResolved = {};   // base (e.g. "letter_m") -> { el: <audio> } | 'none' | undefined
  var chosenVoice = null;
  var voicePicked = false;
  var unlocked = false;

  // ---- helpers -------------------------------------------------------------

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function pickVoice() {
    if (!speech) return null;
    var voices = speech.getVoices() || [];
    if (!voices.length) return null;         // not ready yet; try again later
    voicePicked = true;

    var en = voices.filter(function (v) { return /^en(-|_|$)/i.test(v.lang || ''); });
    var pool = en.length ? en : voices;

    // Prefer a warm/female-sounding voice when we can identify one by name.
    var warm = /(female|samantha|karen|moira|tessa|zira|susan|victoria|allison|ava|serena|joana|fiona|kathy)/i;
    var nice = pool.filter(function (v) { return warm.test(v.name || ''); });

    return (nice[0] || pool[0] || null);
  }

  function getVoice() {
    if (!voicePicked || !chosenVoice) chosenVoice = pickVoice();
    return chosenVoice;
  }

  // Speak text via the synthesizer. Resolves on 'end' (or a safety timeout so a
  // stuck utterance can never hang a blend sequence).
  function speak(text, rate, pitch) {
    if (!speech || !text) return Promise.resolve();
    rate = rate || 1; pitch = pitch || 1;
    return new Promise(function (resolve) {
      var done = false;
      function fin() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      }
      try { speech.cancel(); } catch (e) {}   // latest-tap-wins; avoids overlap/queue buildup
      var u = new SpeechSynthesisUtterance(String(text));
      var v = getVoice();
      if (v) u.voice = v;
      u.lang = (v && v.lang) || 'en-US';
      u.rate = rate; u.pitch = pitch; u.volume = 1;
      u.onend = fin; u.onerror = fin;
      // Backstop: estimate spoken length (slower rate => longer) + buffer.
      var ms = Math.max(700, (String(text).length * 90) / rate) + 500;
      var timer = setTimeout(fin, ms);
      try { speech.speak(u); } catch (e) { fin(); }
    });
  }

  // Replay an already-resolved <audio> element from the start; resolves when it
  // finishes. This runs from a cached element, so play() happens in a microtask
  // right off the tap gesture — which iOS allows.
  function playElement(a) {
    return new Promise(function (resolve) {
      var done = false, timer;
      function fin() { if (done) return; done = true; clearTimeout(timer); a.onended = a.onerror = null; resolve(); }
      a.onended = fin; a.onerror = fin;
      timer = setTimeout(fin, 6000);   // never hang a blend sequence
      try {
        a.currentTime = 0;
        var p = a.play();
        if (p && p.catch) p.catch(function () { fin(); });
      } catch (e) { fin(); }
    });
  }

  // Play the recorded clip for `base` if one exists, else fall back to TTS.
  //
  // The first time a sound is heard we try each supported format by ACTUALLY
  // PLAYING it — synchronously off the tap, so iOS Safari's autoplay rules allow
  // it — and remember the format that works. A missing/undecodable format falls
  // through to the next, then to text-to-speech. Crucially we only remember a
  // definite "no clip" after every format truly 404s; a blocked play (iOS) keeps
  // the valid clip cached for next time instead of disabling the letter.
  function playClipOrTts(base, ttsFn) {
    var known = clipResolved[base];
    if (known && known.el) return playElement(known.el);   // fast path: reuse cached clip
    if (known === 'none') return ttsFn();                  // confirmed: no clip in any format

    return new Promise(function (resolve) {
      var i = 0;
      (function tryNext() {
        if (i >= CLIP_EXTS.length) { clipResolved[base] = 'none'; ttsFn().then(resolve); return; }
        var a = new Audio(AUDIO_DIR + base + '.' + CLIP_EXTS[i++]);
        var settled = false, backstop;
        function seal() { settled = true; clearTimeout(backstop); a.onended = a.onerror = a.onplaying = null; }
        a.onplaying = function () { clipResolved[base] = { el: a }; };            // this format works — remember it
        a.onended   = function () { if (!settled) { seal(); resolve(); } };
        a.onerror   = function () { if (!settled) { seal(); tryNext(); } };       // missing/undecodable — try next
        backstop = setTimeout(function () { if (!settled) { seal(); resolve(); } }, 6000);
        var p;
        try { p = a.play(); } catch (e) { seal(); tryNext(); return; }
        if (p && p.catch) p.catch(function (err) {
          if (settled) return;
          if (err && err.name === 'NotAllowedError') {          // autoplay-blocked but the clip is valid
            clipResolved[base] = { el: a }; seal(); resolve();  // keep it cached; next tap will play it
          } else {                                              // NotSupportedError etc. — wrong/absent format
            seal(); tryNext();
          }
        });
      })();
    });
  }

  // ---- public API ----------------------------------------------------------

  function playLetter(letter) {
    var l = String(letter).toLowerCase();
    return playClipOrTts('letter_' + l, function () {
      return speak(PHONEME[l] || l, LETTER_RATE, LETTER_PITCH);
    });
  }

  function playWord(word) {
    var w = String(word).toLowerCase();
    return playClipOrTts('word_' + w, function () {
      return speak(w, WORD_RATE, WORD_PITCH);
    });
  }

  // The heart of the game: sound out each letter slowly, pause, then say the
  // whole word ("m … a … t" -> "mat").
  function playBlend(word) {
    var letters = String(word).toLowerCase().split('');
    var chain = Promise.resolve();
    letters.forEach(function (l, i) {
      chain = chain
        .then(function () { return playLetter(l); })
        .then(function () { return wait(i < letters.length - 1 ? GAP_BETWEEN_LETTERS : GAP_BEFORE_WORD); });
    });
    return chain.then(function () { return playWord(word); });
  }

  function say(text) {
    return speak(text, SAY_RATE, SAY_PITCH);
  }

  // Prefer a recorded ui_<name> prompt clip, else speak the fallback text.
  function sayUi(name, fallbackText) {
    return playClipOrTts('ui_' + name, function () {
      return say(fallbackText || '');
    });
  }

  function stopAll() {
    try { if (speech) speech.cancel(); } catch (e) {}
    Object.keys(clipResolved).forEach(function (base) {
      var r = clipResolved[base];
      if (r && r.el) { try { r.el.pause(); } catch (e) {} }
    });
  }

  // Browsers block audio until the user interacts. Call this from the first
  // real gesture (a tap) to "prime" both the synthesizer and HTML audio.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      if (speech) {
        var u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        speech.speak(u);
        speech.resume();
      }
    } catch (e) {}
  }

  // Voices often load asynchronously; refresh our pick when they arrive.
  if (speech && typeof speech.addEventListener === 'function') {
    speech.addEventListener('voiceschanged', function () {
      voicePicked = false;
      chosenVoice = null;
      getVoice();
    });
  }

  return {
    playLetter: playLetter,
    playWord: playWord,
    playBlend: playBlend,
    say: say,
    sayUi: sayUi,
    stopAll: stopAll,
    unlock: unlock,
    isUnlocked: function () { return unlocked; }
  };
})();
