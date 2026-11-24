# Roxy Agency website

Marketing site for **Roxy Agency (Roxy BC)**, a BIGO Live agency partner.

The public text, photos, events, salary table and videos now live in simple content files. After a free GitHub account is connected, Pride can edit all of that from an Android phone with **Pages CMS** (no code).

## Live preview

**https://40e8c35041424bbd.flypod.page**

Hosted on flypod.page (same system as the Fari prototype). This no-account preview expires on **8 December 2026, 4:54 AM Pacific Time (UTC-8)**. Run `flypod login` from the machine that deployed it to remove the expiry and keep the same URL.

Private editor how-to (not in the public menu): https://40e8c35041424bbd.flypod.page/edit/

## Why Pages CMS

Compared with Decap CMS, Sveltia CMS, or a paid site builder:

- It is **free** and built for phones (“full responsive design, optimized for mobile”).
- Pride only needs **one account: GitHub**. The editor is the hosted app at [app.pagescms.org](https://app.pagescms.org). There is no Netlify Identity, no OAuth app, and no `/admin` login to set up.
- Email invites are available later if someone else should help edit.
- Saving writes the content files in GitHub. GitHub Pages or Netlify then republish the site automatically.

A hosted builder (Wix, Squarespace, and similar) would mean rebuilding the site and often paying. Decap or Sveltia would add a second login system. Those were not used.

## Local preview

```bash
python3 -m http.server 8080 --directory site
```

Then open http://localhost:8080

The site is static. The browser reads JSON from `site/content/`. There is no build step.

## What to edit (content files)

| In Pages CMS | File | What it changes |
| --- | --- | --- |
| Site name & contact | `site/content/settings.json` | Name, WhatsApp, email, invite link, footer, share text |
| Homepage headline | `site/content/hero.json` | Headline, welcome line, hero photos |
| How to join | `site/content/join.json` | Download links and join steps |
| Academy cards | `site/content/academy.json` | Training cards |
| Salary table | `site/content/salary.json` | Host salary rows and payout note |
| Invite & earn | `site/content/referral.json` | Referral commission amounts |
| Videos | `site/content/videos.json` | Video files and captions |
| Events | `site/content/events.json` | Event / poster cards (add, hide, or change) |
| Photo gallery | `site/content/gallery.json` | Photos |
| Host stories | `site/content/stories.json` | Real testimonials only, with permission |
| About | `site/content/about.json` | Pride / Why Roxy |
| Contact section text | `site/content/contact.json` | Contact headings and button labels |

New photos go in `site/assets/uploads/`. Videos go in `site/assets/video/` (keep each clip under 8 MB). The CMS config is `.pages.yml` at the **repository root** (this folder, the one that contains `site/`).

## Accounts to create (nothing was created for you)

Do **not** buy a domain, a plan, or a paid app for this setup.

1. **GitHub (required)** — [github.com/signup](https://github.com/signup), free. Use an email Pride can open on his phone. Turn on two-factor authentication when GitHub asks.
2. **Netlify (optional)** — [app.netlify.com/signup](https://app.netlify.com/signup), free, sign up *with GitHub*. Only needed if you prefer Netlify instead of GitHub Pages for hosting. Netlify is a bit easier later for `presidoagencyroxy.com` (one A record). GitHub Pages works with GitHub alone.

Pages CMS does not need its own password. Sign in with GitHub at [app.pagescms.org](https://app.pagescms.org).

## Connect it (helper, once, in a browser)

These steps need a signed-in browser. They were not done here: no GitHub or Netlify account was created.

1. Create a new GitHub repository, for example `roxy-agency-website`. **Public** is fine (the website is public anyway) and is required for free GitHub Pages. Private is ok if you use Netlify instead.
2. Upload **this whole folder** (the one with `.pages.yml`, `netlify.toml`, `.github/`, and `site/`) as the repository root. Do not upload only the inner `site` folder, or the editor will not find the config.
3. Pick one free host:

   **Option A — GitHub Pages (fewest accounts)**  
   In the repo: **Settings → Pages → Source: GitHub Actions**. The workflow `.github/workflows/deploy-pages.yml` is already here. After the first run, GitHub will show a URL like `https://USERNAME.github.io/roxy-agency-website/`.

   **Option B — Netlify (easier custom domain later)**  
   Sign up at Netlify with GitHub, click **Add new site → Import an existing project**, pick this repo, and set the publish directory to `site`. Leave the build command empty. Netlify will give a `*.netlify.app` URL and republish on every push.

4. Open [app.pagescms.org](https://app.pagescms.org) → **Sign in with GitHub** → install the **Pages CMS** GitHub App on Pride’s account, **only this repository** → open the repo. The editor should show sections like “Homepage headline” and “Salary table”.
5. Tell Pride the live URL and to bookmark [app.pagescms.org](https://app.pagescms.org). On Android Chrome: menu → **Add to Home screen**.

Until these steps are done, the flypod preview stays live, but there is no save button for phone edits.

## How Pride edits from his phone afterward

1. Open the **Pages CMS** home-screen icon (or app.pagescms.org) and sign in with GitHub if asked.
2. Open the Roxy repository.
3. Tap the section to change (headline, events, salary table, photos, videos, contact, and so on).
4. Change the text, or tap a photo / video field and pick a file from the phone. Keep videos under 8 MB.
5. Tap **Save**. Wait one or two minutes, then refresh the public website.

If the WhatsApp number changes, update it under **Site name & contact** and replace the QR image, or leave the QR field empty so the site can generate a new code.

Only add host stories with the person’s permission. The site will keep “Your story here” until a real story is added.

## Later: attach presidoagencyroxy.com

The same GitHub repo and Pages CMS editor stay in place. After the domain is bought (not done here):

- **If the site is on Netlify:** Domain management → add `presidoagencyroxy.com` and `www`. At the registrar, set an **A** record for `@` to `75.2.60.5`, and a **CNAME** for `www` to `YOUR-SITE.netlify.app`. Remove leftover AAAA records. Netlify will issue HTTPS automatically.
- **If the site is on GitHub Pages:** Repo Settings → Pages → Custom domain → `presidoagencyroxy.com`. At the registrar, add GitHub’s current A / AAAA records for the apex and a `www` CNAME to `USERNAME.github.io`. Turn on “Enforce HTTPS” after the certificate appears.
- Then, in Pages CMS, set **Public website address** under Site name & contact to `https://presidoagencyroxy.com`.

## Deploy an update to the flypod preview

From `site/`:

```bash
npx flypod update
```

WhatsApp: [0706 504 6266](https://wa.me/2347065046266) · Email: [bigosalary@gmail.com](mailto:bigosalary@gmail.com)

18+ only. Roxy Agency is an independent agency working with BIGO LIVE; earnings depend on meeting BIGO targets.
