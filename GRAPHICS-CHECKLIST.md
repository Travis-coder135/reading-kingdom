# Reading Kingdom — Graphics Checklist 🎨

Every picture in the game and where it's used, so you can draw your own and swap them in — the
visual counterpart to `AUDIO-CHECKLIST.md`. Work top-down by **priority tier**; you don't have to
do them all, and the game looks great on the built-in emoji until you do.

> **⚠️ One build step first (I can do it).** Today every picture is an **emoji drawn in code** —
> only the app icons are real image files. To make custom art appear automatically (drop a file in
> and it's used, exactly like the audio clips), the game needs a small **art loader** — a
> `window.Art` helper that mirrors `window.Audio2`: if `assets/art/<name>.png` exists, show it;
> otherwise show the emoji. **This isn't built yet.** This list is the spec for *what to draw* and
> the *exact filenames*, so the art is drop-in ready the moment the loader is added. Say the word
> and I'll build it.

---

## How the art will be used (naming)

All custom art goes in **`assets/art/`**, named so the loader can find it. Same idea as the audio
folder. `.png` (transparent) is the default; `.svg` and `.webp` can be supported too.

| Kind | Filename | Example |
|------|----------|---------|
| Buddy | `buddy_<id>.png` | `buddy_puppy.png` |
| Word picture | `word_<word>.png` | `word_cat.png` |
| Letter keyword | `keyword_<letter>.png` | `keyword_a.png` |
| Reward | `reward_<slug>.png` | `reward_medal.png` |
| Control icon | `icon_<name>.png` | `icon_speaker.png` |
| Map stop | `map_<state>.png` | `map_current.png` |
| Decoration | `decor_<name>.png` | `decor_crown.png` |

A missing file just falls back to the current emoji — so partial art sets are fine.

## How to make the art (style guide)

- **Square, transparent PNG**, ~**512×512** (crisp on big iPad tiles; it's scaled down, never up).
- **One bold subject, centered**, generous margins, thick friendly outlines, bright and
  high-contrast — readable at a glance by a 5-year-old.
- **Keep one consistent style** across the whole set (same line weight, palette, vibe) so it reads
  as one world.
- **Word pictures are rewards** — the game only shows them *after* she blends the word (never
  before), so they can be delightful without giving the answer away.
- Keep files small (aim < ~50 KB each) so the app stays fast and offline-friendly.

## Recommended order (roadmap)

1. **⭐ Priority 1 — Characters & UI (~32 pictures).** The buddy, the buttons, map stops, rewards,
   and a little decoration. This is the *whole game's* look with the fewest files — do this first
   and everything already feels custom.
2. **Priority 2 — Word pictures (125).** The big count; do them a level at a time (emoji covers the
   rest until you get to them).
3. **Priority 3 — Letter keyword pictures (25).** Shown in the optional sound warm-up.
4. **Stretch — the world.** An illustrated map, buddy poses, a custom letter font, redrawn app
   icon. See the bottom.

---

## ⭐ Priority 1 — Characters & UI

### A. Buddies (4) — highest impact; she sees her buddy on every screen

| ✔ | File | Now | Notes |
|---|------|-----|-------|
| ☐ | `buddy_puppy.png`   | 🐶 | The star of the show — appears everywhere and reacts (bounces/dances). |
| ☐ | `buddy_kitten.png`  | 🐱 | |
| ☐ | `buddy_unicorn.png` | 🦄 | |
| ☐ | `buddy_bunny.png`   | 🐰 | |

*(Optional later: a happy/cheer pose per buddy, e.g. `buddy_puppy_cheer.png`, for celebrations.)*

### B. Control icons (6) — the buttons she taps to get around

| ✔ | File | Now | Where |
|---|------|-----|-------|
| ☐ | `icon_speaker.png` | 🔊 | Top bar — "hear that again." |
| ☐ | `icon_trophy.png`  | 🏆 | Top bar — open the trophy shelf. |
| ☐ | `icon_home.png`    | 🏰 | Top bar — back to the map (a little castle). |
| ☐ | `icon_blend.png`   | 🧲 | The **Blend** button (a magnet pulling sounds together). |
| ☐ | `icon_next.png`    | ➡️ | Forward arrow on the word-confirmation card. |
| ☐ | `icon_go.png`      | ▶ | Big green "Let's read!" button (after the warm-up). |

### C. Map stops (3) — the 12 kingdom stops use these three states

| ✔ | File | Now | State |
|---|------|-----|-------|
| ☐ | `map_current.png` | 🏰 | The next playable stop (it pulses). Also used for any open stop. |
| ☐ | `map_done.png`    | ⭐ | A finished level. |
| ☐ | `map_locked.png`  | 😴 | Not unlocked yet (asleep). |

### D. Rewards (14) — the collectibles she earns and sees on the trophy shelf

Rotate across sports / princess-magic / animals (BUILD-SPEC §11).

| ✔ | File | Now | | ✔ | File | Now |
|---|------|-----|---|---|------|-----|
| ☐ | `reward_medal.png`     | 🏅 | | ☐ | `reward_kitten.png`     | 🐱 |
| ☐ | `reward_crown.png`     | 👑 | | ☐ | `reward_gold_medal.png` | 🥇 |
| ☐ | `reward_puppy.png`     | 🐶 | | ☐ | `reward_wand.png`       | 🪄 |
| ☐ | `reward_trophy.png`    | 🏆 | | ☐ | `reward_bunny.png`      | 🐰 |
| ☐ | `reward_gem.png`       | 💎 | | ☐ | `reward_piggy.png`      | 🐷 |
| ☐ | `reward_unicorn.png`   | 🦄 | | ☐ | `reward_chick.png`      | 🐥 |
| ☐ | `reward_ribbon.png`    | 🎽 | | | | |
| ☐ | `reward_sparkles.png`  | ✨ | | | | |

### E. Decoration (~5) — small touches

| ✔ | File | Now | Where |
|---|------|-----|-------|
| ☐ | `decor_crown.png`   | 👑 | Buddy-picker sparkle row + "you finished the kingdom!" title. |
| ☐ | `decor_sparkle.png` | ✨ | Buddy-picker + confetti. |
| ☐ | `decor_confetti.png`| 🎉⭐🎊💫🌟 | Celebration confetti pieces (a few small shapes; optional). |
| ☐ | `decor_rotate.png`  | 📱 | The "turn me sideways" portrait hint. |
| ☐ | `decor_trophy_empty.png` | 🗃️ | Empty trophy shelf ("read a book to win a prize!"). |

> **Tip — reuse:** the **castle** 🏰 shows up in the home button, the map's current stop, and the
> title; one nice castle can cover all three. The **star** ⭐ is the map "done" stamp *and* the
> progress dots. Draw those two well and they carry a lot of the game.

---

## Priority 2 — Word pictures (125) `word_<word>.png`

The reward picture that pops up **after** she blends each word. The emoji shown is the current
picture — a hint for what to draw. Do them a level at a time; emoji covers any you haven't made.

### Level 1 (m a t s) — 7
☐ at ⭐ ☐ am ⭐ ☐ mat 🟫 ☐ sat ⭐ ☐ sam 🧒 ☐ tam 🧢 ☐ as ⭐

### Level 2 (+d p) — 8
☐ dad 👨 ☐ mad 😠 ☐ sad 😢 ☐ pat ✋ ☐ tap 🚰 ☐ map 🗺️ ☐ pad 📝 ☐ sap ⭐

### Level 3 (+n g) — 8
☐ man 🧑 ☐ pan 🍳 ☐ tan 🟤 ☐ nap 😴 ☐ tag 🏷️ ☐ nag ⭐ ☐ gap 🕳️ ☐ gas ⛽

### Level 4 (+o c) — 12
☐ dog 🐶 ☐ cat 🐱 ☐ cot 🛏️ ☐ dot ⚫ ☐ pot 🍲 ☐ top 🪀 ☐ mop 🧹 ☐ got ⭐ ☐ cop 👮 ☐ nod ⭐ ☐ cod 🐟 ☐ cap 🧢

### Level 5 (+h r) — 12
☐ hat 🎩 ☐ ham 🍖 ☐ had ⭐ ☐ hop 🐇 ☐ rat 🐀 ☐ ran 🏃 ☐ rag ⭐ ☐ ram 🐏 ☐ hot 🔥 ☐ hog 🐷 ☐ rod 🎣 ☐ car 🚗

### Level 6 (+i b) — 12
☐ pig 🐷 ☐ big 🐘 ☐ dig ⛏️ ☐ pin 📌 ☐ sit 🪑 ☐ sip 🥤 ☐ hit 🥊 ☐ bit ⭐ ☐ him ⭐ ☐ his ⭐ ☐ rib 🦴 ☐ bib 👶

### Level 7 (+f l) — 12
☐ fan 🪭 ☐ fat ⭐ ☐ fit 💪 ☐ fig ⭐ ☐ lap 🏁 ☐ lad 👦 ☐ lid ⭐ ☐ lip 👄 ☐ log 🪵 ☐ lot ⭐ ☐ fog 🌫️ ☐ fin 🦈

### Level 8 (+u j) — 16
☐ sun ☀️ ☐ run 🏃 ☐ fun 🎉 ☐ bun 🍞 ☐ cup 🥤 ☐ cut ✂️ ☐ cub 🐻 ☐ bug 🐛 ☐ mug ☕ ☐ mud 🟤 ☐ jug 🫙 ☐ hug 🤗 ☐ bus 🚌 ☐ nut 🥜 ☐ tub 🛁 ☐ pup 🐕

### Level 9 (+k w x) — 12
☐ box 📦 ☐ fox 🦊 ☐ six 6️⃣ ☐ fix 🔧 ☐ mix 🥣 ☐ wax 🕯️ ☐ tax ⭐ ☐ wig 💇 ☐ win 🏆 ☐ wit ⭐ ☐ kid 🧒 ☐ kit 🧰

### Level 10 (+e v) — 16
☐ bed 🛏️ ☐ red 🔴 ☐ hen 🐔 ☐ pen 🖊️ ☐ net 🥅 ☐ jet ✈️ ☐ pet 🐾 ☐ vet 🩺 ☐ leg 🦵 ☐ beg 🙏 ☐ peg 🪝 ☐ men 👬 ☐ get ⭐ ☐ let ⭐ ☐ set ⭐ ☐ wet 💧

### Level 11 (+y z) — 8
☐ yes 👍 ☐ yet ⭐ ☐ yam 🍠 ☐ yak 🐃 ☐ zip 🤐 ☐ zap ⚡ ☐ zig ⭐ ☐ zag ⭐

### Level 12 (review) — 12 (all reused from earlier levels — nothing new to draw)
cat 🐱 · dog 🐶 · sun ☀️ · pig 🐷 · bed 🛏️ · box 📦 · jam 🍓 · hat 🎩 · run 🏃 · six 6️⃣ · web 🕸️ · mud 🟤

> **The 25 "star" words** (`at, am, as, sat, sap, nag, got, nod, had, rag, bit, him, his, fat, fig,
> lid, lot, tax, wit, get, let, set, yet, zig, zag`) are abstract (little words, verbs). They just
> show a ⭐ today — drawing them is **optional**; a star is a perfectly good reward for those.

---

## Priority 3 — Letter keyword pictures (25) `keyword_<letter>.png`

Shown in the optional **sound warm-up** at the start of a level ("a is for 🍎"). One picture per
letter (alphabet minus q):

☐ a 🍎 ☐ b 🎈 ☐ c 🥕 ☐ d 🐶 ☐ e 🥚 ☐ f 🐟 ☐ g 🍇 ☐ h 🏠 ☐ i 🧊 ☐ j 🧃
☐ k 🔑 ☐ l 🦁 ☐ m 🌙 ☐ n 👃 ☐ o 🐙 ☐ p 🐷 ☐ r 🌈 ☐ s 🐍 ☐ t 🐯 ☐ u ☂️
☐ v 🌋 ☐ w 🐺 ☐ x 🦊 ☐ y 🪀 ☐ z 🦓

*(The letter shapes themselves — the `a`, `b`, `c` she reads — are a **font**, not pictures. If you
want a custom handwriting/print look, that's a separate "custom letter font" task below.)*

---

## Stretch — build the whole world 🌟

Bigger, optional projects that go beyond swapping single pictures:

- **Illustrated kingdom map** — replace the dotted trail + gradient with a painted map (path,
  hills, a castle at the end). `map_background.png` + a styled trail. *(Needs a little layout work.)*
- **Buddy poses** — idle / cheer / dance frames per buddy for more personality.
- **Custom letter font** — a friendly rounded print/handwriting typeface for the word display, so
  "reading like a book" looks even more real.
- **Redraw the app icon** — the home-screen castle icon is already a custom PNG
  (`assets/icons/`), but you can replace it with your own art (192, 512, maskable, 180 sizes).
- **Themed picture packs** — extra art skewed to her loves (animals, sports, princesses).

---

## Progress tracker

| Tier | Pictures | Done? |
|------|----------|-------|
| ⭐ P1 — Buddies | 4 | ☐ |
| ⭐ P1 — Control icons | 6 | ☐ |
| ⭐ P1 — Map stops | 3 | ☐ |
| ⭐ P1 — Rewards | 14 | ☐ |
| ⭐ P1 — Decoration | ~5 | ☐ |
| P2 — Word pictures | 125 (100 real + 25 optional stars) | ☐ |
| P3 — Letter keywords | 25 | ☐ |
| Stretch — map / poses / font / icon | — | ☐ |

**Minimum for a fully custom-looking game:** Priority 1 (~32 pictures). Everything else can trickle
in; the game keeps using the built-in emoji until each picture arrives.

> **Next step:** whenever you're ready to actually use custom art, tell me and I'll build the art
> loader (`window.Art` + `assets/art/`) so these files drop straight in — just like the audio.
