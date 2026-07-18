/*
 * Reading Kingdom — Main  (boot + screen routing + all screens)
 * =============================================================================
 * Ties everything together: runs the decodability validator on boot, then
 * routes between the screens described in BUILD-SPEC §6–7:
 *   Buddy picker → Kingdom map → (optional warm-up) → Book/blend → Celebration
 *   with a Trophy shelf reachable from the map.
 *
 * No framework, no router library — just show/hide of freshly-built DOM. All
 * navigation is icons + spoken prompts (no text menus); on-screen letters/words
 * are the CONTENT, not UI chrome.
 */
(function () {
  'use strict';

  // ---- small DOM helper ----------------------------------------------------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!attrs.hasOwnProperty(k) || attrs[k] == null) continue;
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k === 'style') n.setAttribute('style', attrs[k]);
        else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') {
          n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          n.setAttribute(k, attrs[k]);
        }
      }
    }
    if (kids != null) {
      (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
        if (c == null) return;
        n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return n;
  }

  // ---- lightweight WebAudio sound effects (no asset files needed) ----------
  var SFX = (function () {
    var ctx = null;
    function ac() {
      if (!ctx) {
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { ctx = null; }
      }
      return ctx;
    }
    function resume() { var c = ac(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} } }
    function tone(freq, start, dur, type, gainv) {
      var c = ac(); if (!c) return;
      try {
        var o = c.createOscillator(), g = c.createGain();
        o.type = type || 'sine';
        o.frequency.value = freq;
        o.connect(g); g.connect(c.destination);
        var t = c.currentTime + start;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gainv || 0.2, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.03);
      } catch (e) {}
    }
    return {
      resume: resume,
      pop: function () { tone(560, 0, 0.12, 'triangle', 0.16); },
      chime: function () { tone(659, 0, 0.20, 'sine', 0.20); tone(988, 0.09, 0.24, 'sine', 0.15); },
      win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * 0.12, 0.3, 'sine', 0.18); }); },
      sparkle: function () { tone(1245, 0, 0.10, 'sine', 0.12); tone(1661, 0.06, 0.14, 'sine', 0.10); }
    };
  })();

  // ---- content constants ---------------------------------------------------
  var BUDDIES = [
    { id: 'puppy',   emoji: '🐶', name: 'Puppy' },
    { id: 'kitten',  emoji: '🐱', name: 'Kitten' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
    { id: 'bunny',   emoji: '🐰', name: 'Bunny' }
  ];
  var BUDDY_BY_ID = {};
  BUDDIES.forEach(function (b) { BUDDY_BY_ID[b.id] = b; });

  // Reward rotation deliberately alternates sports / princess-magic / animals so
  // nothing feels one-note (BUILD-SPEC §11).
  var REWARD_ROTATION = [
    { emoji: '🏅', name: 'a shiny medal' },
    { emoji: '👑', name: 'a royal crown' },
    { emoji: '🐶', name: 'a puppy sticker' },
    { emoji: '🏆', name: 'a gold trophy' },
    { emoji: '💎', name: 'a sparkly gem' },
    { emoji: '🦄', name: 'a unicorn sticker' },
    { emoji: '🎽', name: 'a race ribbon' },
    { emoji: '✨', name: 'magic sparkles' },
    { emoji: '🐱', name: 'a kitten sticker' },
    { emoji: '🥇', name: 'a first place medal' },
    { emoji: '🪄', name: 'a magic wand' },
    { emoji: '🐰', name: 'a bunny sticker' },
    { emoji: '🐷', name: 'a piggy sticker' },
    { emoji: '🐥', name: 'a baby chick sticker' }
  ];

  // Map-stop layout: 12 stops snaking across the play area (shared 0..100 space
  // for both the SVG trail and the % positioned stops so they line up).
  var LEVEL_COUNT = window.Engine.levelCount();
  var STOP_POS = [];
  (function () {
    for (var i = 0; i < LEVEL_COUNT; i++) {
      var t = LEVEL_COUNT > 1 ? i / (LEVEL_COUNT - 1) : 0;
      STOP_POS.push({ x: 8 + 84 * t, y: 50 + 30 * Math.sin(i * 1.05 + 0.35) });
    }
  })();

  // ---- app state -----------------------------------------------------------
  var appEl, fxEl, topbarEl;
  var state = {
    session: null,
    buddyEl: null,
    replayFn: function () {}   // speaker button re-speaks the current screen prompt
  };

  // ---- mounting & top bar --------------------------------------------------
  function mount(node) {
    window.Audio2.stopAll();
    appEl.innerHTML = '';
    appEl.appendChild(node);
    requestAnimationFrame(function () { node.classList.add('screen-in'); });
  }

  function iconBtn(emoji, label, onClick, cls) {
    return el('button', {
      'class': 'icon-btn' + (cls ? ' ' + cls : ''),
      'aria-label': label,
      onclick: function () { window.Audio2.unlock(); SFX.resume(); onClick(); }
    }, [el('span', { 'class': 'icon-btn-emoji', 'aria-hidden': 'true' }, emoji)]);
  }

  function setTopbar(cfg) {
    topbarEl.innerHTML = '';
    if (!cfg || cfg.visible === false) { topbarEl.classList.add('hidden'); return; }
    topbarEl.classList.remove('hidden');
    var left = el('div', { 'class': 'topbar-slot' }, cfg.left || []);
    var right = el('div', { 'class': 'topbar-slot' }, cfg.right || []);
    topbarEl.appendChild(left);
    topbarEl.appendChild(right);
  }

  var speakerBtn = function () {
    return iconBtn('🔊', 'Hear that again', function () { state.replayFn(); });
  };
  var trophyBtn = function () {
    return iconBtn('🏆', 'Trophy shelf', function () { showTrophyShelf(); });
  };
  var homeBtn = function () {
    return iconBtn('🏰', 'Back to the kingdom map', function () { showMap(); });
  };

  // ---- buddy helpers -------------------------------------------------------
  function buddyEmoji() {
    var b = BUDDY_BY_ID[window.Progress.getBuddy()];
    return b ? b.emoji : '🐶';
  }
  function makeBuddy(extraClass) {
    var node = el('div', { 'class': 'buddy' + (extraClass ? ' ' + extraClass : '') }, buddyEmoji());
    state.buddyEl = node;
    return node;
  }
  function cheerBuddy() {
    if (!state.buddyEl) return;
    state.buddyEl.classList.remove('cheer');
    void state.buddyEl.offsetWidth;   // restart the animation
    state.buddyEl.classList.add('cheer');
  }

  // ---- confetti ------------------------------------------------------------
  var CONFETTI = ['🎉', '⭐', '✨', '🎊', '💫', '🌟', '💛', '💜'];
  function confetti(count) {
    for (var i = 0; i < count; i++) {
      var p = el('div', { 'class': 'confetti' }, CONFETTI[i % CONFETTI.length]);
      p.style.left = (Math.random() * 100) + '%';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.animationDuration = (1.7 + Math.random() * 1.3) + 's';
      p.style.fontSize = (20 + Math.random() * 28) + 'px';
      fxEl.appendChild(p);
      (function (node) { setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 3400); })(p);
    }
  }

  // long-press helper (for the hidden parent reset)
  function onLongPress(node, ms, cb) {
    var timer = null;
    function start() { timer = setTimeout(function () { timer = null; cb(); }, ms); }
    function cancel() { if (timer) { clearTimeout(timer); timer = null; } }
    node.addEventListener('pointerdown', start);
    node.addEventListener('pointerup', cancel);
    node.addEventListener('pointerleave', cancel);
    node.addEventListener('pointercancel', cancel);
  }

  // =========================================================================
  // SCREEN 1 — Buddy picker  (BUILD-SPEC §6.1)
  // =========================================================================
  // opts.change = true when re-picking from the map (keeps all progress, and shows
  // a back button + a check on the current buddy). No args = first-launch pick.
  function showBuddyPicker(opts) {
    opts = opts || {};
    var change = !!opts.change;
    setTopbar(change ? { visible: true, left: [homeBtn()], right: [speakerBtn()] } : { visible: false });

    var grid = el('div', { 'class': 'buddy-grid' });
    BUDDIES.forEach(function (b) {
      var isCurrent = change && window.Progress.getBuddy() === b.id;
      var kids = [el('div', { 'class': 'buddy-emoji' }, b.emoji)];
      if (isCurrent) kids.push(el('span', { 'class': 'buddy-current-badge', 'aria-hidden': 'true' }, '✓'));
      var card = el('button', {
        'class': 'buddy-card' + (isCurrent ? ' current' : ''),
        'aria-label': b.name + (isCurrent ? ' (your buddy now)' : ''),
        onclick: function () {
          window.Audio2.unlock(); SFX.resume();
          if (card.classList.contains('picked')) return;
          card.classList.add('picked');
          window.Progress.setBuddy(b.id);
          SFX.sparkle();
          window.Audio2.sayUi('buddy_' + b.id, b.name + '!');
          confetti(20);
          setTimeout(showMap, 950);   // progress is untouched — setBuddy only changes the buddy
        }
      }, kids);
      grid.appendChild(card);
    });

    var screen = el('div', { 'class': 'screen buddy-picker' }, [
      el('div', { 'class': 'kingdom-title' }, '🏰'),
      el('div', { 'class': 'sparkle-row' }, '✨ 👑 ✨'),
      grid
    ]);

    state.replayFn = function () { window.Audio2.sayUi('pick_buddy', change ? 'Pick a new buddy!' : 'Pick your buddy!'); };
    mount(screen);

    if (change) {
      window.Audio2.say('Pick a new buddy!');
    } else {
      window.Audio2.sayUi('welcome', 'Welcome to the Reading Kingdom!').then(function () {
        return window.Audio2.sayUi('pick_buddy', 'Pick your buddy!');
      });
    }
  }

  // =========================================================================
  // SCREEN 2 — Kingdom map  (BUILD-SPEC §6.2)
  // =========================================================================
  function showMap() {
    setTopbar({ visible: true, left: [homeBtnDisabledPlaceholder()], right: [speakerBtn(), trophyBtn()] });

    var nextLevel = window.Engine.nextPlayableLevel();
    var unlocked = window.Progress.getUnlockedLevel();
    var allDone = window.Engine.isLevelComplete(LEVEL_COUNT) && unlocked >= LEVEL_COUNT;

    // SVG trail behind the stops.
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'map-trail');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    var d = 'M ' + STOP_POS.map(function (p) { return p.x + ' ' + p.y; }).join(' L ');
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'map-trail-path');
    svg.appendChild(path);

    var stops = el('div', { 'class': 'map-stops' });
    for (var i = 0; i < LEVEL_COUNT; i++) {
      (function (idx) {
        var levelId = idx + 1;
        var pos = STOP_POS[idx];
        var isUnlocked = window.Progress.isLevelUnlocked(levelId);
        var isComplete = window.Engine.isLevelComplete(levelId);
        var isNext = (levelId === nextLevel) && isUnlocked && !isComplete;

        var face = !isUnlocked ? '😴' : (isComplete ? '⭐' : '🏰');
        var cls = 'map-stop';
        if (!isUnlocked) cls += ' locked';
        else if (isNext) cls += ' current';
        else if (isComplete) cls += ' done';
        else cls += ' open';

        var stop = el('button', {
          'class': cls,
          'aria-label': 'Kingdom stop ' + levelId,
          style: 'left:' + pos.x + '%; top:' + pos.y + '%;',
          onclick: function () {
            window.Audio2.unlock(); SFX.resume();
            if (!isUnlocked) {
              stop.classList.remove('shake'); void stop.offsetWidth; stop.classList.add('shake');
              window.Audio2.say("Let's finish the other places first!");
              return;
            }
            SFX.pop();
            startLevel(levelId);
          }
        }, [
          el('span', { 'class': 'map-stop-face', 'aria-hidden': 'true' }, face),
          el('span', { 'class': 'map-stop-num', 'aria-hidden': 'true' }, String(levelId))
        ]);
        stops.appendChild(stop);
      })(i);
    }

    // The map buddy is tappable — tap it to change your buddy (keeps progress).
    var mapBuddy = makeBuddy('buddy-map');
    mapBuddy.setAttribute('role', 'button');
    mapBuddy.setAttribute('aria-label', 'Change your buddy');
    mapBuddy.appendChild(el('span', { 'class': 'buddy-swap-badge', 'aria-hidden': 'true' }, '🔄'));
    mapBuddy.addEventListener('click', function () {
      window.Audio2.unlock(); SFX.resume(); SFX.pop();
      showBuddyPicker({ change: true });
    });

    var screen = el('div', { 'class': 'screen map-screen' }, [
      el('div', { 'class': 'map-header' }, allDone ? '👑 Reading Kingdom 👑' : '🏰 Reading Kingdom'),
      el('div', { 'class': 'map-area' }, [svg, stops, mapBuddy])
    ]);

    state.replayFn = function () {
      if (allDone) window.Audio2.say('You finished the whole kingdom! Tap a castle to read again.');
      else window.Audio2.say('Tap the glowing castle to read a book!');
    };
    mount(screen);

    // Let the buddy greet on arrival.
    state.replayFn();
  }

  // The map's left top-bar slot is intentionally empty (you're already home).
  function homeBtnDisabledPlaceholder() { return el('div', { 'class': 'topbar-spacer' }); }

  // =========================================================================
  // Optional sound warm-up before a level that introduces new letters (§6)
  // =========================================================================
  function startLevel(levelId) {
    var book = window.Engine.firstUnfinishedBook(levelId);
    if (!book) return;
    var newLetters = window.Engine.newLettersForLevel(levelId);
    var firstBook = window.Engine.booksForLevel(levelId)[0];
    var freshLevel = firstBook && book.id === firstBook.id && !window.Progress.isBookComplete(book.id);

    if (newLetters.length && freshLevel) {
      showWarmup(levelId, newLetters, function () { startBook(book.id); });
    } else {
      startBook(book.id);
    }
  }

  function showWarmup(levelId, letters, done) {
    setTopbar({ visible: true, left: [homeBtn()], right: [speakerBtn()] });

    var row = el('div', { 'class': 'warmup-row' });
    letters.forEach(function (l) {
      var card = el('button', {
        'class': 'warmup-card',
        'aria-label': 'Letter ' + l,
        onclick: function () {
          window.Audio2.unlock(); SFX.resume(); SFX.pop();
          card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
          window.Audio2.playLetter(l);
        }
      }, [
        el('span', { 'class': 'warmup-letter' + (window.Engine.isVowel(l) ? ' vowel' : '') }, l),
        el('span', { 'class': 'warmup-keyword' }, window.Emoji.forLetter(l))
      ]);
      row.appendChild(card);
    });

    var goBtn = el('button', {
      'class': 'big-go-btn',
      'aria-label': "Let's read",
      onclick: function () { window.Audio2.unlock(); SFX.resume(); SFX.pop(); done(); }
    }, [el('span', { 'aria-hidden': 'true' }, '▶')]);

    var screen = el('div', { 'class': 'screen warmup-screen' }, [
      el('div', { 'class': 'warmup-title' }, '🔤 New sounds!'),
      row,
      makeBuddy('buddy-side'),
      goBtn
    ]);

    state.replayFn = function () { window.Audio2.say('Tap the letters to hear their sounds.'); };
    mount(screen);
    // auto-play each new sound once, in sequence, then invite a tap
    var chain = Promise.resolve();
    letters.forEach(function (l) { chain = chain.then(function () { return window.Audio2.playLetter(l); }).then(function () { return new Promise(function (r) { setTimeout(r, 200); }); }); });
  }

  // =========================================================================
  // SCREEN 3 — Book / blend screen  (the core — BUILD-SPEC §7)
  // =========================================================================
  function startBook(bookId) {
    state.session = window.Engine.makeSession(bookId);
    if (!state.session) { showMap(); return; }
    renderWord();
  }

  function renderWord() {
    var s = state.session;
    var word = s.currentWord();
    var letters = s.currentLetters();
    var blending = false;
    var advanced = false;

    setTopbar({ visible: true, left: [homeBtn()], right: [speakerBtn()] });

    // progress dots — how many words of this book are done
    var dots = el('div', { 'class': 'progress-dots' });
    for (var i = 0; i < s.total; i++) {
      dots.appendChild(el('span', { 'class': 'dot' + (i < s.wordsDone() ? ' filled' : '') }, i < s.wordsDone() ? '⭐' : '•'));
    }

    // letter tiles
    var wordRow = el('div', { 'class': 'word-row' });
    var tiles = [];
    letters.forEach(function (l) {
      var tile = el('button', {
        'class': 'tile' + (window.Engine.isVowel(l) ? ' vowel' : ''),
        'aria-label': 'Letter ' + l,
        onclick: function () {
          if (blending) return;
          window.Audio2.unlock(); SFX.resume(); SFX.pop();
          tile.classList.remove('tap'); void tile.offsetWidth; tile.classList.add('tap');
          window.Audio2.playLetter(l);
        }
      }, l);
      tiles.push(tile);
      wordRow.appendChild(tile);
    });

    var blendBtn = el('button', {
      'class': 'blend-btn',
      'aria-label': 'Blend the sounds together',
      onclick: doBlend
    }, [el('span', { 'class': 'blend-emoji', 'aria-hidden': 'true' }, '🧲'), el('span', { 'class': 'blend-label' }, 'Blend')]);

    var confirm = el('div', { 'class': 'confirm-overlay hidden' });

    var stage = el('div', { 'class': 'book-stage' }, [
      dots,
      wordRow,
      el('div', { 'class': 'blend-area' }, blendBtn),
      makeBuddy('buddy-side')
    ]);

    var screen = el('div', { 'class': 'screen book-screen' }, [stage, confirm]);

    state.replayFn = function () {
      if (confirm.classList.contains('hidden')) window.Audio2.say('Tap the letters, then tap blend!');
      else window.Audio2.playWord(word);
    };
    mount(screen);

    // gentle spoken invite for the very first word of the book
    if (s.indexNow() === 0) {
      window.Audio2.say('Tap the letters, then blend them together!');
    }

    function doBlend() {
      if (blending) return;
      blending = true;
      window.Audio2.unlock(); SFX.resume();
      blendBtn.disabled = true;
      wordRow.classList.add('merging');

      setTimeout(function () {
        window.Audio2.playBlend(word).then(function () {
          SFX.chime();
          revealConfirm();
        });
      }, 460);
    }

    function revealConfirm() {
      cheerBuddy();
      confetti(10);
      var pic = window.Emoji.forWord(word);
      confirm.innerHTML = '';
      confirm.appendChild(el('div', { 'class': 'confirm-card' }, [
        el('div', { 'class': 'confirm-emoji' }, pic),
        el('div', { 'class': 'confirm-word' }, word),
        el('div', { 'class': 'confirm-arrow', 'aria-hidden': 'true' }, '➡️')
      ]));
      confirm.classList.remove('hidden');
      // tap anywhere on the confirmation advances (§7.4)
      confirm.onclick = function () {
        if (advanced) return;
        advanced = true;
        SFX.pop();
        var finished = s.advance();
        if (finished) showCelebration();
        else renderWord();
      };
    }
  }

  // =========================================================================
  // SCREEN 4 — Book-complete celebration  (BUILD-SPEC §6.4)
  // =========================================================================
  function showCelebration() {
    var s = state.session;
    setTopbar({ visible: false });

    // Award a rotating collectible, then record completion + any unlock.
    var reward = REWARD_ROTATION[window.Progress.rewardCount() % REWARD_ROTATION.length];
    var award = { emoji: reward.emoji, name: reward.name, bookId: s.bookId, ts: Date.now() };
    window.Progress.addReward(award);
    var outcome = window.Engine.completeBook(s.bookId);

    var buddy = makeBuddy('buddy-dance');

    var rewardCard = el('div', { 'class': 'reward-card pop-in' }, [
      el('div', { 'class': 'reward-emoji' }, award.emoji)
    ]);

    var continueBtn = el('button', {
      'class': 'big-go-btn celebrate-continue',
      'aria-label': 'Back to the kingdom map',
      onclick: function () { window.Audio2.unlock(); SFX.resume(); SFX.pop(); showMap(); }
    }, [el('span', { 'aria-hidden': 'true' }, '🏰')]);

    var screen = el('div', { 'class': 'screen celebrate-screen' }, [
      el('div', { 'class': 'celebrate-banner' }, '🎉 You read the whole book! 🎉'),
      buddy,
      rewardCard,
      continueBtn
    ]);

    state.replayFn = function () { window.Audio2.sayUi('read_whole_book', 'You read the whole book!'); };
    mount(screen);

    SFX.win();
    confetti(60);
    cheerBuddy();

    // Spoken celebration chain: big praise → prize → (maybe) new place unlocked.
    window.Audio2.sayUi('read_whole_book', 'You read the whole book!')
      .then(function () { return window.Audio2.sayUi('new_reward', 'You earned ' + award.name + '!'); })
      .then(function () {
        if (outcome.unlockedNewLevel) {
          confetti(30);
          return window.Audio2.sayUi('level_unlocked', 'You unlocked a new place in the kingdom!');
        }
      });
  }

  // =========================================================================
  // SCREEN 5 — Trophy shelf  (BUILD-SPEC §6.5 & §11)
  // =========================================================================
  function showTrophyShelf() {
    setTopbar({ visible: true, left: [homeBtn()], right: [speakerBtn()] });

    var rewards = window.Progress.getRewards();
    var grid = el('div', { 'class': 'trophy-grid' });

    if (!rewards.length) {
      grid.appendChild(el('div', { 'class': 'trophy-empty' }, [
        el('div', { 'class': 'trophy-empty-emoji' }, '🗃️'),
        el('div', { 'class': 'trophy-empty-hint' }, 'Read a book to win a prize!')
      ]));
    } else {
      rewards.forEach(function (r) {
        var cell = el('button', {
          'class': 'trophy-cell',
          'aria-label': r.name,
          onclick: function () {
            window.Audio2.unlock(); SFX.resume(); SFX.sparkle();
            cell.classList.remove('pop'); void cell.offsetWidth; cell.classList.add('pop');
            window.Audio2.say(r.name);
          }
        }, [el('span', { 'class': 'trophy-emoji' }, r.emoji)]);
        grid.appendChild(cell);
      });
    }

    var title = el('div', { 'class': 'trophy-title' }, '🏆 My Trophy Shelf 🏆');
    // Hidden parent control: long-press the title ~3s to reset all progress.
    onLongPress(title, 3000, function () {
      if (window.confirm('Reset all progress and start over?')) {
        window.Progress.reset();
        showBuddyPicker();
      }
    });

    var screen = el('div', { 'class': 'screen trophy-screen' }, [
      title,
      makeBuddy('buddy-corner'),
      grid
    ]);

    state.replayFn = function () {
      if (!rewards.length) window.Audio2.say('Read a book to win your first prize!');
      else window.Audio2.say('Here are your prizes! Tap one.');
    };
    mount(screen);
    state.replayFn();
  }

  // =========================================================================
  // Boot
  // =========================================================================
  function boot() {
    appEl = document.getElementById('app');
    fxEl = document.getElementById('fx');
    topbarEl = document.getElementById('topbar');

    // Decodability validator — the key correctness check (BUILD-SPEC §9).
    var report = window.Engine.validateCurriculum();
    if (!report.ok) {
      showValidatorBanner(report.violations);
      report.violations.forEach(function (v) {
        // Surface loudly so a content edit can never silently break rule §1.1.
        console.error('[Reading Kingdom] DECODABILITY VIOLATION — Level ' + v.level +
          ', book ' + v.bookId + ', word "' + v.word + '": ' + v.reason);
      });
    } else {
      console.log('[Reading Kingdom] Decodability check passed for all ' + LEVEL_COUNT + ' levels ✔');
    }

    // Prime audio on the first real gesture (autoplay policies) and re-speak the
    // current prompt so she always hears something right after her first touch.
    document.addEventListener('pointerdown', function primer() {
      window.Audio2.unlock();
      SFX.resume();
      state.replayFn();
      document.removeEventListener('pointerdown', primer);
    }, { once: true });

    // Register the service worker for offline / installable use (defensive: it
    // won't run from file:// and that's fine — BUILD-SPEC §2).
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }

    // First screen: buddy picker on first launch, otherwise straight to the map.
    if (window.Progress.hasBuddy()) showMap();
    else showBuddyPicker();
  }

  function showValidatorBanner(violations) {
    var banner = el('div', { 'class': 'dev-banner' },
      '⚠ Decodability check failed (' + violations.length + '). See console. ' +
      'First: L' + violations[0].level + ' "' + violations[0].word + '" — ' + violations[0].reason);
    document.body.appendChild(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
