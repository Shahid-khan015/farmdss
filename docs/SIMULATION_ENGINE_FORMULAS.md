# Simulation Engine — DSS Formula Audit

Authoritative map from `docs/Simulation for DSS _Sahid.docx` (the **primary and
authoritative reference**) to the code in `backend/app/core/`.

| Module | Scope |
|---|---|
| `dss_shared.py` | Primitives common to all three modes + numerical-safety guards |
| `legacy_algorithms.py` | DSS **Section 3** — single conventional implement |
| `combi_algorithms.py` | DSS **Section 4** (passive-passive) and **Section 5** (active-passive) |
| `constants.py` | Every magic number, each tagged with its provenance |
| `engineering_validation.py` | Range checks, advisory status/recommendation text |
| `performance_calculator.py` | Adapter from `PerformanceInputs` onto the Section 3 engine |

## Classification vocabulary

| Tag | Meaning |
|---|---|
| **DSS-EXACT** | Transcribed verbatim from the document (equation image or text) |
| **DSS-AMBIGUOUS** | The document is silent, internally contradictory, or gives a value that cannot be used as written; the resolution is stated explicitly below |
| **IMPLEMENTATION-ASSUMPTION** | A choice the implementation had to make that the document does not cover (solver method, unit split, loop bound) |
| **LEGACY** | Carried over unchanged from the pre-existing codebase; not in the document |
| **EXTERNAL-MODEL** | Sourced from a named external standard the document cites |

**Source extraction note.** The document's equations are embedded objects, not
text: Sections 4–5 as PNGs (`image15`–`image49`) and Section 3 as WMF/OLE objects
(`image1`–`image14`). The WMF renderer garbles them, so the Section 3 equations
were recovered by parsing the WMF `ExtTextOut` records directly (glyph + x/y
position). Image numbers cited below are those internal names.

---

## A. Section 3 — single implement (`legacy_algorithms.py`)

### A1. Draft force — **DSS-EXACT** ⚠️ *corrected*
```
D = F * (A + B*S + C*S²) * W * T                          [image: OMML in body text]
```
`D` N · `A,B,C` ASAE implement parameters · `S` km/h · `W` m · `T` cm.
There is **no divisor on T** — the units above are what balance the equation.
Implemented once, in `dss_shared.draft_force_n`; all three modes call it.

**Correction (supersedes the earlier reading).** This file previously recorded the
equation as `... * W * (T/10)` and asserted the `/10` was "a genuine denominator in
the source markup". That was wrong. The user supplied the equation directly from the
document as `D = F{A + B(S) + C(S)²}WT`, and three independent checks agree:

1. It is exactly **ASABE D497** (`D = F_i[A + B·S + C·S²]·W·T`, `W` m, `T` cm, `D` N).
2. `tests/test_dss_shared.py` pins the equation using `A=652, B=0, C=5.1, F=0.70` —
   the D497 Table 1 moldboard row and its medium-texture `F₂`. Under D497 a 2 m plough
   at 15 cm needs ≈15.4 kN; with the `/10` the engine returned 1.5 kN.
3. The seeded ASAE parameters are the same order of magnitude as the real D497
   constants — they were never inflated to compensate for a divisor.

The defect was systemic, not a scale factor. Draft 10× too small meant the slip solver
converged on its first 2 % trial step for every realistic input, pinning tractive
efficiency near 10 % (real tillage is 50–75 %) and reporting "Underloaded" for every
tractor/implement pairing — the DSS could not perform matching at all. With the
correction, slip spans 4–19 %, TE 24–57 %, and power utilization separates a 17 kW
tractor (overloaded) from a 40 kW one (headroom) on the same implement.

`F` (soil-texture factor) — **REFERENCE-ALIGNED** 🔧 *revised*. One global value per soil
texture, applied to every implement: **Fine 1.00, Medium 0.70, Coarse 0.45**
(`constants.FI_FACTOR_BY_TEXTURE`). The DSS document names the texture classes without
tabulating them, so the authority here is the reference stack: the spreadsheet's
"tractor and implement data" sheet, cells **D50:F53** — a three-row Soil Type/Fi table
with **no implement dimension** — and `tillage_dss.html`, which hard-codes the same
three values in its texture selector.

This is a **deliberate departure from ASABE D497**, and the direction matters. D497
Table 1 carries its own `F₁/F₂/F₃` on each implement row (disc plough and disc harrow
1.0/0.88/0.78, cultivator 1.0/0.85/0.65); the three values above are specifically its
**moldboard-plough row**, generalised to every tool. The spreadsheet's own `A`/`B`/`C`
are per-implement D497 rows, so the workbook was read from that table row by row and
took `F` from one row only.

Applying it everywhere understates draft on non-moldboard tools in non-fine soil:
draft ×0.795 (disc, medium), **×0.577** (disc, coarse), ×0.824 and ×0.692 (cultivator,
medium/coarse). Downstream on a disc harrow in coarse soil: draft −42.3 %, slip −44.9 %,
power utilisation −36.4 %, fuel/ha −29.5 %. **MB Plough is unaffected in every texture,
and fine soil is unaffected for every implement.** Adopted by explicit decision, trading
D497 fidelity for agreement with the spreadsheet and the HTML tool.

`implement_type` no longer selects the value but is still validated: `fi_factor` rejects
PTO-powered types outright. That guard used to fall out of the per-implement table having
no active rows; a global table has no such row to be missing, so it is now an explicit
`is_passive` check. Pinned by `test_fi_factor_raises_value_error_for_active_types`, and
the values by `test_fi_soil_texture_factor_is_global` (all 12 implement × texture
combinations), `test_fi_is_global_and_matches_the_reference_stack`, and
`test_fi_is_applied_identically_in_all_three_modes`.

`W` (the width term) — **EXTERNAL-MODEL (ASABE D497 Table 1)** 🔧 *revised*.
D497 does not use one unit for `W`. Full-width tools (mouldboard/disc ploughs, disc
harrows) take the working width in **metres**; tined implements are tabulated **per
tool**, so `W` is the **number of tools**. `A = 32, B = 1.9, C = 0` is D497's
secondary-tillage field cultivator, a per-tool row.
`legacy_algorithms.draft_width_parameter` / `constants.DRAFT_WIDTH_IS_TOOL_COUNT`,
sourced from `Implement.number_of_tools`.

Reading a cultivator's `W` as metres gives **505 N/m at every size** — the width
cancels, so the number carries no information — against ~1975 N/m for a disc plough
and ~4050 N/m for a disc harrow. It also dropped a 9-tine cultivator's draft (606 N)
below a rotavator's forward thrust (1296 N), making `Deff` non-positive and failing
**every cultivator + rotavator active-passive run on every tractor**. Per-tool gives a
consistent ~2070 N/m across sizes, and the reference cultivator widths independently
corroborate it: they imply a 241–244 mm tine spacing, textbook for a field cultivator.

Only Eq. 3.1 is affected — field capacity, turning time and swath always use metres.

**A missing `number_of_tools` raises; it does not fall back to metres.** An earlier
revision did fall back so that rows predating the column kept running. The result is
not merely understated but meaningless: for a 9-tine cultivator behind a rotavator at
12 cm / 4 km/h the substitution takes draft from 2759 N to **12.6 N (219× low)**,
because in active-passive the understated passive draft is very nearly cancelled by
the rotor's forward thrust (`Deff = Dp + Da − Ta`). The run then *succeeds* and reports
a plausible "Underloaded" verdict built on ~zero draft. A refused answer beats a wrong
one that looks right. `routes/simulations._require_implement_fields` gates it before
dispatch (conditionally, via `draft_width_is_tool_count`) so the 422 names the field.
Pinned by `test_draft_width_rejects_a_missing_tool_count` and
`test_missing_tool_count_would_have_nearly_cancelled_active_draft`.

> ⚠️ **Deliberate divergence from both reference implementations**, which use metres
> for every implement class.

### A2. Vertical soil reaction — **EXTERNAL-MODEL** ⚠️ *corrected*
```
Py = ratio * D
ratio: Implement.vertical_horizontal_ratio, else per-type fallback:
       MB Plough 0.20 · Disc Plough 0 · Disc Harrow 0 · Cultivator 0.20
```
Both reference implementations carry `Py/D` as a **per-implement input** — the spreadsheet's
"Vertical to Horizontal Ratio" cell (`C17`, with `C44 = C17*C43`) and the HTML library's `PyD`
field — not as a per-type constant. The engine reads the implement's own column first and falls
back to the table only when it is null.

Supersedes `MB 0.15 / Disc Plough 0.40 / Disc Harrow 0.50 / Cultivator 0`, attributed to
Kepner et al. 1978 via the DSS document. Those values disagree with **both** references on every
row — nearly inverted for the disc tools and the cultivator — and materially changed the axle-load
split. The `Implement.vertical_horizontal_ratio` column already existed and was threaded into
`LegacyInputs` but ignored; it is now the primary source.

### A3. Depth of draft action and wheel eccentricity
```
Yd = (2/3) * Td            [DSS-EXACT, image6 — the document calls it "assumed"]
er = 0.1 * rr              [DSS-EXACT, Liljedahl et al. 1996]
ef = 0.1 * rf              [IMPLEMENTATION-ASSUMPTION — 0.1 is stated only for er]
```

### A4. Dynamic axle loads — **DSS-EXACT** (`image4`, `image5`)
```
Rr = [(Wm+Py)(Xcgi+Hd+L+ef) + Wt(L+ef−Xcgt) − D*Yd] / (L − er + ef)   (Eq. 3.5)
Rf = (Wt + Wm + Py) − Rr                                              (Eq. 3.6)
```

**Front lift is answered, not refused** 🔧 *revised*
(`legacy_algorithms.resolve_axle_loads`, used by all three modes.)

A non-positive `Rf` means the draft has lifted the front end. The engine used to
raise `ValueError("Invalid load distribution: dynamic axle load became
non-positive")`, which surfaced as an opaque 422 on **241 of 1,573** catalogue
pairings. But that is precisely the condition the DSS exists to advise on, and
the engine already owns the solver: most such pairings become driveable with
modest front ballast (Captain DI 2600 + 5-bottom MB needs 200 kg; Mitsubishi
MT 180 D + 5-bottom needs 900 kg).

The resolver now fits the minimum front ballast that restores the `Kwef = 0.20`
steering-weight target, re-solves the same Eq. 3.5/3.6 balance with it, and
returns a normal result carrying:

| key | meaning |
|---|---|
| `stabilising_front_ballast_kg` | ballast fitted; `0.0` when none was needed |
| `infeasible_without_ballast` | `True` when the figures are conditional on it |

plus an explicit warning. It still raises only when **no** finite ballast reaches
the target, and a non-positive **rear** load still raises unconditionally — front
ballast moves load *off* the driven axle, so rear lift is genuinely not rescuable.

After this change the full 1,573-pairing sweep has **zero** hard failures.

### A5. Wheel numeric (mobility number) — **DSS-EXACT** ⚠️ *corrected*
```
Bn = CI * b * d / Wd                                                  [image7]
```
`CI` kPa · `b`, `d` m · `Wd` **kN**, the dynamic load on one *tire*.

> **Correction (this revision).** The engine previously computed
> `Bn = (CI·b·d/W) · 1/(1 + 3b/d)`, described in an earlier audit as an
> "expert-validated" third formula. That shape factor **does not appear in the
> DSS document**, which gives the single-term expression above. It has been
> removed. At the reference case (CI = 1200 kPa, b = 0.34 m, d = 1.30 m,
> W = 6.89 kN) `Bn` moves **43.1 → 77.0**, still well inside the usable ~5–80
> band, so convergence behaviour is unaffected — but every traction-downstream
> output shifts. See "Output impact" at the end.

Unit note — **IMPLEMENTATION-ASSUMPTION**: `Wd` in kN is forced by the equation
(`CI[kPa]·b·d[m²]` is kN, so the quotient is only dimensionless with `W` in kN).
Callers pass `W = axle load / 2`; the document specifies a per-tire load without
saying how to split the axle.

**Scope**: this Section 3 `Bn` governs the driven rear wheel in the single and
active-passive modes, **and the undriven front wheel in all three modes** (A6).

### A6. Rolling resistance — **DSS-EXACT** (`image7`, `image8`)
```
ρr = 1/Bn + 0.04 + 0.5*s/√Bn      (rear, driven — s = slip fraction)
ρf = 1/Bn + 0.04                  (front, undriven — no slip term)
```
`image8` states explicitly that `ρf`'s `Bn` uses the **front** cone index, tire
width, tire diameter and front dynamic load. This is why `legacy_algorithms.wheel_response`
hard-wires the front model to A5 and accepts no wheel-numeric callable.

### A7. Traction coefficients
```
μg = 0.88 * (1 − e^(−0.1·Bn))                             [DSS-EXACT, image25]
μ  = μg*(1 − e^(−k·S)) − 1/Bn − 0.5*S/√Bn                 [see below]
```
`image12` gives Eq. 3.9's `μ′` specialised to S = 0.15. Recovering its glyphs
yields `0.88(1−e^(−0.1·Bn))(1−e^(−0.3×0.15)) − 1/Bn − 0.5×0.15/√Bn`. The absence
of the usual `+0.04`/`−0.04` pair confirms this is a **net** traction ratio (the
two cancel), so the generalisation to arbitrary `S` above is sound.

**`k = 7.5` — DSS-AMBIGUOUS → IMPLEMENTATION-ASSUMPTION.** The document literally
shows `0.3`. Implemented literally, `μ ≈ 0.017` at 15 % slip, so the slip solver
never converges for any realistic tractor **in any of the three modes**. `7.5` is
the standard Wismer-Luth/Brixius value and yields physically realistic curves.
Confirmed with the user as a corrected transcription. Defined once, in
`constants.TRACTION_SLIP_EXPONENT_COEFF`.

### A8. Slip iteration — **DSS-EXACT** (with one bound assumed)
```
Pst(S) = μ(S) * Rr                                        [DSS-EXACT, image27]
Start S = 2 %, step 0.1 %, stop when Pst ≥ D              [DSS-EXACT, §3.4.6 text]
Hard cap S = 20 %                                         [IMPLEMENTATION-ASSUMPTION]

On convergence, interpolate between the last two grid points:  [EXTERNAL-MODEL]
  S = S_prev + (D − Pst_prev)·(S_step − S_prev)/(Pst_step − Pst_prev)
  then re-evaluate μ and Pst at S
```
The document gives no upper bound; without one an infeasible pull loops forever.
Hitting the cap sets `converged = False` and emits a warning — it never
fabricates a result.

The interpolation follows the reference implementation's `solveSlip`. The stepped
value is the first 0.1 % increment at which pull exceeds draft, so it overstates
slip by up to one full step; interpolating recovers the slip at which `Pst == D`.
`μ` and `pull_n` are re-evaluated there, so the solution stays self-consistent, and
every downstream quantity (TE, power, fuel, ballast, status) uses the interpolated
value. The stepped value is still reported as the `slip_stepped` diagnostic, so the
§3.4.6 schedule remains auditable.

### A9. Tractive efficiency — **DSS-EXACT** formula, denominator corrected 🔧 *revised*
```
TE = μ*(1−S) / GT                                          (Eq. 3.2, image1)
GT = 0.88*(1 − e^(−0.1·Bn))*(1 − e^(−7.5·S)) + 0.04        (Brixius 1987)
```
`legacy_algorithms.gross_traction_at_slip` / `traction_efficiency_percent`.

**The formula is unchanged; what it was fed was wrong.** The implementation bound
the denominator to `gross_traction_ratio(Bn) = 0.88(1 − e^(−0.1·Bn))`, which is the
Brixius **envelope** — the ceiling `GT` approaches as slip grows — not the gross
traction ratio developed at the operating slip.

The model identification is not in doubt: our `μ` equals Brixius `GT − MR` exactly,
where `MR = 0.04 + 1/Bn + 0.5·S/√Bn` (the two `0.04` terms cancel, which is why the
engine's `μ` has no constant). That fixes what `GT` must be.

Consequences of the old denominator:
- TE understated ~3× at working slip (26% where the correct value is 75%);
- TE became **monotonic in slip**, so no optimum existed — a tractor-matching DSS
  could not identify a best operating slip;
- since `Ptr = DBp/(TE·ηt)`, power utilisation was inflated by the same factor,
  which is the DSS's headline Overloaded / properly-loaded / Underloaded verdict.

Evidence for the correction: TE now lands at 68–80% (mean 68.4% over the full
catalogue), matching published drawbar-to-PTO ratios of ~65–75% in field
conditions; the old form implied 38.5%, worse than a tracked vehicle in mud. And
at 5 km/h / 20 cm the corrected engine reproduces the standard ~10 kW-per-plough-
bottom rule (17 kW→2-bottom, 29 kW→3-bottom, 40 kW→4-bottom), which the old form
did not — it called a 40 kW tractor overloaded on a 3-bottom plough.

> ⚠️ **Deliberate divergence from both reference implementations.** Both share this
> defect (xlsx `C59 = (C58*(1-C55))/C57`; `tillage_dss.html` `tractiveEfficiencyPct`).
> The HTML's own tooltip defines TE as "ratio of drawbar to axle power delivered" —
> the correct definition, which its formula does not compute.
>
> `bn_rear` is a **required keyword argument** on `traction_efficiency_percent` so
> the envelope can never again be passed in silently. Pinned by
> `test_tractive_efficiency_uses_gross_traction_at_slip_not_the_envelope` and
> `test_tractive_efficiency_peaks_at_a_working_slip`.

### A10. Maximum pull from engine torque (Pet) — **DSS-EXACT** formula ✨ *new*
```
Pet = F − MR = T*ηea/r − (ρr*Rr + ρf*Rf)                  (Eq. 3.4, image2)
```
Recovered from the WMF records; previously unimplemented. Reported as
`engine_torque_limited_pull` when the tractor record carries `max_engine_torque`,
`None` otherwise.

**It does not cap `Pst`** — the document introduces Pet but never states its role
in the algorithm flow, so imposing one would be inventing control logic. This is a
deliberate, documented restraint.

> ⚠️ **Missing gear ratio — DSS-AMBIGUOUS, discovered during this revision.**
> The thrust term applies **engine** torque directly at the driving-wheel radius
> with no transmission reduction between them (`T` is defined as "engine torque",
> `r` as "rolling radius of driving wheel"). A real tractor has a total reduction
> of roughly 25–40:1, so `T·ηea/r` computed literally is ~30× too small: for a
> 45 kW / 180 N·m tractor it gives ≈267 N of thrust against ≈1500 N of motion
> resistance, i.e. **Pet is negative for every realistic tractor**.
>
> No gear ratio has been invented — the equation is implemented exactly as given.
> Instead the two cases are reported distinctly (`_engine_torque_warnings`):
> `Pet ≤ 0` warns that the value is a **formula artefact of the missing ratio**
> and explicitly not an engine limitation; `0 < Pet < D` gives the genuine
> "engine is the binding constraint" message. Concluding the latter from a
> negative Pet would be a false inference from a known-incomplete formula.
>
> Resolving this needs either a gear-ratio input or confirmation that `T` was
> meant as *axle* torque.

### A11. Ballast — ⚠️ *replaced by the reference method*
```
Kwef = Rf / Wt, target 0.20                               [DSS-EXACT, image21]

Front — bisection on the ballast mass:
  residual(BRf) = Rf(Wt + BRf·g) / (Wt + BRf·g) − 0.20
  where Rf(·) is this mode's own Eq. 3.5/3.6 balance, re-solved with the
  ballast added. Bracket expands geometrically from 5000 kg.

Rear — fixed point on R', then the shortfall:
  R'  = D / μ'(s_target, Bn evaluated at W = R'/2)
  BRr = max(0, (R' − Rr) / g)
  s_target = 15% by default; active-passive passes its *solved* slip.
```
Both forms come from the reference implementations, which the engine was
reconciled against. They replace the document's Eq. 3.7 (front, implicit) and
Eq. 3.8 (rear, moment balance):

- **Eq. 3.7's** right-hand side saturates below its own ever-growing target for
  some geometries, making the target unreachable as an artefact of the equation
  rather than the physics. Re-solving the actual balance removes that failure mode
  and cannot disagree with the axle loads reported elsewhere.
- **Eq. 3.8's** moment form disagreed with both references; the shortfall form is
  what both compute.

A consequence worth recording: DSS Eq. 5.12/5.13 (active-passive) *is* the rear
shortfall form, differing only in target slip, and Eq. 5.10/5.11's front closed
form is subsumed by the shared bisection. All three modes therefore now share one
front and one rear solver, and the Section 5 special cases were deleted.

**Modelling limitation:** ballast is added at the tractor CG rather than ahead of
the front axle, so only part of each added kilogram reaches the front wheels and
reported front masses are larger than a physical front weight would need to be.
This is the reference behaviour, adopted deliberately.

Solution methods remain **IMPLEMENTATION-ASSUMPTION** — the references give the
algorithms, the document gives neither.

The rear solver has two dead ends: `μ' ≤ 0` at the target slip (the soil develops
no net pull at any rear-axle load), and a fixed point that does not settle. Both
mean "this pairing is too heavy for this soil" — the verdict the DSS exists to
deliver — so `rear_ballast_required_kg` returns `(None, reason)` and the caller
raises it as a warning, keeping draft/slip/power/fuel as the evidence. It
previously raised, discarding the whole result set for exactly the pairings that
most needed explaining. The number is still never fabricated. The front solver
returns `(None, False)` on the same principle.

### A12. Power — **DSS-EXACT**
```
DBp = D * S                                               (Eq. 3.4,  image: text)
Ptr = DBp / (TE * ηt)                                     (Eq. 3.11, image13)
Put = Ptr / (Pt*(1−fs)) * 100                             (Eq. 3.12, image14)
```

### A13. `Put` status table — **DSS-EXACT**
95–100 % → properly loaded · < 95 % → underloaded · > 100 % → overloaded.

### A14. Fuel — **DSS-EXACT** equation, **DSS-AMBIGUOUS** application
```
X   = Ptr / Pt                                                        [DSS-EXACT*]
SFC = 2.64X + 3.91 − 0.203*√(738X + 173)   [L/kW·h]       [DSS-EXACT, image30]
                                            (ASABE 2001 — EXTERNAL-MODEL)
```
\* `X` is never defined for Sections 3/4. It follows from Section 5's
`Xeff = (Ptr + PPTO)/Pt` (`image48`) under the document's own statement that
"Section 4's equations are the special case of Section 5's obtained by setting
PPTO = 0". That limit gives exactly `Ptr/Pt`.

**Fuel L/h basis — DSS-AMBIGUOUS / LEGACY, deliberately unchanged:**
```
Fuel[L/h]  = SFC * DBp                                    [LEGACY — preserved]
Fuel[L/ha] = Fuel[L/h] / FCactual
Overall%   = DBp*3600/1000 / (FCth * Fuel[L/ha] * 35.5) * 100
```
The document **stops at `FC`** — it calls the expression "specific fuel
consumption", remarks only that a lower `Ptr` lowers `FC`, and never converts to
L/h or L/ha anywhere. There is therefore no DSS-intended multiplicand to recover.
`SFC × DBp` is dimensionally inconsistent with `X` being a PTO-power ratio, but
switching to `Ptr` would substitute one undocumented model for another, so the
source behaviour is preserved and the alternative is reported alongside it as the
diagnostic-only `fuel_l_per_hour_pto_basis`, which feeds nothing.

### A15. Field capacity and time — mixed
```
FCth = S * W / 10                                         [DSS-EXACT]

turning_time = 15.56 + 2.61*(W/S) − 1.41*S, clamped 8–45 s   [LEGACY]
number_turns = round(field_width / W)                        [LEGACY]
FCactual     = area / (turning time + theoretical time)      [LEGACY]
field_eff    = clamp(FCactual/FCth * 100, 50, 95)            [LEGACY]
```
The 50–95 clamp can make the reported efficiency inconsistent with the reported
capacities. The behaviour is preserved; the unclamped ratio is now also reported
as `legacy_field_efficiency_raw` so the discrepancy is visible.

---

## B. Section 4 — passive-passive (`combi_algorithms.py`)

### B1. Combined draft — **DSS-EXACT** (`image16`, `image17`)
```
DTotal = (1 − ki) * (D1 + D2),   ki ∈ [0.00, 0.25]
```
`DTotal` replaces `D` throughout the rest of the Section 4 chain: axle loads, the
slip loop's target, `R'`, both ballast equations, drawbar power and fuel.

### B2. Dynamic axle loads — **CORRECTED**: Eq. 3.5/3.6 generalised to N tools

**Implemented:**
```
Rr = [ (Wi+Py)(Xcgi_eff + Hd + L + ef) + Wt(L + ef − Xcgt) − DTotal*Yd ] / (L − er + ef)
Rf = (Wt + Wi + Py) − Rr,     Wi = W1 + W2,   Xcgi_eff = (W1*X1 + W2*X2)/Wi
```

**What the document states (`image18`), and why it is not used:**
```
Rr = [Wt*Xcgt + W1*X1 + W2*X2 + Py*Hd + DTotal*Yd] / L
```
The document calls this Section 3's balance in "simplified-eccentricity form". It
is not. Re-deriving the balance from the Section 4 free-body diagram (`image15`),
taking moments about the front-axle contact, reproduces **Eq. 3.5 exactly**. The
Section 4 form uses the wrong moment arms — `Xcgt` where the geometry requires
`L − Xcgt`, `Xn` where it requires `L + Hd + Xn`, `Hd` where it requires `L + Hd` —
and the **opposite sign** on the draft term.

Reduced to a single tool with `ki = 0`, the two disagree by **21 %** on rear-axle
load for identical inputs (Rr 17 033 N vs 13 478 N; Kwef 0.418 vs 0.569). Both
cannot be right, and Section 3 is the validated conventional path.

Because `ΣWn·Xn ≡ Wi·Xcgi_eff` by definition of a weight-weighted centroid, the
individual tool moments are represented **exactly** — collapsing the tools
introduces no approximation. Placing `Py` at `Xcgi_eff` is the one assumption, and
it is the one Section 3 already makes.

This also restores the wheel eccentricity terms the Section 4 form dropped, and it
is what makes B7's exact reduction property hold.

The same correction applies to Section 5's Eq. 5.7a, which the document derives
from this equation; see C3.

### B3. Combining rules the document does not give — **IMPLEMENTATION-ASSUMPTION**
```
Py       = ratio(tool1)*D1 + ratio(tool2)*D2      (each tool's own ratio on its own draft)
Xcgi_eff = (W1*X1 + W2*X2) / (W1+W2)              (weight-weighted CG, for ballast reuse)
```

### B4. Wheel numeric `Bn'` — **DSS-EXACT** (`image24`)
```
Bn' = (b*d/W) * √( CI / (W/(b*d)) ) * (1 + b/(2*d))
```
The `(1 + b/(2d))` factor is outside the square root. Implemented verbatim as
`combi_algorithms.mobility_number_passive_passive`.

⚠️ **This expression is not dimensionally valid and drives no result.** It is
retained, tested and reported as the diagnostic `dss_section4_wheel_numeric` purely
so the source stays auditable. See B6.

### B5. Wheel numeric actually used — **CORRECTED**: Section 3's `Bn`

Both wheels use `mobility_number` (`Bn = CI·b·d/Wd`, A5), the rear evaluated at
this combination's own axle load `W = Rr/2` (and `W = R'/2` inside the rear-ballast
fixed point). What distinguishes passive-passive from a single implement is the
**axle load** it produces via `DTotal` — not a different wheel-numeric model.

Justification, strongest first:
1. `Bn'` is dimensionally invalid (B6) — it cannot be a wheel numeric.
2. A wheel numeric describes the **tyre–soil–load** interaction of the driven
   wheel. It has no physical dependence on how many implements are towed; the
   configuration already enters through `W`.
3. The Section 4 prose says the traction sub-model applies "unchanged" from
   Section 3.4.5, with `DTotal` in place of `D`.
4. The term *under* `Bn'`'s own root, `CI/(W/(b·d))`, **is** Section 3's `Bn`.

The front wheel already used A5 (`image8` defines `ρf` from `Bn = CI·b·d/Wf`); now
the rear does too, so one model governs the whole machine.

### B6. Why `Bn'` was disqualified — **dimensional analysis**

| term | units |
|---|---|
| `b·d / W` | m² / kN — **not dimensionless** |
| `CI / (W/(b·d))` | kPa / kPa = 1 ✓ |
| `1 + b/(2d)` | 1 ✓ |

The product carries **m²/kN**. A wheel numeric is dimensionless by definition, so
this cannot be one. The defect is measurable rather than a matter of reading:

- It scales as `W^−1.5`; a dimensionless group built on `CI·b·d/W` must scale as `1/W`.
  Pinned by `test_section4_wheel_numeric_is_dimensionally_inconsistent`.
- It collapses ~2 orders of magnitude below the 5–80 band the Brixius-form traction
  equations consuming it assume: at a 6.9 kN wheel load it gives 0.64, driving
  `μ = −1.63` at 15 % slip.

| wheel load | `Bn` (A5) | `Bn'` | μ at 15 % slip from `Bn'` |
|---|---|---|---|
| 1 000 N | 530.4 | 11.51 | +0.297 |
| 2 000 N | 265.2 | 4.07 | −0.084 |
| 6 890 N | 77.0 | 0.637 | −1.629 |
| 15 000 N | 35.4 | 0.198 | −5.204 |

Previously the engine implemented `Bn'` literally and raised a diagnostic
`ValueError` for every realistic tractor, so passive-passive **never produced a
result**. That was the correct response while the equation was believed to be
correct-but-unusable. The dimensional analysis changes the premise: substituting
`Bn` is not a correction factor applied to force convergence, it is using the only
dimensionally valid wheel numeric the specification defines.

### B7. Reduction property — the consistency check that now holds

With a second tool contributing no weight, no draft and no extra width, and
`ki = 0`, a passive-passive run **is** a single-implement run. Every shared
quantity — draft, both axle loads, both wheel numerics, slip, μ, TE, drawbar and
PTO power, fuel, field capacity, both ballast figures — agrees **exactly**, because
both paths now use the same Section 3 equations.

Pinned by `test_passive_passive_reduces_exactly_to_the_single_implement_result`.
The previous implementation could not satisfy this at all: a ~21 % different axle
balance and a wheel numeric that made the mode fail outright.

### B8. Traction, ballast, power, fuel — **DSS-EXACT** (`image21`–`image30`)
Identical to A6–A14 with `DTotal` in place of `D`. The ballast equations are the
Section 3 forms reproduced verbatim in the document with the explicit instruction
to use `DTotal` for `D`.

---

## C. Section 5 — active-passive (`combi_algorithms.py`)

### C1. Rotor thrust and effective draft — **DSS-EXACT** (`image32`–`image34`)
```
Ta   = ηr * PPTO / V                                      (Eq. 5.2)
Deff = Dp + Da − Ta                                       (Eq. 5.1/5.3)
```
`ηr` is user-selectable in **[0.25, 0.45]**, per the document. `Deff` replaces `D`
through the rest of the Section 5 chain.

**Unit trap (document's own):** `PPTO` is in **W** here (with `V` in m/s, giving N)
but in **kW** in Eq. 5.4's `9550` relation. Both are implemented as written.

Guard: `Deff ≤ 0` (rotor thrust exceeds total resistance) raises a clear error
rather than producing negative drawbar power. **IMPLEMENTATION-ASSUMPTION**
(defensive; not from the document).

### C2. PTO reaction moment — **DSS-EXACT** (`image35`–`image37`)
```
MPTO = 9550 * PPTO[kW] / N[rpm]                           (Eq. 5.4)   → N·m
Weq  = MPTO / L                                           (Eq. 5.5)   → N
Rr*  = Rr + Weq                                           (Eq. 5.6)
```

### C3. Dynamic axle loads — **DSS-EXACT** (`image38`, `image39`)
```
Rr = [Wt*Xcgt + Wp*Xp + Wa*Xa + Py*Hd + Deff*Yd]/L + MPTO/L + Fv      (Eq. 5.7a)
Rf = Wt + Wp + Wa + Py − Rr                                           (Eq. 5.7b)
```
`Fv` — **DSS-AMBIGUOUS**: introduced in prose as a "dynamic vertical force" with no
derivation formula anywhere. Treated as an optional measured rotor-spec input,
defaulting to **0**. With `Fv = 0` and `PPTO = 0` these reduce exactly to B2, as
the document states.

### C4. Front ballast — **DSS-EXACT** (`image40`, `image41`)
```
Rf = 0.20*(Wt + BRf)   ⇒   BRf = (0.20*Wt − Rf) / 0.80                (Eq. 5.11)
```
A closed form specific to Section 5, unlike the implicit Eq. 3.7 used elsewhere.
Now expressed via `FRONT_BALLAST_TARGET_KWEF` rather than inline `0.20`/`0.80`.

### C5. Rear ballast — **DSS-EXACT** (`image42`, `image43`)
```
Rreq = Deff / μ(S)                                                    (Eq. 5.12)
BRr  = Rreq − Rr                                                      (Eq. 5.13)
```
A negative `BRr` means the rotor's thrust and reaction moment already supply
sufficient rear loading. Reported as 0 with an explanatory note — the document
calls this out as a principal advantage of the active-passive design.

### C6. Power and fuel — **DSS-EXACT** (`image47`–`image49`)
```
Ptr  = Deff-based drawbar power / (TE * ηt)               (Eq. 3.11 form)
Put  = (Ptr + PPTO) / (Pt*(1−fs)) * 100                   (Eq. 5.14)
Xeff = (Ptr + PPTO) / Pt                                  (Eq. 5.15)
FCcombi = 2.64*Xeff + 3.91 − 0.203*√(738*Xeff + 173)      (image49)
```
Implemented as `dss_shared.power_and_fuel(extra_pto_kw=PPTO)`; `extra_pto_kw = 0`
gives the Section 3/4 forms from the same code path. The L/h basis is A14's
(preserved `SFC × DBp`).

### C7. Rotor power / equivalent force — **DSS-EXACT** formula, **DSS-AMBIGUOUS** use
```
Pr = 2πNT/60          (Eq. 5.8, image44)      → kW
Fr = Pr / V           (Eq. 5.9, image45)      → N
```
Reported as `rotor_mechanical_power` / `rotor_equivalent_force` for cross-check
only; they do **not** feed `Deff`/`Ta`/axle loads. The document frames these as an
alternative torque-based route to `Ta`, meant for an **independently measured**
rotor shaft torque used to back-calculate `ηr`. This engine has no measured-torque
input, so `T = MPTO` — itself derived from `PPTO`/`N` via the same 9550 relation.
`Pr` therefore reproduces `PPTO` **by construction**: an internal-consistency
identity, not independent information. Genuine diagnostic value needs a real
measured-torque input field.

### C8. Which wheel numeric Section 5 uses — **IMPLEMENTATION-ASSUMPTION**
The document gives no `Bn'` for Section 5 — `Bn'` is introduced only in Section 4.
Both wheels therefore use Section 3's `Bn` (A5) -- as every mode now does (B5).

### C9. Combined traction bookkeeping — **not wired**
```
P = Deff + R + Fi                                         (image46)
```
Documented in the text but not used: `R` is already reported as
`motion_resistance_ratio` (A6), and `Fi` (inertial resistance, which the document
itself calls "normally negligible at steady forward speed") has no input.

---

## D. Constants (`constants.py`)

| Constant | Value | Tag |
|---|---|---|
| `GRAVITY` | 9.81 m/s² | — |
| `DIESEL_CALORIFIC_VALUE` | 35.5 MJ/L | DSS-EXACT |
| `SLIP_INITIAL_PCT` / `SLIP_INCREMENT_PCT` | 2.0 / 0.1 | DSS-EXACT |
| `MAX_SLIP_PCT` / `MAX_SLIP_ITERATIONS` | 20.0 / 500 | IMPLEMENTATION-ASSUMPTION |
| `WHEEL_ECCENTRICITY_COEFF` | 0.1 | DSS-EXACT (`er`), IMPLEMENTATION-ASSUMPTION (`ef`) |
| `DRAFT_DEPTH_ACTION_FRACTION` | 2/3 | DSS-EXACT |
| `ROLLING_RESISTANCE_BASE` / `_SLIP_COEFF` | 0.04 / 0.5 | DSS-EXACT |
| `TRACTION_MU_G_SCALE` / `_BN_EXPONENT_COEFF` | 0.88 / 0.1 | DSS-EXACT |
| `TRACTION_SLIP_EXPONENT_COEFF` | **7.5** | DSS-AMBIGUOUS (doc shows 0.3) — see A7 |
| `FRONT_BALLAST_TARGET_KWEF` | 0.20 | DSS-EXACT |
| `REAR_BALLAST_TARGET_SLIP_PCT` | 15.0 | DSS-EXACT |
| `BALLAST_SOLVER_TOLERANCE` / `_MAX_ITERATIONS` | 1e-4 / 200 | IMPLEMENTATION-ASSUMPTION |
| `PY_OVER_D_RATIO_BY_IMPLEMENT` | 0.15/0.40/0.50/0 | DSS-EXACT |
| `FI_FACTOR_BY_TEXTURE` | 1.0 / 0.70 / 0.45 | REFERENCE-ALIGNED |
| `SFC_COEFF_*`, `SFC_RADICAND_*` | 2.64/3.91/0.203/738/173 | DSS-EXACT (ASABE 2001) |
| `PUT_PROPERLY_LOADED_RANGE` | (95, 100) | DSS-EXACT |
| `TURNING_TIME_*`, `FIELD_EFFICIENCY_CLAMP`, `FUEL_L_PER_HA_CLAMP`, `OVERALL_EFFICIENCY_CLAMP` | — | LEGACY |
| `KI_RANGE` / `ROTOR_EFFICIENCY_RANGE` | (0, 0.25) / (0.25, 0.45) | DSS-EXACT |

`MOBILITY_NUMBER_SHAPE_COEFF` has been **removed** — it existed only to support
the incorrect `Bn` (A5).

---

## E. Units

| Quantity | Unit | Note |
|---|---|---|
| `CI` | kPa | |
| `b`, `d`, `L`, `Xcg`, `Hd`, `Yd`, `r` | m | route converts tyre mm → m |
| `T` (tillage depth) | cm in Eq. 3.1 (no divisor); m in `Yd` | `Yd = (2/3)·(T/100)` — the `/100` is a genuine cm→m conversion and is unrelated to the `/10` removed from Eq. 3.1 |
| `W` in `Bn` / `Bn'` | **kN**, per wheel = axle load / 2 | forced by the equation; the halving is an assumption |
| `D`, `Py`, `Rr`, `Rf`, `Ta`, `Pet` | N | |
| `S` (speed) | km/h in Eq. 3.1; m/s in `DBp`, `Ta`, `Fr` | |
| `S` (slip) | fraction internally, % at the API boundary | |
| `PPTO` | **W** in `Ta = ηr·PPTO/V`; **kW** in `MPTO = 9550·PPTO/N` | the document's own inconsistency |
| `MPTO` | N·m; `Weq = MPTO/L` in N | |
| `SFC` | L/kW·h | multiplicand undocumented — see A14 |
| Ballast | solved in N, reported in kg via `GRAVITY` | |

No conversion factor is introduced anywhere the document does not imply one.

---

## F. Numerical safety

`dss_shared` provides `require_positive`, `require_finite`, `safe_div` and
`safe_sqrt`. Each raises a `ValueError` naming the offending quantity and its
value; **none substitutes a fallback**. They guard non-positive speed / depth /
width / area / PTO power / cone index / tyre dimensions / wheelbase / rolling
radii, non-positive dynamic axle loads, `ki` and `ηr` out of range, `power_reserve
≥ 100 %`, zero `μg`, negative radicands and NaN/Infinity.

Failure modes that are reported rather than hidden: slip non-convergence at the
20 % cap (`converged=False` + warning), no net traction at any slip (warning
naming the cause), a rear-ballast fixed point that fails to settle (error),
infeasible front ballast (warning), `Deff ≤ 0` (C1), and `Pet < D` (A10, warning only).

---

## G. Output impact of this revision

Additive result keys only — nothing renamed or removed, no DB column or Pydantic
schema change: `engine_torque_limited_pull`, `fuel_l_per_hour`,
`fuel_l_per_hour_pto_basis`, `legacy_field_efficiency_raw`, and (active-passive)
`pto_power_fraction_effective`.

Values that moved, each traceable to one documented cause:

| Mode | What changed | Cause |
|---|---|---|
| `single`, `active_passive` | `legacy_mobility_number_rear/front`, `coefficient_net_traction`, `legacy_gross_traction_ratio`, `traction_efficiency`, `motion_resistance*`, `required_pto_power`, `power_utilization`, `specific_fuel_consumption`, `fuel_consumption_per_hectare`, `overall_efficiency` | `Bn` correction (A5) |
| `passive_passive` | **every value** — the mode previously always raised and produced none | `Bn` correction (B5) + axle balance (B2) |
| `active_passive` | `legacy_front/rear_axle_load_n`, `front/rear_weight_utilization`, both ballast figures, and everything downstream of the rear load | axle balance (B2), shared with Section 4 |

`draft_force`, `drawbar_power`, field capacities, ballast and all status text are
unchanged. Stored historical simulations keep their original values.

---

## H. Open ambiguities

1. **`Bn'` (Section 4 wheel numeric) — resolved.** Shown to be dimensionally
   invalid (m²/kN) and therefore not a wheel numeric at all; Section 3's `Bn` is
   used instead, as the Section 4 prose itself instructs. The expression is still
   implemented, tested and reported as the `dss_section4_wheel_numeric` diagnostic.
   What remains unknown is what the source *intended* — worth confirming against
   the underlying thesis. See B5/B6.
1b. **Section 4/5 axle balance — resolved.** The combi moment balance disagreed
   with the validated Eq. 3.5 by ~21 % and used geometrically wrong moment arms
   plus the opposite draft sign; Eq. 3.5 generalised to N tools is used instead.
   See B2.
2. **Traction slip exponent.** Document shows `e^(−0.3·S)`; engine uses `7.5`. The
   literal value breaks every mode. See A7.
3. **Fuel L/h basis.** The document never converts `SFC` to L/h. Preserved as
   `SFC × DBp`; PTO-power alternative reported as a diagnostic. See A14.
4. **`Fv`** (active-passive dynamic vertical force) — named in prose, no formula;
   defaults to 0.
5. **Rotor `Pr`/`Fr`** reproduce `PPTO` by construction because `T = MPTO`; a real
   cross-check needs a measured-torque input. See C7.
6. **`Fi` soil-texture table** — classes named, no numbers given; the values are taken
   from the reference stack (global, 1.0/0.70/0.45), not from the document.
7. **`ef`** — `0.1` stated only for `er`, applied to `ef` by symmetry.
8. **`Pet`'s role** — Eq. 3.4 is given but its place in the algorithm flow is not;
   implemented as a diagnostic that does not cap `Pst`. See A10.
9. **`Pet`'s missing gear ratio (new).** Eq. 3.4 applies engine torque at the wheel
   radius with no transmission reduction, making Pet negative for every realistic
   tractor. Implemented literally; the non-physical case is labelled as such rather
   than misreported as an engine limit. Needs a gear-ratio input, or confirmation
   that `T` meant axle torque. See A10.

### Client-side duplication — resolved

An earlier revision of this document recorded a divergent draft/power estimator in
`frontend/src/screens/SimulationSetupScreen.tsx` (an invented `coneIndex/1500`
multiplier, raw `depth` instead of `depth/10`, a different `Fi` table, no tractive
efficiency) plus client-side regeneration of warnings and recommendations in
`SimulationResultScreen.tsx`.

**All of it has been removed.** The client now renders only what the engine
returns:

- The pre-run preview is replaced by a readiness check
  (`frontend/src/utils/simulationReadiness.ts`) that tests for *missing input
  fields* against the backend's own preconditions and performs no arithmetic.
- `warnings`, `recommendation_messages`, `status`, `confidence` and `load_status`
  are displayed verbatim; when the backend omits one, the UI shows nothing rather
  than substituting a guess.
- `frontend/src/utils/dssBands.ts` holds the only DSS thresholds the client knows
  (the Put 95–100% window, the 15% ballast target, the 20% solver cap, Kwef 0.20
  and the operating-input ranges). They are used solely to colour and annotate
  charts, never to derive a value or generate advice.
- `results.converged` is surfaced as a first-class banner, so a run that hit the
  slip cap is never presented as a working configuration.
- The diagnostics panel exposes `Bn`/`Bn'`, `μg`, `μ`, motion resistance, axle
  loads, `Pet` and both fuel bases, each tagged with the provenance vocabulary
  above — including the `Pet` gear-ratio caveat and the two fuel-basis readings.

The soil-derived starting values in `frontend/src/utils/soilParameters.ts` remain a
UI convenience and are **not** DSS defaults; every value they fill is labelled
"Suggested starting value — not a DSS default" in the interface.
