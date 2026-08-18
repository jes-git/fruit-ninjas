Vendor files for MediaPipe Tasks

Place the following files here to enable a reliable local load of MediaPipe Hand Landmarker:

- `tasks-vision.js` — the ESM bundle for `@mediapipe/tasks-vision` (browser build)
- `wasm/` — directory containing the wasm files required by the package
- `hand_landmarker.task` — the model asset file

You can populate this directory by running the helper script `scripts/fetch_mediapipe_vendor.sh` (it will try common CDNs). If that fails, download the package files manually from an upstream source and place them here.

When these files exist, the game will load `/vendor/tasks-vision.js` first and use `/vendor/hand_landmarker.task` for the model.
