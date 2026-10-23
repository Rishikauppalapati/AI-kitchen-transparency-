# Clear Kitchen: test cases and results

Every case below was run on 22 October 2026. "Browser" means it was driven in the running app at phone size (375px wide). "Real AI" means the photo went through the live Gemini route. A case marked "Not tested" has not been checked yet.

After the final changes to the AI rules, the photo sheet, the demo images and the rate-limit handling, these were run again: the whole tidy dining journey with the real AI (five photos, fridge, OTP, diner view), untidy photos and a retake, the delivery setup and confirm, the file refusals, the help box on all eight photo prompts, and every demo image through the AI route (section 8). The other cases were verified earlier the same day and the code they depend on has not changed since.

The AI runs on Google's free tier, which allows 15 photo checks per minute on the main model. The tests were paced to stay under that. If you run many checks in a minute, expect "AI usage limit reached. Not a fail: retry in about N s".

## 1. Manager: dining check

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| MD-01 | Open Manager, Dining. | Six tiles all "To do". "Complete verification with OTP" is disabled. | Passed | Browser |
| MD-02 | Give a photo tile a passing photo. | Tile turns green with the AI's note. | Passed | Browser, real AI |
| MD-03 | Give a photo tile a failing photo. | Tile turns amber with a short note and a Retake pill. | Passed | Browser, real AI |
| MD-04 | Give a tile a not-a-kitchen picture, then a blurry dark one. | Amber, note "Photo doesn't show this". Nothing else changes. | Passed | Browser, real AI |
| MD-05 | Fridge reading 7. | Amber, note "7.0Â°C is above 5Â°C". | Passed | Browser |
| MD-06 | Fridge readings 5 and 3.5. | Both green (5Â°C or lower passes). | Passed | Browser |
| MD-07 | Fridge reading "abc". | Message "Enter a number between -30 and 30." No change. | Passed | Browser |
| MD-08 | Make five tiles green and leave one amber or untouched. | "Complete verification with OTP" stays disabled. | Passed | Browser |
| MD-09 | All six green, OTP 1111, then 1234. | 1111 shows an error. 1234 signs off. | Passed | Browser |
| MD-10 | After verification. | Tiles reset to "To do" for the next check. | Passed | Browser |
| MD-11 | Make some tiles green, leave the screen, come back. | The tiles are still as left (draft is saved). | Passed | Browser |

## 2. Manager: delivery check

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| DL-01 | Open Delivery check. | Three setup tiles. "Confirm setup" disabled until all three are green. | Passed | Browser |
| DL-02 | Work on the 11:30 AM shift, then switch to 6:30 PM. | The two shifts have separate tiles. | Passed | Browser |
| DL-03 | Trigger a surprise packing check. | A card with a 10:00 countdown and a banner. | Passed | Browser |
| DL-04 | Give the packing check a failing photo. | Note shown, the check stays open, you can retake. | Passed | Browser, real AI |
| DL-05 | Give it a passing photo. | Slot shows "Passed" and the diner count goes up by one. | Passed | Browser |
| DL-06 | Let the 10 minutes run out. | Slot shows "Missed". It does not count toward the diner's "n of 3". | Passed | Browser (sped-up timer) |
| DL-07 | Fast-forward the demo clock past a surprise packing check's window. | Recorded as missed, with a quiet entry in the bell list. | Passed | Browser |
| DL-08 | Look at "Handled for you". | Labelled "Simulated in demo (needs platform data)". | Passed | Browser |

## 3. Diner screens

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| DV-01 | Open Dining. | Three sample restaurants, each with a raid chip using an icon and words. | Passed | Browser |
| DV-02 | Open a freshly verified restaurant, Kitchen tab. | Green "Verified today", "Last verified: ...", "Evidence level 1 of 3: photo", six ticked checks, "Self-reported, AI-checked". | Passed | Browser |
| DV-03 | Open a restaurant not verified for over 24 hours. | Grey "Not verified for N day(s)", ticks greyed and labelled "Last known". | Passed | Browser |
| DV-04 | Open the resolved-raid restaurant. | What was reported, action, three dated fixes with evidence levels, "Re-check passed", source link. | Passed | Browser |
| DV-05 | Open the unresolved-raid restaurant. | "No follow-up found in our sources as of <today>". The words "not fixed" appear nowhere. | Passed | Browser |
| DV-06 | Open the restaurant with no raid. | "No raids reported in our sources", streak, latest passed checks. | Passed | Browser |
| DV-07 | Book a table. | Confirm stays disabled until a date and a time are chosen. Success screen says it is a demo. | Passed | Browser |
| DV-08 | Open the Delivery tab. | Freshness badge, "n of 2" surprise packing checks, complaints from the last 30 days with timelines. | Passed | Browser |
| DV-09 | Order now. | Order button disabled until an item is added. Total shown. Success screen says it is a demo. | Passed | Browser |
| DV-10 | Open News. | Five real reports worded as reported, each with a source link that opens in a new tab. A note says they are separate from the sample restaurants. | Passed | Browser |
| DV-11 | Report a problem with nothing chosen, then with a category only. | Error messages ask for the category, then for the seal answer. | Passed | Browser |
| DV-12 | Send a report. | A status timeline appears, and the complaint shows in the manager's Complaints inbox. | Passed | Browser |
| DV-13 | Manager records the fix. | The diner's delivery history shows "Fix recorded: ...". | Passed | Browser |

## 4. Rules that protect the diner's view

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| ST-01 | Leave a tile amber or unfinished and look at the diner page. | "Last verified" does not change. | Passed | Browser |
| ST-02 | All six green, complete verification with 1234, look at the diner page. | "Last verified: just now" and "Verified today". | Passed | Browser, production build |
| ST-03 | Fail the same tile three times. | "Flagged for review" on the manager side only. The diner page shows no flag. | Passed | Browser |
| ST-04 | Retry a flagged tile with a good photo. | Allowed. The tile can turn green. | Passed | Browser |
| ST-05 | The AI fails or times out. | Tile turns amber ("Couldn't check, try again") and it is not counted as a failed attempt. | Passed | Browser |
| ST-06 | Fast-forward +6 hours, +6 hours, then +1 day. | Green "6 hours ago", amber "Check overdue" at 12 hours, then grey "Not verified for 1 day". | Passed | Browser |
| ST-07 | Leave delivery setup failing or incomplete. | The delivery page does not change. | Passed | Browser |
| ST-08 | Check the diner's pack count. | Only passed random checks count. Missed ones do not. | Passed | Browser |
| ST-09 | Press Reset demo. | Everything returns to the starting data. | Passed | Browser |
| ST-10 | Refresh the page. | The role, screen, clock and all saved data are kept. | Passed | Browser |

## 5. Notifications

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| NT-01 | Press a trigger button in the demo panel. | A banner slides in with a Start button, and the bell count goes up. | Passed | Browser |
| NT-02 | Press Start. | Opens Dining check or Delivery check as appropriate and marks it read. | Passed | Browser |
| NT-03 | Dismiss a banner. | It disappears and the reminder stays unread in the bell. | Passed | Browser |
| NT-04 | Open the bell list. | All reminders, newest first, with "New" tags. Opening marks them read. | Passed | Browser |
| NT-05 | Set the demo clock before 8:30 AM and move forward. | Reminder at 8:30, due notice at 9:00, follow-up at 9:30. If the check was signed off in time, the later ones are skipped. | Passed | Browser (injected clock) |
| NT-06 | Leave Auto notifications On in the Manager view. | A reminder every 2 minutes. A new one waits until the last is opened. Nothing pops while a sheet is open. Off stops them. None in the Diner view. | Passed | Browser (sped-up timer) |
| NT-07 | Let the real clock pass 9:00 AM. | The scheduled reminders appear on their own. | Not tested | |

## 6. Demo controls

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| DP-01 | Open the demo panel as Diner. | Only role, restaurant and Reset demo, plus a hint. | Passed | Browser |
| DP-02 | Open it as Manager. | Also the demo clock, expected-result switch, auto notifications and trigger buttons. | Passed | Browser |

## 7. Bad files that should be refused

The Upload button was removed from every screen (manager and diner). These cases still apply to Take photo and to the server route, which refuses bad files whatever sends them.

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| UP-01 | Upload a PDF. | Clear message, nothing changes. Refused in the browser and again by the server. | Passed | Browser, API |
| UP-02 | Upload a 30 MB image. | "That photo is too large." Nothing changes. | Passed | Browser, API |
| UP-03 | Upload a text file renamed to .jpg. | "We couldn't open that file as a picture." | Passed | Browser, API |
| UP-04 | Upload an empty file. | "That photo is empty." | Passed | API |
| UP-05 | Send an unknown check name (such as "toString" or "fridge"). | "Unknown check." | Passed | API |
| UP-06 | Send a 5 MB file straight to the server. | Refused as too large. | Passed | API |

## 8. AI photo checks: every demo image through the real AI

Each demo image was sent to the live route as its own check, three or more times, with the result the AI should give. Tidy images must pass (green). Untidy ones must fail (amber). The not-a-kitchen and blurry images must come back as "Photo doesn't show this" (amber, a retake). The images are in `public/demo/`. Twelve are illustrations drawn for this project (`demo-sources/`) with no caption that gives the answer away; the rest are real photos or simple generated bad inputs.

| Demo image | Check | Expected | Result over the runs | Example AI note |
|---|---|---|---|---|
| caps_gloves_tidy | Caps and gloves | Pass (green) | 3 of 3 right, no wrong answers | Hat and gloves are worn |
| caps_gloves_untidy | Caps and gloves | Fail (amber) | 3 of 3 right, no wrong answers | Bare heads and hands visible. |
| floors_tidy | Floors and drains | Pass (green) | 3 of 3 right, no wrong answers | Floor and drain are clean, dry and clear |
| floors_untidy | Floors and drains | Fail (amber) | 3 of 3 right, no wrong answers | Water bottles and litter on the floor |
| labels_tidy | Stock labels | Pass (green) | 3 of 3 right, no wrong answers | All containers have labels with readable dates. |
| labels_untidy | Stock labels | Fail (amber) | 3 of 3 right, no wrong answers | Food containers missing labels and dates |
| bins_tidy | Bins | Pass (green) | 3 of 3 right, no wrong answers | All three bins are closed with lids down. |
| bins_untidy | Bins | Fail (amber) | 3 of 3 right, no wrong answers | Waste bin is overflowing with rubbish. |
| handwash_tidy | Handwash station | Pass (green) | 3 of 3 right, no wrong answers | Soap dispenser and wash basin are visible. |
| handwash_untidy | Handwash station | Fail (amber) | 3 of 3 right, no wrong answers | Wash basin and running water visible, but no soap. |
| seals_tidy | Delivery seals | Pass (green) | 3 of 3 right, no wrong answers | Seal stickers and roll of seals are visible. |
| seals_untidy | Delivery seals | Fail (amber) | 7 of 7 right after the redraw. The first drawing had the word EMPTY and a cardboard roll core, and the AI misjudged it once the caption was removed (it read the core as a roll of stickers, then the words SEAL STICKERS on an empty tray). | Seal stickers container is empty. |
| bags_tidy | Delivery bags | Pass (green) | 6 of 6 right (the rule about stains was tightened after the first 3 runs and it still passes) | All bags and boxes appear clean. |
| bags_untidy | Delivery bags | Fail (amber) | 4 of 4 right after the stains were redrawn. The first drawing was judged clean 3 of 3 times: the AI mistook solid blobs for a printed design. | The delivery bags and boxes are clean. |
| hotcold_tidy | Hot and cold bags | Pass (green) | 3 of 3 right, no wrong answers | Hot and cold items are kept in separate bags. |
| hotcold_untidy | Hot and cold bags | Fail (amber) | 3 of 3 right, no wrong answers | Hot and cold items share the same bag. |
| pack_tidy | Packed order | Pass (green) | 3 of 3 right, no wrong answers | Packed order is closed with a seal strip. |
| pack_untidy | Packed order | Fail (amber) | 3 of 3 right, no wrong answers | Packed order bag has a visible spill. |
| not_a_kitchen | Bins (any check) | Not relevant (amber) | 3 of 3 right, no wrong answers | Photo doesn't show this |
| blurry_dark | Handwash (any check) | Not relevant (amber) | 3 of 3 right, no wrong answers | Photo doesn't show this |

Final result: every image gives the expected answer on every run, with no wrong answers in the final versions (68 correct answers). Two drawings were misjudged while being developed (the stained bags and the empty seal tray) and were redrawn until the AI judged them correctly, which is the reason for the longer notes above.

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| AI-01 | Upload a clear photo that meets the rule for its check. | Pass, tile green, a short note of at most 12 words. | Passed (all nine tidy images) | Real AI |
| AI-02 | Upload a clear photo that breaks the rule. | Fail, tile amber, the reason in the note. | Passed (all nine untidy images) | Real AI |
| AI-03 | Upload a picture of the wrong thing, or one too dark and blurry. | "Photo doesn't show this", amber, retake. | Passed | Real AI |
| AI-04 | The notes never describe people. | No words like chef, man or woman. | Passed, with one borderline note: "Chef hat and gloves worn properly" (it names the hat, not a person) | Real AI |
| AI-05 | Google reports the free-tier limit (HTTP 429). | The app moves to a backup model; if all are limited, it says how long to wait. | Passed for the message parsing (9 cases built from Google's real error texts); not provoked live | Unit check |
| AI-06 | The AI service fails completely. | Tile amber "AI was busy. Not a fail: retry" with the Retake pill, not counted as a failed attempt. | Passed | Browser |
| AI-07 | Check six photos within one minute on the free tier. | May hit the 15-per-minute limit and show the wait message. | Known limit | Google free tier |
### Demo photos: saved results, and the live switch

By default a demo photo applies the result the real AI gave that exact image (section 8), instantly and without any AI call, so a demo is the same every time. The tile is labelled "Demo photo". The switch "Live AI for demo photos" in the Manager's demo controls runs the real AI on demo photos instead, and the tile is then labelled "Live AI check".

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| DM-01 | In dining, pick each tidy demo image (caps, floors, labels, bins, handwash). | Every tile turns green, labelled "Demo photo", in under half a second, with no AI call. | Passed (5 of 5) | Browser |
| DM-02 | In dining, pick each untidy demo image and the two bad inputs. | Every tile turns amber (Retake), labelled "Demo photo". | Passed (7 of 7) | Browser |
| DM-03 | In delivery, pick each tidy and untidy demo image (seals, bags, hot and cold). | Tidy green, untidy amber, labelled "Demo photo". | Passed (6 of 6) | Browser |
| DM-04 | Do the whole journey with demo photos: five tidy dining photos, fridge 3.5, OTP 1234. | "Complete verification with OTP" enables, and the diner page shows "Verified today" and "Last verified: just now". | Passed | Browser |
| DM-05 | In delivery, pick the three tidy setup photos and confirm, then answer a packing check with the untidy and then the tidy demo photo. | Setup confirmed and diner delivery page updates. Untidy pack photo refused with the reason. Tidy one counts, and the diner's "n of 3" goes up. | Passed | Browser |
| DM-07 | With the live switch on, make every AI call fail, then use a tidy and an untidy demo photo. | The saved result is used instead: tidy green, untidy amber, labelled "Demo photo". Never an error. | Passed | Browser (simulated outage) |
| DM-08 | Use Take photo with the switch off. | Always the live AI, labelled "Live AI check". | Passed (earlier tests; the code path is unchanged) | Real AI |

## 9. Security

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| SEC-01 | Search every project file and the production build output for the API key. | The key appears in none of them. | Passed (192 source and fresh production-build files, key in none) | File scan |
| SEC-02 | Search every file the browser downloads from the running production app, and its response headers. | The key appears in none. | Passed (29 browser-bound files and the headers; the Gemini SDK is not in the browser bundle at all) | Browser, scan |
| SEC-03 | Read the API's success and error responses. | None contains the key or internal error details. | Passed (empty request, text-as-photo and error responses, plus headers, contain no key) | API |
| SEC-04 | Search the git history. | No commit contains the key. | Passed (0 commits contain the key) | git |
| SEC-05 | Check which env files git tracks. | Only the blank `.env.example`. `.env.local` is ignored. | Passed (only .env.example is tracked) | git |
| SEC-06 | Try to import the Gemini code from a browser file. | The build refuses (a `server-only` guard). | Passed | Build |
| SEC-07 | The AI service rejects the key (a deliberately invalid key). | Friendly message, tile amber with "AI was busy. Not a fail: retry", not counted as a failed attempt, no key or error details shown. | Passed (tile says "AI was busy. Not a fail: retry", has the Retake pill, and is not counted toward the 3-attempt flag) | Browser, production build |

## 10. Accessibility

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| AX-01 | Calculate the contrast of every text and background colour pair. | At least 4.5 to 1 for text, 3 to 1 for the focus ring and form field borders. | Passed | Calculation |
| AX-02 | Measure every button, link and field on every screen and sheet at 375px wide. | Each is at least 44px tall and wide. | Passed | Browser |
| AX-03 | Check that every control has a name and every image has alt text. | None missing. | Passed | Browser |
| AX-04 | Open a bottom sheet, press Tab past the last control, press Shift+Tab on the first, press Escape. | Focus stays inside, wraps around, Escape closes, and focus returns to the opening button. | Passed | Browser |
| AX-05 | Look at every status (green, amber, grey, flags, raid states). | Each has an icon and words as well as colour. | Passed | Browser |
| AX-06 | Use the app with a real screen reader. | Reads sensibly. | Not tested | |

## 11. Branding and layout

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| BR-01 | Open any screen as Diner and as Manager. | The Clear Kitchen logo is centred at the top. It is exactly centred on the phone frame. | Passed | Browser |
| BR-02 | Look at the Manager view. | The bell sits clear to the right of the logo (28px gap) and level with it. | Passed | Browser |
| BR-03 | Open the page title and browser-tab icon. | Title "Clear Kitchen", with the pot icon. | Passed | Browser |

## 12. Deployment readiness

| ID | Test case | Expected | Result | How |
|---|---|---|---|---|
| DEP-01 | Run lint and the production build. | Both pass with no errors. | Passed (lint clean; production build lists /, /api/check and /icon.svg) | Command line |
| DEP-02 | Run the production server and the whole journey (tiles, sign-off, diner view). | Works as in development. | Passed (before the final changes) | Browser |
| DEP-03 | The code is on GitHub. | The pushed commit matches the local one. | Passed (checked right after the push) | git |
| DEP-04 | The site is live on Vercel. | A working public link. | Not done: needs the owner's Vercel login and key entry | |
