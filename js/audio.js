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
 * AUDIO-CHECKLIST.md):
 *   letter_<l>.mp3   word_<word>.mp3   ui_<name>.mp3
 * The engine probes a clip the first time it's needed by simply trying to play
 * it; if it 404s / is missing it marks it absent and uses TTS from then on.
 */
window.Audio2 = (function () {
  'use strict';

  var AUDIO_DIR = 'assets/audio/';

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
  var clipStatus = {};   // src -> 'present' | 'absent'
  var clipCache = {};    // src -> HTMLAudioElement (reused once known present)
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

  // Try to play a recorded clip; if it's missing/errors, run the TTS fallback.
  // Resolves when the sound (clip or fallback) finishes.
  function playClipOrTts(src, ttsFn) {
    if (clipStatus[src] === 'absent') return ttsFn();

    return new Promise(function (resolve) {
      var audio = clipCache[src] || new Audio(src);
      var done = false;
      function finish(viaError) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        audio.onended = audio.onerror = null;
        if (viaError) {
          clipStatus[src] = 'absent';         // remember: use TTS next time
          ttsFn().then(resolve);
        } else {
          clipStatus[src] = 'present';
          clipCache[src] = audio;
          resolve();
        }
      }
      audio.onended = function () { finish(false); };
      audio.onerror = function () { finish(true); };
      // Safety backstop in case neither event fires.
      var timer = setTimeout(function () { finish(false); }, 5000);
      try {
        audio.currentTime = 0;
        var p = audio.play();
        if (p && p.catch) p.catch(function () { finish(true); });
      } catch (e) {
        finish(true);
      }
    });
  }

  // ---- public API ----------------------------------------------------------

  function playLetter(letter) {
    var l = String(letter).toLowerCase();
    var phoneme = PHONEME[l] || l;
    return playClipOrTts(AUDIO_DIR + 'letter_' + l + '.mp3', function () {
      return speak(phoneme, LETTER_RATE, LETTER_PITCH);
    });
  }

  function playWord(word) {
    var w = String(word).toLowerCase();
    return playClipOrTts(AUDIO_DIR + 'word_' + w + '.mp3', function () {
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

  // Prefer a recorded ui_<name>.mp3 prompt, else speak the fallback text.
  function sayUi(name, fallbackText) {
    return playClipOrTts(AUDIO_DIR + 'ui_' + name + '.mp3', function () {
      return say(fallbackText || '');
    });
  }

  function stopAll() {
    try { if (speech) speech.cancel(); } catch (e) {}
    Object.keys(clipCache).forEach(function (src) {
      try { clipCache[src].pause(); } catch (e) {}
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
