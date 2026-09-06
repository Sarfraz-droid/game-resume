# Low-poly models (poly.pizza)

The garden runs fine with **no** model files — every prop has a built-in
procedural mesh. Add `.glb` files to swap in nicer low-poly art from
<https://poly.pizza/search/garden>. Each one is optional and picked up
automatically on the next `npm run dev` / `npm run build`.

## How

1. Open a model on poly.pizza → **Download** → **glTF (.glb)**.
2. Save it into `src/assets/models/` with the **exact file name** from the table.
3. If the fit is off, tune `scale` / `y` / `rotY` for that key in
   `src/game/models.js` (per-model, one line).

Models on poly.pizza are CC0 or CC-BY — keep the attribution line the site shows
if it's CC-BY (drop it in the README or an on-screen credit).

## File names

| Save as (`src/assets/models/…`) | Used for | Fallback if absent |
|---|---|---|
| `tree-round.glb` | broadleaf trees (kind 0) | procedural round tree |
| `tree-pine.glb`  | conifers (kind 1) | procedural conifer |
| `tree-birch.glb` | birches (kind 2) | procedural birch |
| `bush.glb`       | shrubs dotted around the lawn | procedural blob |
| `rock.glb`       | boulders in the outer ring | procedural dodecahedron |
| `flowers.glb`    | *(reserved — flower clusters, not yet wired)* | instanced flowers |
| `bench.glb`      | park benches beside each footpath | simple plank bench |
| `lamp.glb`       | lamp posts along the road kerb | procedural lamp |
| `bridge.glb`     | bridge over the first pond | procedural plank bridge |
| `fountain.glb`   | centre-of-plaza fountain | procedural fountain |
| `lilypad.glb`    | lily pads on the ponds | *(nothing)* |
| `treehouse.glb`  | scenic treehouse, NE outer ring | *(nothing)* |
| `sheep.glb`      | 3 grazing sheep on the lawn | *(nothing)* |
| `barrel.glb`     | *(reserved)* | *(nothing)* |

## Kits — multi-object packs (`src/game/kit.jsx`)

Besides the one-object files above, the scene can pull individual props out of a
whole low-poly **pack** in a single `.glb`. Drop these in `src/assets/models/`:

| Save as | Used for | Fallback if absent |
|---|---|---|
| `forest-pack.glb`     | trees (oak/pine/spruce/birch), shrubs, boulders, fallen logs, toadstools, ferns | procedural meshes |
| `japanese-garden.glb` | scenic bridge-garden set piece in the NE corner (by the treehouse anchor) | *(nothing)* |
| `go-kart.glb`         | *(reserved — uncomment `kart` in `kit.jsx` to swap the buggy)* | procedural buggy |

`kit.jsx` loads each pack once, pulls the named sub-object, recentres it on the
origin with its base at `y=0`, flat-shades it and scales it to a target size in
world units. Node names and the per-species picks live in the `FOREST` map;
tune sizes via the `fit` prop where `<KitPart>` is used in `env/Scenery.jsx`,
`env/Flora.jsx` and `env/Island.jsx`.

The Japanese-garden pack is coloured through `KHR_materials_pbrSpecularGlossiness`,
which current three no longer reads — `GARDEN_MATS` in `kit.jsx` re-applies the
pack's own diffuse colours by material name.

> The repo's `/models/` folder also holds `marina_bay_street_circuit.glb` — it's
> a 59 MB, 1.3 M-triangle photoscan, not low-poly, so it's deliberately left out
> of the bundle.

## Suggested picks (search terms on poly.pizza)

- **Trees**: "Pine Tree", "Tree" (Quaternius / Kenney "Nature Kit" packs match
  the reference image style well)
- **Bridge**: "Wood Bridge" / "Bridge"
- **Bench**: "Park Bench" / "Bench"
- **Lamp**: "Street Lamp" / "Lantern"
- **Fountain**: "Fountain"
- **Treehouse**: "Tree House" / "Cabin"
- **Sheep**: "Sheep"
- **Lily pad**: "Lily Pad" / "Water Lily"
