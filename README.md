# Kitchen Transparency (hackathon prototype)

Restaurants do AI-checked kitchen check-ins in a manager view. Diners see the result in a diner view: when the kitchen was last verified, which checks passed, any past raid and how it was resolved. One Next.js web app, phone-first, deployable to Vercel.

All restaurants are fictional samples. The news items are real reports, worded as reported and linked to their sources.

## Run it

1. Get a Gemini API key from https://aistudio.google.com/apikey.
2. Copy `.env.example` to `.env.local` and put the key after `GEMINI_API_KEY=`. Never put the key in code and never commit `.env.local` (git ignores it). The key is only read on the server, in `lib/gemini.ts`.
3. Install and start:

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the round demo button (bottom right) to switch between Manager and Diner, pick a restaurant, fast-forward the demo clock, trigger a random pack check, show the expected AI result, or reset the demo.

## How it works

- **Draft versus published.** The manager edits a draft. The diner only ever reads a published snapshot, written only on a valid OTP sign-off (dining, demo code 1234) or setup confirmation (delivery) when every required tile is green. Rules live in `lib/state.ts`. State is saved in your browser (localStorage).
- **The AI call.** One route, `POST /api/check` (`app/api/check/route.ts`), asks Gemini whether a photo passes a check, using the questions in `lib/checks.ts`. The browser shrinks photos to 1024px JPEG first. Uploads are checked by type, size and file signature. The model list is at the top of `lib/gemini.ts`; a slow or overloaded model is backed up by the next one, and the whole check times out after 15 seconds.
- **Plain code, no AI.** The fridge reading (5°C or lower; verify the limit with FSSAI before real use), freshness bands, retake counting, flags, schedule and the OTP.

## Demo photos

Every photo prompt offers Take photo, Upload, and Use a demo photo. Demo images are JPEGs in `public/demo/`, named exactly as listed in `lib/demoPhotos.ts`. A demo photo that exists goes through the same real AI check as an upload. If a file is missing, the sheet says which file to add and offers the expected result as a clearly labelled simulation.

Files in `public/demo/` today:

| File | Source | Real AI result when tested |
|---|---|---|
| `caps_gloves_untidy.jpg` | Pexels, [Maxence Ambert](https://www.pexels.com/photo/commercial-kitchen-in-a-restaurant-21661595/) | amber: no caps or gloves |
| `labels_untidy.jpg` | same photo as above | amber: no date labels |
| `floors_untidy.jpg` | Pexels, [Alexander F Ungerer](https://www.pexels.com/photo/interior-of-a-messy-kitchen-20374786/) | amber: items on the floor |
| `handwash_tidy.jpg` | Pexels, [ready made](https://www.pexels.com/photo/stainless-steel-faucet-turned-off-3847573/) | green: soap dispenser and basin visible |
| `handwash_untidy.jpg` | Pexels, [Karola G](https://www.pexels.com/photo/washing-hands-in-sink-5240613/) | amber: no soap visible |
| `bins_untidy.jpg` | Pexels, [Markus Spiske](https://www.pexels.com/photo/black-trash-bin-with-full-of-trash-3806764/) | amber: bin overflowing, lid open |
| `not_a_kitchen.jpg` | drawn by us | amber: photo doesn't show this |
| `blurry_dark.jpg` | made from the first photo, darkened and blurred | amber: photo doesn't show this |

Each of these gave the expected result on repeated real-AI runs. A photo that did not (the chefs photo for `caps_gloves_tidy`, and a row of alley dumpsters for `bins_tidy`, which the AI judged as having open lids) was removed.

Still missing (12): `caps_gloves_tidy`, `floors_tidy`, `labels_tidy`, `bins_tidy`, `seals_tidy`, `seals_untidy`, `bags_tidy`, `bags_untidy`, `hotcold_tidy`, `hotcold_untidy`, `pack_tidy`, `pack_untidy`. Add a clear, well-lit JPEG with the exact name and it is picked up automatically. A "tidy" photo must clearly satisfy the check (for example, everyone visible wearing caps and gloves) or the AI will rightly say it does not pass.

`test-photos/` holds the original Pexels downloads (also credited to [Gaurav Ranjitkar](https://www.pexels.com/photo/cooks-preparing-food-in-a-restaurant-kitchen-15323383/) for `tidy-1.png`).

## Deploy to Vercel

Import the GitHub repo in Vercel and add `GEMINI_API_KEY` under Settings, Environment Variables. Photos are limited to 4 MB per request.
