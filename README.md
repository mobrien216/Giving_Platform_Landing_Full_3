# Cleveland Foundation — Digital Experience Prototype

> **This is the V1 (board demo) version.** It shows only what the first release will include. The full prototype, with every idea explored so far, stays at [Giving_Platform_Landing_Full_2](https://github.com/mobrien216/Giving_Platform_Landing_Full_2); build back toward it from there.

## What V1 changes from Full_2 (11-09-2026)

| Area | V1 |
|---|---|
| Landing page | Rebuilt on the product team's staging stylesheet (`assets/site/application.css`, page tweaks in `assets/site/site.css`, behaviour in `assets/site/site.js`). Sections: hero, light 2026 grants ticker, *Who are you?* doors, *Cleveland, You're the Reason* with the campaign film behind it (`assets/video/campaign.mp4`, loads when scrolled near), *Neighbors helping neighbors*, scrolling *How a community foundation works*, closing CTA. |
| Registration windows | Same flow as Full_2, styled by `assets/landing/popups.css`, which `scripts/build-popup-css.js` generates from `landing.css` + `tcf-v3-site.css` inside `@scope` so they don't restyle the page. Labels: Nonprofit Partner, Professional Advisor. Adds phone + password (checked, never stored). Interest areas are the **17 Fields of Interest**, grouped by Impact Agenda area. |
| Community Member app | Local Legends, Impact Calculator, Impact Map, Stories from the field, News feed, Open a DAF, Plan Your Legacy, Make a Gift, and a **Your giving history** list on the home page. Removed: History Quiz, Learn, Members, Grow Your City, Own Part of the Neighborhood. |
| Professional Advisor app | Same as Community plus the **Advisor FAQ**. Removed: Charitable Gift Planner, Estate Planning Checklist, History Quiz. |
| Fund holder portal | Unchanged except: History Quiz and Grow Your City removed (badges off); persona tools trimmed to the Advisor FAQ; profile and giving-plan interests use the 17 Fields of Interest (`INTERESTS_V1` / `INTEREST_AREAS` at the top of `assets/portal/app.js`; the Field-to-focus-area mapping is a best guess for the program team to confirm). Portal data saves under its own key (`tcf-v1-donor-portal-profile`) so it doesn't mix with Full_2 in the same browser. |

Removed features' views and code are mostly still in the files, just unlinked, so they can be switched back on.


A clickable prototype of the Foundation's public site and its three signed-in / registered experiences, built as a static site so it can be hosted on GitHub Pages.

> **Prototype only.** All people, funds, balances and grants are fictional. Nothing is sent anywhere: activity is saved in the visitor's own browser, and the Salesforce / Ren iPhi sync shown in the portal is simulated.

## How the site fits together

```
index.html  ─────────────── Landing page (clevelandfoundation.org)
   │
   ├─ Log-In / "I have a fund here" ───────► portal/            Account Holder Portal
   │                                            sign-in → dashboard (DAF + organizational funds)
   ├─ Join the Community → Community Member ► community/         Community Member experience
   ├─ Join the Community → Advisor ─────────► advisors/          Advisor experience
   ├─ Non-profit Partner → Org Fund Account ► portal/?fund=eac   Portal, organizational fund selected
   └─ Impact Map / Calculator (in-page) ────► tools/             loaded only when opened
```

Only **four pages** make up the whole system. Inside each app, moving between modules happens in place — no page reload — and every module still has its own link.

## Folder structure

```
/
├── index.html                    Landing page
├── portal/index.html             Account Holder Portal
├── portal/plan/index.html        Five-year giving plan (values, contributions, investments, gifts) — opened from My giving plan
├── open/index.html               Open a Donor Advised Fund (online flow) — from "Open a DAF" in the apps and the portal sign-in
├── community/index.html          Community Member experience   ┐ GENERATED from src/giving/
├── advisors/index.html           Advisor experience            ┘ (do not edit — see below)
├── tools/
│   ├── impact-map.html           Landing-page impact map
│   └── impact-calculator.html    Landing-page impact calculator
├── assets/
│   ├── img/                      Logo and images (shared by every page)
│   ├── css/                      tcf-v3.css (tokens + fonts) and the three bridge files
│   ├── fonts/                    Self-hosted brand fonts (licensed, see README.txt)
│   ├── data/grants-2025.js       THE grants dataset: map tool, community/advisor map, portal map
│   ├── landing/                  landing.css · landing.js (page + navigation) · tracks.js (non-profit door, config, prefetch)
│   ├── portal/                   portal.css · data.js (engagement content) · app.js · init.js
│   ├── giving/                   Shared by community + advisors: app.js, extras.js, giving.css, map-and-grants.js
│   ├── advisors/                 Advisor-only: advisor.css, Gift Planner, Estate Checklist + FAQ
│   ├── tools/                    Map + calculator styles and scripts
│   ├── intro/welcome.html        Welcome animation (iframe) for community/advisors
│   └── js/tcf-bridge.js          Registration hand-off + deep links for community/advisors
├── src/giving/                   Source for the two app pages: page.html (shared) + community.html / advisors.html (per-app fills)
├── scripts/stamp-assets.js       Adds a ?v= fingerprint to every local .js/.css reference so browsers never run stale code
├── scripts/build-pages.js        Builds community/ and advisors/index.html from src/giving/ (no dependencies)
├── package.json                  npm run build · npm run check · npm run serve (optional shortcuts)
├── 404.html                      Friendly not-found page
└── .nojekyll                     Tells GitHub Pages to serve files as-is
```

## Direct links to modules

| App | Link pattern | Examples |
|---|---|---|
| Portal | `portal/#/<module>` | `#/home` `#/performance` `#/allocation` `#/grants` `#/history` `#/contribute` `#/statements` `#/documents` `#/endow` `#/family` `#/advisor` `#/profile` `#/plan` `#/engage` `#/feed` `#/map` `#/legends` `#/quiz` `#/garden` `#/impact` `#/qr` (org funds) |
| Community / Advisors | `community/#/<view>` · `advisors/#/<view>` | `#/home` `#/newsfeed` `#/legends` `#/history` `#/garden` `#/impactmap` `#/calculator` |

Portal links ask the person to sign in once per browser session, then open the module the link pointed to. Community and advisor links skip the intro animation and open the module directly.

## How the pages talk to each other

| Hand-off | How |
|---|---|
| Registration → community / advisors | Landing saves name, email, interests and advisor type as `tcf_registration` in the browser; the app greets the person by name. |
| Landing Log-In → portal | Opens `portal/?signin=1`, which always starts at the sign-in screen. |
| Org fund → portal | Opens `portal/?signin=1&fund=eac` so the dashboard opens on the organizational fund. |
| Sign out (any app) → landing | Returns to `index.html`. |
| Portal profile | Saved as `tcf-donor-portal-profile-v1`; **Profile → Sync & data → Reset demo** clears it. |
| Portal session | `tcf_portal_session` in sessionStorage, or localStorage when **Keep me signed in** is ticked. |
| Five-year giving plan | The plan saves itself as `tcf-five-year-plan-v2` and, after every change, a small summary as `tcf-five-year-plan-summary`, which **My giving plan** reads. The portal hands the plan the mission and fund purpose statements as `tcf-plan-context`. **Reset demo** clears all three. |
| Impact map interest | `impact-map-my-interests` / `impact-map-aggregate-v1` in localStorage (this browser only on a static host). |

## Speed

- Styles, scripts and images live in separate files, so the browser downloads them once and reuses them.
- The community and advisor experiences share one `assets/giving/app.js` and the rest of `assets/giving/`, downloaded once for both.
- The 2025 grants dataset (~145 KB) exists once, in `assets/data/grants-2025.js`; every map uses it, and the browser caches it across pages.
- Map pins use the coordinates stored with each grant — no address lookups at runtime.
- The landing page's map and calculator load only when someone opens them.
- After the landing page finishes loading, it quietly pre-loads the three apps in the background, so the next click feels instant.

## Preview locally

From the folder that contains this README:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. (Opening `index.html` straight from disk mostly works, but some browsers restrict saved data for `file://` pages, so a local server is closer to the real thing.)

## Publish on GitHub Pages

1. Create a repository and upload **everything in this folder**, keeping the folder structure. `index.html` must be at the top level.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<your-account>.github.io/<repository-name>/`.

Every link is relative, so the site works at that address without any changes.

## Design system

The site follows **Component Library 3.0**, built on the approved Digital Style Guide 2026 (10-20-2026).

- `assets/css/tcf-v3.css` — the v3 tokens and font declarations. Every page loads it first.
- Corners: `--r` (4px) for cards, panels and inputs; `--r-btn` (6px) for every button, chip and control, slightly softer. Change a button's corners there, not in the app stylesheets.
- Section labels (the small all-caps line above a title) have no square markers. There are three styles, all defined in the **Labels** section of `tcf-v3-site.css`:
  - **Type only** for headings, greetings, heroes, page, card and menu labels. They're set in `--label`, a softer green.
  - **Hairline rule** for navigation tiles (`.panel`): a thin line runs from the label to the tile's edge.
  - **Color edge** for data tiles, meaning tiles that show account figures and click through. Put them in a `.pgrid.data` row and set each tile's color as `--pk`; a 3px bar in that color runs along the top.
- `assets/css/tcf-v3-site.css`, `tcf-v3-giving.css`, `tcf-v3-tools.css` — bridges that map each app's older token names to v3 (style guide p.103) and restyle shared components.
- `assets/fonts/` — Paralucent, Paralucent Condensed and Source Sans Pro, self-hosted (licensed).
- `assets/intro/welcome.html` — the welcome animation (Giving Portal animatic v5) used by the Community and Advisor apps.

## Needs internet

The maps (Leaflet + OpenStreetMap tiles) and the portal's QR code library load from public CDNs. Everything else, including all fonts, is in this folder.

## Opening a Donor Advised Fund

`open/index.html` is the online "Open a Donor Advised Fund" flow: intro, then **You · Your fund · Fund it · Secure & agree · Review**, then confirmation. Its steps and fields follow the current Microsoft Form process ("Build notes" in its header shows the question each field maps to; "Ren spec" shows the record it would send).

**Ways in** (`?from=`):

| From | Where |
|---|---|
| `community` / `advisors` | every "Open a DAF" button in the registration apps (`openDAF()` in `assets/giving/app.js`) |
| `signin` | "Open a Donor Advised Fund" under the portal's sign-in form |
| `portal` | "Open a new fund" inside the portal (fund switcher, My funds, Contribute), for an existing holder |

**When the donor finishes**, "Go to my account" saves a small hand-off (`tcf_new_fund`: name, email, fund name, gift, card or ACH, allocation, persona) and opens `portal/?newfund=1`:

- **A new donor** lands signed in with only their new fund. The opening gift is the balance, and a **Sign your fund agreement** card stays on the dashboard until they sign (DocuSign is simulated).
- **An existing holder** gets the new fund added alongside their others.
- **Persona:** a donor who came from the community or advisor app sees that app's own engagement tools at the bottom of the portal's **Engage** menu (Community: Learn, Members, Vision cards; Advisor: Gift planner, Estate planning checklist, Advisor FAQ). They open inside the portal (`#/learning`, `#/giftplanner` …), using the apps' frame mode (`?embed=1`).
- **Reset demo** returns to the Taylor Williams demo account.

**Prototype safeguards:** the payment and password steps show a prototype notice, and obvious test values are filled in. Card, bank, password, date of birth, address and phone are never saved or handed on; the flow clears them on submit. Everything joining the flow to the site is in the **SITE INTEGRATION** block at the end of `open/index.html`; the flow itself is unchanged apart from brand styling (self-hosted fonts, the `tcf-v3-site.css` bridge, brand corners, flat green, light only).

### Future state: no separate signing step

**Today (what the prototype shows):** after submitting, the donor logs in to the portal and signs a fund agreement in DocuSign before the fund opens. This mirrors the current process, so it stays as is for now.

**Where we want to go:** no log-in-and-sign step at all. Checking the three boxes on **Secure & agree** (Terms and Conditions, irrevocable gift, accurate information) should be everything needed to open the account, and the donor goes straight from submitting to an open fund. The confirmation page becomes "Congratulations, welcome, you've opened your fund. Log in and start granting" instead of "log in and sign your agreement".

**What has to change to get there:**
- **Terms and agreement language** (legal/compliance): rewrite the Terms and Conditions, and the agreement terminology throughout, so that accepting them in the flow is the fund agreement. Legal and compliance confirm this is sufficient before launch.
- **`open/index.html`:**
  - drop the intro's third phase ("Sign your fund agreement");
  - update the Secure & agree checkbox wording;
  - turn the confirmation screen into a welcome / start-granting page;
  - update the Ren build notes and spec (the record's status is "Pending agreement signature" today).
- **Portal** (`assets/portal/app.js`): new funds open immediately. Remove `agreementCard`, `signAgreement`, `completeAgreement` and the "Agreement to sign" status.

## My giving plan and My profile

**My giving plan** (`portal/#/givingplan`, in the left menu just above My profile) is where a donor builds their plan, ideally with their advisor. Top to bottom:

1. **How complete it is:** "You're 80% complete", with the six cards counting equally, and buttons to message or book a call with the advisor.
2. **Six cards, in any order:** **Mission, legacy & purpose · Your values · Contribution plan · Matched organizations · Investments · Granting plan**. No numbers and no required order; each card shows its status and what we already know. **Mission, legacy & purpose** opens its own page (`#/givingplan` with `{page:'mission'}`) of free-text boxes for a personal mission statement, a legacy statement, and a purpose statement for each fund the donor can see. They save as you type (in the portal profile) and log a Salesforce update when a box loses focus.
3. **Your five-year giving plan:** the optional finished plan, with contributions and grants by year once the cards are filled in, and a PDF.
4. **Tell us what you care about:** the causes tagged at registration (editable), plus three ways to go deeper: a quick pick list, a values quiz and a values card game.

**My profile** (`portal/#/profile`) is account settings only: who you are, then Profile details, Preferences, Security and Sync & data, each on its own page (`#/profile` with `{tab}`).

The other cards, the activities and the finished plan open the five-year giving plan inside the portal (`#/plan`), which runs `portal/plan/index.html` in a frame. That page is the standalone giving-plan prototype with one marked **PORTAL INTEGRATION** block at the end, which:

- hides its own header when embedded (`?embed=1`) and opens the requested section (`step=1-5`) or activity (`values=picks|quiz|cards`);
- shows one card at a time: no section rail or progress meter, and the footer button is **Done**, which returns to My giving plan;
- loads from an address stamped with the plan page's fingerprint (`<meta name="tcf-plan">` in `portal/index.html`, kept current by `scripts/stamp-assets.js`), so a new deploy never shows a cached plan;
- starts a **new** plan from the fund's real balance (`balance=`) and pre-selects the donor's registration causes in the pick list (`interests=`, mapped in `INTEREST_AREAS` in `assets/portal/app.js`);
- publishes the summary the hub reads, and tells the portal when values change or the plan is saved (shown as Salesforce updates under Sync & data).

My giving plan never reads the plan's internals, only the summary, so either side can change as long as the summary keeps its shape (`v: 1`).

Information flows the other way through `tcf-plan-context` (`v: 1`): the portal writes the personal mission statement and the selected fund's name and purpose statement, and the plan shows them first on its finished summary and at the top of the PDF. The legacy statement stays in the profile and is not printed on the plan.

**Tony**, the AI portfolio-allocation assistant, is linked from the Investments section. Set `TONY_URL` near the top of `portal/plan/index.html`; while it's `null`, the button explains that Tony isn't connected yet.

## Maintaining it

See **REFACTOR-NOTES.md** for what changed in the October 2026 clean-up and the shared page template, the conventions to follow (load order, where data lives, escaping), and the remaining recommendations.

- **Grants data:** edit only `assets/data/grants-2025.js`. Every record needs `lat`/`lng`; a record without them is placed at its ZIP centroid and looked up once via OpenStreetMap Nominatim.
- **Community and Advisor pages are generated.** `community/index.html` and `advisors/index.html` share ~1,550 identical lines, so both are built from one template:
  1. Edit `src/giving/page.html` for anything both apps show, or `src/giving/community.html` / `src/giving/advisors.html` for the per-app parts (title, 3 menu entries, 3 home panels, extra views, extra scripts — listed at the top of each file).
  2. Run `npm run build` (or `node scripts/stamp-assets.js` then `node scripts/build-pages.js`) and commit the source **and** the generated pages. GitHub Pages serves the files as-is; no build runs on GitHub.
  3. `npm run check` exits with an error if a page is out of date, was hand-edited, or points at an old version of a script — run it before committing.
- **After editing any .js or .css file, run `npm run build`.** Pages load scripts and stylesheets as `app.js?v=<fingerprint>`. GitHub Pages lets browsers keep files for 10 minutes, so without a new fingerprint, visitors can keep running the old file (or a mix of old and new) after a deploy. The fingerprint only changes for files you edited.
- **Seeing an old version right after a deploy?** The page itself can still be cached for up to 10 minutes: hard-refresh (Ctrl+F5 / Cmd+Shift+R). Also check the address: the old site is `…/Giving_Platform_Landing_Full/` (no `_2`).
- **Shared app code:** `assets/giving/app.js` serves both community and advisors. Advisor-only hooks are guarded with `typeof`.
- **Stylesheet order is load-bearing:** `tcf-v3.css` → app stylesheet → the matching `tcf-v3-*.css` bridge.

## Open items

- **Tony:** set `TONY_URL` in `portal/plan/index.html` when the assistant has an address.
- **Giving plan storage:** the plan and its summary live in this browser only. A real build would save values, the plan and its sections to Salesforce (and planned contributions and grants to Ren iPhi) so they follow the donor across devices and reach their advisor.
- **Grantee Portal link:** set `GRANTEE_PORTAL_URL` in `assets/landing/tracks.js`. While it's blank, that option shows the "Coming soon" window.
- Placeholder content to replace before any public use: Candid seal levels, fund documents, wiring details, spending-policy figures and QR link.
- **Figures that disagree across pages** (need an approved source): $3.9B vs $3.1B granted since 1914; $90M vs $160M granted last year; "$100M+ every year this decade" vs $90M last year; ticker labelled "2026 grants" on the landing page but "2025 grants" in the apps. Details in REFACTOR-NOTES.md.
- **Gift Planner tax logic** (QCD eligibility and the household-level limit) needs review by the tax-content owner before advisors rely on it.
- **Open a DAF, for real:** the flow needs a PCI-compliant payment processor, Ren for the fund record, DocuSign for the agreement and Entra for the login before it collects real information, with the usual security, legal and compliance review. Its five investment pools marked "To confirm" also need names and descriptions.
- **Leftover donor screens in the registration apps:** the apps' old in-app "donor mode" (My fund, performance, grants…) can no longer be reached now that fund holders go to the portal. It can be removed in a clean-up.
- **Unlinked views:** `vision` (both apps) and `calculator`/`members`/`learning` on advisors are only reachable by `#/` link. Link or remove.

### Resolved

- **10-26-2026:** Paralucent web font license confirmed to cover self-hosting in a public repository; the 257 grant records in `assets/data/grants-2025.js` (organization names, addresses, grant names) confirmed OK for public display.
