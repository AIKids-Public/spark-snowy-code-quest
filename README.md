# 🎄 Spark's Snowy Code Quest

**▶️ Play now: https://aikids-public.github.io/spark-snowy-code-quest/**

A Christmas Eve blizzard has scattered Santa's presents across the North Pole! Help **Spark** rescue them by **asking Frosty the AI helper** clearly and kindly, then **coding** Spark's path to Santa's sleigh.

A free, festive browser game from **AIKids** that teaches two skills together:

- 🗣️ **Prompting**: asking an AI for help clearly, kindly and safely
- 🧩 **Coding**: sequences, loops and debugging

No download, account or ads, and no data leaves the device. It works on laptops, tablets and phones.

---

## How to play

Each mission has two steps:

1. **Ask Frosty the AI.** The map is hidden by a blizzard or darkness, or blocked by ice. Write a good request and Frosty clears the map or gives Spark a new ✨ **Melt** power.
2. **Code Spark's path.** Collect every 🎁, then finish on the 🛷. Watch out for 🎄 trees, ⛄ snowmen and 🧊 ice!

Use fewer steps to earn up to ⭐⭐⭐. Finish all five missions to unlock the **sleigh-ride finale** and a **downloadable certificate**.

## Three age groups

| | ❄️ Snowflake Explorers<br>Ages 4–8 | 🦌 Reindeer Coders<br>Ages 9–12 | ⭐ North Star Engineers<br>Ages 13–16 |
|---|---|---|---|
| **Asking the AI** | Tap the kindest, clearest request | Build a prompt: *who + what + why* | Write your own prompt, checked against a 5-point checklist |
| **Coding** | Tap arrow buttons | Blocks with 🔁 Repeat loops | Typed code with nested loops |
| **Support** | Very simple words, 🔈 *Read to me*, grown-up tips | Hints after two tries | Line-numbered error messages |

There are 5 missions per age group, 15 in total.

## Extras

- 🎨 **Holiday Card Maker**: answer 5 questions to design a Christmas card, then download it as a picture.
- 📜 **Certificate**: a personalised certificate of achievement for each age group, ready to print.
- 🎵 **Calm holiday music**: an original lullaby you can switch on or off.
- 🔈 **Read aloud**: a soft, friendly voice reads the words for younger players.

## For parents and teachers

- **Safety**
  - Children are reminded to use **first names only**.
  - Names typed into cards and certificates stay on the device.
  - Game progress is saved only in the browser (`localStorage`).
- **Accessibility**
  - Large tap targets and simple language for young readers.
  - Full keyboard support.
  - Animations switch off automatically when the device is set to *reduce motion*.
- **Offline**: once loaded, the game runs entirely in the browser.

## Running it yourself

There's nothing to install. Either:

- open `index.html` in any modern browser, or
- serve the folder with a static server, e.g. `python3 -m http.server`, then visit `http://localhost:8000`.

| File | What it does |
|---|---|
| `index.html` | Page layout and styles |
| `logic.js` | Missions, maps, the code interpreter and prompt scoring |
| `game.js` | Screens, editors, animation and sound effects |
| `card.js` | Holiday Card Maker |
| `finale.js` | Sleigh-ride finale and certificate |
| `music.js` | "Snowfall Lullaby", generated live with the Web Audio API |
| `card-assets.js` | Embedded images, so cards and certificates can be exported as PNGs |

## Licence

- **Code:** [MIT](LICENSE).
- **The Spark character and the AIKids name and logo:** © AIKids, all rights reserved. They are not covered by the MIT licence. See [LICENSE](LICENSE) for details.
