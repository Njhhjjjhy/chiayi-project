# QA panel setup (one-time, ~3 minutes)

The QA panel is a small floating button on every page that opens a side panel where Corbett can leave notes. Notes are stored on Vercel (no separate accounts needed). This file walks you through the one-time setup.

## What you'll do

1. Enable Vercel Blob storage (1 click)
2. Add the shared passphrase as an environment variable (30 seconds)
3. Redeploy (automatic on next push)

That's it. Both steps happen entirely inside your existing Vercel dashboard.

---

## Step 1 — Enable Vercel Blob

Vercel Blob is where the notes and any attached screenshots will live.

1. Go to your Vercel project: https://vercel.com/ (open the `chiayi-project` / `fireflies` project)
2. Click the **Storage** tab in the top nav
3. Click **Create** → choose **Blob**
4. Pick a name (e.g. `fireflies-qa`) and click **Create**
5. Vercel will offer to **Connect to project** — accept

Vercel automatically injects the credential (`BLOB_READ_WRITE_TOKEN`) as an environment variable. You don't need to copy or paste anything.

## Step 2 — Set the passphrase

This is the password Corbett (and you) enter once to unlock the QA panel.

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add a new variable:
   - Name: `QA_PASSPHRASE`
   - Value: `fireflies`
   - Environments: tick **Production**, **Preview**, and **Development**
3. Save

> The passphrase is stored only as an env var on Vercel — never in the codebase.

## Step 3 — Redeploy

Push any commit, or in Vercel click **Deployments** → the latest deployment → **Redeploy**. Once it's live, the **Notes** button will appear in the bottom-right corner of every page.

---

## How Corbett uses it

1. He opens the live URL on his phone or laptop
2. Clicks the **Notes** button bottom-right
3. Enters the passphrase (`fireflies`) — saved in his browser, only once
4. Picks a category (Bug / Design / Idea / Install), optionally tags a room location, types the note, optionally pastes or uploads a screenshot
5. Clicks **Add note**

You see the same list when you unlock on your machine. You can mark notes as done, delete them, or reopen.

## Local development

To run the QA panel locally with Vercel-compatible API routes, install the Vercel CLI once:

```bash
pnpm dlx vercel link    # one-time, links this folder to your Vercel project
pnpm dlx vercel dev     # starts dev server with /api routes wired up
```

`pnpm dev` (Vite alone) won't run the `/api/*` routes — you need `vercel dev` for that.

## Troubleshooting

- **"Wrong passphrase"** when you know it's right → check the env var is set in the right environment (Production vs Preview), and that you redeployed after adding it.
- **Screenshots fail to upload** → check Vercel Blob is enabled and connected to this project.
- **Notes don't persist** → same as above; the api routes write to Blob.
- **Button doesn't appear** → hard-refresh; verify the latest commit deployed.
