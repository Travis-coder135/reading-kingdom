# Audio clips go here

This folder is where **optional** recorded voice clips live. The game works
immediately without any of them — it falls back to the browser's built-in
text-to-speech. Drop clips in here and the game uses them automatically, per
file, wherever they exist.

**File names (all lowercase):**

- Letter sound → `letter_<letter>.mp3` (e.g. `letter_m.mp3`) — say the **sound**
  ("mmm"), not the letter name.
- Word → `word_<word>.mp3` (e.g. `word_mat.mp3`) — say the whole word normally.
- Prompt / celebration → `ui_<name>.mp3` (e.g. `ui_welcome.mp3`).

See **`../../AUDIO-CHECKLIST.md`** for the full list, the exact names, and what
to say for each. Start with Priority 1 (letters + prompts) for the biggest
improvement.

`.mp3` is safest; `.m4a`/`.wav` also work in Safari.
