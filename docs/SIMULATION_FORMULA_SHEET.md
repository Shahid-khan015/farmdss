# DSS Simulation Engine — Formula Sheet

Every formula evaluated by the simulation module, with symbols, units, constants and
provenance. Transcribed from the code, not from the specification document, so this sheet
describes **what the engine actually computes**.

- **Scope:** `backend/app/core/` — `dss_shared.py`, `legacy_algorithms.py`,
  `combi_algorithms.py`, `constants.py`, `engineering_validation.py`.
- **Companion documents:** [`SIMULATION_ENGINE_FORMULAS.md`](SIMULATION_ENGINE_FORMULAS.md) is
  the clause-by-clause audit map from code back to `Simulation for DSS _Sahid.docx` and carries
  the derivations and defect analyses. This sheet is the flat reference; where the two
  disagree, the code wins and both should be corrected.

## 0. How to read this sheet

### Provenance tags

Every formula and constant carries one tag:

| Tag | Meaning |
|---|---|
| `DSS-EXACT` | Transcribed symbol-for-symbol from the specification document. |
| `DSS-AMBIGUOUS` | The document is unclear, self-contradictory, or dimensionally invalid here; the reading used is stated explicitly. |
| `IMPLEMENTATION-ASSUMPTION` | Not in the document; required to make the chain computable. Stated, never hidden. |
| `LEGACY` | Absent from the document; preserved unchanged from the pre-existing codebase rather than invented. |
| `EXTERNAL-MODEL` | Sourced from named external literature. |

### Conventions

- **Slip** appears as a percentage `S%` in the UI and as a fraction `s = S%/100` inside the
  traction equations. The sheet writes `s` wherever a fraction is required.
- **Wheel vs axle load.** Wheel numerics take the load on *one tyre*. The engine passes
  `W = axle load / 2` (equal wheel loading) — an `IMPLEMENTATION-ASSUMPTION`; the document
  specifies a per-tyre load without saying how to split the axle.
- **Forces are Newtons** throughout the engine. Masses in kg are converted with
  `g = 9.81 m/s²` at the boundary, and ballast results are converted back to kg for reporting.
- **Failures are loud.** `require_positive`, `safe_div`, `safe_sqrt` and `require_finite`
  raise `ValueError` naming the offending quantity. No guard substitutes a fallback value —
  a simulation that cannot be computed fails visibly rather than reporting a fabricated number.

---

## 1. Nomenclature

### Inputs — tractor

| Symbol | Quantity | Unit |
|---|---|---|
| `Pt` | Rated PTO power | kW |
| `L` | Wheelbase | m |
| `Wsf`, `Wsr` | Static front / rear axle weight | kg |
| `Rsf`, `Rsr` | Static front / rear axle load = `Wsf·g`, `Wsr·g` | N |
| `Wt` | Total tractor weight = `(Wsf + Wsr)·g` | N |
| `Hd` | Hitch distance from rear axle | m |
| `Xcgt` | Tractor CG distance from rear axle | m |
| `ηt` | Transmission efficiency | % |
| `fs` | Power reserve | % |
| `T` | Maximum engine torque (optional) | N·m |
| `rr`, `rf` | Rear / front rolling radius | m |
| `dr`, `df` | Rear / front overall tyre diameter | m |
| `br`, `bf` | Rear / front tyre section width | m |

### Inputs — implement (per tool)

| Symbol | Quantity | Unit |
|---|---|---|
| `W` | Working width | m |
| `Wm` | Implement weight (as force, `mass·g`) | N |
| `Xcgi` | Implement CG distance from hitch | m |
| `A`, `B`, `C` | ASAE draft parameters | — |
| — | Implement type | enum (drives `F` and `Py/D`) |

### Inputs — operating conditions

| Symbol | Quantity | Unit | Accepted range |
|---|---|---|---|
| `S` | Operating speed | km/h | 2 – 8 |
| `Td` | Tillage depth | cm | 5 – 35 |
| `CI` | Soil cone index | kPa | 300 – 3000 |
| `W` | Implement width | m | 0.5 – 5 |
| `Af` | Field area | ha | > 0 |
| `Wf` | Field width | m | > 0 |
| — | Soil texture | enum (Fine / Medium / Coarse) | |

`Pt` must be `> 10 kW`. Ranges enforced by `validate_operating_ranges`
(`engineering_validation.py`) and surfaced as HTTP 422 field errors.

### Inputs — combination-specific

| Symbol | Quantity | Unit | Range | Mode |
|---|---|---|---|---|
| `ki` | Tool-interaction coefficient | — | 0.00 – 0.25 | passive-passive |
| `ηr` | Rotor efficiency | — | 0.25 – 0.45 | active-passive |
| `PPTO` | Rotor PTO power draw | kW | > 0 | active-passive |
| `N` | Rotor speed | rpm | > 0 | active-passive |
| `Da` | Rotor mechanical resistance | N | ≥ 0 | active-passive |
| `Fv` | Rotor dynamic vertical force | N | ≥ 0 (default 0) | active-passive |
| `Xa` | Rotor CG distance from hitch | m | | active-passive |

### Outputs

| Symbol | Quantity | Unit |
|---|---|---|
| `D` / `DTotal` / `Deff` | Draft (single / passive-passive / active-passive) | N |
| `Py` | Vertical soil reaction | N |
| `Rr`, `Rf` | Dynamic rear / front axle load | N |
| `Bn` | Wheel numeric (mobility number) | — |
| `ρr`, `ρf` | Rear / front rolling-resistance coefficient | — |
| `μg`, `μ` | Gross / net traction coefficient | — |
| `S%` | Wheel slip | % |
| `TE` | Tractive efficiency | % |
| `Kwef`, `Kwer` | Front / rear weight utilization | — |
| `BRf`, `BRr` | Front / rear ballast required | kg |
| `FCth`, `FCac` | Theoretical / actual field capacity | ha/h |
| `FE` | Field efficiency | % |
| `DBp` | Drawbar power | kW |
| `Ptr` | Required PTO power | kW |
| `Put` | Power utilization | % |
| `X` | PTO power fraction | — |
| `SFC` | Specific fuel consumption | L/kW·h |
| `Pet` | Engine-torque-limited pull (diagnostic) | N |

---

## 2. Constants

All live in `app/core/constants.py`. **No value may be re-declared inline** — a value that
appears in two places is a value that can drift.

### Physical

| Constant | Symbol | Value | Unit | Tag |
|---|---|---|---|---|
| `GRAVITY` | `g` | 9.81 | m/s² | — |
| `DIESEL_CALORIFIC_VALUE` | — | 35.5 | MJ/L | `DSS-EXACT` |

### Geometry

| Constant | Value | Unit | Tag |
|---|---|---|---|
| `DRAFT_DEPTH_ACTION_FRACTION` | 2/3 | — | `DSS-EXACT` |
| `WHEEL_ECCENTRICITY_COEFF` | 0.1 | — | `DSS-EXACT` for `er` (Liljedahl et al., 1996); `IMPLEMENTATION-ASSUMPTION` for `ef` — the document states 0.1 only for `er`, applied to `ef` by symmetry |

### Traction and rolling resistance

| Constant | Value | Tag |
|---|---|---|
| `ROLLING_RESISTANCE_BASE` | 0.04 | `DSS-EXACT` |
| `ROLLING_RESISTANCE_SLIP_COEFF` | 0.5 | `DSS-EXACT` |
| `TRACTION_MU_G_SCALE` | 0.88 | `DSS-EXACT` |
| `TRACTION_BN_EXPONENT_COEFF` | 0.1 | `DSS-EXACT` |
| `TRACTION_SLIP_EXPONENT_COEFF` | **7.5** | `DSS-AMBIGUOUS → IMPLEMENTATION-ASSUMPTION` — see below |

> **The 7.5 vs 0.3 correction.** The document's Eq. 3.9 image literally shows `exp(-0.3·s)`.
> Implemented literally, `μ` stays near zero across the entire practical 2–20 % slip range, so
> the slip solver never converges for any realistic input, in any of the three modes. 7.5 is the
> standard Wismer–Luth / Brixius literature value and produces physically realistic traction
> curves. Confirmed with the user as a corrected transcription, not a literal DSS value. Defined
> in exactly one place.

### Slip iteration

| Constant | Value | Unit | Tag |
|---|---|---|---|
| `SLIP_INITIAL_PCT` | 2.0 | % | `DSS-EXACT` |
| `SLIP_INCREMENT_PCT` | 0.1 | % | `DSS-EXACT` |
| `MAX_SLIP_PCT` | 20.0 | % | `IMPLEMENTATION-ASSUMPTION` — the document gives no upper bound |
| `MAX_SLIP_ITERATIONS` | 500 | — | `IMPLEMENTATION-ASSUMPTION` — loop safety net |

### Ballast solvers

| Constant | Value | Tag |
|---|---|---|
| `FRONT_BALLAST_TARGET_KWEF` | 0.20 | `DSS-EXACT` |
| `REAR_BALLAST_TARGET_SLIP_PCT` | 15.0 % | `DSS-EXACT` |
| `BALLAST_SOLVER_TOLERANCE` | 1×10⁻⁴ | `IMPLEMENTATION-ASSUMPTION` |
| `BALLAST_SOLVER_MAX_ITERATIONS` | 200 | `IMPLEMENTATION-ASSUMPTION` |

### ASABE (2001) specific fuel consumption

| Constant | Value | Tag |
|---|---|---|
| `SFC_COEFF_A` | 2.64 | `DSS-EXACT` |
| `SFC_COEFF_B` | 3.91 | `DSS-EXACT` |
| `SFC_COEFF_C` | 0.203 | `DSS-EXACT` |
| `SFC_RADICAND_COEFF` | 738.0 | `DSS-EXACT` |
| `SFC_RADICAND_OFFSET` | 173.0 | `DSS-EXACT` |

### Field capacity (all `LEGACY` — absent from the DSS document)

| Constant | Value | Unit |
|---|---|---|
| `TURNING_TIME_COEFF_CONST` | 15.56 | s |
| `TURNING_TIME_COEFF_WIDTH_OVER_SPEED` | 2.61 | — |
| `TURNING_TIME_COEFF_SPEED` | 1.41 | — |
| `TURNING_TIME_CLAMP` | 8.0 – 45.0 | s |
| `FIELD_EFFICIENCY_CLAMP` | 50.0 – 95.0 | % |
| `OVERALL_EFFICIENCY_CLAMP` | 0.0 – 100.0 | % |

### `Py/D` — vertical:horizontal soil-reaction ratio  `DSS-EXACT`

**Fallback only.** Both reference implementations carry `Py/D` as a *per-implement input*
(`Implement.vertical_horizontal_ratio`), which the engine reads first; this table applies only when
that column is null. Values pinned to the references — the spreadsheet's "Vertical to Horizontal
force ratio" row and the HTML library's `PyD` field, which agree exactly.

| Implement type | `Py/D` |
|---|---|
| MB Plough | 0.20 |
| Disc Plough | 0.00 |
| Disc Harrow | 0.00 |
| Cultivator | 0.20 |

> Supersedes an earlier table (0.15 / 0.40 / 0.50 / 0.00) attributed to Kepner et al. 1978 via the
> DSS document, which disagreed with both references on every row — nearly inverted for the disc
> tools and the cultivator — and materially changed the axle-load split.

### `F` — soil-texture adjustment factor  `EXTERNAL-MODEL`

**ASABE D497 Table 1**, columns `F₁/F₂/F₃`. The DSS document names the texture classes but does
not tabulate them; the stored values match D497 row-for-row — the same standard Eq. 3.1 itself
comes from — so they are cited to it. (Earlier revisions of this sheet tagged them
`LEGACY — no cited source`; re-tagged on that evidence, with no numeric change.)

| Implement type | Fine | Medium | Coarse |
|---|---|---|---|
| MB Plough | 1.00 | 0.70 | 0.45 |
| Disc Plough | 1.00 | 0.88 | 0.78 |
| Disc Harrow | 1.00 | 0.88 | 0.78 |
| Cultivator | 1.00 | 0.85 | 0.65 |

### Mode-specific ranges

| Constant | Range | Tag |
|---|---|---|
| `KI_RANGE` | 0.00 – 0.25 | `DSS-EXACT` (Section 4) |
| `ROTOR_EFFICIENCY_RANGE` | 0.25 – 0.45 | `DSS-EXACT` (Section 5) |
| `PUT_PROPERLY_LOADED_RANGE` | 95 – 100 % | `DSS-EXACT` |

---

## 3. Core chain (shared by all three modes)

### A. Draft force — Eq. 3.1  `DSS-EXACT`

```
D = F · (A + B·S + C·S²) · W · Td
```

| Symbol | Unit |
|---|---|
| `D` | N |
| `F` | — (soil-texture factor, §2) |
| `A`, `B`, `C` | ASAE parameters |
| `S` | km/h |
| `W` | m |
| `Td` | cm |

There is **no divisor on `Td`** — the units above are what make the equation balance. This is
exactly the **ASABE D497** draft model, `D = F_i[A + B·S + C·S²]·W·T`, which the DSS document
is transcribing.

> **Correction.** An earlier revision of this sheet carried `(Td / 10)` and stated the divisor
> was genuine. It was not, and the error was systemic rather than a scale factor: draft 10× too
> small made the slip solver converge on its first 2 % trial step for every realistic input,
> pinning tractive efficiency near 10 % (real tillage is 50–75 %) and reporting "Underloaded" for
> every tractor/implement pairing — so the DSS could not perform matching at all. With the
> correction, slip spans 4–19 %, TE 24–57 %, and power utilization separates a 17 kW tractor
> (overloaded) from a 40 kW one (headroom) on the same implement.

`dss_shared.draft_force_n` is the single transcription of Eq. 3.1; all three modes call it.
Guards: `W`, `S`, `Td` must all be `> 0`.

### B. Geometry  `DSS-EXACT` (except `ef`)

```
Yd = (2/3) · (Td / 100)          m      depth at which draft acts
er = 0.1 · rr                    m      rear wheel eccentricity
ef = 0.1 · rf                    m      front wheel eccentricity
```

`Yd` converts cm → m internally. `ef` is `IMPLEMENTATION-ASSUMPTION` (see §2).

### C. Vertical soil reaction

```
Py = (Py/D) · D                  N
```

Ratio from the §2 table, keyed by implement type. Both tables (`F` and `Py/D`) are defined
**only for passive tools**; a PTO-powered implement reaching them raises a `ValueError`
surfaced as HTTP 422, because the DSS passive-draft model does not apply to it.

### D. Dynamic axle loads — Eq. 3.5 / 3.6  `DSS-EXACT`

```
       (Wm + Py)·(Xcgi + Hd + L + ef) + Wt·(L + ef − Xcgt) − D·Yd
Rr = ───────────────────────────────────────────────────────────────
                          L − er + ef

Rf = (Wt + Wm + Py) − Rr
```

Units: all forces N, all distances m. Raises if `L − er + ef = 0`, or if either load comes out
non-positive.

> **This same equation is used by all three modes.** The Section 4/5 restatement
> `Rr = [Wt·Xcgt + Σ(Wn·Xn) + Py·Hd + D·Yd] / L` is **not** used: re-deriving the balance from
> the combi free-body diagram reproduces Eq. 3.5 exactly and shows the combi form uses the wrong
> moment arms (`Xcgt` where the geometry requires `L − Xcgt`, `Xn` where it requires
> `L + Hd + Xn`, `Hd` where it requires `L + Hd`) and the **opposite sign** on the draft term.
> Reduced to a single tool the two disagree by ~21 % on rear-axle load. See
> `_combined_axle_load_shared` and `SIMULATION_ENGINE_FORMULAS.md`.

Weight utilization:

```
Kwef = Rf / Wt          Kwer = Rr / Wt          (dimensionless)
```

### E. Wheel numeric — Section 3  `DSS-EXACT`

```
Bn = CI · b · d / Wd
```

| Symbol | Unit |
|---|---|
| `CI` | kPa |
| `b` | m (tyre section width) |
| `d` | m (tyre overall diameter) |
| `Wd` | **kN** (dynamic load on one tyre) |
| `Bn` | dimensionless |

Since `1 kPa ≡ 1 kN/m²`, `CI·b·d` has units of kN, so `Wd` must be in kN for `Bn` to be
dimensionless. The engine receives `Wd` in Newtons and converts. **No shape factor,
contact-patch correction or other multiplier appears in the source equation, and none is
applied.**

Evaluated at `W = axle load / 2` on both axles, in all three modes. What differs between modes
is the *axle load*, never the formula.

### F. Rolling resistance  `DSS-EXACT`

```
ρr = 1/Bn + 0.04 + 0.5·s / √Bn         rear  (driven — carries the slip term)
ρf = 1/Bn + 0.04                       front (undriven — no slip term)

MR ratio = ρr + ρf
```

`ρf` uses `Bn` evaluated with the **front** cone index, tyre width, tyre diameter and front
dynamic load. `wheel_response` hard-wires the front model and takes no callable, so an
alternative rear model cannot leak onto the front wheel.

### G. Traction  `DSS-EXACT` (except the slip exponent)

```
μg = 0.88 · (1 − e^(−0.1·Bn))                              Brixius envelope (ceiling)

μ  = μg·(1 − e^(−7.5·s)) − 1/Bn − 0.5·s/√Bn                net traction coefficient  (= GT − MR)

GT = μg·(1 − e^(−7.5·s)) + 0.04                            gross traction ratio AT slip s

TE = μ·(1 − s) / GT × 100                                  tractive efficiency, %
```

`TE` is clamped to `[0, 100]`. `TE ≤ 0` raises: *"Either decrease depth or speed of operation,
since slip is very low."*

`μg` depends only on `Bn`, so it is computed once and hoisted out of the slip loop; the value is
identical either way.

> **Note the two different gross-traction quantities.** `μg` is the *envelope* — the ceiling `GT`
> approaches as slip grows. `GT` is what is actually developed at slip `s`, and it is the correct
> denominator for `TE`. Using `μg` there (as both reference implementations do, and as this engine
> did until this revision) understates `TE` roughly 3× at working slip, removes its optimum
> entirely, and — because `Ptr = DBp/(TE·ηt)` — inflates power utilisation by the same factor.
> Brixius' motion-resistance ratio is `MR = 0.04 + 1/Bn + 0.5·s/√Bn`, and `μ` above is exactly
> `GT − MR`: the two `0.04` terms cancel, which is why `μ` carries no constant. That identity is
> what fixes `GT`. See `SIMULATION_ENGINE_FORMULAS.md` A9.

### H. Slip iteration — Section 3.4.6  `DSS-EXACT` (bounds are assumptions)

```
Bn ← evaluated at W = Rr/2
s  ← 2.0 %
repeat:
    μ   = μ(Bn, s)
    Pst = μ · Rr                       soil-limited pull, N
    if Pst ≥ D:  converged, stop
    s  += 0.1 %
    if s ≥ 20 %: s = 20 %, recompute, stop  (not converged)

on convergence, interpolate between the last two grid points:
    s = s_prev + (D − Pst_prev)·(s_step − s_prev)/(Pst_step − Pst_prev)
    then re-evaluate μ and Pst at s
```

The **stepped** value is the first 0.1 % increment at which pull exceeds draft, so it overstates
slip by up to one step; interpolating recovers the slip at which `Pst == D`, which is what every
downstream quantity uses. The stepped value is still reported, as `slip_stepped`.

Two distinct non-convergence outcomes are reported separately, because they need different
advice:

| Outcome | Condition | Meaning |
|---|---|---|
| `converged = False`, `traction_possible = True` | `μ > 0` somewhere, but `Pst < D` at 20 % | Pull is simply short of the draft at the slip cap. |
| `converged = False`, `traction_possible = False` | `μ ≤ 0` at *every* trial slip | Motion resistance exceeds available gross traction — more slip will not help. |

### I. Field capacity  `FCth` is `DSS-EXACT`; everything else is `LEGACY`

```
FCth      = S · W / 10                                              ha/h

t_turn    = clamp( 15.56 + 2.61·(W/S) − 1.41·S , 8 , 45 )           s
n_turns   = round( Wf / W )                                         —
t_turning = t_turn · 2 · n_turns / 3600                             h
t_theory  = Af / FCth                                               h
t_total   = t_turning + t_theory                                    h

FCac      = Af / t_total                                            ha/h
FE        = clamp( FCac / FCth × 100 , 50 , 95 )                    %
```

The turning-time model, the derivation of actual capacity from total operating time, and the
50–95 % clamp are all absent from the DSS document and preserved unchanged from the pre-existing
implementation rather than invented or "corrected". The unclamped ratio is also reported as
`legacy_field_efficiency_raw`, because the clamp can make the reported efficiency inconsistent
with the reported capacities.

### J. Power and fuel

```
DBp = D · S / 3.6 / 1000                        kW      Eq. 3.4   DSS-EXACT
Ptr = DBp / ( (TE/100) · (ηt/100) )             kW      Eq. 3.11  DSS-EXACT
Put = (Ptr + PPTO) / ( Pt·(1 − fs/100) ) × 100  %       Eq. 3.12 / 5.14  DSS-EXACT
X   = (Ptr + PPTO) / Pt                         —       Eq. 5.15  DSS-EXACT

SFC = 2.64·X + 3.91 − 0.203·√(738·X + 173)      L/kW·h  ASABE (2001)  DSS-EXACT
```

`PPTO = 0` for single and passive-passive modes; the rotor's PTO draw for active-passive. With
it at zero, `Put` and `X` collapse to Eq. 3.12's `Ptr/(Pt(1−fs))` and `Ptr/Pt` — which is exactly
how the document derives Section 4 from Section 5 ("Section 4's equations are the special case of
Section 5's obtained by setting `PPTO = 0`").

Guards: `fs ≥ 100 %` raises. `X` is floored at 0 before the square root.

Fuel — `DSS-AMBIGUOUS / LEGACY`:

```
fuel_lph          = SFC · DBp                                        L/h    ← drives all reported fuel
fuel_lph_pto      = SFC · (Ptr + PPTO)                               L/h    ← diagnostic only, feeds nothing
fuel_per_ha       = max( 0 , fuel_lph / FCac )                       L/ha   ← floored, never capped

                    DBp · 3600 / 1000
overall_eff = ───────────────────────────────── × 100, clamped [0,100]   %
              FCth · fuel_per_ha · 35.5
```

> The document gives `SFC` in L/kW·h and stops there — it never converts to L/h or L/ha, so there
> is no DSS-intended multiplicand to recover. `fuel_lph = SFC·DBp` is preserved from the
> pre-existing implementation. `fuel_lph_pto_basis` — the reading dimensionally consistent with
> `X` — is computed alongside as a diagnostic and deliberately drives nothing.

Overall efficiency is a useful-work ratio: numerator `kW × 3600 s/h ÷ 1000 = MJ/h`; denominator
`ha/h × L/ha × MJ/L = MJ/h`. When `fuel_per_ha = 0`, overall efficiency is reported as 0 rather
than an invented value.

### K. Ballast

**Front — bisection on the ballast mass.** Target `Kwef = Rf/(Wt + BRf) ≥ 0.20`.

```
residual(BRf) = Rf(Wt + BRf·g) / (Wt + BRf·g) − 0.20
```

`Rf(·)` is the mode's own Eq. 3.5/3.6 balance **re-solved with the ballast added**, so the answer
cannot disagree with the axle loads reported elsewhere. The bracket expands geometrically from
5 000 kg; if the target is never bracketed the requirement is reported as unreachable rather than
quoted from the search ceiling. Returns `0` immediately when `Kwef` already meets the target.

> Supersedes DSS Eq. 3.7's implicit closed form, whose right-hand side saturates below its own
> ever-growing target for some geometries — making the target unreachable as an artefact of the
> equation rather than the physics. Both reference implementations solve it this way instead.
>
> **Modelling limitation:** ballast is added at the tractor CG, not ahead of the front axle, so
> only part of each added kilogram reaches the front wheels. Reported masses are therefore larger
> than a physical front-mounted weight would need to be. This is the reference behaviour.

**Rear — fixed point on `R'`.** Target slip 15 % by default.

```
R'  = D / μ'( s_target , Bn evaluated at W = R'/2 )      iterate to convergence

BRr = max( 0 , (R' − Rr) / g )                           [kg]
```

`R'` is the rear-axle load that develops the required pull at the target slip; the ballast is the
shortfall against the current load. `s_target` is 15 % by default; active-passive passes its
**solved** slip instead — DSS Eq. 5.12/5.13 is this same expression — so all three modes now share
one rear solver. No early return for slip already below target: `R'` then lands below `Rr` and the
`max()` yields 0 naturally.

> Supersedes DSS Eq. 3.8's moment-balance form, which disagreed with both references.

Two dead ends are possible: `μ' ≤ 0` at the target slip (the soil develops no net pull at any
rear-axle load), and a fixed point that does not settle in 200 iterations. Both mean *this
pairing is too heavy for this soil* — the verdict the DSS exists to deliver — so the solver
returns **no number plus the reason**, the caller raises it as a warning, and the rest of the
result set (draft, slip, power, fuel) survives as the evidence. `ballast_rear_required` is
`null` in that case; it is never fabricated, and it never means "none needed".


### L. Engine-torque pull limit — Eq. 3.4  `DSS-EXACT` transcription, `DSS-AMBIGUOUS` physics

```
Pet = F − MR = T·(ηt/100) / rr − ( ρr·Rr + ρf·Rf )       N
```

Computed only when the tractor record carries a torque figure. **Diagnostic only** — the document
introduces `Pet` but never states its role in the algorithm flow, and in particular never says it
caps the soil-limited pull `Pst`, so it does not constrain the slip solution.

> ⚠️ As written, the thrust term applies **engine** torque directly at the driving-wheel radius
> with no transmission gear reduction. A real tractor has roughly 25–40:1, so `T·ηt/rr` computed
> literally is about 30× too small and `Pet` comes out negative for every realistic tractor. The
> equation is implemented exactly as given — no gear ratio has been invented — so a non-positive
> `Pet` indicates the missing ratio, **not** an engine limitation. The engine emits a warning
> saying precisely this, and a separate warning for the genuine `0 < Pet < D` case.

---

## 4. Mode: `single` — DSS Section 3

`legacy_algorithms.calculate_legacy_performance`. Runs blocks A → L unchanged with one implement.
`calculation_mode = "dss_spec_v1"`.

---

## 5. Mode: `passive_passive` — DSS Section 4

`combi_algorithms.calculate_passive_passive_performance`.
`calculation_mode = "dss_spec_v1_passive_passive"`.

### Combined draft — Eq. 4.1  `DSS-EXACT`

```
D1, D2  = Eq. 3.1 applied to each tool independently (own F, A, B, C, W)
DTotal  = (1 − ki) · (D1 + D2)              ki ∈ [0.00, 0.25]
```

`DTotal` replaces `D` throughout the rest of the chain: axle loads, the slip-iteration
convergence target, `R'`, both ballast equations, drawbar power and fuel. `ki` outside its range
raises.

### Combining rules

The document states these in words but not as symbol-for-symbol formulas; both are documented at
their call sites rather than silently assumed.

```
Wi        = W1 + W2                                       combined implement weight, N
Xcgi_eff  = (W1·X1 + W2·X2) / (W1 + W2)                   weight-weighted CG from hitch, m
Py        = (Py/D)₁·D1 + (Py/D)₂·D2                       each tool's own ratio on its own draft, N
W_working = max(w1, w2)                                   working width for field capacity, m
```

Because `Σ(Wn·Xn) ≡ Wi·Xcgi_eff` by definition of a weight-weighted centroid, the individual tool
moments are represented **exactly** — collapsing the two tools into one introduces no
approximation in the axle balance.

`max(w1, w2)` is correct for two tools on one toolbar making a single pass.

> **`Py` is not scaled by `ki`.** The document gives no combining rule for the vertical reaction;
> reducing it would be an unsupported assumption.

### Consistency property

A passive-passive run with a null second tool and `ki = 0` reduces **exactly** to the single-
implement result — draft, axle loads, `Bn`, slip, `TE`, power, fuel and ballast. Pinned by
`test_passive_passive_reduces_exactly_to_the_single_implement_result`; it is the strongest
consistency check on the combi path.

### Diagnostic only: the Section 4 wheel numeric `Bn'`

```
Bn' = (b·d / W) · √( CI / (W/(b·d)) ) · (1 + b/(2·d))
```

Reported as `dss_section4_wheel_numeric`. **It drives nothing.**

A wheel numeric is dimensionless by definition. This expression is not:

| Term | Units |
|---|---|
| `b·d / W` | m²/kN — **not dimensionless** |
| `CI / (W/(b·d))` | kPa/kPa = 1 ✓ |
| `1 + b/(2d)` | 1 ✓ |

The product carries **m²/kN**. It scales as `W^−1.5` where a dimensionless group must scale as
`1/W`, so it collapses as load rises and drives the net traction coefficient negative. Evaluated
at `CI = 1500 kPa`, `b = 0.4 m`, `d = 1.5 m`:

| Wheel load `W` | `Bn` (§3) | `Bn'` (§4) | `μ(Bn', s=0.15)` |
|---|---|---|---|
| 1 000 N | 900.00 | 20.400 | +0.451 |
| 2 000 N | 450.00 | 7.212 | +0.139 |
| 6 890 N | 130.62 | 1.128 | **−0.894** |
| 15 000 N | 60.00 | 0.351 | **−2.954** |

Above roughly 2 kN per wheel — i.e. every realistic tractor — `μ < 0`, meaning no pull develops
at any slip. At the same load `Bn'` sits two orders of magnitude below `Bn`.

What is used instead is the Section 3 `Bn`, which is exactly the term appearing *under* `Bn'`'s
own square root, is what the Section 4 prose calls for ("the tractive-performance sub-model of
Section 3.4.5 applies unchanged, with `DTotal` in place of `D`"), and is the only physically
defensible reading — the wheel numeric describes the tyre–soil–load interaction of the driven
wheel and cannot depend on how many implements are being towed. The combination already enters
through the axle load `W`, which changes with `DTotal`.

**Do not wire `Bn'` back into the traction chain.** Pinned by
`test_section4_wheel_numeric_is_dimensionally_inconsistent`.

---

## 6. Mode: `active_passive` — DSS Section 5

`combi_algorithms.calculate_active_passive_performance`.
`calculation_mode = "dss_spec_v1_active_passive"`.

### Rotor sub-model  `DSS-EXACT`

```
Ta   = ηr · PPTO / V                        N        Eq. 5.2   rotor forward thrust
Deff = Dp + Da − Ta                         N        Eq. 5.1 / 5.3  effective draft
MPTO = 9550 · PPTO / N                      N·m      Eq. 5.4   PTO reaction moment
Weq  = MPTO / L                             N        Eq. 5.5   equivalent rear load
Rr*  = Rr + Weq + Fv                        N        Eq. 5.6 / 5.7a
```

> **Unit trap — `PPTO` has two different units in two equations.** In Eq. 5.2 it is **W** (with
> `V` in m/s, giving `Ta` in N); in Eq. 5.4 the `9550` constant fixes it as **kW** (with `N` in
> rpm). The document genuinely uses different units for the same symbol. The engine converts
> explicitly at each call site: `pto_power_draw_kw · 1000` for Eq. 5.2, raw kW for Eq. 5.4.

`ηr` outside 0.25–0.45 raises. `V = S/3.6` m/s.

`Deff ≤ 0` raises with an explanatory message: the rotor's forward thrust exceeds the combined
resistance of the passive tool and the rotor's own drag, so the configuration would require no
drawbar pull at all — reduce rotor PTO power or efficiency, or increase speed.

`Fv` is introduced by the document without a derivation formula (it is implicitly an
empirical/measured rotor-spec quantity); it defaults to 0.

### Combining rules

Passive tool + rotor unit are treated as one combination implement by the same shared Eq. 3.5
balance, with `extra_rear_load_n = Weq + Fv`:

```
Wi       = Wp + Wa
Xcgi_eff = (Wp·Xp + Wa·Xa) / (Wp + Wa)
Py       = (Py/D)passive · Dp            rotor contributes no passive vertical reaction
W_working = passive tool width           field capacity uses the passive tool only
```

### Power  `DSS-EXACT`

Blocks E–J run with `Deff` in place of `D`, and `PPTO = rotor.pto_power_draw_kw`:

```
Put  = (Ptr + PPTO) / (Pt·(1 − fs/100)) × 100         Eq. 5.14
Xeff = (Ptr + PPTO) / Pt                              Eq. 5.15  → feeds SFC
```

Both the drawbar-equivalent power and the directly-delivered PTO power count, because both come
from the same engine.

### Ballast — Section 5 closed forms  `DSS-EXACT`

Unlike the implicit Eq. 3.7 reused elsewhere, ballast adds **directly** to `Rf` here:

```
Front  Eq. 5.10/5.11:   Rf = 0.20·(Wt + BRf)   ⟹   BRf = (0.20·Wt − Rf) / 0.80      N
Rear   Eq. 5.12/5.13:   Rreq = Deff / μ(S)         BRr  = Rreq − Rr                  N
```

Both reported as `max(0, ·)/g` in kg. A negative `BRr` means the rotor's thrust and PTO reaction
moment already supply sufficient rear loading; it is reported as 0 with a note, per the
document's own commentary.

### Diagnostics — Section 5.9

```
Pr = 2·π·N·T / 60 / 1000        kW      rotor mechanical power
Fr = Pr · 1000 / V              N       rotor equivalent horizontal force
```

> **These are an identity, not an independent cross-check.** The document presents them as an
> alternate torque-based route to the same thrust term `Ta`, intended for an *independently
> measured* rotor shaft torque. The engine has no measured-torque input, so it passes `T = MPTO`
> — which was itself derived from `PPTO` and `N` via the same 9550 relation. The result therefore
> reproduces `PPTO` by construction. Genuine diagnostic value requires a real measured torque.

---

## 7. Mode comparison

| Block | `single` | `passive_passive` | `active_passive` |
|---|---|---|---|
| Draft | `D` (Eq. 3.1) | `DTotal = (1−ki)(D1+D2)` | `Deff = Dp + Da − Ta` |
| Draft applications | 1 | 2 (independent) | 1 passive + rotor model |
| `Py` | `(Py/D)·D` | `Σ (Py/D)ᵢ·Dᵢ` | `(Py/D)·Dp` |
| Implement weight | `Wm` | `W1 + W2` | `Wp + Wa` |
| CG from hitch | `Xcgi` | weight-weighted | weight-weighted |
| Axle balance | Eq. 3.5/3.6 | Eq. 3.5/3.6 | Eq. 3.5/3.6 + `Weq + Fv` |
| Wheel numeric | Section 3 `Bn` | Section 3 `Bn` (+ `Bn'` diagnostic) | Section 3 `Bn` |
| Traction chain | Eq. 3.2 / 3.9 | identical | identical |
| `PPTO` in `Put`/`X` | 0 | 0 | rotor draw |
| Working width | implement `W` | `max(w1, w2)` | passive tool width |
| Front ballast | shared bisection on the mode's own axle balance | *(same)* | *(same)* |
| Rear ballast | shared `R'` fixed point, target 15 % | *(same)* | *(same)*, target = **solved slip** |

**One wheel-numeric model, everywhere.** What differs between modes is the *axle load* `Bn` is
evaluated at, not the formula.

---

## 8. Classification tables

### Power utilization — DSS "Check Put value"  `DSS-EXACT`

| `Put` | Load status |
|---|---|
| `< 95 %` | Tractor is Underloaded |
| `95 – 100 %` | Tractor is properly loaded |
| `> 100 %` | Tractor is Overloaded |

> `Put > 100 %` is a legitimate DSS result and drives the overload status. The frontend caps only
> the *displayed* percentage at 100 %; the true value is what feeds status and tone.

### Simulation status  `LEGACY` — advisory UI text, not part of the DSS derivation

Evaluated top-down; first match wins.

| Condition | Status |
|---|---|
| not compatible | Not Recommended |
| not converged, or `S% ≥ 20` | Unstable |
| `S% > 15` or `Put > 85 %` or `FE < 65 %` | Heavy Load |
| otherwise | Stable |

### Confidence  `LEGACY`

| Condition | Confidence |
|---|---|
| validation errors, incompatible, not converged, or `S% ≥ 20` | Low |
| `S% < 8` or `S% > 15` | Moderate |
| otherwise | High |

### Recommendations  `LEGACY`

Accumulated, de-duplicated, joined with `"; "`.

| Trigger | Recommendation(s) |
|---|---|
| `S% > 15` | Reduce operating depth; Add ballast |
| `Put > 90 %` | Reduce implement width; Increase tractor HP |
| `TE < 60 %` | Reduce operating speed |
| `fuel_per_ha > 45` | Reduce operating depth |
| none of the above | Operate within the recommended slip and power ranges |

---

## 8b. Reconciliation against the reference implementations

Compared clause-by-clause against `docs/tillage_dss (2).html` (a complete JS port of this engine)
and `docs/Tractor_Implement_Performance_Calculator Updated.xlsx` (a single-point calculator with
live formulas). Both were driven with their own input columns and compared numerically.

**Result: exact parity — 0 mismatches, worst relative deviation 0.000e+00** on every shared
quantity, in both harnesses.

### Corroborated (previously carried as our own assumptions)

| Item | Evidence |
|---|---|
| Eq. 3.1 has **no `/10`** on depth | xlsx `C43 = C6*(C7+C8*C18+C9*(C18^2))*C14*(C13)`; the HTML says so in a comment |
| Slip exponent **7.5**, not the document's 0.3 | xlsx `C58` uses `EXP(-7.5*C55)`; HTML `TRACTION_SLIP_EXPONENT_COEFF: 7.5` |
| Eq. 3.5/3.6 axle balance in **all three modes** | xlsx `C48` is Eq. 3.5 verbatim; HTML `combinedAxleLoad` identical |
| `Bn = CI·b·d/W` with **no shape factor** | HTML defaults its `legacyShapeFactor` off, and its own hint calls our form "the audited reference engine" |
| Per-wheel load = axle/2 | xlsx `C50`, `C51` |
| Front **and** rear motion resistance `ρf`, `ρr` | xlsx `C54`, `C56`. **The HTML omits these entirely — our engine matches the spreadsheet, the more complete of the two** |
| `fuel L/h = SFC · DBp` | xlsx `C65`. Previously tagged `DSS-AMBIGUOUS`/`LEGACY`; now corroborated |
| Field-efficiency clamp [50, 95] | xlsx `C73 = MIN(MAX(…,50),95)` |

### Residual divergences — deliberate

Where the two references contradict each other, or where this engine is the more correct of the
three, the engine was **not** changed:

| Item | Ours / HTML | xlsx | Why ours stands |
|---|---|---|---|
| Turning time | `t_turn · 2 · N_turns` | `N_turns · t_turn` | The ×2 counts both headlands; the HTML agrees with us |
| `Kwef` basis | `Rf / Wt` | `Rf / (Rr + Rf)` | The HTML's front-ballast solver uses the `Rf/Wt` basis, so the sheet is the outlier |
| `Fi` | per (implement type × texture), ASABE D497 Table 1 | one user-entered value | The HTML hardcodes only the MB-plough row (1.0/0.7/0.45) for *every* implement — less accurate |
| Turning-time clamp [8, 45] s | clamped | unclamped | HTML agrees with us |
| Slip | iterated per §3.4.6 | fixed `s = 0.02` | The spreadsheet is a single-point calculator, not an iterating engine |
| `Pet` engine-torque diagnostic | present | absent | Already documented as diagnostic-only |
| Rear-ballast fixed-point tolerance | 1×10⁻⁴ N | HTML 1×10⁻³ N | Ours is tighter; agreement is limited to ~1e-8 relative by this alone |

### Defect found in the reference spreadsheet

The spreadsheet's tyre input block (`C29`–`C36`) is **shifted by one row**: every tyre cell holds
the value belonging to the row above it, and the true front diameter (513.59 mm) is absent
entirely. Cross-checked against the same tractor's record in the HTML library:

| Sheet cell | Value | Actually is |
|---|---|---|
| `C29` front diameter | 127 | front **section width** |
| `C30` front section width | 237.74 | front static loaded radius |
| `C31` front static loaded radius | 245.01 | front **rolling radius** |
| `C32` front rolling radius | 789.43 | **rear** diameter |
| `C34` rear diameter | 203.2 | rear section width |
| `C35` rear section width | 364.24 | rear static loaded radius |
| `C36` rear static loaded radius | 375.85 | rear rolling radius |

The cells are also labelled "m" while holding millimetres. Consequently the sheet's own `Bn`
(≈4.5×10⁷), motion-resistance, TE, power and fuel outputs are not physically meaningful. This is a
data-entry fault in the reference, **not** a formula disagreement — formula parity is exact, and
this engine is unaffected because it reads tyre dimensions from the database with an explicit
mm→m conversion.


### 8b.4 Corrections made after end-to-end verification against the references

| # | Defect | Fix |
|---|---|---|
| 1 | `TE` divided by the Brixius envelope `μg` instead of `GT` at the operating slip — understating TE ~3×, removing its optimum, and inflating power utilisation (the headline verdict) by the same factor | `gross_traction_at_slip`; `bn_rear` is now a **required** keyword arg so the envelope cannot be passed silently. TE now 68–80% (published range 65–75% drawbar/PTO); reproduces the ~10 kW-per-plough-bottom rule |
| 2 | Eq. 3.1's `W` treated as metres for cultivators, where D497 tabulates per tool — draft size-independent at 505 N/m, and `Deff ≤ 0` failed **every** cultivator + rotavator run on **every** tractor | `Implement.number_of_tools` + `draft_width_parameter`; draft/m now a consistent ~2070 N/m |
| 3 | Front lift raised an opaque 422 on 241 of 1,573 pairings, refusing the very question the DSS exists to answer | `resolve_axle_loads` fits the minimum stabilising front ballast and returns a normal result. Sweep now has **0** hard failures |
| 4 | `field_length` was required by the API and never used; an area inconsistent with L×W was silently accepted | area is derived from `L×W` when both are known, as the reference does |
| 5 | Library tyre `overall_diameter` held the **rim** diameter; `cg_distance_from_rear` disagreed with each tractor's own axle weights by 13–52% | corrected in the seed **and** in a data migration; all 11 tractors now satisfy `Xcgt = Wf·L/(Wf+Wr)` exactly |
| 6 | The audited A/B/C and Py/D values never reached deployed databases — `seed_library_if_empty` only inserts into an *empty* catalogue, so all 13 passive implements still held the original placeholders (a 9-tine cultivator produced 72,675 N instead of ~6,350 N) | data migration `l7m8n9o0p1q2` syncs them by implement type |
| 7 | `pto_power > 10 kW` validation rejected the catalogue's own 6.6 kW tractor, so every simulation against it 422'd | floor lowered to `PTO_POWER_MIN_KW = 5.0`, covering Indian power tillers |

Items 1 and 2 are **deliberate divergences** from both references, which share both defects.

---


## 9. Accuracy and limitations

**These formulas are faithfully transcribed. They are not field-validated.**

| Aspect | Status |
|---|---|
| Formula fidelity to the DSS document | High — asserted symbol-for-symbol by `tests/test_dss_shared.py`, `test_legacy_algorithms.py`, `test_combi_algorithms.py` |
| Internal consistency | High — combi reduces exactly to single; weight conservation `Rr + Rf = Wt + Wi + Py` holds across the sweep |
| Calibration against real equipment | **None.** The library catalogue is placeholder data (`seed_library.py`: *"REPRESENTATIVE PLACEHOLDER catalogue data… Calibrate against real equipment data sheets before relying on absolute results"*) |
| Validation against field trials | **None.** No field-trial dataset exists anywhere in the repository |

Known open items, in order of impact on absolute accuracy:

1. **The seeded ASAE `A`/`B`/`C` parameters are placeholders** and multiply the draft directly —
   the largest single uncalibrated term now that `F` is cited to ASABE D497. Replace them with
   real implement data sheets before trusting absolute magnitudes.
2. **The slip exponent is 7.5, not the document's literal 0.3** — a deliberate, documented
   correction without which no mode converges.
3. **Fuel L/h basis is `LEGACY`** — the document stops at L/kW·h and specifies no conversion.
4. **Field capacity below `FCth` is entirely `LEGACY`** — turning time, actual capacity and the
   50–95 % efficiency clamp are absent from the document.
5. **`Pet` omits the transmission gear ratio** and is diagnostic-only for that reason.
6. **Equal wheel loading (`W = axle/2`)** is assumed on both axles.
7. **`ef = 0.1·rf`** is applied by symmetry; the document states 0.1 only for `er`.

Treat outputs as **directionally reliable for comparing configurations**, and as **uncalibrated
in absolute magnitude** until equipment data and field measurements are supplied.

---

## 10. Source map

| Block | Function | File |
|---|---|---|
| A Draft | `draft_force_n` | `dss_shared.py` |
| B Geometry | `geometry_terms` | `dss_shared.py` |
| C `Py/D`, `F` | `py_over_d_ratio`, `fi_factor` | `legacy_algorithms.py` |
| D Axle loads | `dynamic_axle_loads`, `_combined_axle_load_shared` | `legacy_algorithms.py`, `combi_algorithms.py` |
| E Wheel numeric | `mobility_number` | `legacy_algorithms.py` |
| F Rolling resistance | `rolling_resistance_rear/front`, `wheel_response` | `legacy_algorithms.py` |
| G Traction | `gross_traction_ratio`, `net_traction_coefficient`, `traction_efficiency_percent` | `legacy_algorithms.py` |
| H Slip | `solve_slip` | `legacy_algorithms.py` |
| I Field capacity | `field_capacity` | `dss_shared.py` |
| J Power / fuel | `power_and_fuel`, `specific_fuel_consumption_l_per_kwh` | `dss_shared.py` |
| K Ballast | `front_ballast_required_kg`, `rear_ballast_required_kg` | `legacy_algorithms.py` |
| L `Pet` | `engine_torque_limited_pull_n` | `legacy_algorithms.py` |
| §5 Combined draft | `combined_draft_n` | `combi_algorithms.py` |
| §5 `Bn'` diagnostic | `mobility_number_passive_passive` | `combi_algorithms.py` |
| §6 Rotor | `rotor_thrust_n`, `effective_draft_n`, `pto_reaction_moment_nm`, `pto_equivalent_rear_load_n` | `combi_algorithms.py` |
| §6 Rotor diagnostics | `rotor_mechanical_power_kw`, `rotor_equivalent_force_n` | `combi_algorithms.py` |
| §8 Status tables | `put_load_status`, `derive_simulation_status`, `derive_confidence`, `build_recommendations` | `dss_shared.py`, `engineering_validation.py` |
| Constants | — | `constants.py` |
| Guards | `require_positive`, `require_finite`, `safe_div`, `safe_sqrt`, `clamp` | `dss_shared.py`, `engineering_validation.py` |
