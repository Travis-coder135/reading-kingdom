# Reading Kingdom — Build Specification (developer hand-off)

**Audience:** a developer building this from scratch. This document is self-contained — you
should not need any other context. Read `README.md` first for the vision; this is the *how*.

**One-line summary:** a touch-based iPad web game that teaches early reading through decodable
phonics — the child sounds out and blends short-vowel, 2–3 letter words, unlocking letters a few
at a time across 12 leveled "books," with spoken audio throughout and a short, always-completable
reward loop.

---

> **As-built updates (post-spec).** This document is the original plan; the shipped game follows
> it, with these refinements worth knowing up front:
> - **Letter sounds recorded.** All 25 letter clips (`letter_a.mp3` … `letter_z.mp3`) are recorded
>   in the owner's voice and live. Whole words and spoken prompts still use TTS until recorded.
> - **Audio formats.** Clips may be `.mp3`, `.m4a`, `.wav`, `.ogg`, or `.webm` (not only mp3).
> - **iPad-safe playback.** Clips play from within the tap gesture so iPad Safari's autoplay rules
>   don't silence them; a transient load failure never permanently disables a letter.
> - **Word display "like a book."** The word is shown as plain, connected letters on a light page
>   (no per-letter flashcard boxes, no vowel/consonant colour) — each still tappable for its sound.
>   See §7.
> - **Blend pacing.** During a blend the letters play ~1.4× (pitch preserved) with a short ~40 ms
>   gap, so it reads as one connected blend. See §8.
> - **Deployed.** Hosted on GitHub Pages and installable to the iPad home screen.

## 1. Hard requirements (do not violate these)

The pedagogy is the product. Every one of these is a correctness requirement, not a preference:

1. **Decodable only.** A word may only be shown if *every letter in it* has been introduced in
   the current level or an earlier one, **and** it contains a vowel that has been introduced.
   This must be enforced by an automated check (see §9).
2. **Blending is the core interaction.** Tap each letter tile → hear that letter's *sound*
   (phoneme, e.g. "mmm" — **not** the letter name "em"). Then a **Blend** action merges the
   tiles and speaks the whole word. This is the center of the game.
3. **Pictures confirm, never reveal.** Any picture/emoji for a word appears **only after** the
   child has blended it. Never show the picture beside the un-read word — that lets her guess
   instead of decode.
4. **No reading to navigate.** All navigation is icons + spoken prompts. No text menus, no typed
   input. (On-screen letters/words are the *content*, not UI chrome.)
5. **No fail states.** No timers, no scores, no "wrong — try again" penalties. Gentle re-prompts
   only. The loop is engineered so she always succeeds and always finishes.
6. **Gradual release.** A few new letters per level; word length and book length grow gently.
7. **Alphabet minus Q.** 2–3 letter words, short vowels only. No consonant blends, no digraphs
   (no `sh`, `ch`, `th`, `ck`, etc.) anywhere in this set.
8. **Touch-first.** Tap targets ≥ ~64px. No hover-dependent behavior. Tap (and at most simple
   drag) only. Target iPad Safari, landscape.

## 2. Technology & constraints

- **Plain HTML + CSS + JavaScript. No framework. No build/bundler step.** The owner is not a
  developer; the app must run from a static folder and survive with zero maintenance.
- **No ES-module imports across files / no `fetch()` of local JSON.** Load code and data as
  plain `<script>` tags that attach to `window` globals, so the app also works when opened from
  a `file://` path (not just from a server). Put the curriculum in `data/curriculum.js` as
  `window.CURRICULUM = {...}`, not in a `.json` file.
- **Progress** persists in `localStorage`.
- **PWA:** add `manifest.webmanifest` + a service worker for "Add to Home Screen" + offline.
  Register the service worker defensively (wrap in a feature check; it won't run from `file://`,
  and that's fine).
- **Orientation:** design for landscape; show a friendly "turn me sideways" overlay in portrait.
- **Self-contained art:** for v1, use **emoji** for buddies, rewards, and word-confirmation
  pictures so there are no missing image files. (An optional later art pass can swap in custom
  images.) This means no image assets are required to ship v1.

## 3. Suggested file structure

```
reading-kingdom/
  index.html
  manifest.webmanifest
  sw.js                    # service worker (offline cache)
  css/
    styles.css
  js/
    audio.js               # window.Audio2 — playback + Web Speech phoneme fallback
    emoji.js               # window.WORD_EMOJI + window.LETTER_EMOJI maps
    progress.js            # window.Progress — localStorage load/save
    engine.js              # window.Engine — book/word/blend logic
    main.js                # boot, decodability check, screen routing
  data/
    curriculum.js          # window.CURRICULUM — the 12 levels (source of truth)
  assets/
    audio/                 # (optional) real recorded clips; engine prefers these if present
    icons/                 # PWA icons (192px, 512px)
```

Load order in `index.html` (plain scripts, no `type=module`):
`curriculum.js → emoji.js → audio.js → progress.js → engine.js → main.js`.

## 4. Data model

`window.CURRICULUM` shape:

```js
window.CURRICULUM = {
  levels: [
    {
      id: 1,
      newLetters: ["m", "a", "t", "s"],   // letters first introduced this level
      sightWords: [],                       // minimal; whole-word taught, not blended
      books: [
        { id: "1-1", words: ["mat", "sat", "am", "at"] },
        { id: "1-2", words: ["sam", "tam", "as", "mat"] }
      ]
    },
    // ...levels 2–12
  ]
};
```

Notes:
- A **word is just a string**; the engine derives its letters by splitting characters. The
  emoji picture is looked up from `window.WORD_EMOJI[word]` (fallback ⭐) so it isn't stored in
  the curriculum.
- **"Letters known through level N"** = the union of `newLetters` for levels `1..N`. The engine
  computes this; the validator uses it.
- Keep words **lowercase**. (Names like "sam" stay lowercase to avoid capital-letter confusion
  for a brand-new reader.)

## 5. The complete curriculum (validated, decodable)

Vowel order **a → o → i → u → e**; a few new letters per level; alphabet minus Q. Every word
below has been checked: its letters are a subset of the letters known through its level, and it
contains an introduced vowel. Use these as the word banks; group them into books (4 words each
early, up to ~6 later). Suggested book groupings are given.

**Cumulative letters available, by level:**

| Lvl | New letters | All letters known so far | Introduced vowels |
|-----|-------------|--------------------------|-------------------|
| 1  | m a t s | m a t s | a |
| 2  | d p     | m a t s d p | a |
| 3  | n g     | m a t s d p n g | a |
| 4  | o c     | m a t s d p n g o c | a o |
| 5  | h r     | m a t s d p n g o c h r | a o |
| 6  | i b     | m a t s d p n g o c h r i b | a o i |
| 7  | f l     | m a t s d p n g o c h r i b f l | a o i |
| 8  | u j     | m a t s d p n g o c h r i b f l u j | a o i u |
| 9  | k w x   | m a t s d p n g o c h r i b f l u j k w x | a o i u |
| 10 | e v     | + e v | a o i u e |
| 11 | y z     | + y z | a o i u e |
| 12 | (none — review) | all except q | a o i u e |

**Word banks & suggested books:**

- **Level 1** (m a t s): `at, am, as, mat, sat, sam, tam`
  - Book 1-1: at, am, mat, sat · Book 1-2: sam, tam, as, mat
- **Level 2** (+d p): `dad, mad, sad, pad, pat, tap, map, sap, dam, tad`
  - Book 2-1: dad, mad, sad, pat · Book 2-2: tap, map, pad, sap
- **Level 3** (+n g): `man, pan, tan, nap, nag, tag, gap, gas, sag, gag, and`
  - Book 3-1: man, pan, tan, nap · Book 3-2: tag, nag, gap, gas
- **Level 4** (+o c): `cat, can, cap, cot, cop, cod, cog, dot, dog, got, pot, top, mop, nod, pod`
  - Book 4-1: dog, cat, cot, dot · Book 4-2: pot, top, mop, got · Book 4-3: cop, nod, cod, cap
- **Level 5** (+h r): `hat, ham, had, hop, hot, hog, rat, ram, ran, rag, rap, rot, rod, tar, car, par`
  - Book 5-1: hat, ham, had, hop · Book 5-2: rat, ran, rag, ram · Book 5-3: hot, hog, rod, car
- **Level 6** (+i b): `big, bit, bib, bin, bid, bat, bag, bar, bob, cab, rib, rig, rim, tin, tip, dig, dip, din, hit, him, his, hip, sit, sip, pig, pin, pit`
  - Book 6-1: pig, big, dig, pin · Book 6-2: sit, sip, hit, bit · Book 6-3: him, his, rib, bib
- **Level 7** (+f l): `fan, fat, fit, fig, fin, fib, fog, log, lot, lit, lip, lid, lap, lag, lad, pal, gal`
  - Book 7-1: fan, fat, fit, fig · Book 7-2: lap, lad, lid, lip · Book 7-3: log, lot, fog, fin
- **Level 8** (+u j): `jug, jam, jog, jab, cub, cup, cut, hug, hut, hum, bug, bun, bus, gum, gun, mud, mug, nut, pup, run, sun, tub, tug, fun, rug, rub`
  - Book 8-1: sun, run, fun, bun · Book 8-2: cup, cut, cub, bug · Book 8-3: mug, mud, jug, hug · Book 8-4: bus, nut, tub, pup
- **Level 9** (+k w x): `kid, kit, kin, wig, win, wit, wag, wax, wok, box, fox, fix, six, mix, tax, fax, ox`
  - Book 9-1: box, fox, six, fix · Book 9-2: mix, wax, tax, wig · Book 9-3: win, wit, kid, kit
- **Level 10** (+e v): `bed, beg, den, get, gem, hen, hem, jet, leg, let, men, met, net, pen, pet, peg, red, set, ten, vet, wet, web, wed, fed, van, vat`
  - Book 10-1: bed, red, hen, pen · Book 10-2: net, jet, pet, vet · Book 10-3: leg, beg, peg, men · Book 10-4: get, let, set, wet
- **Level 11** (+y z): `yes, yet, yak, yam, yap, yum, yip, zap, zip, zig, zag, zit, fez, biz`
  - Book 11-1: yes, yet, yam, yak · Book 11-2: zip, zap, zig, zag
- **Level 12** (review — all vowels): `cat, dog, sun, pig, bed, box, jam, hat, run, six, web, mud, hen, fox, cup, van, red, big, top, bug`
  - Book 12-1: cat, dog, sun, pig · Book 12-2: bed, box, jam, hat · Book 12-3: run, six, web, mud

**Sight words:** keep minimal. `and` appears in Level 3 but is fully decodable, so treat it as a
normal word. If you later add non-decodable helpers (`the`, `is`), teach them as spoken whole
units with a distinct tile style, and add them to a `sightWords` list — never require blending
them.

## 6. Screens & flow

Single-page app; show/hide screen containers, no router library. Screens:

1. **Buddy picker** (first launch only, then skippable via settings): 4 big emoji buddies
   (e.g. 🐶 🐱 🦄 🐰). Tapping one speaks its name and stores the choice. The chosen buddy
   appears on every later screen and reacts to successes.
2. **Map / kingdom:** 12 stops laid on a path. Locked stops look "asleep" (dimmed 😴); the
   next playable stop gently pulses. Tapping a playable stop opens its book list (or first
   unfinished book directly). A **trophy-shelf** icon and a **replay-audio** speaker icon are
   the only persistent controls.
3. **Book / blend screen (the core):** see §7.
4. **Book-complete celebration:** confetti/sparkles, buddy dance, spoken "You read the whole
   book!", award a collectible, then return to map (unlock next stop if it was the level's last
   book).
5. **Trophy shelf:** grid of earned collectibles; tapping one plays a happy sound / speaks it.

Optional **sound warm-up** at the start of a level that introduces new letters: flash each *new*
letter, tap to hear its sound, buddy cheers. One tap to skip (it's optional because she already
knows most sounds — never a gate).

## 7. The book / blend screen (spec the core carefully)

State: a book = ordered list of words; render one word at a time.

Per word:
1. Render the word as a **readable word** — plain, connected letters on a light "page" (e.g.
   `mat`, *not* three separated flashcard tiles), large and dark like print, so she can read the
   word itself. Each letter is still its own tap target. The buddy watches from the side. A
   progress indicator (e.g. stars along a path) shows how many words are done / remaining.
   *(As built: this replaced the original separated-tiles look so words look like real words; the
   per-letter tap-for-sound behaviour is unchanged.)*
2. **Tap a letter** → it lifts with a soft highlight and plays that letter's **sound** (phoneme).
   She may tap letters any number of times, in any order. No penalty, no required order.
3. **Blend action** → a big friendly **Blend** button (magnet icon). On tap the letters play in
   sequence — sped up ~1.4× (pitch preserved) with only a short gap between them, so it reads as
   one connected blend rather than three spaced-out sounds — then the whole word is spoken.
   *(Blend is a button, chosen for age 5; drag-to-blend was the alternative.)*
4. **Confirmation:** the word's emoji picture pops in (this is the first time any picture
   appears), a happy chime plays, buddy reacts. A forward arrow (or a tap anywhere) advances.
5. After the last word → book-complete celebration (§6.4).

Rules: no wrong answers exist on this screen. If she taps Blend before tapping any letters,
still blend (gently). Everything moves forward.

## 8. Audio (required — she can't read)

Speak everything: letter sounds, whole words, celebrations, and navigation prompts.

- **`window.Audio2` API** (suggested): `playLetter(letter)`, `playWord(word)`,
  `playBlend(word)` (letters slow, then the word), `say(text)` for prompts/celebrations.
- **Preferred source: pre-recorded clips** in `assets/audio/` — `letter_<l>`, `word_<word>`, and
  `ui_<name>` in any of `.mp3` / `.m4a` / `.wav` / `.ogg` / `.webm`. If a clip exists, play it.
  Pre-recorded is the phonics gold standard because it produces correct **phonemes**; browser TTS
  says letter **names**. `AUDIO-CHECKLIST.md` is the manifest of wanted clips. **As built: all 25
  letter clips are recorded (owner's voice) and live**; whole words and prompts still use TTS.
  Clips are played from within the tap gesture (so iPad Safari doesn't silence them), and during a
  blend the letter clips are sped up ~1.4× with pitch preserved and tight gaps.
- **Fallback: Web Speech API** (`speechSynthesis`) so the game is fully playable *before any clip
  is recorded*. For **letters**, feed the synthesizer a phoneme approximation, not the letter
  name. Suggested approximations (tune by ear; slower rate ~0.7, slightly higher pitch):

  ```
  a "ah"  b "buh"  c "kuh"  d "duh"  e "eh"  f "ff"  g "guh"  h "huh"
  i "ih"  j "juh"  k "kuh"  l "ll"   m "mm"  n "nn"  o "aw"   p "puh"
  r "rr"  s "ss"   t "tuh"  u "uh"   v "vv"  w "wuh"  x "ks"  y "yuh"  z "zz"
  ```

  For **whole words**, TTS reads them acceptably — just speak the word string. Prefer an English
  voice; a warm/female voice if available. The engine should transparently prefer a real clip
  when present and fall back to TTS otherwise.

## 9. Decodability validator (the key correctness check)

On boot (and ideally as a standalone script the owner can run), verify the whole curriculum:

- For each level N, compute `known = union(newLetters for levels 1..N)`.
- For each word in each book of level N:
  - every character of the word must be in `known`;
  - the word must contain at least one **introduced vowel** (a vowel first appearing in level
    ≤ N).
- If any word fails, **surface it loudly** (dev banner + console error listing the offending
  word, book, and level). This guarantees rule §1.1 can never silently break when content is
  edited later. Keep it running in dev; it can be silent/no-op in "production" but should never
  be removed.

## 10. Progress persistence

`window.Progress` over `localStorage` (single child for v1):
- `buddy` — chosen buddy id.
- `unlockedLevel` — highest unlocked level (start 1).
- `completedBooks` — set/array of book ids finished.
- `rewards` — array of earned collectibles.
Provide a hidden/parent reset (e.g. long-press the shelf) to clear progress. A "who's playing?"
multi-child picker is explicitly **out of scope for v1** but leave room for it.

## 11. Rewards (rotate across all three interests)

On book completion, award one collectible, rotating so nothing feels one-note:
- **Sports:** 🏅 medal, 🏆 trophy, 🎽 ribbon.
- **Princess/magic:** 👑 crown, 💎 gem, ✨ sparkles, 🪄 wand.
- **Animals/pets:** 🐶 🐱 🦄 🐰 🐷 🐥 stickers.
Store earned rewards; show them on the trophy shelf; tapping one replays a happy sound.

## 12. Build order (ship incrementally)

1. **Vertical slice:** buddy picker → map (Level 1 stop live) → Book 1-1 → full blend mechanic →
   celebration → reward shelf → progress saved. TTS fallback audio only. *This is the first thing
   she can play.*
2. **All content:** enter all 12 levels into `curriculum.js`; wire the decodability validator.
3. **Polish:** PWA install + offline + orientation lock; reward rotation; optional sound warm-up;
   trophy shelf.
4. **Real audio:** record letter phonemes + word clips; engine auto-prefers them.
5. **(Optional) art pass:** swap emoji for custom buddy/reward/word images (still never shown
   before the blend).

## 13. Acceptance criteria (definition of done for v1)

- [ ] The decodability validator passes for all 12 levels with zero violations.
- [ ] A non-reader can navigate the entire app using only icons + spoken prompts (no text menu
      is required to progress).
- [ ] Tapping a letter plays its **sound** (not its name); blending plays the whole word.
- [ ] A word's picture appears **only after** the blend, never before.
- [ ] There are no timers, scores, or failure/penalty states anywhere.
- [ ] Completing a book shows a celebration, awards a collectible, and (if it's the level's last
      book) unlocks the next map stop.
- [ ] Progress (buddy, unlocked level, rewards) survives closing and reopening the app.
- [ ] Works in iPad Safari in landscape with tap targets ≥ ~64px; portrait shows a rotate hint.
- [ ] Installable via "Add to Home Screen" and launches full-screen; core play works offline.

## 14. Decisions (resolved, as built)

- Blend trigger: **button** ✓ (chosen over drag-tiles-together).
- Word display: **plain connected letters on a page, "like a book"** ✓ (not separated tiles).
- Orientation: **landscape**, with a friendly "turn me sideways" hint in portrait ✓.
- Hosting: **GitHub Pages** (free public URL), installable to the iPad home screen ✓.
- Audio: **owner records his own voice** ✓ — the 25 letter sounds are done; words/prompts optional.
