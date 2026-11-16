# Infinite Worlds — Art Direction & Quality Contract

Status: approved creative direction (16 November 2026)  
Scope: **all** nested worlds, starting with **Worlds 1–3**.  
Reference provided by the owner: `ScreenRecording_11-16-2026 14-15-16_1.mp4`, showing a journey through **The Infinite Gallery**. Reference is for composition, rhythm, clarity and craftsmanship, **not copied illustrations, characters, text or scenes**.

## 0. Non-negotiable design sentence

**Fewer things, drawn much better.** A small convincing physical detail already contains the next fully realised world. A visitor discovers the opening through zoom; it must never look like a sticker or a decorative magic portal.

## 1. What to learn from the supplied recording

The reference deliberately leaves broad surfaces quiet: ivory walls, clear floor planes, wide door openings, uncluttered sky and negative space. Sharp silhouettes and restrained contour lines do the heavy lifting. Information gathers at **specific architectural features** (frame mouldings, stairs, lintels, galleries, roof glazing and tiny framed artworks) rather than being randomly sprinkled across the screen. One detail carries the visitor naturally into the next room. Small humorous scenes reward close looking **without competing with the zoom target**.

Our visual identity is **Grand Computer / Bureau of Impossible Things**. Keep its existing technological wonder, precise metalwork, classic architecture, warmth, rich physicality and subtle humour. Do **not** redraw as a crude/flat SVG prototype. Do **not** imitate or reproduce someone else's drawings from the recording. We apply its principles of scene hierarchy, controlled detail and connected space.

## 2. The three detail zones (apply to each world)

1. **Focus zone (≈10–20% of composition)** — richest craftsmanship. The physical portal (screen, keyhole, eyepiece) is aligned down to source coordinates; its casing has designed mechanical construction, wear where believable, calibrated highlights, and a small hint of the next world.
2. **Supporting architecture (≈25–35%)** — readable physical shapes and perspective: one main aisle, a few strong arches, restrained carved profiles, believable repeated structural details. Supporting elements lead the eye inward.
3. **Rest / atmosphere (remainder)** — open wall, soft sky, clean floor, gentle gradient. Avoid high-frequency repeating texture, over-detailed paving, glowing speckles, arbitrary gold stripes, dense ivy, countless ornaments, unnecessary objects or luminous “fantasy” effects.

These are composition targets, not pixel-count quotas. Density should **fall** with distance from the portal; the background must read instantly even at phone size.

## 3. Palette and material discipline

- Core: near-black charcoal, dark wood, warm cream/stone, muted brass, carefully controlled amber light.
- Secondary accents: muted sky blue for depth; narrow cool cyan only where technology actually emits light.
- A **single** main bright/high-contrast accent per scene, typically the physical opening or the path toward it.
- Brass looks like machined metal, not neon. Stone should be simple and spacious, not marbled with noise in every square inch.
- Similar perspective, exposure, contour sharpness, saturation and texture grain across Worlds 1–3. Do not mix cartoon cutouts, hyper-glossy baroque fantasy art and soft matte photography in adjacent worlds.
- Humor: one optional visual discovery per scene (e.g. a tiny useful label or mildly absurd instrument note). No jokes that interrupt navigation or introduce major bright objects.

## 4. World 1 — The Grand Computer

**Already liked and retained:** the original person at desk, actual retro-tech console, warm lighting and gallery visible in the monitor. Never change the page into a generic sci-fi dashboard. Keep the supplied text and existing brand marks.

**Refine, not reimagine:**
- Leave larger areas of desk and wall visually quiet.
- Details belong on chips, brass screw heads, wires, monitor trim and the screen aperture. Avoid extra decorative overlays across the hallway.
- The monitor itself acts as the portal. No added circular magic frame, hard scene swap, or obvious “picture on top of a picture”.
- When zooming in, the hallway must become genuinely more detailed through registered close-up levels; never upscale 960px art indefinitely.

**Acceptance:** from the first screen the viewer identifies a single zoom direction into the monitor; the same physical screen edge stays aligned throughout.

## 5. World 2 — The Grand Gallery and ordinary walnut door

**Already liked and retained:** symmetrical cream corridor, actual landscape paintings, brass/black technology edge, warm ceiling lamps, red central runner, walnut double door.

**Refine:**
- Do not turn the paintings into artificial screens.
- The red runner and ceiling-light sequence provide clear visual perspective. Remove competing flourishes near the vanishing point.
- Detail belongs to door grain, handle mounting, real lock escutcheon, paintings and picture frames. Wider wall panels and floor remain comparatively quiet.
- **Keyhole:** looks like a real lock immediately below the pull; tiny dark opening, delicate bevel and brushed-metal fixing screws. It is not a gigantic decorative emblem.
- The next world is already visible *through the same precisely defined keyhole path* at all zoom levels.
- Every new keyhole contour must be updated together in the SVG artwork, Canvas Path2D clip, registration coordinates, close-up layers and automated alignment tests.

**Acceptance:** when the viewer reaches the handle, they are led into the small aperture with no shape shift or “black blob”.

## 6. World 3 — A spacious, calm balcony with one real telescope

**Must retain:** ample breathing room and a longer visual approach than the old tiny terrace; central vanishing point; plausible brass technical object; the next world already visible in its glass.

**Do not retain:** ornate flower overload, star-map ceilings in every panel, shiny marble grain covering every surface, large circular brass orb on a podium, huge front-facing portals, imaginary telescope geometry.

**Compose instead:**
- Foreground: broad, **mostly calm** paving with a few long perspective lines. No large high-contrast compass rose that competes with the telescope.
- Middle ground: subtle balustrade and at most two architectural elements framing a clearly visible slim **single-body refractor telescope**. Place at the end of a longer aisle, on a believable fine tripod/mount.
- Distance: gentle horizon, low-contrast landscape/sea/sky. Background is simple; do not add dozens of small islands, towers and bright sailboats.
- Telescope tube: narrower and longer than its objective diameter, with real eyepiece/focus assembly, one functional front glass and restrained brass collars. No standalone sphere, giant brass disc or sci-fi portal.
- **The portal is the actual optical pupil**, registered to the painted glass **including elliptical perspective** when necessary. It must not look pasted on, nor introduce a hard circular seam.
- Next world: a very small readable composition inside the glass. As the camera zooms, the world unfolds out of that real opening without a picture swap or obvious mask edge.
- Close-up details: choose 3–5 engineered details on the optical tube/stand (fasteners, focus dial, machined groove, small inspection sticker, hinge). Outside these, *reduce* noise.

**Accept:** the entire telescope is modest at first glance, the pupil is truly small, the reflection has physical depth and the portal becomes the next world at the same coordinates.

## 7. All worlds beyond the balcony

Apply the same rules to servers, underwater archive, observatory and endings. Each world contains **one main focal detail**, one connected entry point and a calm environment. Do not increase visual clutter merely because the zoom is deep. Maintain the exact humorous-surprise behavior. If a source illustration becomes soft, add a **registered high-resolution painting** or a purposeful vector micro-detail pass, never a generic global sharpening filter or endlessly upscaled raster.

## 8. Rendering and transition constraints

- Keep the **current, approved visual experience**, not the rejected all-flat-vector V2, as the production starting point.
- Existing `public/infinite-worlds.html` remains the sole standard destination; alternate experiments remain opt-in and do not silently replace it.
- Use image-space **nested affine registrations**, one camera path and physical clip geometry shared between the close-up illustration and Canvas. No visually discontinuous zoom stage.
- **Vector where appropriate:** door engravings, circuitry, telescope metal rim and true fine lines. **Painted multi-resolution levels where appropriate:** architecture, lighting, subtle materials and other imagery where flat vector would lose quality.
- Avoid image-file resolution ceilings: create an intentional close-up for an object before its pixels become visible. HD tile rendering helps preserve vector sources, but does *not* manufacture missing raster detail.
- A partial portal that appears over an existing dark aperture should inherit the **source aperture geometry and shading**, not cover it with a bright stroke or unrelated overlay.
- Retain wheel, drag and pinch gestures; reduce speed near important discoveries without changing scale continuity.
- Preserve original provided artwork, branding, project logos and the existing Random ending behavior.

## 9. Visual quality gates — before any release

Test real rendered screenshots on **wide desktop and narrow phone**, not only code substring checks. For each opening verify:

1. **Wide shot:** silhouette, visual breathing room and obvious focus.
2. **50% approach:** perspective lines, physical realism and no busy competing details.
3. **Close-up:** genuine fine detail, no visible pixel stair-stepping or blurry texture patch.
4. **Before crossing:** next world is physically inside the opening; the opening matches the source object's actual rim.
5. **After crossing:** no discontinuity in scale, orientation, position, color treatment or visible seam.
6. **Return zoom:** the correct previous object reappears at the original position without a state jump.
7. **Pan/pinch/mobile:** no clipping, blank canvas or accidentally visible next world outside its aperture.

**If a revised scene is less coherent or less credible than the old version, reject it.** Do not publish merely because GitHub and Vercel builds pass.

## 10. Work order / stop adding decorative content

1. **Fix the current telescope physical optic, not its entire world:** crop-inspect the painted glass, align the mask and ellipse to the actual glass and optical perspective; add shaded glass and rim detail only if it really integrates. Verify multi-step stills in actual browser zoom.
2. **Calm the balcony:** selective background reduction without changing the approved aesthetic, clean floor, remove visual competitors; do not replace the scene with a new wildly different generated image.
3. **Door-to-balcony continuity:** inspect source path, antialiasing, framing, adjacent scale levels and warm/cool material transition.
4. **Add close-up detail sources for the pixels that actually need them**, one correctly registered layer at a time, with before/after comparisons.
5. Extend the same process to every subsequent opening.

## 11. Core acceptance statement

**A first-time viewer sees a beautifully readable illustration, chooses one tiny believable detail, and discovers a surprising complete world inside it — with neither visual clutter nor any noticeable technical transition.** Every addition must make that experience easier, clearer or richer. If not, remove it.
