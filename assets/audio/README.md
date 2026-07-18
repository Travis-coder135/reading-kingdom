# Audio clips

Recorded voice clips live here. The game uses a clip automatically wherever one
exists (per sound) and falls back to the browser's built-in text-to-speech
otherwise.

## Status

- ✅ **Letter sounds — all 25 recorded** (`letter_a.mp3` … `letter_z.mp3`, no `q`).
  Letters, and the letter-by-letter part of blending, now play in a real voice.
- ⬜ **Words** (`word_<word>.mp3`) — still text-to-speech until recorded.
- ⬜ **Prompts / celebrations** (`ui_<name>.mp3`) — still text-to-speech until recorded.

## File names (all lowercase)

- Letter sound → `letter_<letter>.<ext>` (e.g. `letter_m.mp3`) — say the **sound**
  ("mmm"), not the letter name.
- Word → `word_<word>.<ext>` (e.g. `word_mat.mp3`) — say the whole word normally.
- Prompt / celebration → `ui_<name>.<ext>` (e.g. `ui_welcome.mp3`).

**Format:** `<ext>` can be `mp3`, `m4a`, `wav`, `ogg`, or `webm`. `.mp3` is the
safest everywhere and is what the letter clips use.

**Tip:** during a blend the letter clips play a little faster (pitch kept), so
record each sound clearly at a natural, unhurried pace — the game handles the
speed-up.

See **`../../AUDIO-CHECKLIST.md`** for the full list and what to say for each.
After adding files, commit and push so the hosted game (GitHub Pages) serves them.
