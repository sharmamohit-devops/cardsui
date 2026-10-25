# Topit Card Gallery

- The 36 card designs are exact crops of user-supplied artwork, uploaded as CDN
  assets (`src/assets/cards/*.asset.json`) and rendered as `<img>` in the
  gallery. Why: user asked for pixel-exact cards ("exact same"); CSS recreation
  would lose fidelity.
- Web fonts (Bricolage Grotesque, DM Sans) load via `<link>` in
  `src/routes/__root.tsx` head. Why: Tailwind v4's Lightning CSS cannot resolve
  remote `@import` in styles.css.
