# PeplaOS 25 🦭

A fake Mac-style operating system for Punnu's 25th birthday, made by the peplaz.

## Editing
- **All text, nicknames, friends' messages, the letter, seal videos, brainrot cards** → `js/data.js`
- **Photos/videos** → drop them into `images/`, then run:
  ```
  node scripts/list-images.js
  ```
- **Voice notes** → put `.mp3` files in `audio/` and list them under `sounds` in `js/data.js`.
  Convert WhatsApp `.ogg`/`.opus` with: `ffmpeg -i in.ogg -ac 1 -b:a 96k audio/name.mp3`

## Tests
- Static checks (data, files, captions, banned words):
  ```
  node tests/check.js
  ```
- In-browser smoke test: open the site with `?smoke` (e.g. http://localhost:5525/?smoke).
  It logs in, opens every app and prints a results table in the console.

Built by Debabideb. Bugs khoma korben.

## Run locally
```
python -m http.server 5525
```
then open http://localhost:5525

## Deploy (GitHub Pages)
Push this folder to a GitHub repo → Settings → Pages → Deploy from branch → `main` / root.
(The mic-blowing cake needs https, which Pages gives you.)

## Credits
- Birthday seal photo (cake.exe): "Wild smiling harbor seal at Jökulsárlón (Iceland)" by Giles Laurent, CC BY-SA 4.0, via Wikimedia Commons.
- Icons: Lucide (ISC license).
