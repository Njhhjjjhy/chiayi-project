# Ceiling visual research

Reference inputs: `meeting-refrence-3.webp` (codebase root), plus web research on contemporary practice in suspended sculptural ceiling installations.

Per canonical rule, this document captures visual principles only. No designers, studios, artists, brands, or specific artworks are named. Where a source named a work, the principle was extracted and the name dropped.

## Summary of the visual reference image

The image looks straight up into a tall, ornate stairwell. Suspended in the volume are many elongated, organic forms – flat-ish in profile but irregular in outline, somewhere between a long pebble, a petal, and a flatbread. Each form is a heavily textured sheet whose surface reads as thousands of small clustered bubbles or spheres fused together, like pulped fibre with a cratered relief; the material reads off-white to cream and translucent enough that ambient light passes through and softens the edges. Sizes range from roughly 0.5 m to over 2 m on the long axis. Orientations vary – some sit almost horizontal, others tilt up to 20–30°, and several rotate freely on the room's vertical axis, so the eye reads no single "face" of the canopy. They hang from very thin, near-invisible cables, several per form, so they read as floating rather than mounted. The forms cluster at certain depths and leave generous empty gaps elsewhere, building a layered overhead field rather than a continuous ceiling plane.

## Visual principles

1. **Repetition with variation reads as natural, not industrial.** Identical forms repeated read as production. Same family of forms in varied sizes, outlines, and tilts read as grown.
2. **Scale variation across a population implies biological distribution.** Mixed sizes within one population suggest age, growth, or local conditions – the eye accepts them as belonging together. Uniform sizes read as manufactured.
3. **Negative space carries the floating quality.** The empty volume between forms is what makes the forms read as suspended. A completely filled canopy collapses depth and reads as a textured ceiling, not a sculpture.
4. **Density variation reinforces narrative.** Tight clusters draw the eye and create focal "rooms" within the canopy; sparse zones let the eye rest and re-enter. Uniform density flattens spatial reading.
5. **Layered depth defeats grid reading.** Forms placed at multiple heights (and overlapping in plan) prevent the canopy from collapsing into a single plane. Two or three heights is enough; more is unnecessary noise.
6. **Tilt breaks the orthogonal frame of the architecture.** Even small tilts (±10–20°) disrupt the visual grid of the room and make the forms read as objects in space rather than tiles on a surface.
7. **Cables should be visually quiet.** Thin, dark, matte cables disappear against dark architecture or vanish in front of bright forms. Visible structural rigging breaks the "grown" reading immediately.
8. **Surface texture activates light from any angle.** A heavily textured (bubbled, fibrous, crumpled) surface catches ambient light at many angles, so the forms remain legible at low light levels. Smooth surfaces require directed light to read.
9. **Outline irregularity sells the organic.** Smooth elliptical outlines read as designed; jagged, scalloped, or asymmetric outlines read as natural.
10. **Translucency softens the silhouette and doubles as a light element.** Materials that pass some light pull the form into the lighting design (uplit, backlit, side-lit) and prevent hard black silhouettes against bright fixtures.
11. **Edges should not align with room edges.** Forms whose long axes are parallel to wall lines read as architectural. Forms rotated off-axis read as independent objects.
12. **Empty perimeter is acceptable.** The canopy does not need to fill every corner. Leaving the perimeter sparse focuses the dense centre and keeps wall edges legible.

## Material observations relevant to local fabrication

- **Paper mache over chicken wire armature** produces lightweight, irregular, textured forms at low cost and is the closest analogue to the visual reference's bubbled surface. The chicken wire defines the silhouette; the paper layers carry the surface character.
- **Pulped paper / cellulose** applied wet over a release form can reproduce the cratered, clustered-sphere surface seen in the reference. Drying time is the main constraint.
- **Plywood** can hold the silhouette and tilt cleanly but cannot easily reproduce the textured surface – best used as a structural backer behind a paper or fibre skin.
- **Hybrid plywood + paper mache** allows precise mounting geometry (cable points, wiring channels) on plywood backers while keeping the visible face organic. Likely the practical answer.
- **Fabric over wire** is lighter and faster than paper mache but reads as cloth, not pulped fibre. Useful if final material weight becomes the constraint.
- **Fibre-based pulp (loofah scraps, recycled cellulose, banana fibre)** is locally available in Taiwan and would tie the ceiling material visually to the loofah wall on `front-wall`. Worth testing during the paper mache prototyping weekend.
- **Surface treatment matters more than substrate.** A smooth-finished form, regardless of material, will read as designed; a deliberately rough or clustered surface reads as natural.

## Form vocabulary

Shape descriptors suitable as parameters for procedural placeholder geometry. Mix and match; no single descriptor should dominate.

1. **ovoid** – long axis 2–4× short axis, smooth-ish outline
2. **blade** – long, thin, slightly curved on the long axis
3. **petal** – broad at one end, tapering at the other
4. **lens** – symmetric, flat-ish, slight curvature
5. **bowl** – concave when viewed from below
6. **shell** – asymmetric curve, one edge thicker than the other
7. **pod** – closed teardrop, elongated
8. **drop** – round bottom, tapering top
9. **lobe** – single irregular bulge, scalloped edge
10. **patch** – wide, flat, irregular outline (closest to the reference image's largest forms)
11. **disc** – round, flat, used sparingly to avoid grid reading
12. **frond** – long, thin, lightly waved outline
13. **plume** – wide at base, soft-edged taper
14. **slab** – large, rectangular-ish but with rounded corners and irregular edges
15. **fragment** – small, asymmetric, no clear axis

Use this vocabulary procedurally – assign a shape type and a size band per element, then jitter outline points so no two are identical.

## Density pattern observations

- **Cluster-and-clearing rhythm.** Real overhead canopies (foliage, swarms, cloud formations) are not uniform – they cluster, leave clearings, and cluster again. Modelling 2–3 cluster centres per surface with falling density between them reads more naturally than uniform scatter.
- **Edges sparser than centre.** Forms thin out toward the room edges. This focuses attention on the centre and avoids visual collision with wall fixtures.
- **No two clusters identical.** If clusters look the same in shape and density, the canopy reads as repeated. Each cluster should have a different element-count and a different dominant shape type.
- **Empty zones are part of the composition.** Plan for at least 20–30% of the canopy plane to be empty. This is where the floating reading lives.
- **Vertical layering inside a cluster.** Within one cluster, place forms at two or three height bands so the cluster reads as a small volume, not a flat patch.
- **Single outliers carry weight.** A small number of forms placed deliberately outside any cluster – alone, far from neighbours – reads as significant. Use sparingly (one to three per scene).
- **Density should respond to the room below.** Denser canopy over seating zones (where visitors look up for a long time); sparser canopy over transit zones. The canopy is a response to occupation, not a uniform field.

## Sources consulted

- [Beyond Plain White: Possibilities of Sculptural Suspended Ceilings – ArchDaily](https://www.archdaily.com/971646/beyond-plain-white-possibilities-of-sculptural-suspended-ceilings)
- [Sculptural Suspended Ceiling Installation – The Architects Diary](https://thearchitectsdiary.com/sculptural-suspended-ceiling-installation-that-hangs-proudly-the-collective-works-studio/)
- [Look Up: Sculptural Wood Ceilings That Undulate and Flow – Architizer](https://architizer.com/blog/inspiration/collections/wood-ceilings/)
- [Pixelated Ceilings – Sculptform](https://sculptform.com/en-us/pixelated-ceilings)
- [Suspended Ceilings & Clouds – Griplock Systems](https://griplocksystems.com/product-category/suspended-ceilings)
- [Paper mache ceiling tiles – Ultimate Paper Mache](https://www.ultimatepapermache.com/sarahs-paper-mache-ceiling-tiles)
- [The Impact of Suspended Artwork in Modern Design – Tensile](https://www.tensile.com.au/the-impact-of-suspended-artwork-in-modern-design/)
- [Cable Suspension: Art & Gallery Hanging Systems – Gripple](https://www.gripple.com/en-us/building-services/arts-culture/)
- [Negative Space in Interior Design – Homes and Gardens](https://www.homesandgardens.com/news/negative-space-in-interior-design)
- [Fiber Sculpture – arttextstyle](https://arttextstyle.com/art/fiber-sculpture/)
