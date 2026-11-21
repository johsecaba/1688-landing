# 1688.bible

A ChatGPT-style conversation kept to the Bible. People ask about books, verses, people, history, and Christian living grounded in Scripture. Off-topic questions are declined.

The interface follows two systems from [Refero Styles](https://styles.refero.design/):

- [Cursor — warm parchment atelier](https://styles.refero.design/style/4e3b4717-84c8-4599-baaf-a343c3d619b6) for the cream page, hairline rules, 4px corners, and the literary reading voice.
- [Slash — gilded ledger lines](https://styles.refero.design/style/7c38e84b-aea0-4c8f-b3e9-60b994ee6c6b) for the rule that gold is punctuation (citations, rules, numerals) and never a button fill.

Neutrals are the crown logo’s own cream, navy, and gold.

## Develop

```bash
npm install
npm run dev
```

On Vercel, the AI Gateway authenticates with OIDC. Locally, copy `.env.example` to `.env.local` and set `AI_GATEWAY_API_KEY`. The model id lives in `lib/model.ts`.

Conversations for this first version stay in the browser’s `localStorage`.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint
