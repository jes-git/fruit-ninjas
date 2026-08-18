# Slice & Spark

A browser arcade game inspired by fruit slicing games. Play with mouse or webcam hand tracking.

## Share it online

Camera controls require a secure website address (HTTPS). The easiest route is Netlify:

1. Go to https://app.netlify.com/drop.
2. Drag this entire folder onto the page.
3. Netlify will give you a public HTTPS link to share.

No build step is needed. Mouse control works everywhere; webcam hand tracking is available after the visitor grants camera permission.

## Run & Troubleshooting

 - Serve the folder over HTTPS (Netlify, Vercel) or open on `http://localhost` while developing — modern browsers treat `localhost` as a secure context for camera access.
 - Quick local test (from the repo folder):

```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

### If the camera won't start

 - Confirm the page is served over HTTPS or `localhost`.
 - Check the browser permission prompt and site settings (allow Camera). In Chrome: Settings → Privacy and security → Site Settings → Camera.
 - Open the browser DevTools Console (F12) and look for errors such as `NotAllowedError`, `NotReadableError`, or CORS/wasm load errors; these messages help pinpoint the issue.
 - If you see errors about loading MediaPipe wasm or model assets, ensure the CDN requests are not blocked by an extension or network policy.
 - If the site is embedded in another page (iframe), some browsers restrict camera access — try opening the site in a top-level tab.

If you want, I can add an in-page camera-permission error message and more robust logging to help diagnose the exact failure on your Netlify deployment.

### Vendor MediaPipe (recommended for reliable camera)

If CDN imports fail on your host, you can vendor the MediaPipe Tasks bundle, wasm, and model into the `vendor/` directory so the game loads them locally.

Run the helper script to attempt to fetch these files (best-effort):

```bash
bash scripts/fetch_mediapipe_vendor.sh
```

If the script succeeds, commit the `vendor/` directory and push — the site will load MediaPipe from local files instead of remote CDNs.

## Continuous deployment (GitHub → Netlify)

You can wire this repo to automatically deploy to Netlify when you push to `main`. I added a GitHub Actions workflow at `.github/workflows/deploy_netlify.yml` that uses the Netlify CLI.

Steps to enable:

- Create a GitHub repo and push this project (branch `main`).
- In your Netlify account create a Personal Access Token and copy it (`NETLIFY_AUTH_TOKEN`).
- In your Netlify site settings find the **Site ID** and copy it (`NETLIFY_SITE_ID`).
- In the GitHub repo, go to Settings → Secrets and variables → Actions and add two repository secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.
- Push to `main` — the workflow will run and deploy the `./` folder as the publish directory.

If you'd like, I can also add a small status badge or update the workflow to only publish a `dist/` folder if you introduce a build step.

## Push this project to GitHub (one-shot)

I added a helper script `push_to_github.sh` that runs the exact Git commands to push this project to your GitHub repo `https://github.com/jes-git/fruit-ninjas.git`.

Run in Git Bash from the project root:

```bash
bash push_to_github.sh
```

If you prefer manual commands, run:

```bash
git init
git add .
git commit -m "Initial commit - Slice & Spark"
git branch -M main
git remote add origin https://github.com/jes-git/fruit-ninjas.git
git push -u origin main
```

If push fails due to authentication, use one of:
- Configure SSH keys and use the SSH remote `git@github.com:jes-git/fruit-ninjas.git`.
- Create a GitHub Personal Access Token (PAT) and use it when prompted for a password, or use the `gh` CLI: `gh repo create jes-git/fruit-ninjas --public --source=. --push`.

After the push, GitHub Actions will run the deploy workflow (if you added secrets earlier) and Netlify will publish the updated site.
