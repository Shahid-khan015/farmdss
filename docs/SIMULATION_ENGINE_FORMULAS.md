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

## 0. Status of the reference stack — read this first

A full formula-by-formula validation was run against the spreadsheet's *cell
formulas* (extracted from the `.xlsx` XML, not from its rendered values) and
against the HTML tool. Two findings govern how every "the references say X" claim
in this document must be read.

### 0.1 The spreadsheet's tyre input block is corrupted

`Tractor_Implement_Performance_Calculator Updated.xlsx`, sheet **Performance
Calculator**, rows **29–36**, was pasted **one row off** from the *tractor and
implement data* sheet, and the values are **mm** under a column that says **m**:

| sheet1 cell | label | value | what it actually holds (sheet2 col F) |
|---|---|---|---|
| `C29` | `df` | 127 | `bf`, front section width (mm) |
| `C30` | `bf` | 237.74 | `rslf`, front static loaded radius (mm) |
| `C31` | `fslr` | 245.01 | `rf`, front rolling radius (mm) |
| `C32` | `rf` | 789.43 | **`dr`, the REAR overall diameter** (mm) |
| `C34` | `dr` | 203.2 | `br`, rear section width (mm) |
| `C35` | `br` | 364.24 | `rslr`, rear static loaded radius (mm) |
| `C36` | `rslr` | 375.85 | `rr`, rear rolling radius (mm) |
| `C37` | `rr` | 0.364 | hand-typed, the only cell actually in metres |

Consequences in the workbook's own outputs:

```
ef = 0.1 * C32 = 0.1 * 789.43   = 78.94 metres of wheel eccentricity
Rr denominator = L + ef - er     = 80.33  (should be ~1.42)
Rf                               = 27.2 N — 2.8 kg on the front axle
Bn_rear = CI*C36*C35/Wd          = 44,539,161.7   (physical band ~5–80)
Bn_front                         = 3.33e9
mu_g                             = 0.88 exactly (saturated)
TE                               = 13.65 %
Put                              = 189.6 %
```

**The workbook's formula structure is authoritative and the engine reproduces it
exactly. Its computed outputs are not a valid numeric reference for anything
downstream of the tyre inputs.** Validation was therefore done against the
workbook's formula chain re-evaluated on corrected tyre values (sheet2 col F,
mm→m). Pinned by `tests/test_reference_case_validation.py`.

### 0.2 The HTML tool is a port of this engine, not an independent implementation

`tillage_dss (2).html`'s own header reads:

> ENGINE — faithful port of the validated Python engine
> (dss_shared.py / legacy_algorithms.py / combi_algorithms.py)

and it is a port of an **older revision**: it still carries the removed
`legacyShapeFactor` on `mobilityNumber`, while already having the post-B2
`combinedAxleLoad`.

(An earlier version of this section also cited its envelope `tractiveEfficiencyPct`
as evidence of being outdated. That was wrong — the envelope is what DSS Eq. 3.2
specifies, and the engine now matches it. See A9.)

**Everywhere this document says a divergence is "from both reference
implementations", that is one independent source and one derivative of an earlier
version of this engine — not two independent voices.** Arguments that rested on
Excel-and-HTML agreement are weaker than they appear, and the sections below have
been corrected accordingly.

### 0.3 The spreadsheet's note column contradicts its own formulas in three places

The `E` column is prose written beside each formula; where they disagree the
**formula is authoritative**. All three stale notes have caused real
mis-transcriptions:

| cell | note says | formula actually is | damage |
|---|---|---|---|
| `E43` | `Fi*(A+B*S+C*S²)*W*(Td/10)` | no `/10` | the historical 10×-too-small draft bug |
| `E65` | `SFC * Rated PTO power * 0.88` | `C64*C60` = `SFC*DBp` | the "fuel basis ambiguity" (A14) |
| `E77` | `Rf / Wt` | `C49/(C48+C49)` = `Rf/(Rr+Rf)` | Kwef denominator (A11) |

### 0.4 Validated stages

On the reference case (VST Shakti MT 180D + MB Plough single bottom, fine soil,
CI 1500 kPa, 15 cm, 2.5 km/h, 200×100 m field), the engine reproduces the
workbook's formula chain **to every printed digit** at: draft, `Py`, `Yd`, `er`,
`ef`, `Rr`, `Rf`, both wheel loads, both wheel numerics, `mu_g`, `DBp`, `FCth`
and field efficiency. Since A9's revert to the specification's envelope denominator,
**TE and the whole power chain agree too**. Every remaining difference is
attributable to A1's `W` unit, A15's turning factor, or the fact that the
spreadsheet **has no slip solver** (`C55` is hard-coded to 2 %) and **no ballast
solver** (`C78` is hard-coded to 0).

**Modes 2 and 3 have no independent numeric reference at all** — the spreadsheet
is single-implement only and the HTML is derivative. Passive-passive and
active-passive rest on the DSS document plus the B7 reduction property.

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

`F` (soil-texture factor) — **REFERENCE-ALIGNED** 🔧 *reverted, again*. One global
value per soil texture, applied to every implement: **Fine 1.00, Medium 0.70,
Coarse 0.45** (`constants.FI_FACTOR_BY_TEXTURE`).

**This has now flipped twice.** A per-implement table (ASABE D497 Table 1: disc
plough and disc harrow 1.0/0.88/0.78, cultivator 1.0/0.85/0.65) was reinstated for
one session -- independently corroborated by `farmdss/Rakesh Dss/Front _screen.frm`
(`Command6_Click`, lines 3011–3059), the 2006 VB6 tool this whole DSS derives from
(soil-texture radio buttons Option6=Fine/Option7=Coarse/Option8=Medium, confirmed at
lines 193–222) -- then **reverted again** so the engine matches
`docs/tillage_dss (2).html` exactly: its `readCommonInputs` reads Fi from one
texture selector (`fi: parseFloat(...)`) with no implement dimension at all, same as
the spreadsheet's "tractor and implement data" sheet (cells D50:F53).

The per-implement table is still available as `constants.FI_FACTOR_BY_IMPLEMENT_TYPE`,
unused by `fi_factor` now, a one-line revert
(`fi_factor` back to `FI_FACTOR_BY_IMPLEMENT_TYPE[implement_type.value][...]`) away if
D497 fidelity is ever prioritised over HTML parity again. Flattening understates draft
on non-moldboard tools in non-fine soil (draft ×0.795 disc-medium, ×0.577 disc-coarse,
×0.824/×0.692 cultivator medium/coarse). MB Plough and fine soil are numerically
unchanged either way, so this reversal is invisible on the reference case.

`implement_type` is still validated even though it no longer selects the value:
`fi_factor` rejects PTO-powered types outright (`is_passive` check). Pinned by
`test_fi_factor_raises_value_error_for_active_types`, and the flattened values by
`test_fi_soil_texture_factor_is_global` (all 12 implement × texture combinations),
`test_fi_is_global_and_matches_the_reference_stack`, and
`test_fi_is_applied_identically_in_all_three_modes` (which now asserts Single/PP/AP
all reach the same shared value again, not their own implement's row).

`W` (the width term) — **REFERENCE-ALIGNED** 🔧 *reverted*.
Every implement, cultivators included, takes the working width in **metres** --
`constants.DRAFT_WIDTH_IS_TOOL_COUNT = frozenset()`, so
`legacy_algorithms.draft_width_parameter` always returns `width_m` and never consults
`Implement.number_of_tools`.

**This reverts a per-tool reading adopted for one session**, to match
`docs/tillage_dss (2).html`'s engine exactly -- its `draftForceN` takes only
`widthM`, with no tool-count concept for any implement class. D497 does not use one
unit for `W`: full-width tools (mouldboard/disc ploughs, disc harrows) tabulate the
working width in metres, but tined implements are tabulated **per tool**
(`A = 32, B = 1.9, C = 0` is D497's secondary-tillage field cultivator, a per-tool
row) -- reading a cultivator's `W` as metres instead gives **505 N/m at every size**,
since the width cancels and the figure carries no size information, against ~1975 N/m
for a disc plough and ~4050 N/m for a disc harrow. It can also drop a 9-tine
cultivator's draft below a rotavator's forward thrust in active-passive combinations,
making `Deff` non-positive -- `effective_draft_n` still raises loudly on that (Eq.
5.1/5.3's own guard, independent of this constant), matching the HTML's identical
`rawDeff <= 0` check, so this reversion trades numeric fidelity for a *more*
frequently non-positive `Deff` on narrow/many-tine cultivators, not a silently wrong
one -- see A10/§5 for that guard.

Only Eq. 3.1 was ever affected — field capacity, turning time and swath always use
metres regardless of this constant.

Per-tool fidelity is a one-line revert
(`DRAFT_WIDTH_IS_TOOL_COUNT = frozenset({"Cultivator"})`) if D497 fidelity is ever
prioritised over HTML parity again; a missing `number_of_tools` would then need
re-gating (`routes/simulations._require_implement_fields`, via
`draft_width_is_tool_count`) since the reverted constant no longer requires it.
Pinned by `test_draft_width_is_metres_for_cultivators_too` and
`test_cultivator_draft_per_metre_carries_no_size_information`.

> The spreadsheet's own cultivator widths (2.20 / 2.66 / 3.13 m for 9 / 11 / 13
> tines) imply a 244 / 242 / 241 mm tine spacing -- textbook and consistent -- which
> is what a tool-count reading would corroborate, for the record; see
> `test_cultivator_draft_scales_with_whatever_number_w_is_given` in
> `test_reference_case_validation.py`.

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

**Archaeological note: the removed shape factor traces to a formula this engine
never actually reproduced.** `farmdss/Rakesh Dss/Front _screen.frm`
(`Command6_Click`, line 3139): `Bnr = (2000*CI*b*d/Rd) * (2/(1+3*b/d))` — the 2006
VB6 tool this DSS derives from. This is a *different* formula from the one removed
above: it carries a `2000×` coefficient (vs. the standard `CI·b·d/W_kN`'s implicit
`1000×` from the kPa/kN unit split) on top of a `2/(1+3b/d)` shape factor (vs. the
removed `1/(1+3b/d)`, no leading 2). Net effect, combining both factors: VB6's `Bn`
is roughly **2.17×** the standard value at typical `b/d` ratios — the *opposite*
direction from the removed shape factor, which read roughly 0.54× (a rough halving,
matching the "43.1 → 77.0" reference-case shift above). Neither formula is
ASABE/Wismer-Luth-standard, and no source derives either; this backend has never
carried a toggle for this VB6 variant. Recorded for provenance only — nothing here
is adopted.

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

**`k = 7.5` — REFERENCE-CONFIRMED** ✅ *resolved, was DSS-AMBIGUOUS*. The document
literally shows `0.3`. Implemented literally, `μ ≈ 0.017` at 15 % slip, so the slip
solver never converges for any realistic tractor **in any of the three modes**.

This is no longer an assumption. The spreadsheet's own cell formula is
`C58 = C57*(1-EXP(-7.5*C55))-(1/C52)-(0.5*C55)/(SQRT(C52))` — **7.5 explicitly** —
and `tillage_dss.html` carries the same in `K.TRACTION_SLIP_EXPONENT_COEFF`. `7.5`
is also the standard Wismer-Luth/Brixius value. The document's `0.3` is a
transcription error in the equation image. Defined once, in
`constants.TRACTION_SLIP_EXPONENT_COEFF`; pinned by
`test_slip_exponent_is_the_value_the_workbook_uses_not_the_documents`.

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

**Archaeological note: the 2006 VB6 original subtracts front-wheel drag from `Pst`,
the specification does not.** `farmdss/Rakesh Dss/Front _screen.frm`
(`Command6_Click`, lines 3145–3149) computes
`Pull_st = (GT − RRr1 − RRf1) * Rd` — both rear *and* front rolling resistance
subtracted from gross traction before multiplying by the rear axle load — where
`Pst(S) = μ(S) * Rr` above uses rear resistance only, per `image27`, DSS-EXACT. The
VB6 approach is dimensionally questionable (front resistance should scale with `Rf`,
not `Rd`) and is not applied consistently even within that same file — its separate
rear-ballast loop (lines 3205–3221) uses rear resistance only, matching the
specification. This engine follows the specification; the VB6 reading is recorded
here as the pre-specification convention the document superseded, not adopted.

### A9. Tractive efficiency — **DSS-EXACT** ✅ *reverted to the specification*
```
TE = μ*(1−S) / μg                                          (Eq. 3.2, image1)
μg = 0.88*(1 − e^(−0.1·Bn))                                (Brixius envelope)
```
`legacy_algorithms.traction_efficiency_percent` → `traction_efficiency_envelope_percent`.

**The denominator is the Brixius envelope `μg`.** Eq. 3.2 is stored in the DOCX as a
MathType/OLE object (`word/media/image1.wmf`), which is why plain-text extraction
shows only the label "(3.2)" and its variable legend. Rendered, it reads
`TE = μ(1−S)/μg`, with the document's own legend giving `μ` as the coefficient of
traction and `μg` as the gross traction ratio. There is no `+0.04` term and no slip
factor in the denominator.

All three artifacts agree:

| source | denominator |
|---|---|
| DOCX Eq. (3.2) — **the specification** | `μg` (envelope) |
| `tillage_dss.html` `tractiveEfficiencyPct` | `μg` (envelope) |
| spreadsheet `C59 = (C58*(1-C55))/C57` | `μg` (envelope) |

**History — an earlier revision of this document argued the opposite.** It bound the
denominator to `gross_traction_at_slip = μg(1 − e^(−7.5·S)) + 0.04`, reasoning from
the model identification (`μ = GT − MR` with `MR = 0.04 + 1/Bn + 0.5·S/√Bn`, the two
`0.04` terms cancelling) that Eq. 3.2 must want the ratio *developed at slip* rather
than its asymptotic ceiling. That argument is coherent but it was inference, and it
made the engine the sole outlier against its own specification. The specification
text settles it; the inference is superseded.

**Accepted, documented consequences.** These are properties of the specified model,
deliberately not compensated for anywhere downstream:

- TE reads lower and, since `Ptr = DBp/(TE·ηt)`, power utilisation reads higher —
  most markedly at high mobility numbers (firm soil). On the reference case: TE
  79.1% → 41.5%, Put 32.7% → 62.3%.
- TE becomes **monotonic in slip** across the whole 1–25% working band, so there is
  no interior optimum for slip advice to aim at. Pinned by
  `test_envelope_te_is_monotonic_in_slip_so_no_optimum_exists`.
- Published field drawbar-to-PTO ratios sit near 65–75%, which the envelope form
  does not reproduce. See "RESOLVED: tractive-efficiency denominator" — conformance
  to the specification is settled; whether the specified model matches the field is
  a separate question that only measurement can answer.

The at-slip value is retained as the diagnostic `traction_efficiency_at_slip_percent`
(`traction_efficiency_at_slip_pct`), alongside the `gross_traction_at_slip` ratio it
is built from, so the two readings stay directly comparable in every result dict.

`bn_rear` remains a required keyword-only argument on `traction_efficiency_percent`:
the envelope denominator does not consume it, but three call sites pass it and it
records which wheel numeric the traction solution came from, so it is asserted rather
than dropped.

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
                                                          ⚠️ see denominator note below

Front — bisection on the ballast mass:
  residual(BRf) = Rf(Wt + BRf·g) / (Wt + BRf·g) − 0.20
  where Rf(·) is this mode's own Eq. 3.5/3.6 balance, re-solved with the
  ballast added. Bracket expands geometrically from 5000 kg.

Rear — fixed point on R', then the shortfall:
  R'  = D / μ'(s_target, Bn evaluated at W = R'/2)
  BRr = max(0, (R' − Rr) / g)
  s_target = 15% by default; active-passive passes its *solved* slip.
```
⚠️ **Kwef denominator — reference conflict, resolved to `Wt`.** The spreadsheet
disagrees with *itself*: `C77`'s formula is `Rf/(Rr+Rf)` — the total dynamic weight
— while its own note column beside it reads `Rf / Wt`. The document's `image21` and
`tillage_dss.html` both give `Rf/Wt`, which is what ships. The choice is not
cosmetic: on the reference case it is **0.2087** (at or above the 0.20 target, so no
ballast is fitted) against **0.1672** (below target, ballast demanded). One of the
three stale-note cases in §0.3. Recorded at
`legacy_algorithms.front_ballast_required_kg`.

Both solver forms come from the reference implementations, which the engine was
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

### A14. Fuel — **DSS-EXACT** equation, basis ⚠️ *reversed, then reverted*
```
X   = (Ptr + PPTO) / Pt                                               [DSS-EXACT]
SFC = 2.64X + 3.91 − 0.203*√(738X + 173)   [L/kW·h]       [DSS-EXACT, image30]
                                            (ASABE 2001 — EXTERNAL-MODEL)

Fuel[L/h]  = SFC * DBp                    ← drawbar power   [REFERENCE-ALIGNED]
Fuel[L/ha] = Fuel[L/h] / FCactual
Overall%   = DBp*3600/1000 / (FCth * Fuel[L/ha] * 35.5) * 100
```

**The multiplicand is drawbar power again**, matching `docs/tillage_dss (2).html`'s
engine exactly (`powerAndFuel`: `fuelLph = sfc * pdbKw`) and the spreadsheet's cell
formula, `C65 = C64*C60`.

**This has now flipped twice.** A PTO-power basis (`Fuel[L/h] = SFC * (Ptr + PPTO)`)
was adopted for one session on physical grounds -- the engine burns fuel to
produce `Ptr = DBp/(TE·ηt)` regardless of how much of that survives wheel slip as
useful pull, so billing against `DBp` discards exactly the slip-loss fraction, a
factor of `1/(TE·ηt)`, 2–4× at ordinary working slips -- corroborated by field data
(a 9-tyne cultivator at 3 km/h/20 cm/fine soil landed near the 15–18 L/ha commonly
reported for that operation on the PTO basis, far below it on the drawbar basis;
the source's own stated figures, 1.84 vs 15.5 L/ha, could not be reproduced exactly
since the case omits tractor/cone-index/field-size, but the direction and
magnitude held at 4.4–5.1 vs 11.6–13.4). **That argument still holds physically** --
it is simply not what production computes any more, reverted for HTML parity.

**Two historical sources were already on the drawbar side when the PTO basis was
adopted**: the spreadsheet's `C65`, and `farmdss/Rakesh Dss/Front _screen.frm`
(`Command6_Click`, line 3242: `Fuel_cons = SFC * Pdb / FC_ac`), the 2006 VB6 tool
this whole DSS derives from. Neither states a rationale for the drawbar basis
beyond matching the spreadsheet cell, so their agreement was recorded rather than
acted on at the time -- but `tillage_dss (2).html` being on that same side is what
tips this reversal, since matching it exactly is now the explicit goal.

**Coupling to Eq. 3.2.** Because `Ptr ∝ 1/TE`, the *diagnostic* PTO-basis fuel
figure still moves with the tractive-efficiency denominator (A9) -- envelope `TE`
together with the PTO basis is what would reproduce plausible field consumption,
were that basis primary. It currently is not.

`fuel_l_per_hour_pto_basis = SFC * (Ptr + PPTO)` is retained as a diagnostic so
the physical argument above stays checkable against a live run, and `fuel_basis`
states which reading is primary (`"drawbar"`). Pinned by
`test_the_two_fuel_bases_differ_by_exactly_the_traction_loss` and
`test_every_stage_except_fuel_matches_the_reference_engine` (fuel is the one
deliberate exception there, checked via the PTO-basis diagnostic instead of the
primary figure).

### A14b. Advisory rules — **DSS Table 4.2** ✨ *new*

Recommendations follow the document's own Table 4.2, "Checking conditions and
corresponding messages for different parameters" — four conditions, each with its
literal message text:

| condition | message |
|---|---|
| slip > 15 % | Reduce depth or speed of operation or ballast rear axle of tractor |
| μ > ceiling | *(same message)* |
| Kwef < 0.20 | Reduce depth or speed of operation or ballast **front** axle of tractor |
| Put > 100 % | Reduce depth or speed of operation |

μ's ceiling depends on soil **condition**: soft 0.40, medium 0.55, firm 0.60.

**This replaced an ad hoc rule set** that fired at `Put > 90` (the document says
100) plus tractive-efficiency < 60 % and fuel > 45 L/ha checks that appear nowhere
in the specification. Both are gone. `result_envelope` had to grow three
parameters — μ, Kwef and Fi — that it never received, which is why two of the four
conditions were previously unimplementable.

When nothing fires the result is **empty**, not a default string: the document
gives no "all clear" message, so none is invented.

⚠️ **The Fi → soil-condition mapping is interpretation, not specification.** The
document indexes μ's ceiling by bearing strength (soft/medium/firm) and Fi by
texture (fine/medium/coarse), and gives no crosswalk. The engine reuses the
texture already chosen, on the association of coarse soils with lower bearing
strength. This is the weakest link in Table 4.2 — it decides which ceiling a run
is judged against — and is worth confirming with the DSS author. See
`constants.FI_TO_SOIL_CONDITION_BOUNDS`. Note this classification deliberately uses
`constants.FI_FACTOR_BY_TEXTURE` (the flattened, texture-only set), **not**
`FI_FACTOR_BY_IMPLEMENT_TYPE` — the ground's bearing strength must not change
depending on which implement happens to be attached.

**A fifth condition, additive and outside the specification.** Slip below
`TABLE_4_2_SLIP_UNDERUTILIZED_PCT` (8 %) appends its own message, worded distinctly
from the four above so it is never mistaken for spec text. Table 4.2 itself is
silent on low slip — not opposed to flagging it, just missing it — and this fills
that gap from `Front _screen.frm` (lines 3194–3201: `If slip <= 7.9 Then "Increase
depth or speed of operation, Because slip is less than 8%"`), the same VB6 original.
Before this addition the only trace of the signal was `derive_confidence` quietly
downgrading to "Moderate" for `slip < 8` — accurate, but with no explanatory text
for the user. Independent of the other four conditions; can fire alongside them.
Pinned by `test_low_slip_advisory_is_additive_and_not_part_of_table_4_2` and
`test_low_slip_advisory_does_not_fire_inside_table_4_2s_optimal_band`.

### A14c. Standalone PTO-powered implement ✨ *new*

A rotavator or power harrow used **alone** has no towed draft: it is rigidly
three-point mounted and the library carries no A/B/C for it, so Eq. 3.1's entire
chain has nothing to compute. `calculate_standalone_active_performance` computes
field capacity from width and speed, and power/fuel from the implement's own rated
PTO draw (`Put = PPTO/(Pt(1−fs))`, `X = PPTO/Pt`, fuel = SFC × PPTO).

**Draft, axle loads, Bn, slip, μ, TE and both ballast figures are returned as
`None`, never 0.0** — zeros would render as real numbers and would satisfy any
downstream `is not None` check. Only Table 4.2's Put rule can fire, since the other
three conditions have no input.

This previously raised outright. That guard was correct about Eq. 3.1 but
over-applied: it also refused the one configuration where Eq. 3.1 is not needed.

### A15. Field capacity and time — mixed
```
FCth = S * W / 10                                         [DSS-EXACT]

turning_time = 15.56 + 2.61*(W/S) − 1.41*S            [REFERENCE-ALIGNED, xlsx C67]
             clamped 8–45 s                           [LEGACY — engine only]
number_turns = round(field_width / W)                 [REFERENCE-ALIGNED, xlsx C68]
FCactual     = area / (turning time + theoretical)    [REFERENCE-ALIGNED, xlsx C72]
field_eff    = clamp(FCactual/FCth * 100, 50, 95)     [REFERENCE-ALIGNED, xlsx C73]
```
🔧 *Retagged.* These four were previously `[LEGACY]` / "absent from the DSS
document". That was wrong: the document omits them, but the **spreadsheet has all
four**. Only the 8–45 s turning-time clamp and the 0–100 overall-efficiency clamp
are genuinely engine-only.

The 50–95 clamp can make the reported efficiency inconsistent with the reported
capacities. The behaviour is preserved; the unclamped ratio is also reported
as `legacy_field_efficiency_raw` so the discrepancy is visible.

⚠️ **The turning-time factor of 2, now with independent corroboration.** The engine
computes total headland time as `turning_time_s * 2 * number_turns / 3600`. The
spreadsheet has **no such factor** (`C71 = (C68*C67)/3600`). `tillage_dss.html` has
it, but per §0.2 that is a port of this engine and so is not independent
corroboration on its own.

`farmdss/Rakesh Dss/Front _screen.frm` (`Command6_Click`, line 3169:
`total_turning_time = (turning_time * 2 * number_turn) / 3600`), the 2006 VB6 tool
this whole DSS derives from, carries the identical factor of 2 — genuinely
independent of this engine, and older than both the spreadsheet and the HTML port.
That makes it 2 of 3 independent sources (VB6 original + this engine) in agreement,
against 1 (the spreadsheet) that omits it. This tips the balance but is still short
of a definitive ruling — neither VB6 nor this engine's history documents *why* the
factor is there, only that both apply it.

Current behaviour is **preserved, now on stronger footing than before**:
silently dropping it would shift every actual-capacity, total-time and
fuel-per-hectare figure in the system. `FieldCapacity` now reports both
`total_turning_time_h` (doubled, used) and `turning_time_single_pass_basis_h`
(the spreadsheet's basis, unused), so the disagreement is visible in the output
rather than buried inside a multiplication. On the reference case: 2.284 h vs
1.142 h, which moves field efficiency 92.1 % → 95.0 %.
Pinned by `test_field_capacity_reports_both_turning_time_bases`.
**Needs a ruling from the DSS author.**

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
| `TRACTION_SLIP_EXPONENT_COEFF` | **7.5** | **REFERENCE-CONFIRMED** (xlsx `C58`; doc's 0.3 is a transcription error) — see A7 |
| `FRONT_BALLAST_TARGET_KWEF` | 0.20 | DSS-EXACT |
| `REAR_BALLAST_TARGET_SLIP_PCT` | 15.0 | DSS-EXACT |
| `BALLAST_SOLVER_TOLERANCE` / `_MAX_ITERATIONS` | 1e-4 / 200 | IMPLEMENTATION-ASSUMPTION |
| `PY_OVER_D_RATIO_BY_IMPLEMENT` | 0.15/0.40/0.50/0 | DSS-EXACT |
| `FI_FACTOR_BY_TEXTURE` | 1.0 / 0.70 / 0.45 | REFERENCE-ALIGNED |
| `SFC_COEFF_*`, `SFC_RADICAND_*` | 2.64/3.91/0.203/738/173 | DSS-EXACT (ASABE 2001) |
| `PUT_PROPERLY_LOADED_RANGE` | (95, 100) | DSS-EXACT |
| `TURNING_TIME_COEFF_*` | 15.56 / 2.61 / 1.41 | **REFERENCE-ALIGNED** (xlsx `C67`) — see A15 |
| `FIELD_EFFICIENCY_CLAMP` | (50, 95) | **REFERENCE-ALIGNED** (xlsx `C73`) — see A15 |
| `TURNING_TIME_CLAMP`, `OVERALL_EFFICIENCY_CLAMP` | (8, 45) s, (0, 100) % | LEGACY — engine only, absent from the spreadsheet |
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
2. **Traction slip exponent — resolved.** ✅ The spreadsheet's `C58` uses `7.5`
   explicitly, as does the HTML. The document's `e^(−0.3·S)` is a transcription
   error in the equation image; implemented literally it breaks every mode. See A7.
3. **Fuel L/h basis — resolved.** ✅ The spreadsheet's `C65 = C64*C60` is literally
   `SFC × DBp` (its note column disagrees with its own formula; the formula wins).
   Not an ambiguity, and not merely preserved legacy. See A14.
4. **`Fv`** (active-passive dynamic vertical force) — named in prose, no formula;
   defaults to 0.
5. **Rotor `Pr`/`Fr`** reproduce `PPTO` by construction because `T = MPTO`; a real
   cross-check needs a measured-torque input. See C7.
6. **`Fi` soil-texture table** — classes named, no numbers given; the values are taken
   from the reference stack (global, 1.0/0.70/0.45), not from the document.
7. **`ef`** — `0.1` stated only for `er`, applied to `ef` by symmetry.
8. **`Pet`'s role** — Eq. 3.4 is given but its place in the algorithm flow is not;
   implemented as a diagnostic that does not cap `Pst`. See A10.
9. **`Pet`'s missing gear ratio.** Eq. 3.4 applies engine torque at the wheel
   radius with no transmission reduction, making Pet negative for every realistic
   tractor. Implemented literally; the non-physical case is labelled as such rather
   than misreported as an engine limit. Needs a gear-ratio input, or confirmation
   that `T` meant axle torque. See A10.
10. **Turning-time factor of 2 (new).** The engine doubles headland time; the
   spreadsheet does not, and it is the only independent voice on this. No source
   derives the factor either way. Both bases are now reported; behaviour unchanged
   pending a ruling. See A15.
11. **Kwef denominator (new).** The spreadsheet's `C77` formula (`Rf/(Rr+Rf)`)
   contradicts its own note (`Rf/Wt`). The document and the HTML support `Rf/Wt`,
   which ships — but it changes the ballast verdict on the reference case. See A11.
12. **Modes 2 and 3 have no independent numeric reference (new).** The spreadsheet
   is single-implement only; the HTML is a port of this engine. Passive-passive and
   active-passive are validated only against the DSS document and the B7 reduction
   property. Genuine numeric validation needs worked examples from the document or
   an independent implementation. See §0.4.
13. **The spreadsheet itself needs repair (new).** Its tyre input block is
   row-shifted and mislabelled mm-as-m (§0.1), so it cannot serve as a numeric
   oracle until fixed. Its formula structure is sound.

### RESOLVED: tractive-efficiency denominator (DSS Eq. 3.2 = envelope)

**Resolved 2026-08-31.** The engine divides Eq. 3.2 by the Brixius **envelope**
`mu_g`, matching the specification.

The equation is stored in `Simulation for DSS _Sahid_corrected.docx` as a
MathType/OLE object (`word/media/image1.wmf`), which is why plain-text extraction
of the DOCX shows only the label "(3.2)" and its variable legend. Rendered, it
reads `TE = mu*(1-S)/mu_g`, the legend giving `mu` as the coefficient of traction
and `mu_g` as the gross traction ratio. No `+0.04`, no slip factor in the
denominator. `tillage_dss.html` and spreadsheet `C59` both agree.

An earlier revision made the engine divide by the gross traction ratio developed at
the operating slip, arguing from the model identification `mu = GT - MR` that Eq. 3.2
must intend the developed ratio rather than its ceiling. That inference made the
engine the sole outlier against its own specification and has been reverted. The
at-slip value is retained as the diagnostic `traction_efficiency_at_slip_percent`,
reported by all three modes beside the `gross_traction_at_slip` ratio it is built
from.

Conformance is settled. **Whether the specified model matches reality is a separate,
still-open question** — published field drawbar-to-PTO ratios sit near 65-75% and the
envelope form does not reproduce them (it gives ~41.5% on the reference case, against
~79.1% for the at-slip form), and it makes TE monotonic in slip so no interior
optimum exists for slip advice. Only a field measurement of drawbar and axle power on
a known pairing can settle that; it is not a code question.

Pinned by `tests/test_reference_parity.py` (both bases against transcriptions of the
HTML's own functions) and `test_envelope_te_is_monotonic_in_slip_so_no_optimum_exists`.


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
