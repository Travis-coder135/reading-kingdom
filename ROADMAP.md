# Reading Kingdom — Roadmap 🗺️

Ideas and build-outs to take the game from "a solid first reader" to "the app she asks for by
name." This is a menu, not a contract — pick by **impact vs. effort**. Nothing here is required;
the game is already complete and playable.

Where useful, items reference what already exists in the code so they're concrete, not generic.

## How to read this

Each item is tagged with rough **effort** and **what it moves**:

- **Effort:** `S` = a few hours · `M` = a day or a few · `L` = a multi-day project.
- **Tags:** 🎯 teaches reading · 💛 keeps her coming back · 👪 for the grown-ups · ♿ reaches more
  kids · 🎙️ audio · 🎨 art & sound · 🛠️ technical/robustness.

A **⭐ Recommended next 5** list is at the bottom if you just want a place to start.

## Guardrails (keep these true as you add features)

These are the reasons the game works. Any new feature should respect them — see `BUILD-SPEC.md §1`.

1. **Decodable only.** New words must pass the boot-time decodability validator (`engine.js`).
   Never show a word she can't sound out from letters already taught.
2. **No reading to navigate.** Menus stay icon + voice. On-screen text is *content*, not UI.
3. **No fail states.** No timers, no scores, no "wrong." Confidence is the fuel.
4. **Touch + audio first**, landscape iPad, tap targets ≥ ~64px.
5. **Stays a plain static site** (no build step) so it's hostable and maintenance-free. A few
   items below would challenge this — they're flagged with ⚠️ so you can decide deliberately.

---

## Phase 1 — Finish the voice 🎙️ (you're ~⅓ done)

The 25 letter sounds are recorded. Completing the audio is the single biggest "this feels
hand-made" upgrade, and the on-ramp is warm because the engine already prefers clips per-sound.

- **Record the whole-word clips** — `M · 🎯🎙️`. ~186 `word_*.mp3` files (`AUDIO-CHECKLIST.md`
  Priority 2). Today blending plays *your* letters then a robot word; recording words makes the
  whole blend your voice and fixes any odd TTS pronunciations.
- **Record prompts & celebrations** — `S · 💛🎙️`. ~20 `ui_*.mp3` ("You read the whole book!" in
  your voice is a huge motivator). Priority 1B in the checklist.
- **Rotating praise** — `S · 💛`. Record 2–3 takes of "Great job!/Yay!/Wow!" and rotate them so
  praise never sounds repetitive (the checklist already suggests `ui_great_job_2.mp3`, etc.).
- **In-app Recording Studio** — `M · 🛠️🎙️`. A hidden parent page that records each clip in the
  browser and downloads it already-named (`letter_m`, `word_cat`, …), so finishing the audio needs
  no audio-editing app. (A start on this was sketched; worth finishing — it removes all friction.)
- **Precache audio for true offline** — `S · 🛠️`. Add recorded clips to the service-worker
  precache list so the installed app has them offline on first launch (today they cache after
  first online play).

## Phase 2 — From words to reading 📖

The current loop teaches decoding one word at a time. These are the steps toward actually reading.

- **Sight words** — `M · 🎯`. Teach a small set of non-decodable high-frequency words (`the`, `is`,
  `a`, `to`, `was`) as whole units with a distinct tile style — never blended. The data model
  already has an empty `sightWords: []` per level waiting for this.
- **Decodable sentences** — `L · 🎯`. After a level's words, show a short sentence built only from
  known words ("Sam sat. The cat ran."). She taps a word to hear it, then reads the line. This is
  the real bridge from words to reading and pairs perfectly with sight words.
- **"Read it first" mode** — `M · 🎯`. An optional flow where she attempts the word herself, then
  taps Blend to check — building independent decoding instead of always being shown the sounds.
- **Segmenting game** — `M · 🎯`. The reverse of blending: hear a word, tap out its sounds. Strong
  for phonemic awareness and a nice change of pace using the same tiles.
- **Letter tracing / formation** — `L · 🎯`. Trace the letter shape with a finger while hearing the
  sound (multi-sensory; ties reading to writing). Great for age 5.

## Phase 3 — Make her want to come back 💛

The pedagogy is done; this is the "one more book" hook.

- **Buddy care & customization** — `L · 💛`. Feed/dress the buddy, give it a home that grows.
  Emotional attachment is the strongest retention lever for this age.
- **Reward shop** — `M · 💛`. Let earned collectibles/stars be *spent* on stickers, buddy hats, or
  map decorations — turning the trophy shelf from a display into a goal.
- **A living kingdom map** — `M · 💛`. The map visually blooms as she progresses (a garden grows, a
  castle lights up), so progress is something she can *see*, not just a number.
- **Mini-games between books** — `M · 💛`. Quick letter-hunt / matching / memory games using only
  letters she knows — variety without leaving the phonics frame.
- **Story moments** — `M · 💛`. Finishing a level reveals a tiny illustrated story beat starring her
  buddy, so the "books" ladder up to a narrative.
- **Gentle welcome-back** — `S · 💛`. On reopening, the buddy greets her by name and reacts to how
  long it's been — warm, never a guilt-trip streak counter.

## Phase 4 — Grow the curriculum 🧩

- **More books per level** — `S · 🎯`. `curriculum.js` word banks contain ~60 validated words that
  aren't in any book yet. Grouping them into extra books is cheap, more practice, and can't break
  decodability. **Easiest high-value content win.**
- **Adaptive review** — `L · 🎯`. Track which words she re-blends or stalls on and resurface them
  (light spaced-repetition). Turns the review Level 12 into something ongoing and personal.
- **Digraphs** (`sh`, `ch`, `th`, `ck`) — `L · 🎯`. The current set deliberately excludes these;
  they're the next phonics phase and unlock hundreds of real words. Needs a "two letters, one
  sound" tile treatment.
- **Consonant blends** (`st`, `tr`, `fl`, …) — `L · 🎯`. Also excluded today; the step after
  digraphs toward real text.
- **Long vowels / silent-e / vowel teams** — `L · 🎯`. The big phase after short vowels
  (`cake`, `rain`, `boat`). A major curriculum expansion (Levels 13+).
- **Capitals & names** — `M · 🎯`. Introduce uppercase for sentence starts and her own name once
  she's steady on lowercase.
- **Interest-themed decodable packs** — `M · 💛🎯`. Bonus books skewed to her loves (animals,
  sports, princesses) using only decodable words — motivation + practice.

## Phase 5 — For the grown-ups 👪

Right now the only parent control is a hidden long-press reset. Owners of a kids' app need more.

- **Parent settings screen** — `M · 👪`. A gated (e.g. "hold and count to 3" / simple math gate)
  panel for: change buddy, audio on/off, blend speed, reset, and the items below.
- **Progress dashboard** — `M · 👪`. Books finished, letters/words seen, time played, and any words
  she stalls on — so a parent knows what to practice.
- **Multi-child profiles** — `M · 👪`. The "who's playing?" picker the spec left room for
  (`progress.js` is single-child today). Each child gets their own buddy, unlocks, and rewards.
- **Manual level unlock / skip / repeat** — `S · 👪`. Let a parent jump ahead if she's beyond
  Level 1, or replay a level for practice.
- **Progress backup & restore** — `S · 🛠️👪`. Export/import progress as a file. Cheap insurance —
  today everything lives in `localStorage` and vanishes if the browser data is cleared.
- **Optional cloud sync** — `L · 🛠️ ⚠️`. Sync across devices / never lose progress. Powerful but
  needs a backend or a hosted service, which breaks the "plain static site" rule — do this only if
  losing local progress becomes a real pain.

## Phase 6 — Reaches more kids ♿

- **Dyslexia-friendly font toggle** — `S · ♿`. Offer a rounded, open typeface option for the word
  display.
- **Adjustable blend speed** — `S · ♿👪`. Expose the blend speed (the `BLEND_CLIP_RATE`/gap knobs
  in `audio.js`) as a simple slider — some kids need slower, some faster.
- **Hand preference** — `S · ♿`. Let the buddy/controls sit on the left or right for lefties.
- **Reduced-motion & contrast passes** — `S · ♿`. There's already a `prefers-reduced-motion` block;
  extend the care to all animations and check contrast throughout.
- **Another language track** — `L · ♿🎯 ⚠️`. Spanish phonics is beautifully regular and a natural
  second curriculum — a big but high-reach project (new curriculum + audio).

## Phase 7 — Art & sound polish 🎨

The spec's "optional art pass" (§12.5), plus sound. Emoji ship fine today; this is the glow-up.

- **Custom illustrations** — `L · 🎨`. Replace emoji for word pictures, buddies, and rewards with
  original art — still never shown before the blend (Rule 3). The full asset list + exact
  filenames are in `GRAPHICS-CHECKLIST.md`; needs a small `window.Art` loader (mirrors `Audio2`)
  so custom files drop straight into `assets/art/`.
- **Animated buddies with personality** — `L · 🎨`. Idle animations, reactions, little quirks.
- **Music & richer SFX** — `M · 🎨`. Gentle, toggleable background music and a fuller sound palette
  (the current chimes are synthesized in `main.js`).
- **Custom book typeface** — `S · 🎨`. A friendly print font for the word display to make "reading
  like a book" even more real.
- **First-run spoken tutorial** — `M · 🎨💛`. A 20-second, icon-and-voice walkthrough of tap → blend
  → celebrate for the very first launch.

## Ongoing — keep it solid 🛠️

- **Decodability check in CI** — `S`. Run the validator on every push so no content edit can ever
  ship a non-decodable word.
- **Automated smoke tests** — `M`. Script the buddy → map → blend → celebrate flow so refactors
  can't silently break it (this was done by hand during the build).
- **Local, private analytics** — `S`. Record (on-device only) which words take longest, to feed
  adaptive review — no third-party tracking on a kids' app.
- **Performance pass** — `S`. Verify smooth play on older iPads (confetti/animation budgets).

---

## ⭐ Recommended next 5

A balanced sequence — finish what's started, protect the owner, cheap wins, then the big leap:

1. **Recording Studio + record words & prompts** (Phase 1) — completes the hand-made voice.
2. **Parent settings + manual unlock + progress backup** (Phase 5) — control and safety for you.
3. **More books per level** (Phase 4) — a big practice boost from words already in the data.
4. **Sight words → decodable sentences** (Phase 2) — the real jump from words to *reading*.
5. **Reward shop or living map** (Phase 3) — turn progress into something she wants to chase.

## Someday / wild ideas 💭

- Let **her** record letters/words and hear her own voice play back.
- "**Read to my buddy**" — she reads a page aloud and it's recorded for a parent to hear.
- **Printable companion** — generate decodable mini-books to print for offline/bedtime reading.
- **AI-generated art** per word for endless fresh pictures.
- **Sibling co-op** — two buddies, take turns.
