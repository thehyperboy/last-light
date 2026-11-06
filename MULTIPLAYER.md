# LAST LIGHT — offline multiplayer (2-device proof of concept)

## Architecture

- Solo and multiplayer share `src/game/simulation.ts`.
- The **host is authoritative** for health, inventory, pickups, generator/beacon progress, enemy AI, and match completion.
- Guests send sanitized inputs (`playerId` + axes/buttons). They never apply pickups, damage, or objectives locally.
- Transport is a **browser WebRTC data channel**. There is no cloud matchmaking and no signaling server during the match.
- Pairing exchanges a compressed **SDP + ICE candidate bundle** as a QR code or copy-paste string (`LL1.…`). A room code is **not** a connection.
- Default ICE config uses **no STUN/TURN**, so candidates are LAN/host only. Optional STUN is a settings toggle and needs internet **only** to gather addresses.

This milestone is a **two-peer** proof of concept (`POC_PLAYERS = 2`). A third hello is rejected.

## Runtime limitation (browsers)

A browser page cannot bind a LAN game socket or discover peers automatically. WebRTC still needs an out-of-band SDP/ICE exchange even when both phones are offline. LAST LIGHT uses the other device’s screen (QR or paste) as that channel.

Bluetooth is **not** implemented.

Secure-context notes:

- Android Chrome usually allows WebRTC on `http://<lan-ip>:5173`.
- iOS Safari generally requires **HTTPS** (or localhost) for WebRTC and camera QR scan. Use a trusted cert or accept the Vite self-signed warning if you enable HTTPS.
- Camera QR scan also needs a secure context. Paste still works when the camera is blocked.

## Connect two devices without internet

1. Install deps and start the LAN dev server on a machine both phones can reach **or** install the PWA after the first cache.

```bash
npm install
npm run dev -- --host
```

2. On the same Wi-Fi or a phone hotspot, open `http://<lan-ip>:5173` on both devices. Cellular data is not required for the match.
3. Host: Play → Create local session → Generate connection offer.
4. Guest: Join local session → scan the QR or paste the host `LL1.` code → Apply.
5. Guest shows an answer QR/code. Host pastes or scans that answer → Apply.
6. When the HUD/lobby shows **Data channel open** / `connected`, both names appear. Ready up. Host starts only when both are ready.

If advertised candidates are `.local` names and pairing fails, put both devices on a **phone hotspot** or enable **STUN assist** (internet used only while gathering ICE).

## What is synchronized

Compact host snapshots (`t: 'snap'`) at about 12 Hz:

- Player transforms, health, stamina, inventory, downed/dead
- Pickup taken flags
- Enemy FSM pose and AI state
- Generator / beacon / extract / timer / outcome

Remote meshes already lerp toward snapshot poses.

## Disconnect / reconnect

- Guest loss: host keeps simulating; guest character is marked disconnected; a reconnect window is shown.
- Host loss: guest sees **No host migration**. Authority does not move.
- Reconnect is a **new** WebRTC handshake (new offer + answer) with the same `sessionId` and player id. It is not automatic ICE restart.

## Test results (this workspace)

| Test | Result |
| --- | --- |
| Solo survival (movement, stamina, crafting, extraction) | Automated, passing in `src/game/simulation.test.ts` (7 tests) |
| Host-authoritative 2-player loopback (movement, pickups, generator/beacon) | Automated in `src/net/session.test.ts` (5 tests) |
| Guest disconnect & mid-match reconnection | Automated in `src/net/session.test.ts` |
| SDP/ICE bundle round-trip, mDNS detection, & `LL1.` codes | Automated in `src/net/protocol.test.ts` (7 tests) |
| Two physical phones, same Wi-Fi, no internet | **Not verified in this workspace** (no secondary physical radio hardware attached to the test agent) |
| Android ↔ iOS physical connection | **Not verified on device** (simulated via WebRTC spec compliance) |
| Installed PWA pairing on physical device | **Not verified on device** |
| Four simultaneous devices | **Not implemented** (single data channel; see checklist below) |

Total automated unit tests: **19 passed (19)**. Do not treat loopback tests as physical device radio tests.

## Known limitations

- One `RTCPeerConnection` / one data channel. Host cannot fan out to three guests yet.
- Some browsers advertise mDNS `.local` hostnames instead of `192.168.x.x`.
- QR codes can fail if CompressionStream is missing (uncommon); paste the text code.
- `http://LAN` is not a secure context on iOS — WebRTC/camera may be blocked.
- Host pause is local-only; the host simulation keeps running.
- 8–12 player support is not claimed.

## Four-player expansion checklist

- [ ] Host data-channel map keyed by player id (one peer connection per guest).
- [ ] Fan-out snapshots; do not mesh guests to each other in v1.
- [ ] Input validation per `playerId`, already started — extend beyond a single `guestId`.
- [ ] Disconnect of guest 2 must not drop guest 1.
- [ ] Unique reconnect offer per guest (or trickle a per-peer handshake).
- [ ] Lobby duplicate-name and slot tests with 3 guests.
- [ ] Snapshot budget: ~10–12 Hz, 4 players + 2 enemies.
- [ ] Mid-range phone FPS with four capsules + two AI.
- [ ] Two Android devices + mixed Android/iOS pairing on hardware.
- [ ] Only then consider 8–12 players.
