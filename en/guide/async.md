---
title: Async and the Event Loop
description: "Gox's async model: async/await, Promises, setTimeout/setInterval, strict timers, the delay(ms, value) helper, and event loop exit semantics."
---

# Async and the Event Loop

`async` / `await` and Promises work out of the box. The built-in helper `delay(ms, value)` returns a Promise that resolves to `value` after `ms` milliseconds — handy for examples and tests:

```js
async function main() {
  let v = await delay(10, "timer done")
  console.log(v)
}
main()
```

```text
Promise { <pending> }     ← top-level echo: the return value of the main() call
timer done                ← after the timer fires, the await resumes
```

The timer family:

| API | Description |
| --- | --- |
| `setTimeout(fn, ms)` | Runs after a delay, returns a timer id; `clearTimeout(id)` cancels it |
| `setInterval(fn, ms)` | Runs repeatedly; `clearInterval(id)` cancels it |
| `setStrictTimeout` and friends | Strict timer variants with controllable precision, for time-sensitive scenarios |
| `requestIdleCallback(fn)` | Idle-time callback; does not block the critical path |
| `delay(ms, value?)` | Gox helper: resolves to the given value after a delay |

::: tip Exit semantics
The script does not exit immediately while timers or async callbacks are still pending — the event loop drives them all to completion. That is why the `main()` above manages to print its result.
:::
