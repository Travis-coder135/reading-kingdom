# Reading Kingdom 🏰

A touch-first, audio-first phonics reading game for a 5-year-old, built to be played on an
iPad. It teaches a beginning reader to **sound out letters and blend them into words** — the
same proven method used by Bob Books and the Science of Reading — wrapped in a fun "kingdom" of
animal friends, princesses/magic, and sports-style rewards.

> **Design north star:** a child taps each letter to hear its sound, blends them into a whole
> word, and finishes a short "book" — then feels the pride of *"I read the whole book!"* and
> comes back for the next one.

---

## Who this is for

- **The player:** a 5-year-old just starting to read. She already knows most of her letter
  *sounds*. She can't yet read instructions, so **everything is spoken and icon-based** — no
  text menus.
- **Her interests** (used for theme, characters, and rewards): **sports, animals/pets, and
  princesses / fairies / magic.**
- **The device:** primarily an **iPad**, held in landscape. Should also work on a laptop.

## What makes it work (the rules the game must respect)

These come from the phonics method and are non-negotiable — see `BUILD-SPEC.md` for detail:

1. **Decodable only.** She's never shown a word she can't sound out from letters already taught.
2. **Blending is the core mechanic** — tap letters for their sounds, then blend to the word.
3. **Pictures confirm, never give away.** Art appears *after* she reads the word, never before.
4. **Gradual release.** A few new letters at a time; length/complexity grow gently.
5. **Confidence is the fuel.** Short, always-completable books; no timers; no wrong-answer
   penalties; big celebration at the end.
6. **No reading required to navigate.** Icons + spoken prompts only.
7. **Alphabet minus Q**, 2–3 letter words, short vowels only, no blends/digraphs.

## The experience, briefly

1. **Pick your buddy** (puppy, kitten, pony/unicorn, bunny…) — appears throughout.
2. **Kingdom map** with 12 stops (the 12 levels). The next one gently pulses; locked ones sleep.
3. **A book** = 4–8 words. For each word: tap the letter tiles to hear their sounds → tap
   **Blend** → the word is spoken and a picture pops up as a reward.
4. **Finish the book** → confetti, buddy dance, spoken *"You read the whole book!"*, and a new
   collectible (medal / crown / animal sticker) for the **trophy shelf**.
5. Finishing a level unlocks the next stop on the map.

## Tech at a glance

- **Plain HTML + CSS + JavaScript. No framework, no build step.** Chosen so a non-developer can
  run and host it easily and it won't break on tooling updates.
- **Installable as a PWA** ("Add to Home Screen" on the iPad → full-screen, works offline).
- **Data-driven:** all 12 levels of content live in one data file; the engine renders from it.
- **Progress saved** in the browser (`localStorage`): buddy choice, unlocked levels, rewards.
- **Audio:** designed for pre-recorded clips (correct letter *sounds*, not letter *names*), with
  the browser's built-in text-to-speech as an automatic fallback so it's playable immediately.

## Project status

✅ **Built and playable (v1).** The full game is implemented from `BUILD-SPEC.md`: all 12 levels,
the blend mechanic, celebrations, rewards, trophy shelf, saved progress, and PWA install/offline.
It runs today using the browser's built-in speech; drop in recordings anytime (see below).

- `README.md` — this file (the vision + overview).
- `BUILD-SPEC.md` — the full, self-contained build specification.
- `AUDIO-CHECKLIST.md` — what to record (optional) to replace text-to-speech with your own voice.

**What's in the folder now:**

```
index.html            manifest.webmanifest   sw.js        (app shell + PWA)
css/styles.css         data/curriculum.js                  (styling · the 12-level curriculum)
js/  audio.js  emoji.js  progress.js  engine.js  main.js   (audio · pictures · save · rules · screens)
assets/icons/…         assets/audio/  (drop recordings here — empty is fine)
```

The decodability check runs on every boot and passed for all 12 levels (0 violations); the whole
buddy → map → blend → celebration → trophy flow was smoke-tested end-to-end.

## How to run it (once built)

No build tools needed. Serve the folder and open it in a browser:

```bash
# from inside the reading-kingdom/ folder
python -m http.server 8000
```

Then:
- **On this computer:** open `http://localhost:8000`.
- **On the iPad (same Wi-Fi):** open `http://<this-computer-IP>:8000` in Safari, then use the
  Share menu → **Add to Home Screen** for a full-screen app icon.
- **Or host it free** (Netlify / GitHub Pages / Vercel) for a permanent URL you can reopen
  anytime and add to the iPad home screen.

## Content & copyright note

The word list is an **original decodable curriculum** built to follow the Bob Books / Science-of-
Reading *method*. It does **not** copy Bob Books' actual words, titles, or art. This keeps the
content controllable, verifiable, and free of copyright concerns.
