# Manifest Notebooky

**The freedom to write anything. The obligation to write it American.**

**Live demo:** https://bluntforceriot.github.io/manifest-notebooky/

![Manifest Notebooky cover art](docs/manifest-notebooky-cover.png)

Manifest Notebooky is a satirical patriotic notebook app built for **Summer into
AI Week 2: Independence Engines**. It gives the user a blank page, then
immediately overreaches by forcing ordinary notes through **Mandatory Murican
Autocorrect**.

You can write anything: a grocery list, a plan, a complaint, a manifesto, or one
suspiciously long note about snacks. The app then demonstrates exactly why
freedom becomes funny, fragile, and annoying when software decides it knows what
you meant.

The cover image is promotional documentation art, not a runtime app asset.
Runtime visuals are generated with HTML/CSS and local TypeScript.

## Why It Exists

A notebook is an Independence Engine because a blank page lets the user build
anything. Blank pages let people plan, remember, complain, organize, revise,
argue, doodle, and write freely.

Manifest Notebooky satirizes software overreach by forcing that freedom through
Mandatory Murican Autocorrect. It is a joke about freedom-talk, productivity
software, patriotic action branding, and the dark-pattern settings that turn
simple tools into tiny paperwork regimes.

Mandatory Murican Autocorrect is never off. The lowest setting is simply
`Mandatory Murican Autocorrect: ON`. Users can upgrade to `MAXIMUM MURICAN`, but
downgrading is locked for five minutes and then requires a ridiculous
forced-positive questionnaire. It is a parody of freedom-talk, patriotic action
branding, and dark-pattern settings.

## Features

- Static Vite + TypeScript browser app.
- Local notebook pages stored in `localStorage`.
- Create, rename, duplicate, delete, edit, and persist pages.
- Eight selectable paper themes.
- Baseline Mandatory Murican Autocorrect while typing, on punctuation, paste,
  blur, and debounce.
- MAXIMUM MURICAN mode with persisted five-minute downgrade lock.
- Downgrade form `Dissatisfaction With Maximum Murican Mode Form 1776-B`.
- Forced-positive processed statement before downgrade is allowed.
- Liberty Telemetry counters.
- Stamps that sit visually on the paper without changing text.
- Deterministic `DECLARE INDEPENDENCE`, `STAMP IT`, `EAGLEIZE IT`, export, and
  clipboard tools.
- Responsive layout checked at desktop and phone-sized viewports.

## Run Locally

```sh
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Play Online

Manifest Notebooky is playable in the browser at:

https://bluntforceriot.github.io/manifest-notebooky/

This is a static browser demo. Players do not need to download the repository
for normal play.

## Verification

```sh
npm ci
npm run typecheck
npm run build
npm run preview
npm run playtest
```

`npm run playtest` expects the preview server at `http://127.0.0.1:4175/`.

## GitHub Pages

This repo includes `.github/workflows/deploy.yml`. To publish through GitHub:

1. Push to `main`.
2. In the GitHub repository settings, set Pages to deploy from GitHub Actions if
   it is not already enabled.
3. Wait for the `Deploy GitHub Pages` workflow to finish.

## Privacy / Hosting Notes

- Static browser app only.
- No backend.
- No accounts.
- No analytics or telemetry.
- No remote AI/model calls.
- Data stays in this browser's `localStorage` unless the user exports/copies it.

## AI / Tooling Note

Built with Codex for implementation and integration. The app uses deterministic
local TypeScript logic only; it does not call a model at runtime.

## Submission Blurb

Manifest Notebooky gives you the freedom to write anything, then proves freedom
is complicated by installing an unavoidable patriotic autocorrect that rewrites
normal language into red-white-blue action paperwork. It is a notebook app, a
parody of software overreach, and a tiny Independence Engine with fireworks in
the spellchecker. The user can even toggle MAXIMUM MURICAN, but downgrading
requires a cooldown and a mandatory reeducation questionnaire, because liberty
sometimes has terms and conditions.

## Scope

This is a public-demo prototype. It intentionally does not include backend sync,
accounts, remote submissions, analytics, online sharing, or runtime AI calls.
