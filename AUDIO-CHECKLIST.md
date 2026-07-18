# Reading Kingdom — Audio Recording Checklist

Everything in the game is spoken aloud (the player can't read yet). The game works immediately
using the browser's built-in text-to-speech, but **your own recorded voice is a big motivator
for a 5-year-old** — and, more importantly, real recordings say letter *sounds* correctly, which
text-to-speech gets wrong. Drop the files into `assets/audio/` and the game uses them
automatically wherever they exist.

You don't have to record everything at once. Work top-down by **priority tier** below.

> **✅ Status (updated 2026-07-17): letter sounds are DONE.** All 25 letter recordings are in
> `assets/audio/` and live in the game — letters now play in your voice, and the "m…a…t" blend
> sounds out each letter with your clips. **Words and prompts still use text-to-speech** until you
> record them (Priority 1B and Priority 2 below). The section-A checkboxes are ticked to match.

---

## How to record (read this first)

- **Quiet room, phone is fine.** Voice Memos (iPhone) or any recorder app works. One clip per
  file.
- **Say letter SOUNDS, not letter NAMES.** This is the single most important rule. For `m` say
  **"mmm"**, not "em." For `s` say **"sss"**, not "ess." See the letter table for a cue on each.
- **Keep it warm and upbeat**, like reading a bedtime story. A little energy goes a long way.
- **Short and clean.** Trim silence off the front and back of each clip. Keep the volume roughly
  consistent across all clips.
- **File format:** the game accepts `.mp3`, `.m4a`, `.wav`, `.ogg`, or `.webm` — whatever your
  recorder produces. `.mp3` is the safest everywhere and is what the letter clips use; just keep
  the names consistent.
- **File names must match exactly** (all lowercase). Naming rules:
  - Letter sound → `letter_<letter>.mp3` (e.g. `letter_m.mp3`)
  - Word → `word_<word>.mp3` (e.g. `word_mat.mp3`)
  - Prompt/celebration → `ui_<name>.mp3` (e.g. `ui_welcome.mp3`)
- Put every file in `reading-kingdom/assets/audio/`.

**Roughly 231 clips total** (25 letters + 186 words + ~20 prompts). That sounds like a lot — but
the tiers below let you get a great-sounding game with only the first ~50, then fill in words
over time (text-to-speech covers any word you haven't recorded yet).

---

## ⭐ Priority 1 — record these first (~50 clips)

This tier alone makes the whole game sound hand-made, because letters and prompts are where
text-to-speech is weakest and where she'll hear your voice most.

### A. Letter sounds (all 25 — alphabet minus Q) — ✅ DONE

All 25 are recorded and in `assets/audio/` as `letter_<letter>.mp3`. The cues below are kept for
reference and any future re-recording. (Cue in quotes; "don't say" is the name to avoid.)

| ✔ | Letter | File | Say (the sound) | Don't say |
|---|--------|------|-----------------|-----------|
| ✅ | a | `letter_a.mp3` | "ah" (as in **a**pple) | "ay" |
| ✅ | b | `letter_b.mp3` | "buh" (quick, tiny 'uh') | "bee" |
| ✅ | c | `letter_c.mp3` | "kuh" | "see" |
| ✅ | d | `letter_d.mp3` | "duh" | "dee" |
| ✅ | e | `letter_e.mp3` | "eh" (as in **e**gg) | "ee" |
| ✅ | f | `letter_f.mp3` | "fff" (stretch it) | "eff" |
| ✅ | g | `letter_g.mp3` | "guh" (hard g, as in **g**o) | "jee" |
| ✅ | h | `letter_h.mp3` | "huh" (a breath) | "aitch" |
| ✅ | i | `letter_i.mp3` | "ih" (as in **i**gloo) | "eye" |
| ✅ | j | `letter_j.mp3` | "juh" | "jay" |
| ✅ | k | `letter_k.mp3` | "kuh" | "kay" |
| ✅ | l | `letter_l.mp3` | "lll" (stretch it) | "el" |
| ✅ | m | `letter_m.mp3` | "mmm" (stretch it) | "em" |
| ✅ | n | `letter_n.mp3` | "nnn" (stretch it) | "en" |
| ✅ | o | `letter_o.mp3` | "aw" (as in **o**ctopus) | "oh" |
| ✅ | p | `letter_p.mp3` | "puh" (quick pop) | "pee" |
| ✅ | r | `letter_r.mp3` | "rrr" | "ar" |
| ✅ | s | `letter_s.mp3` | "sss" (stretch it) | "ess" |
| ✅ | t | `letter_t.mp3` | "tuh" (quick tap) | "tee" |
| ✅ | u | `letter_u.mp3` | "uh" (as in **u**mbrella) | "you" |
| ✅ | v | `letter_v.mp3` | "vvv" (stretch it) | "vee" |
| ✅ | w | `letter_w.mp3` | "wuh" | "double-you" |
| ✅ | x | `letter_x.mp3` | "ks" (as in fo**x**) | "ex" |
| ✅ | y | `letter_y.mp3` | "yuh" | "why" |
| ✅ | z | `letter_z.mp3` | "zzz" (stretch it) | "zee" |

*(No `q` — this set intentionally skips it.)*

### B. Prompts & celebrations (~20)

Keep these warm and encouraging. Text in quotes is a suggestion — say it your way.

| ✔ | File | What to say |
|---|------|-------------|
| ☐ | `ui_welcome.mp3` | "Welcome to the Reading Kingdom!" |
| ☐ | `ui_pick_buddy.mp3` | "Pick your buddy!" |
| ☐ | `ui_buddy_puppy.mp3` | "Puppy!" |
| ☐ | `ui_buddy_kitten.mp3` | "Kitten!" |
| ☐ | `ui_buddy_unicorn.mp3` | "Unicorn!" |
| ☐ | `ui_buddy_bunny.mp3` | "Bunny!" |
| ☐ | `ui_tap_letters.mp3` | "Tap the letters to hear their sounds." |
| ☐ | `ui_blend.mp3` | "Now blend them together!" |
| ☐ | `ui_ready.mp3` | "Ready? Let's read!" |
| ☐ | `ui_read_whole_book.mp3` | "You read the whole book!" (the big one 🎉) |
| ☐ | `ui_great_job.mp3` | "Great job!" |
| ☐ | `ui_you_did_it.mp3` | "You did it!" |
| ☐ | `ui_wow.mp3` | "Wow!" |
| ☐ | `ui_yay.mp3` | "Yay!" |
| ☐ | `ui_super_reader.mp3` | "You're a super reader!" |
| ☐ | `ui_level_unlocked.mp3` | "You unlocked a new place in the kingdom!" |
| ☐ | `ui_new_reward.mp3` | "You earned a special prize!" |
| ☐ | `ui_try_it.mp3` | "Give it a try!" (gentle nudge, never scolding) |
| ☐ | `ui_lets_go.mp3` | "Let's go!" |
| ☐ | `ui_all_done.mp3` | "All done — amazing!" |

> Tip: record **2–3 versions of `ui_great_job` / `ui_yay` / `ui_wow`** (name them
> `ui_great_job_2.mp3`, etc.) if you want variety so praise doesn't sound repetitive. Optional —
> mention it to the developer so they rotate them.

---

## Priority 2 — words, level by level (~186)

Say each as a **normal whole word** (not stretched, not sounded out — the game handles the
slow "m…a…t" blend by playing your letter clips in sequence, then this whole-word clip).
Record in level order so early levels are covered first. **Text-to-speech covers any word you
skip**, so it's fine to do a few levels at a time.

File name = `word_<word>.mp3` for each word below.

### Level 1 (7)
☐ at ☐ am ☐ as ☐ mat ☐ sat ☐ sam ☐ tam

### Level 2 (10)
☐ dad ☐ mad ☐ sad ☐ pad ☐ pat ☐ tap ☐ map ☐ sap ☐ dam ☐ tad

### Level 3 (11)
☐ man ☐ pan ☐ tan ☐ nap ☐ nag ☐ tag ☐ gap ☐ gas ☐ sag ☐ gag ☐ and

### Level 4 (15)
☐ cat ☐ can ☐ cap ☐ cot ☐ cop ☐ cod ☐ cog ☐ dot ☐ dog ☐ got ☐ pot ☐ top ☐ mop ☐ nod ☐ pod

### Level 5 (16)
☐ hat ☐ ham ☐ had ☐ hop ☐ hot ☐ hog ☐ rat ☐ ram ☐ ran ☐ rag ☐ rap ☐ rot ☐ rod ☐ tar ☐ car ☐ par

### Level 6 (27)
☐ big ☐ bit ☐ bib ☐ bin ☐ bid ☐ bat ☐ bag ☐ bar ☐ bob ☐ cab ☐ rib ☐ rig ☐ rim ☐ tin ☐ tip ☐ dig ☐ dip ☐ din ☐ hit ☐ him ☐ his ☐ hip ☐ sit ☐ sip ☐ pig ☐ pin ☐ pit

### Level 7 (17)
☐ fan ☐ fat ☐ fit ☐ fig ☐ fin ☐ fib ☐ fog ☐ log ☐ lot ☐ lit ☐ lip ☐ lid ☐ lap ☐ lag ☐ lad ☐ pal ☐ gal

### Level 8 (26)
☐ jug ☐ jam ☐ jog ☐ jab ☐ cub ☐ cup ☐ cut ☐ hug ☐ hut ☐ hum ☐ bug ☐ bun ☐ bus ☐ gum ☐ gun ☐ mud ☐ mug ☐ nut ☐ pup ☐ run ☐ sun ☐ tub ☐ tug ☐ fun ☐ rug ☐ rub

### Level 9 (17)
☐ kid ☐ kit ☐ kin ☐ wig ☐ win ☐ wit ☐ wag ☐ wax ☐ wok ☐ box ☐ fox ☐ fix ☐ six ☐ mix ☐ tax ☐ fax ☐ ox

### Level 10 (26)
☐ bed ☐ beg ☐ den ☐ get ☐ gem ☐ hen ☐ hem ☐ jet ☐ leg ☐ let ☐ men ☐ met ☐ net ☐ pen ☐ pet ☐ peg ☐ red ☐ set ☐ ten ☐ vet ☐ wet ☐ web ☐ wed ☐ fed ☐ van ☐ vat

### Level 11 (14)
☐ yes ☐ yet ☐ yak ☐ yam ☐ yap ☐ yum ☐ yip ☐ zap ☐ zip ☐ zig ☐ zag ☐ zit ☐ fez ☐ biz

### Level 12 (review — no new words)
All Level 12 words (`cat, dog, sun, pig, bed, box, jam, hat, run, six, web, mud, hen, fox, cup,
van, red, big, top, bug`) already appear in earlier levels — **nothing new to record here.**

---

## Progress tracker

| Tier | Clips | Done? |
|------|-------|-------|
| Priority 1A — Letter sounds | 25 | ✅ done (2026-07-17) |
| Priority 1B — Prompts & celebrations | ~20 | ☐ |
| Level 1 words | 7 | ☐ |
| Level 2 words | 10 | ☐ |
| Level 3 words | 11 | ☐ |
| Level 4 words | 15 | ☐ |
| Level 5 words | 16 | ☐ |
| Level 6 words | 27 | ☐ |
| Level 7 words | 17 | ☐ |
| Level 8 words | 26 | ☐ |
| Level 9 words | 17 | ☐ |
| Level 10 words | 26 | ☐ |
| Level 11 words | 14 | ☐ |

**Minimum to sound hand-made right away:** Priority 1 (letters + prompts) + Level 1 & 2 words =
about **67 clips**. **Letters (25) are already done ✅**, so what's left toward that minimum is the
~20 prompts plus Level 1 & 2 words (~17). Everything else can trickle in; the game fills the gaps
with text-to-speech until your recordings arrive.
