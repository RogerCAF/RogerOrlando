# Infinite Worlds V3 — adaptive WebGL tiles

This is an **independent implementation** of standard tiled-image and level-of-detail rendering principles. No Endless Paper/Infinite Gallery source code, shaders, artwork, names, or assets were copied into the application.

## New rendering pipeline

- Existing authored scene hierarchy, clip paths, camera, portrait computer artwork, server corridor, large stairway, daylight observatory, honeybadger world, pearl world and infinite loop remain unchanged.
- The player first attempts an offscreen, transparent WebGL texture renderer (`public/v3/zoom-v3/lod-tiles.js`). Its result is composited by the existing Canvas 2D layer, inside existing precise physical portal clips.
- For each visible scene, it creates a small ready-to-display fallback thumbnail and schedules native image-source tiles at **256×256 output pixel** granularity.
- For distant images, tiles are downsampled by factors 2, 4 or 8 (mip-like LOD); close zoom samples native-resolution artwork. The chosen level is based on screen pixels per actual source pixel and device pixel ratio.
- Tile requests are asynchronous with at most **three concurrent decodes**. The GPU tile cache is capped at **24 MiB**, with LRU eviction that explicitly deletes evicted GPU textures. When WebGL is unavailable or lost, the approved Canvas 2D renderer remains the fallback.
- CPU computes viewport intersections and WebGL clip-space vertices in JavaScript double precision before uploading; far-off regions and excessive nested screen coordinates are not handed to GPU shaders.
- Use `window.__INFINITE_V3.tileStats()` in the browser console to inspect whether WebGL is active, count decoded tiles, read pending requests and check live cache memory.

## Important limits

Tiling **does not invent new brush strokes** in a small source image. The current drawings range from approximately 650 to 1084 pixels wide. At extreme enlargement, fine painted details can still soften. Real Infinite Gallery-level macro sharpness requires separately authored, precisely registered **higher-resolution detail paintings** for each doorway, small lens and pearl. Do not substitute an AI/sharpening upscaler and call it genuine detail.

The opt-in V3 preview lives at `/infinite-worlds-v3-play.html`. The main portfolio iframe remains on the previously approved `/infinite-worlds.html`. Testing protects this separation.

## Release checks

1. `npm run test:v3-tiles` tests shader/source syntax, LOD calculations, GPU tile uploads, memory cap, coordinates, async loading and the Canvas 2D fallback via a simulated browser.
2. Existing `test:v3-play` and `test:v3-zoom` ensure old illustrations, nested portals, infinite loop, full zoom-out reveal and keyboard/touch controls survive.
3. The complete test sequence runs automatically in `prebuild`.

**Visual QA limitation:** some browser environments have WebGL disabled. The test harness verifies expected GPU calls and fallback, but it does not substitute for testing the production V3 on an actual WebGL-capable iPhone, iPad and desktop browser.
