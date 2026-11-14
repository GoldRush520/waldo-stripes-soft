# Performance

Everything below was measured on the real machine with the harness in this repo. Numbers from
development snapshots, loaded-host runs and the final build are labelled as such.

## Baseline

- Apple M3 (10-core GPU), 60 Hz display, macOS. Chromium 158 via Playwright, **headed**, ANGLE Metal
  (`ANGLE (Apple, ANGLE Metal Renderer: Apple M3)`), production build served by `vite preview`.
- Viewport 1440 × 900 CSS px at device scale 2. Quality is **locked to medium**: pixel ratio capped
  at 1.5 (canvas 2160 × 1350), one 2048² shadow map, MSAA on, no post-processing.
- Scene: the whole generated town — ~10,750 people, 161 authored vignettes, 291 animation clips,
  ~2,000 static placements (0.8 M static triangles), ~560 moving props.

## How to reproduce

```bash
npm run build && npm run preview          # production build on http://127.0.0.1:5181
node scripts/bench.mjs http://127.0.0.1:5181 60 bench-2 desktop      # 60 s, seed bench-2
node scripts/bench.mjs http://127.0.0.1:5181 20 bench-3 portrait     # 390 × 844 @3x
```

The benchmark (`bench()` in `src/dev/devTools.ts`) warms up for 3 s, then pans at 16 m/s through all
district anchors (each clamped to the reachable camera range, completed legs are logged), clicks
through the real asynchronous picking path every 4 s, and pauses/resumes once. It records rAF
intervals, CPU time spent in update + render submission, draw calls and triangles for every frame
(all passes, shadows included). rAF intervals are frame pacing, not GPU time. Extra query switches
for experiments: `&quality=low|medium|high`, `&idle=1` (no panning), `&uncapped=1` (display-rate cap
removed, to read real render cost), `&crowdShadows=0`, `&joints=1`.

## Results (final build, quality locked to medium, host otherwise idle: load average ≈ 4)

| Run | Frames | Median | p95 | p99 | Worst | > 20 ms | Draw calls med / max | Triangles med / max | CPU med / p95 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop 60 s full-town pan, seed `bench-2` (16 legs, 925 m) | 3,511 | 16.7 ms | 17.4 | 17.7 | 18 ms | 0 | 182 / 282 | 2.17 M / 2.85 M | 2.0 / 3.0 ms |
| Desktop 60 s full-town pan, seed `bench-1` (15 legs, 926 m) | 3,512 | 16.7 ms | 17.3 | 17.6 | 18 ms | 0 | 179 / 280 | 2.17 M / 2.87 M | 2.2 / 3.4 ms |
| Portrait 390 × 844 @3x (canvas 585 × 1266), 20 s | 1,107 | 16.7 ms | 17.4 | 17.6 | 18 ms | 0 | 161 / 239 | 1.70 M / 2.24 M | 2.0 / 3.4 ms |

No frame over 20 ms in any of these runs, including the clicks and the pause/resume.

Render cost with the display cap removed (opening view, no panning):

| Setting | Canvas | Median | p95 | p99 |
| --- | --- | --- | --- | --- |
| medium | 2160 × 1350 | 4.1 ms | 5.9 | 8.1 |
| high (native) | 2880 × 1800 | 5.8 ms | 8.7 | 12.7 |

So the locked setting has roughly 3–4× headroom under the 16.7 ms budget on this machine.

Startup (production): module load 0.12–0.3 s, town generation 0.81–0.86 s, warm-up (every part of
town drawn once + picking programs) 0.22–0.28 s → playable ≈ 1.2–1.5 s after navigation. Generation
includes about 0.15 s for the flush-surface pass added with the z-fighting fix (it was 0.64–0.82 s
before); frame time is unaffected by that fix. GPU resources after start: 8 textures, 12 programs, ~370 geometries; static geometry
buffers 44 MB. Three consecutive new puzzles add no geometries or textures (e2e test).

## Honest caveats

- **Host load dominates the bad runs.** At one point during development the machine was running many test
  jobs plus screen recording (load average 15–95, WindowServer at ~80 % CPU). In those conditions the
  same build measured median 16.7 ms but p95 34–50 ms with 12–15 % of frames over 33 ms, evenly
  spread and uncorrelated with clicks, CPU time (≈3 ms) or scene load (the heaviest configuration
  was sometimes the cleanest run). The table above is the calm-host behaviour; a busy machine will
  still drop frames.
- First sample (before the optimisations below, loaded host): median 33.5 ms,
  p95 67.8 ms, 3.86 M triangles, 173 draw calls.
- Only this one machine/browser was measured. No claim is made for other hardware; `&quality=low`
  (pixel ratio 1, 1024² shadows) exists for weaker devices but is not exposed in the HUD.
- The gameplay e2e tests run headless (GPU-accelerated on this Mac) and are functional checks only.

## What makes it fast

1. **GPU crowd, zero per-frame CPU animation.** Every person is an instance of one rig; poses come
   from a baked pose texture and motion (walk routes, rides, boats) is evaluated analytically in the
   vertex shader from deterministic clocks. The per-frame CPU cost is three uniform updates.
2. **Submit only what can be seen.** The camera scale is fixed, so the visible set is resolved on the
   CPU only when the view moves ≥ 5 m (padded by 9 m) and twice a second for walkers, using their
   analytic route position. One draw for all visible bodies, one small draw per accessory type worn
   by someone visible — never hidden geometry. ~1,200–1,300 of ~10,750 people are submitted.
3. **Shadows from the low body.** The body mesh carries two index ranges; the shadow pass draws the
   256-triangle body, the colour pass the 644-triangle one. Tiny accessories do not cast.
4. **Static scenery batched per 45 m cell** into compact buffers (float positions, int8 normals,
   uint8 colours) with near/far tiers prebuilt; frustum culling per cell. One sun, one shadow map
   fitted to the view and snapped to texels in light space.
5. **No stalls while exploring.** A warm-up pass during loading uploads every buffer and compiles
   every program; clicks use asynchronous pixel readback; progressive town build yields between
   districts with message tasks (timers are throttled in background tabs).
6. **Render on demand.** Paused with a still camera renders nothing; hidden tabs do no work.

## No z-fighting

Surfaces that share a plane cannot be ordered by the depth buffer and flicker while panning. Three
measures remove them, checked by `scripts/zfight.ts` (0 coincident visible surface pairs on every
seed tried, down from about 2,200 affected 2 m cells per town):

- ground overlays that overlap are stacked 4 mm apart, and ground, terrain and terrace tops are
  drawn with a small depth offset so anything resting on them wins the depth test;
- every static placement gets a level that differs from all placements it touches (1 mm up, 2 mm
  sideways per level; untouched placements are not moved);
- inside each mesh, flush same-facing faces are separated by 0.6 mm per nesting level at bake time.

The camera's depth range was also tightened from 1,000 m to about 340 m around the visible slab.
After the fix a 20 s windowless run on the production build measured 0 frames over 20 ms, CPU
1.9 / 3.0 ms (median / p95), 194 / 270 draw calls; the 60 s headed runs above predate it.

## Measured experiments that were not kept as defaults

- **Joint-matrix texture pass** (`&joints=1`): each visible person's part matrices are computed once
  per frame in a small fragment pass and vertices read three texels. Output is pixel-identical, but
  on the M3 it measured 4.8 ms vs 4.1 ms per frame for the per-vertex path (uncapped, medium), so the
  simpler path stays the default. It may still help GPUs with slower vertex stages.
- **Adaptive resolution** (`auto` quality) is implemented (rolling slow-frame share, hysteresis,
  cool-down, remembered failed step-ups) but disabled: quality is locked to medium by design.

## Remaining bottlenecks (largest first)

1. Triangle peaks of ~2.9 M per frame while panning across the densest districts (crowd colour +
   shadow passes). Next lever if needed: drop crowd shadow casting (blob contact shadows remain),
   which measured ~1.0–1.6 M triangles per frame.
2. Accessory draw calls (≈ 35–40 visible types, drawn twice for shadow-casting ones).
3. Town generation is synchronous per district (0.03–0.2 s each); the whole town is generated at
   start because panning can reach all of it.
