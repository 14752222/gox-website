---
title: Standard Builtins, Global Functions, and Timers
description: "Gox standard builtin reference: key points for Object/Array/String/Map/Set/Math/JSON/RegExp/Promise/TypedArray/Proxy/Temporal category by category, plus global functions and the setTimeout/strict timer family."
---

# Standard Builtins, Global Functions, and Timers

## Standard Built-in Objects {#builtins}

The tables below list "the methods you can actually use" rather than every prototype method — parts that match the ES standard are not repeated.

### Fundamentals and Collections {#bi-core}

| Object | Highlights |
| --- | --- |
| Object | `keys` / `values` / `entries` / `assign` / `freeze` / `create` / `getPrototypeOf` etc.; `toString` / `hasOwnProperty` / `valueOf` on the prototype |
| Array | Full prototype method family: `map` / `filter` / `reduce` / `find` / `flat` / `sort` / `splice` / `at` etc., plus `Array.from` / `Array.of` / `Array.isArray` |
| String | Prototype methods: `slice` / `split` / `replace(All)` / `padStart` / `trim` / `startsWith` / `match(All)` etc. |
| Number | Constants like `MAX_VALUE` / `MIN_VALUE` / `EPSILON` / `MAX_SAFE_INTEGER` + `Number.parseInt` / `isInteger` / `toFixed` |
| Boolean / Symbol / BigInt | `Symbol("x")` creates a unique symbol; `BigInt(1n)` arbitrary-precision integers |
| Map / Set | Full method family: `set` / `get` / `has` / `delete` / `size` / `keys` / `values` / `entries` / `forEach` |
| WeakMap / WeakSet | Weak-reference collections; keys must be objects |
| WeakRef / FinalizationRegistry | Weak references and finalization callbacks |
| Iterator | Iterator helpers (ES2025), works with `for...of` and spread syntax |

### Numbers and Math {#bi-number}

| Object | Highlights |
| --- | --- |
| Math | `abs` / `floor` / `ceil` / `round` / `max` / `min` / `pow` / `sqrt` / `hypot` / `random` / `trunc` / `sign` / trig functions, plus constants like `PI` / `E` |
| Number | See above; numeric literals support `0x` / `0b` / `0o` / exponent / underscore separators |
| BigInt | `n`-suffixed literals (`10n`); cannot be mixed with Number in arithmetic |

### Strings and Regex {#bi-string}

| Object | Highlights |
| --- | --- |
| String | Template literals (```a${b}```) are a language-level feature; prototype methods see the table above |
| RegExp | `test` / `exec` / named capture groups / flags `gimsuy`; `String.prototype.replace` supports a replacer function |
| JSON | `stringify(value, replacer?, space?)` and `parse(text, reviver?)` |

```js
console.log(JSON.stringify({ ok: true }, null, 2));
console.log("a-b-c".split("-").map(s => s.toUpperCase()));   // [A, B, C]
console.log(/^(\d+)-(\w+)$/.exec("42-abc")[2]);              // abc
```

### Async {#bi-async}

| Object | Highlights |
| --- | --- |
| Promise | `new Promise(fn)`, `then` / `catch` / `finally`, statics `resolve` / `reject` / `all` / `allSettled` / `race` / `any` |
| async / await | Supported at the syntax level. Both `async function` and async arrows (`async () => {}` / `async x => x`) work; no top-level `await` |
| delay | A Gox-specific convenience: `delay(ms, value?)` returns a Promise that resolves after the delay |

```js
async function main() {
  let v = await delay(10, "timer done");     // builtin convenience
  console.log(v);
}
main();

// ⚠ Event handlers must be anonymous async function expressions
const onClick = async function () {
  const r = await fetch("https://example.com");
  console.log(r.status);
};
```

### Binary {#bi-binary}

| Object | Highlights |
| --- | --- |
| ArrayBuffer | Fixed-length byte buffer, `byteLength` / `slice` |
| TypedArray family | `Int8Array` / `Uint8Array` / `Uint8ClampedArray` / `Int16Array` / `Uint16Array` / `Int32Array` / `Uint32Array` / `Float32Array` / `Float64Array` / `BigInt64Array` / `BigUint64Array` |
| DataView | Read/write any type at an offset: `getUint8` / `setInt32` / `getFloat64` etc., with endianness control |

```js
let buf = new ArrayBuffer(8);
let view = new DataView(buf);
view.setInt32(0, 258, true);           // little-endian write
console.log(view.getInt32(0, true));   // 258

// fs.readBytesSync returns exactly a byte array
let bytes = fs.readBytesSync("testdata/image_demo.png");
```

### Metaprogramming {#bi-meta}

| Object | Highlights |
| --- | --- |
| Proxy | Intercept object operations: `get` / `set` / `has` / `deleteProperty` / `apply` / `construct` etc. |
| Reflect | Functional API mirroring the Proxy traps one to one |
| eval | Evaluate string source in the current scope |

### Error Types {#bi-error}

`Error` / `TypeError` / `RangeError` / `ReferenceError` / `SyntaxError` / `AggregateError` — all can be `new`ed, carry `message` / `name` / `stack`, and work with `try` / `catch` / `finally` / `throw`.

```js
try {
  throw new TypeError("bad argument");
} catch (e) {
  console.log(e.name, e.message);      // TypeError bad argument
} finally {
  console.log("cleanup");
}
```

### Temporal Dates and Times {#bi-temporal}

::: warning No Date
Gox **does not implement** the legacy `Date` object; it goes straight to ES's next-generation date/time API `Temporal`. `new Date()` in old code throws a `ReferenceError`.
:::

| Member | Description |
| --- | --- |
| Temporal.Now | The only entry point that reads the system clock: `instant()` / `plainDateISO()` / `plainTimeISO()` etc. (methods with the ISO suffix always use the iso8601 calendar) |
| Temporal.Instant | An absolute point in time (nanosecond precision), e.g. `Instant.from("2026-09-19T00:00:00Z")` |
| Temporal.PlainDate | A date without a time |
| Temporal.PlainTime | A time without a date |
| Temporal.PlainDateTime | Date + time, no time zone |
| Temporal.ZonedDateTime | A full time with a time zone |
| Temporal.Duration | A duration; can be added, subtracted, and compared |
| Temporal.PlainYearMonth / PlainMonthDay | Year-month / month-day |
| Temporal.TimeZone / Calendar | Time zone and calendar objects |

```js
let today = Temporal.Now.plainDateISO();
console.log(today.toString());                       // 2026-09-19

let d = Temporal.PlainDate.from("2026-01-31");
console.log(d.add({ days: 1 }).toString());           // 2026-02-01

let due = Temporal.Duration.from({ hours: 2, minutes: 30 });
console.log(due.total({ unit: "minutes" }));          // 150
```

For the complete method set, see the [runtime implementation tutorial](https://github.com/14752222/Gox/blob/main/docs/js-runtime-api-tutorial.md).

## Global Functions and Constants {#globals}

| Name | Signature | Description |
| --- | --- | --- |
| parseInt | (string, radix?) | Parses an integer, stops at the first invalid character |
| parseFloat | (string) | Parses a floating-point number |
| isNaN | (value) | Is it NaN (performs type coercion) |
| isFinite | (value) | Is it a finite number |
| eval | (code) | Evaluate string source |
| NaN | constant | Not a Number |
| Infinity | constant | Positive infinity |
| undefined | constant | Undefined |

```js
console.log(parseInt("42px", 10));    // 42
console.log(parseFloat("3.14abc"));   // 3.14
console.log(isNaN(NaN), isFinite(Infinity));   // true false
```

## Timers and Scheduling {#timers}

### Regular Timers

| API | Signature | Description |
| --- | --- | --- |
| setTimeout | (fn, ms) => id | Run once after a delay |
| setInterval | (fn, ms) => id | Run periodically |
| clearTimeout | (id) | Cancel |
| clearInterval | (id) | Cancel |
| requestIdleCallback | (fn) => id | Callback at idle time; doesn't block the critical path |
| cancelIdleCallback | (id) | Cancel an idle callback |
| delay | (ms, value?) => Promise | Gox convenience: resolves with the given value after the delay; handy for examples and tests |

### Strict Timers

Regular timers only run when the event loop is idle, so actual intervals can stretch. For time-sensitive scenarios, use the strict timer family:

| API | Description |
| --- | --- |
| setStrictTimeout | Strict one-shot timer, scheduled against the target moment rather than "queued" |
| setStrictInterval | Strict periodic timer |
| clearStrictTimeout | Cancel |
| clearStrictInterval | Cancel |
| setStrictIntervalMode | Adjust the compensation mode of periodic timers |

::: tip Exit semantics
A script **does not** exit immediately while timers or async callbacks are still pending — the event loop drives them all to completion. That's why "calling an async function at the top level still shows its printed result a moment later".
:::

::: info Caret blinking in GUI apps
When a window has neither events nor timers, the event pump falls asleep and the input caret freezes. Apps that need continuous blinking can just run an idle `requestAnimationFrame` loop.
:::
