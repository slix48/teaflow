# TeaFlow

TeaFlow is a peaceful, dependency-free tea brewing app for timing a cup, calculating tea-to-water ratios, saving custom brew profiles, tracking loose-leaf re-steeps, and improving the next brew from taste notes.

The visual theme uses a generated nature background inspired by misty Chinese mountain scenery and Japanese garden elements.

## Preview

![TeaFlow peaceful nature theme](assets/nature-background.png)

## Why TeaFlow Exists

Most tea timers stop at countdowns. TeaFlow keeps the practical brewing context in one place: water temperature, steep range, tea amount, re-steep timing, tasting notes, and saved personal recipes. The goal is a simple tool that helps each cup get a little more repeatable.

## Features

- Tea timer presets for green, black, oolong, white, herbal, Assam, Sencha, Matcha, Earl Grey, Chamomile, and Pu-erh.
- Finish feedback with a soft chime and vibration on supported devices.
- Custom brew profiles with tea name, grams, water amount, temperature, steep time, and rating.
- Brew calculator with metric, US kitchen, and combined display modes.
- Brew history with tea type, water, tea amount, temperature, steep time, rating, and notes.
- Best-brew insight, such as the highest-rated tea temperature and steep time.
- Loose-leaf re-steep tracker for 60, 75, and 90 second steeps.
- Taste-note suggestions for bitter, weak, grassy, strong, and perfect brews.
- Responsive layout for desktop and phone screens.
- PWA install support with an app manifest and offline cache.

## Setup

TeaFlow is a static site. No build step is required.

1. Clone the repo.
2. Open `index.html` in a browser.

For a local server:

```bash
python -m http.server 4175
```

Then open `http://localhost:4175`.

## Install

After TeaFlow is deployed over HTTPS, supported browsers can install it from the address bar or browser menu. Installed mode opens TeaFlow in a standalone app window and keeps the app shell available offline.

## Deploy

This repo includes a GitHub Pages workflow at `.github/workflows/pages.yml`.

1. Push to `main`.
2. In GitHub, open the repository settings.
3. Go to `Pages`.
4. Set the source to `GitHub Actions` if it is not already selected.
5. Run or wait for the `Deploy to GitHub Pages` workflow.

The site should publish at:

```text
https://slix48.github.io/teaflow/
```

## Brew Notes

Brewing ranges are practical starting points, not strict rules. Tea leaf size, water chemistry, vessel, and taste preference all matter.

### General Loose-Leaf Guide

| Water | Tea | Approx. tablespoons |
| --- | --- | --- |
| 1 cup / 240 ml | 2.5-3 g | 1 tbsp |
| 1.5 cups / 360 ml | 4-4.5 g | 1.5 tbsp |
| 2 cups / 475 ml | 5-6 g | 2 tbsp |
| 3 cups / 710 ml | 7.5-9 g | 3 tbsp |
| 4 cups / 950 ml | 10-12 g | 4 tbsp |

### Stronger Brew

| Water | Tea |
| --- | --- |
| 1 cup / 240 ml | 4 g / about 1.5 tbsp |
| 2 cups / 475 ml | 8 g / about 3 tbsp |
| 4 cups / 950 ml | 16 g / about 6 tbsp |

### Delicate Teas

| Water | Tea |
| --- | --- |
| 1 cup / 240 ml | 2-2.5 g / about 1 tbsp |
| 2 cups / 475 ml | 4-5 g / about 2 tbsp |

### Tea Bags

| Water | Tea bags |
| --- | --- |
| 1 cup / 240 ml | 1 |
| 2 cups / 475 ml | 2 |
| 4 cups / 950 ml | 4 |

Tablespoon values are approximate. TeaFlow uses different gram-per-tablespoon densities for different tea shapes, so Assam, Sencha, Silver Needle, Gunpowder Green, and rolled oolong can produce different spoon estimates for the same gram target.

Reference ranges were checked against broad tea brewing guidance from Bon Appetit, The Spruce Eats, and gongfu-style temperature notes for green, oolong, black, dark, and Pu-erh teas.
