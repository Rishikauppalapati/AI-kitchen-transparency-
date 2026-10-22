# Kitchen Transparency (hackathon MVP)

A restaurant manager uploads one kitchen photo. Gemini reads it, and the diner's page for that restaurant updates, next to the raid and fix history. All restaurants are made-up sample data.

## Run it

1. Get a Gemini API key from https://aistudio.google.com/apikey (it starts with `AIza`).
2. Copy `.env.example` to `.env.local` and paste the key after `GEMINI_API_KEY=`. Never put the key in code and never commit `.env.local` (git already ignores it).
3. Install and start:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- `app/page.tsx`: the one screen (manager panel on the left, diner view on the right).
- `app/api/check/route.ts`: receives the photo on the server.
- `lib/gemini.ts`: the only place Gemini is called and the question it is asked.
- `lib/rules.ts`: plain-code rules (upload checks, "retake" decision, evidence level).
- `data/restaurants.json`: sample restaurants and raid records.
- Results are saved in your browser (`localStorage`), so the demo works on one device.

## Test photos

`test-photos/` holds free Pexels photos for trying the check-in (none is a perfect "all pass" example):
- `tidy-1.png`: [Gaurav Ranjitkar](https://www.pexels.com/photo/cooks-preparing-food-in-a-restaurant-kitchen-15323383/)
- `tidy-2.jpg`: [Maxence Ambert](https://www.pexels.com/photo/commercial-kitchen-in-a-restaurant-21661595/)
- `messy-1.jpg`: [Alexander F Ungerer](https://www.pexels.com/photo/interior-of-a-messy-kitchen-20374786/)

## Deploy to Vercel

Import the GitHub repo in Vercel and add `GEMINI_API_KEY` under Settings, Environment Variables.
