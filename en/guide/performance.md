---
title: Performance and Compliance Data
description: "Gox measured performance and compliance data: interpreter throughput vs goja / V8, UI frame rate and GC-pause verdicts, test262 language 78.7% and built-ins 35.7% compliance, and a third-party npm compatibility matrix with root-cause grouping. All figures, methodology and thresholds are public."
---

# Performance and Compliance Data

This page does exactly one thing: **let the numbers talk**. Every figure comes with a
reproducible command, an explicit methodology and a published threshold — including the
**one we miss**.

::: tip The one-line summary
| Acceptance item | Verdict | Basis |
| --- | --- | --- |
| Interpreter on par with goja | ❌ **Missed** | `fib28` pure compute gox ≈ **311ms** vs goja ≈ **130ms** → **2.4× slower** (±25% threshold) |
| UI free of GC pauses | ✅ **Passed** | Stressed-run aggregate p95 frame interval **5.95ms** ≤ 16.7ms; single GC pause max **1.382ms** ≤ 5ms |
| test262 `language` compliance | 78.7% | — |
| test262 `built-ins` compliance | 35.7% | Failures are highly concentrated: the top 10 of 522 clusters cover 42.75% |
:::

## 1. Test environment

All figures were measured on the same machine, on the same day, with the same scripts
(zero dependencies, external timing).

| Item | Value |
| --- | --- |
| Machine | Apple M2, 8 cores, 8 GB, macOS 26.6.2 (arm64) |
| Go | go1.26.2 |
| Node | v22.22.2 |
| goja | `v0.0.0-20261001174550-3ccc9c78af18` (standalone `bench/goja` module) |
| Date | 2026-10-02 (UTC) |

> On-device metrics (screen density, touch, frame rate, PSS memory, cold start) use a
> different methodology and must **not** be subtracted from these; they live separately in
> `docs/mobile-perf-baseline.md`.

## 2. Interpreter throughput baseline

Three scripts: `startup_idle.js` (engine start + minimal evaluation), `fib28.js`
(`fib(28)` recursion + 100k function calls) and `timers_10k.js` (10k `setTimeout(…,0)`
all fired). Each external wall time is the median of 5 runs.

```bash
./scripts/bench-all.sh --runs 5
```

| Stack | Startup (ms) | fib28 + 100k calls (ms) | 10k timers (ms) | Idle RSS (KB) |
| --- | ---: | ---: | ---: | ---: |
| **gox** | 11 | **322** | 124 | 22592 |
| **node (V8)** | 55 | 45 | 152 | 48432 |
| **goja** | 7 | **137** | 121 | 7792 |

Honest caveats: `fib28_ms` is **whole-script wall time** (startup + parse + evaluation);
goja's kernel provides no host timers, so its timer column uses a minimal event loop and
**cannot** be read as "goja's scheduler performance"; RSS measures the "empty shell", not
throughput.

### 2.1 The truth after subtracting startup

`fib28` wall time is polluted by startup — node's startup (55ms) is larger than its total
`fib28` time (45ms), so that column is almost pure startup noise. Subtracting the
`startup_idle` median:

| Stack | Estimated fib28 pure compute | Relative to gox |
| --- | ---: | --- |
| gox | 322 − 11 ≈ **311 ms** | 1.00× |
| goja | 137 − 7 ≈ **130 ms** | **0.42×** (goja is 2.4× faster) |
| node / V8 | ≈ **5 ms** (`hrtime` inline) | **0.016×** (V8 is ~62× faster) |

**Stated honestly:**

- gox is a **pure interpreter** (zero cgo, walking bytecode directly). Most of its gap to
  V8 is the **inherent interpreter-vs-JIT gap** and shouldn't all be blamed on the
  implementation.
- The fair comparison target is **goja (also a pure interpreter)**: gox is about 2.4×
  slower. That is the direct target for the next round of inline-cache / fast-path work.
- Methodology warning: the older "~15× behind V8" figure is the **raw wall ratio**; on a
  **pure-compute** basis the gap is **~60×**. Both are correct — you must state which one
  you're quoting.
- Where gox does well: **timer throughput is already on par with goja** (124ms vs 121ms,
  2% apart), faster even than node on this machine (152ms); **startup is cheap**; idle RSS is
  7.8MB (goja) / 22.6MB (gox) / 48.4MB (node). **The weak spot is the pure-compute hot loop.**

### 2.2 The quantified definition of "on par"

```
gox_fib28_compute ≤ goja_fib28_compute × 1.25     // ±25% tolerance
```

Pass ≤ ×1.25; excellent ≤ ×1.10; fail > ×1.25.
Currently `311 / 130 ≈ 2.39× > 1.25` → **missed**; roughly a 2.4× pure-compute speedup is
needed to clear the gate.

## 3. UI frame rate and GC pauses

**Location**: `tools/perf/frame_gc_test.go` + load script `testdata/perf/frame_load.js`

```bash
go test ./tools/perf/            # light probe + stress (default)
go test ./tools/perf/ -short     # light probe only
```

### 3.1 What is measured

- **Real rendering**: the script builds the tree through real JS; each "frame" updates a
  number of row signals → reactive effects mark dirty → `gfx.Pump` runs the real `Layout` +
  dirty-rect `Draw` + present. **No platform window is created** (a windowless `Surface`
  stand-in is used).
- **Frame interval**: the time between consecutive presents — it includes the JS update +
  effects + Layout + Draw + any GC pause, making it a direct proxy for the frame drops a
  user would perceive.
- **GC pauses**: `runtime/debug.ReadGCStats`, taking the **newly added** per-cycle STW pauses
  in the measurement window. **Tail only.**
- **Allocation rate**: sampled every 2ms by a separate goroutine so `ReadMemStats` overhead
  never lands inside the render loop.

### 3.2 Measured data (Apple M2, 2026-10-02, GOGC=100)

**Light probe** (300 rows, 30 rows updated per frame, 600 measured frames):

| Metric | Value |
| --- | --- |
| Frame interval p50 / p95 / p99 | 0.77 / 1.67 / **1.71** ms |
| Frame interval p99.9 / max | 1.84 / 1.98 ms |
| GC count / pause max | 1 / **0.046** ms |

**Stress** (800 rows, 200 rows updated per frame, 2400 frames × 3 runs aggregated):

| Metric | Value |
| --- | --- |
| Frame interval p50 | 3.35 ms |
| Frame interval **p95** (the verdict metric) | **5.95** ms |
| Frame interval p99 | 9.68 ms |
| Frames over 16.7ms | **6 / 2399 = 0.30%** |
| GC count (3 runs combined) | 61 |
| GC pause p50 / p95 / p99 / max | 0.100 / 0.329 / 0.628 / **1.382** ms |
| GC pause total (3 runs combined) | 10.71 ms (≈1.5µs/frame over 7200 frames) |
| Allocation avg / peak / heap peak | 86.6 / 102.4 MB/s / 98.4 MB |

Spread across the three individual runs (this shows **why the verdict can't rest on
p99/max**):

| Run | p95 | p99 | max | GC pause max |
| --- | ---: | ---: | ---: | ---: |
| #1 | 7.40 | 12.42 | 194.59 | 1.382 ms |
| #2 | 4.39 | 6.74 | 132.53 | 0.316 ms |
| #3 | 5.95 | 9.68 | 120.72 | 0.664 ms |

**GC pauses stay sub-millisecond to 1.4ms**, while frame-interval p99/max swing widely across
runs (p99 6.7–12.4ms, max 120–195ms) — that spread comes from **OS scheduling, not GC**.

### 3.3 The thresholds

```
Verdict of "no GC pauses" holds iff:
  ① p95 frame interval ≤ 16.7 ms    (95% of frames inside the 60fps single-frame budget)
  ② single GC pause max ≤ 5 ms      (the perceptibility threshold for software rendering + interaction)
```

- **Why 16.7ms**: one frame at 60fps. If nearly all frames stay inside it, users perceive no
  periodic drops.
- **Why p95 and not p99/max**: on a non-exclusive desktop machine, p99/max are dominated by OS
  scheduling jitter (across three runs of the same load, p99 varied 7–37ms and max 109–367ms).
  Judging on those would mistake "another process stole the CPU" for "a GC pause". p95 is
  stable across runs (4.4–7.4ms).
- **Why 5ms**: 5ms-class pauses are generally imperceptible; 10ms+ only shows up as a hitch
  during fast scrolling. The measured max of 1.382ms leaves **~3.6× headroom**.

**Current verdict**: ① 5.95 ≤ 16.7 ✅; ② 1.382 ≤ 5 ✅ → **no GC pauses (passed)**.

> Hard gate vs soft verdict: the `perf` test only fails hard on *order-of-magnitude*
> regression (p99 > 200ms, GC pause max > 100ms, anomalous redraw counts), so ordinary jitter
> never produces a false CI failure; the 16.7 / 5ms thresholds are written into the JSON as
> `verdict` for acceptance references.

## 4. test262 compliance

| Suite | Compliance | Passed / total |
| --- | ---: | --- |
| `language` | **78.7%** | — |
| `built-ins` | **35.7%** | 8503 / 23823 |

### 4.1 The failure surface is highly concentrated

built-ins failures are **not "fifteen thousand scattered bugs"** — the top 10 of 522 clusters
alone cover **42.75% of the failure surface**. So work is scheduled by **cluster**, not by
individual test.

Breakdown by mode (mutually exclusive; the modes sum to the 15320 failures):

| Mode | Size | Share of failures | Scheduling implication |
| --- | ---: | ---: | --- |
| Semantic deviation | 9694 | 63.28% | Capability exists but values/order/boundaries/this-checks diverge — the **main battlefield**, align method by method |
| Feature absent | 5185 | 33.84% | Stops in the front end or errors "no such thing" at runtime — **implement in blocks** |
| harness dependency | 369 | 2.41% | The test never reached the engine — **runner side**, cheapest, clear first |
| crash | 52 | 0.34% | Hangs on timeout — highest priority, it poisons an entire shard |
| False-positive retreat | 20 | 0.13% | negative-test verdict mismatch (all in RegExp/property-escapes) |

In one line: **six tenths are "done wrong", three tenths are "not done"**.

Top 10 clusters (family = first 3 path segments of a test):

| # | Directory family | Failure mode | Cluster size | Family baseline (pass/total) |
| --- | --- | --- | ---: | --- |
| 1 | `built-ins/Array/prototype` | Semantic deviation | 1708 | 967/2812 = 34.39% |
| 2 | `built-ins/TypedArray/prototype` | Feature absent | 1311 | 0/1411 = **0.00%** |
| 3 | `built-ins/Temporal/ZonedDateTime` | Semantic deviation | 605 | 277/901 = 30.74% |
| 4 | `built-ins/Temporal/PlainDateTime` | Semantic deviation | 531 | 226/773 = 29.24% |
| 5 | `built-ins/Temporal/PlainDate` | Semantic deviation | 452 | 184/652 = 28.22% |
| 6 | `built-ins/RegExp/property-escapes` | Feature absent | 447 | 143/613 = 23.33% |
| 7 | `built-ins/String/prototype` | Semantic deviation | 391 | 571/1073 = 53.22% |
| 8 | `built-ins/Temporal/PlainYearMonth` | Semantic deviation | 374 | 127/509 = 24.95% |
| 9 | `built-ins/Temporal/PlainTime` | Semantic deviation | 372 | 117/493 = 23.73% |
| 10 | `built-ins/Temporal/Duration` | Semantic deviation | 358 | 172/540 = 31.85% |

**Temporal is "one family, seven clusters"** — 6 of the top 10. `TypedArray/prototype` sits at a
0.00% baseline, meaning the whole segment is unimplemented (implement in blocks, not test by test).

> How to run: `gox test262 -suite built-ins -jobs 16` (128 fixed shards; 23823 tests in 62.7s).
> Methodology: the denominator is the tests actually collected; harness dependencies skipped by
> the runner **count toward the denominator but not toward passes**.

## 5. Third-party npm compatibility

Eight mainstream libraries were tested; **only uuid is partially usable**. Method: npm install →
write a minimal ESM smoke script covering the core API → run `gox <script>.mjs` → record
pass/fail and the first failure point.

| Library | Version | Verdict | Failure reason |
| --- | --- | --- | --- |
| uuid | 14.0.3 | Partially usable | `v4()` generation and uniqueness pass; `validate()` reports `REGEX is not defined` (regex literal subset unsupported) |
| lodash-es | 4.18.1 | Unusable | Cross-module named import binding fails: `toInteger is not defined` (import bindings aren't properly established under circular references between modules) |
| axios | 1.20.0 | Unusable | Minified output contains the character class `[\s\uFEFF\xA0]`; compile-time `Invalid regular expression` |
| dayjs | 1.11.23 | Unusable | Default entry is UMD/CJS (red line one, no CJS); after switching to `dayjs/esm` it parses but compilation fails on a duplicate `diff` declaration in module scope |
| validator | 13.15.35 | Unusable | Compile-time `missing semicolon before COMMA` (minified output contains syntax outside the subset) |
| qs | 6.16.0 | Unusable | CJS main entry: `require is not defined` (red line one, deliberately a loud failure) |
| ms | 2.1.3 | Unusable | CJS main entry: `module is not defined` (red line one) |
| nanoid | 6.0.2 | Unusable | Module binding failure: `GET_RANDOM_LIMIT is not defined` (same class as lodash-es) |

### 5.1 Root-cause grouping (more important than the per-library verdicts)

All measured failures fall into four root causes:

1. **Pure CJS packages** (qs, ms, dayjs default entry, lodash main package): established
   behaviour under red line one — `require/module is not defined`, a **loud failure, not a bug**.
2. **Module bindings failing under circular/deep cross-references** (lodash-es, nanoid): the
   `import` named binding isn't established when the depended-on module executes, giving
   `X is not defined`. This is a **real defect in runtime module evaluation order** and it blocks
   large packages with internal multi-file cross-references — **the highest-priority ecosystem debt**.
3. **Regex subset** (axios, lodash-es, parts of uuid): lookahead `(?=…)` and unicode escapes such
   as `\uFEFF` / `\u200d` are unsupported. Modern minified bundles hit this routinely.
4. **Minified-output syntax subset gaps** (validator, dayjs.min): the parser reports
   `missing semicolon before COMMA` on valid but minified syntax.

::: tip Which packages to pick
**Single-file, no internal circular references and no complex regex pure-ESM packages will run**
(uuid's core is in this class); the rest of the mainstream ecosystem is **essentially unusable** at
v0. Prefer Gox's built-in modules (`fs` / `path` / `http` / `process`) or the `gx/*` host modules.
:::

## 6. Existing performance machinery

These mechanisms **already exist** (this page only takes inventory); they are the answer to "why
doesn't gox stumble on the UI side":

| Mechanism | Implementation | Notes |
| --- | --- | --- |
| `gx/dev` frame instrumentation | `devFrameTick` in `gfx/dev.go` | **Monotonic counting only, no layout/draw timing** (the field shape is locked by `TestDevSnapshotShape`) |
| image LRU cache | `gfx/image.go` | `path → decoded *image.RGBA`, evicted at a **count** cap of 16 |
| glyph LRU cache | `gfx/font.go` | `(size, rune) → glyph mask`, capacity 1024 |
| `<scroll vlist>` virtualisation | `gfx/vlist.go` | Materialises only the **viewport + above/below buffer** (2 rows by default) |

`<scroll vlist>` measurement (100k rows, Windows / i7 machine — **a different machine, not to be
subtracted from the figures above**):

| Rows | First frame, full | First frame, vlist | Scroll frame, full | Scroll frame, vlist |
| --- | ---: | ---: | ---: | ---: |
| 100k | 2187 ms | **89 ms** | 998.8 ms | **0.115 ms** |

The first frame is decoupled from row count (vlist always issues 64 render calls), and scroll
frames are fully decoupled from row count.

> Verification discipline: **you must count "render calls", not "nodes left in the tree"** —
> otherwise a fake virtualisation that builds everything then destroys it will fool the assertion.
>
> This is a **GUI rendering path** result, **not interpreter throughput**. Don't use it to answer
> "why is fib28 slow".

---

Sources: [`docs/performance.md`](https://github.com/14752222/Gox/blob/main/docs/performance.md),
[`docs/test262-builtins-clusters.md`](https://github.com/14752222/Gox/blob/main/docs/test262-builtins-clusters.md),
[`docs/compat-matrix.md`](https://github.com/14752222/Gox/blob/main/docs/compat-matrix.md).

Next stop: [Limits and Common Pitfalls](/en/components/limits) for the itemised gaps, or back to
the [Tutorials](/en/guide/) to start writing code.
