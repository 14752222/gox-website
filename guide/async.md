---
title: 异步与事件循环
description: Gox 的异步模型：async/await、Promise、setTimeout/setInterval、严格定时器与 delay(ms, value) 便捷函数，事件循环退出语义。
---

# 异步与事件循环

`async` / `await` 与 Promise 开箱即用。内置工具 `delay(ms, value)` 返回一个在 `ms` 毫秒后 resolve 为 `value` 的 Promise,写示例和测试都很方便:

```js
async function main() {
  let v = await delay(10, "timer done")
  console.log(v)
}
main()
```

```text
Promise { <pending> }     ← 顶层回显:main() 调用的返回值
timer done                ← 定时器到期后,await 继续执行
```

定时器家族:

| API | 说明 |
| --- | --- |
| `setTimeout(fn, ms)` | 延迟执行,返回定时器 id;`clearTimeout(id)` 取消 |
| `setInterval(fn, ms)` | 周期执行;`clearInterval(id)` 取消 |
| `setStrictTimeout` 等 | 严格定时器变体,精度可控,适合对时间敏感的场景 |
| `requestIdleCallback(fn)` | 空闲时机回调,不阻塞关键路径 |
| `delay(ms, value?)` | Gox 便捷函数:延时 resolve 指定值 |

::: tip 退出语义
脚本不会在有未完成的定时器或异步回调时立刻退出 —— 事件循环会驱动它们全部执行完,这也是上面 `main()` 能打印结果的原因。
:::
