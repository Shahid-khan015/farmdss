# Simulation Engine Test Cases

Manual/QA test cases for `POST /api/v1/simulations/run`, covering all three DSS
simulation modes (`single`, `passive_passive`, `active_passive`) with complete
request payloads, expected outcomes, and the negative/validation cases the
route is known to enforce.

Source of truth for the rules being tested: `backend/app/api/v1/routes/simulations.py`,
`backend/app/core/implement_taxonomy.py`, `backend/app/core/engineering_validation.py`,
and `docs/SIMULATION_ENGINE_FORMULAS.md` for the underlying formulas.

## How to run these

```
POST http://127.0.0.1:8000/api/v1/simulations/run
Authorization: Bearer <access_token>
Content-Type: application/json
```

Get a token via `POST /api/v1/auth/login` with `{"phone_number": "...", "password": "..."}`
for the account that owns the tractors/implements below, or via the
Swagger UI at `/docs`. `201` returns the full `SimulationRead` object; failures
return `422` with a `detail` string (or a structured list for range/required-field
errors) — assert on that, not just the status code.

Every case below is a **complete, ready-to-send payload** — no field is left
implicit. Swap `tractor_id` / `implement_id` for any equivalent entry in the
[Test data reference](#test-data-reference) table if you're running against a
different environment; names are stable, UUIDs are not.

## Operating-condition input ranges (enforced, `422` outside these)

| Field | Min | Max | Unit | Notes |
|---|---|---|---|---|
| `speed` | 2 | 8 | km/h | |
| `depth` | 5 | 35 | cm | |
| `cone_index` | 300 | 3000 | kPa | |
| implement `width` | 0.5 | 5 | m | checked per passive implement, not the rotor |
| tractor `pto_power` | >10 (exclusive) | — | kW | |
| `interaction_coefficient` (ki) | 0.00 | 0.25 | — | `passive_passive` only |
| `rotor_efficiency` | 0.25 | 0.45 | — | `active_passive` only |

`soil_texture` ∈ `Fine | Medium | Coarse`. `soil_hardness` ∈ `Hard | Firm | Tilled | Soft`.

## Test data reference

All tractors below have a full tire specification attached. Owner account is
`keith` (phone `+914141414141`); library rows (`is_library=true`) are visible to
every user. IDs are from the current dev database — re-resolve by name via
`GET /api/v1/tractors?q=...` / `GET /api/v1/implements?q=...` if stale.

### Tractors — keith's "My Tractors"

| Name | id |
|---|---|
| Captain DI 2600 | `5e2e1989-fd05-4861-b012-4f9a67642ea0` |
| Eicher 485 | `d319d7f9-d03c-4e2c-aed5-366fa593d102` |
| Farmtrac 60 Powermaxx | `75e8d3c6-6d47-46ac-a60c-13046f04f1ee` |
| John Deere 5310 | `bbe3cd70-79bf-4383-8ec9-089227b2d052` |
| Mahindra 265 DI | `c05c1c9b-283d-4743-941a-7c213d5338a3` |
| Massey Ferguson 1035 DI | `27df3c84-4ba8-4f69-a423-89d0559094bf` |
| Mitsubishi MT 180 D | `aa7bc812-abe5-4963-b826-c7bc9966fd2b` |
| New Holland 3630 TX Plus | `a7e7dd61-5253-4839-a6eb-277da23423bf` |
| Sonalika DI 750 III | `6adb166d-5bfe-4f15-9430-435ae87ea502` |
| Swaraj 744 FE | `106eceec-fba2-4beb-aa1b-7b9857691c8f` |

### Implements — keith's "My Implements"

| Name | id | Type | Power class |
|---|---|---|---|
| Fieldking 2-Furrow MB Plough | `9b191aad-398d-487c-bccd-a21cfad74214` | MB Plough | passive |
| Fieldking 3-Furrow MB Plough | `863df09a-2524-4034-b8b8-6d5548eb145e` | MB Plough | passive |
| Lemken Opal 3-Disc Plough | `543fc98d-de54-436e-aef0-28126fa618e1` | Disc Plough | passive |
| Maschio Gaspardo Tandem Disc Harrow (20 Discs) | `58b22140-bcd4-46dd-a3c5-c1c57a5e61cf` | Disc Harrow (Tandem) | passive |
| Kartar Offset Disc Harrow (24 Discs) | `cf03b3bf-b674-4614-8acb-38b6ef0c321c` | Disc Harrow (Offset) | passive |
| Shaktiman 9-Tyne Spring Cultivator | `0f6251d8-f9b9-415a-990b-36c83deef6ca` | Cultivator | passive |
| Shaktiman 13-Tyne Spring Cultivator | `d1f27acc-703e-42a4-b3ea-17153072920a` | Cultivator | passive |
| Shaktiman Rotavator (5 ft) | `9bd05752-ee36-40f4-89b3-68cec2138685` | Rotavator | **active** |
| Fieldking Powered Disc Harrow (18 Discs) | `8d666fe0-ee9e-4603-8917-7fbbbf88a43a` | Disc Harrow (Powered) | **active** |
| Maschio Powered Cultivator (9 Tines) | `f27cc1f4-de19-43e1-9d4a-3f4a40b36784` | Cultivator (Powered) | **active** |

### Library (shared, `is_library=true`)

| Name | id | Type |
|---|---|---|
| 3-Bottom MB Plough | `1fdd3fa2-5c1b-4ddf-9d4a-801ff647eeb6` | MB Plough |
| 3-Disc Plough | `0b3b0e7d-4d3e-4003-9c08-c1a11defe9f7` | Disc Plough |
| Medium Cultivator (13 Tines) | `63342fa5-8439-4216-b631-1b010a1ed5bd` | Cultivator |
| Medium Disc Harrow (24 Discs) | `f6369c05-6889-4c90-a52f-17d9414f1be7` | Disc Harrow |
| Rotavator (5 ft) | `ada205b2-0e33-429d-b1c4-7c7fcb5955e2` | Rotavator (active) |
| Powered Cultivator (11 Tines) | `886091fa-201b-4f61-94a0-b22f96d8c781` | Cultivator (Powered, active) |
| Eicher 485 (tractor) | `481b9244-ed85-424d-884f-9e0602b04002` | — |

A baseline operating-conditions block, reused across the happy-path cases
below (same numbers used in `backend/scripts/legacy_regression_cases.py`):

```json
{
  "cone_index": 1200,
  "depth": 15,
  "speed": 5,
  "field_area": 2,
  "field_length": 200,
  "field_width": 100,
  "number_of_turns": 10,
  "soil_texture": "Medium",
  "soil_hardness": "Firm"
}
```

---

## Mode 1 — Single (Conventional)

`combination_type: "single"`. `implement_id` must be a **passive** type.

### TC-S-01 — MB Plough, happy path

```json
{
  "name": "TC-S-01 MB Plough baseline",
  "tractor_id": "bbe3cd70-79bf-4383-8ec9-089227b2d052",
  "implement_id": "9b191aad-398d-487c-bccd-a21cfad74214",
  "combination_type": "single",
  "cone_index": 1200,
  "depth": 15,
  "speed": 5,
  "field_area": 2,
  "field_length": 200,
  "field_width": 100,
  "number_of_turns": 10,
  "soil_texture": "Medium",
  "soil_hardness": "Firm"
}
```

**Expected:** `201`. `slip` converges near the 2% initial trial (well within
the 20% cap), `status: "Stable"`, `draft_force` > 0. Engine-torque warning
(Eq. 3.4 transmission-ratio note) is expected and does not indicate failure.

### TC-S-02 — Disc Plough, Coarse soil (low Fi)

`tractor_id`: `bbe3cd70-79bf-4383-8ec9-089227b2d052` (John Deere 5310),
`implement_id`: `543fc98d-de54-436e-aef0-28126fa618e1`
(Lemken Opal 3-Disc Plough), `soil_texture: "Coarse"`, rest unchanged from the
baseline block. **Expected:** `201`, `draft_force ≈ 982.8 N` (Fi for Disc
Plough on Coarse = 0.78).

### TC-S-03 — Same Disc Plough, Fine soil

Identical to TC-S-02 but `soil_texture: "Fine"`. **Expected:** `201`,
`draft_force ≈ 1260.0 N` — strictly higher than TC-S-02 (Fi=1.0 vs 0.78,
same A/B/C/width/depth/speed otherwise) — this pair is the regression check
for the Fi lookup.

### TC-S-04 — Tandem vs. Offset Disc Harrow

`tractor_id`: `106eceec-fba2-4beb-aa1b-7b9857691c8f` (Swaraj 744 FE),
`implement_id`: `58b22140-bcd4-46dd-a3c5-c1c57a5e61cf` (Maschio Gaspardo
Tandem Disc Harrow, width 1.7 m), baseline conditions. **Expected:** `201`,
`draft_force ≈ 841.5 N`. Also run the same payload against the Offset harrow
(`cf03b3bf-b674-4614-8acb-38b6ef0c321c`, width 2.0 m) — expect a **different**
`draft_force` (≈ 990.0 N), because these are two different catalogue products
(different width/weight), not a controlled pair. `configuration` itself
(Tandem/Offset) is documented as descriptive-only with no distinct DSS
coefficient (`app/models/enums.py::DiscHarrowConfiguration`); to isolate that
specifically, diff two implement records that are identical except for
`configuration` and confirm identical output — not covered by the seeded
catalogue as-is.

### TC-S-05 — Boundary speed (8 km/h max)

Baseline payload on TC-S-01's tractor/implement with `speed: 8`. **Expected:** `201`.

### TC-S-06 — Cultivator, boundary depth (35 cm max)

`tractor_id`: `c05c1c9b-283d-4743-941a-7c213d5338a3` (Mahindra 265 DI),
`implement_id`: `0f6251d8-f9b9-415a-990b-36c83deef6ca` (Shaktiman 9-Tyne
Cultivator), `depth: 35`. **Expected:** `201`.

### TC-S-07 (negative) — speed out of range

Baseline payload, `speed: 9`. **Expected:** `422`, `detail` includes a
`speed` range error (`min: 2, max: 8`).

### TC-S-08 (negative) — cone_index out of range

Baseline payload, `cone_index: 3500`. **Expected:** `422`, range error on
`cone_index` (`min: 300, max: 3000`).

### TC-S-09 (negative) — active implement in the single slot

`implement_id`: `9bd05752-ee36-40f4-89b3-68cec2138685` (Shaktiman Rotavator,
active), `combination_type: "single"`. **Expected:** `422`,
`SlotAssignmentError`: *"A conventional (single-implement) simulation must be
a passive (unpowered) implement, but 'Rotavator' is PTO-powered... "*

### TC-S-10 (negative) — missing operating conditions, no preset

Omit `cone_index`, `depth`, `speed`, `field_area`, `field_length`,
`field_width` entirely and do not set `operating_conditions_preset_id`.
**Expected:** `422` at the Pydantic layer: *"Custom operating conditions
required when no preset is used. Missing: [...]"*.

### TC-S-11 (negative) — tractor not found

Valid implement, `tractor_id`: `00000000-0000-0000-0000-000000000000`.
**Expected:** `404 Tractor not found`.

---

## Mode 2 — Passive + Passive

`combination_type: "passive_passive"`. `implement_id` = tool 1 (front),
`implement_2_id` = tool 2 (trailing), both **passive**, and
`interaction_coefficient` (ki, 0.00–0.25) is required.

> **Previously these cases all returned `422`.** The Section 4 `Bn'` wheel-numeric
> expression was found to be dimensionally invalid (m²/kN, scaling as `W^-1.5`),
> which drove `mu < 0` at every trial slip and made the mode fail for every
> realistic tractor. The engine now uses Section 3's `Bn = CI*b*d/Wd` on the driven
> wheel — the only dimensionally valid wheel numeric the specification defines, and
> what the Section 4 prose itself calls for — and the combi axle balance now uses
> Eq. 3.5/3.6 generalised to two tools.
>
> **Every passive-passive case below is now expected to return `201` with a
> converged result.** A `422` carrying the old `Bn'` diagnostic means the fix has
> been reverted. See `SIMULATION_ENGINE_FORMULAS.md` B2/B5/B6.

### TC-PP-01 — Two MB Ploughs, ki=0 (structural/plumbing check)

```json
{
  "name": "TC-PP-01 two ploughs no interaction",
  "tractor_id": "bbe3cd70-79bf-4383-8ec9-089227b2d052",
  "implement_id": "9b191aad-398d-487c-bccd-a21cfad74214",
  "implement_2_id": "863df09a-2524-4034-b8b8-6d5548eb145e",
  "combination_type": "passive_passive",
  "interaction_coefficient": 0,
  "cone_index": 1200,
  "depth": 15,
  "speed": 5,
  "field_area": 2,
  "field_length": 200,
  "field_width": 100,
  "number_of_turns": 10,
  "soil_texture": "Medium",
  "soil_hardness": "Firm"
}
```

**Expected:** `201`, converged. With `ki = 0`, `draft_force` must equal
`draft_1 + draft_2` exactly. Check `results.converged == true`, `slip` in 2–20 %,
and `legacy_mobility_number_rear` in a usable band (roughly 5–200 for normal
loads) rather than the sub-1 values the old `Bn'` produced. The
`dss_section4_wheel_numeric` diagnostic still reports that old value for audit —
it should be < 1 and must not match `legacy_mobility_number_rear`.

### TC-PP-02 — Same pair, ki=0.15 (mid-range interaction coefficient)

Identical to TC-PP-01 with `interaction_coefficient: 0.15`. **Expected:** `201`.
`draft_force` must equal `0.85 × (draft_1 + draft_2)`, and `required_pto_power`
and `fuel_consumption_per_hectare` must be **lower** than TC-PP-01's — the
document's own claim that a combi pass costs less than two independent ones.

Note `legacy_rear_axle_load_n` moves slightly **up** as ki rises: Eq. 3.5 carries
`− DTotal·Yd`, so less draft means less weight transferred off the rear axle.

### TC-PP-03 — Cultivator + Disc Harrow pair

`implement_id`: `0f6251d8-f9b9-415a-990b-36c83deef6ca` (Shaktiman 9-Tyne
Cultivator), `implement_2_id`: `cf03b3bf-b674-4614-8acb-38b6ef0c321c`
(Kartar Offset Disc Harrow), `interaction_coefficient: 0.1`, baseline
conditions, `tractor_id`: `c05c1c9b-283d-4743-941a-7c213d5338a3`. **Expected:**
`201`, converged — confirms the mode works across implement pairs, not just the
two-plough case.

### TC-PP-03b — Reduction to the conventional result (consistency check)

Run TC-PP-01's tractor and tool 1 as `combination_type: "single"`, then as
`passive_passive` with a second tool that has zero weight, zero ASAE parameters
and no greater width, and `ki = 0`. **Expected:** both `201`, and every shared
result value identical — `draft_force`, both axle loads, both wheel numerics,
`slip`, `traction_efficiency`, `drawbar_power`, `fuel_consumption_per_hectare`
and both ballast figures. This is the strongest available check that the combi
path and the validated conventional path agree.

### TC-PP-04 (negative) — ki out of range

TC-PP-01 payload, `interaction_coefficient: 0.30`. **Expected:** `422` at
the Pydantic layer (`ge=0, le=0.25`), before the engine is invoked at all —
must return before the `Bn'` diagnostic, not after.

### TC-PP-05 (negative) — same implement used for both slots

TC-PP-01 payload with `implement_2_id` set equal to `implement_id`.
**Expected:** `422`, `SlotAssignmentError`: *"A passive-passive combination
needs two different implements..."*

### TC-PP-06 (negative) — active implement in tool-2 slot

TC-PP-01 payload, `implement_2_id`: `9bd05752-ee36-40f4-89b3-68cec2138685`
(Rotavator, active). **Expected:** `422`, `SlotAssignmentError`: *"Tool 2 of
a passive-passive combination must be a passive (unpowered) implement..."*

### TC-PP-07 (negative) — missing implement_2_id

TC-PP-01 payload with `implement_2_id` omitted. **Expected:** `422` at the
Pydantic layer: *"implement_2_id is required for combination_type=passive_passive"*.

### TC-PP-08 (negative) — missing interaction_coefficient

TC-PP-01 payload with `interaction_coefficient` omitted. **Expected:** `422`:
*"interaction_coefficient (ki, 0.00-0.25) is required for combination_type=passive_passive"*.

---

## Mode 3 — Active + Passive

`combination_type: "active_passive"`. `implement_id` = the towed **passive**
tool; `implement_2_id` (optional) = a catalogued **active** rotor implement,
whose specs are resolved server-side. Any inline `rotor_*` field overrides the
catalogue value for that field. If `implement_2_id` is omitted, all six
`rotor_*` fields become required inline.

### TC-AP-01 — Passive tool + catalogued rotor (Rotavator)

```json
{
  "name": "TC-AP-01 cultivator plus rotavator",
  "tractor_id": "bbe3cd70-79bf-4383-8ec9-089227b2d052",
  "implement_id": "0f6251d8-f9b9-415a-990b-36c83deef6ca",
  "implement_2_id": "9bd05752-ee36-40f4-89b3-68cec2138685",
  "combination_type": "active_passive",
  "cone_index": 1200,
  "depth": 15,
  "speed": 5,
  "field_area": 2,
  "field_length": 200,
  "field_width": 100,
  "number_of_turns": 10,
  "soil_texture": "Medium",
  "soil_hardness": "Firm"
}
```

**Expected:** `201`. Rotor specs (`weight`, `cg_distance_from_hitch`,
`rotor_mechanical_resistance`, `rotor_efficiency`, `rotor_pto_power`,
`rotor_speed`) are pulled from the "Shaktiman Rotavator (5 ft)" record.
`rotor_thrust` reduces the effective draft; a "Rear ballast is not required"
note is expected since the rotor's own thrust/PTO reaction typically
oversupplies rear-axle load.

### TC-AP-02 — Same pair, powered Disc Harrow rotor

Identical to TC-AP-01 with `implement_2_id`:
`8d666fe0-ee9e-4603-8917-7fbbbf88a43a` (Fieldking Powered Disc Harrow).
**Expected:** `201`.

### TC-AP-03 — Inline rotor override on a catalogued rotor

TC-AP-01 payload plus `"rotor_efficiency": 0.35` inline. **Expected:** `201`,
and the persisted `rotor_efficiency` in the response is `0.35`, not the
catalogue record's `0.30` — confirms inline values win over the catalogue.

### TC-AP-04 — Fully inline rotor, no catalogue implement

```json
{
  "name": "TC-AP-04 fully inline rotor",
  "tractor_id": "bbe3cd70-79bf-4383-8ec9-089227b2d052",
  "implement_id": "0f6251d8-f9b9-415a-990b-36c83deef6ca",
  "combination_type": "active_passive",
  "rotor_weight": 350,
  "rotor_cg_distance_from_hitch": 0.45,
  "rotor_mechanical_resistance": 310,
  "rotor_efficiency": 0.30,
  "rotor_pto_power": 3.2,
  "rotor_speed": 540,
  "cone_index": 1200,
  "depth": 15,
  "speed": 5,
  "field_area": 2,
  "field_length": 200,
  "field_width": 100,
  "number_of_turns": 10,
  "soil_texture": "Medium",
  "soil_hardness": "Firm"
}
```

**Expected:** `201` — same values as TC-AP-01's resolved rotor, entered by
hand instead of from the catalogue; results should match TC-AP-01 numerically
(same tractor/passive tool/conditions).

### TC-AP-05 (negative) — passive implement in the rotor slot

TC-AP-01 payload, `implement_2_id`: `863df09a-2524-4034-b8b8-6d5548eb145e`
(Fieldking 3-Furrow MB Plough, passive). **Expected:** `422`,
`SlotAssignmentError`: *"The rotor slot of an active-passive combination must
be a PTO-powered implement, but 'MB Plough' is passive..."*

### TC-AP-06 (negative) — active implement in the passive-tool slot

TC-AP-04 payload (fully inline rotor, so the Pydantic "rotor fields required"
check is satisfied and the request actually reaches slot validation) with
`implement_id`: `9bd05752-ee36-40f4-89b3-68cec2138685` (Rotavator) instead of
the cultivator. **Expected:** `422`, `SlotAssignmentError`: *"The passive
tool of an active-passive combination must be a passive (unpowered)
implement..."*. (If `implement_2_id` is omitted **and** the inline rotor
fields are also left out, Pydantic's required-rotor-fields check fires first
and masks this error with a "Rotor fields required" `422` instead — the two
are easy to conflate, so keep the rotor fields in this payload.)

### TC-AP-07 (negative) — rotor_efficiency out of documented range

TC-AP-04 payload, `rotor_efficiency: 0.10`. **Expected:** `422` at the
Pydantic layer (`ge=0.25, le=0.45`).

### TC-AP-08 (negative) — overpowered rotor (effective draft goes negative)

TC-AP-04 payload, `rotor_pto_power: 15.0`, `rotor_efficiency: 0.35`.
**Expected:** `422`, message matches `Effective draft` — the rotor's thrust
would exceed the passive tool's draft plus its own mechanical resistance,
which the engine rejects rather than reporting negative effective draft.

### TC-AP-09 (negative) — missing rotor fields, no catalogue implement

`implement_id` set, `implement_2_id` omitted, and only
`rotor_weight`/`rotor_speed` supplied inline (the other four rotor fields
missing). **Expected:** `422`: *"Rotor fields required for
combination_type=active_passive when no rotor implement (implement_2_id) is
selected. Missing: [...]"*.

---

## Cross-cutting negative cases (any mode)

### TC-X-01 — No Authorization header

Any valid payload, no `Authorization` header. **Expected:** `401`.

### TC-X-02 — Tractor missing tire specification

Requires a tractor with no `TireSpecification` row (not present in the seeded
data above — construct one via `POST /api/v1/tractors` without a
`tire_specification`). **Expected:** `422`: *"Tractor is missing tire
specifications"*.

### TC-X-03 — Implement not found

Valid tractor, `implement_id: "00000000-0000-0000-0000-000000000000"`.
**Expected:** `404 Implement not found`.

### TC-X-04 — Implement missing ASAE parameters

Requires a custom implement created without `asae_param_a/b/c` (not present
in the seeded data above). **Expected:** `422`: *"Implement missing required
fields for simulation: ['asae_param_a', ...]"*.
