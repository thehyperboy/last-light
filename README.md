# LAST LIGHT

Offline-first third-person survival prototype. Solo play does not need a network. Local multiplayer uses WebRTC with a manual SDP/ICE exchange (QR or copy-paste). There is no signaling server.

## Run

```bash
npm install
npm run dev
```

On the same Wi-Fi, phones can load `http://<your-lan-ip>:5173`. After the first load, the service worker caches the shell for offline solo play.

Local multiplayer is a **two-device WebRTC proof of concept** with a manual SDP/ICE exchange (QR or paste). See `MULTIPLAYER.md`. A room code is not a connection. Device-to-device pairing has to be confirmed on real phones; this repo’s automated tests cover host authority over a loopback link, not Wi-Fi radios.

```bash
npm test
npm run build
npm run preview
```

## Play

- **Solo Survival** — collect metal / batteries / meds / repair parts, craft at the bunker, repair the generator, restore the beacon, hold extraction.
- **Local Multiplayer** — two devices, host-authoritative. See `MULTIPLAYER.md`.
- **Pass-and-Play** — turn-based party mode on one device (not simultaneous).

Desktop: WASD, mouse-drag look on the right side, Space jump, Shift sprint, E use, F craft, Q meds.
