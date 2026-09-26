---
title: 标准内建对象、全局函数与定时器
description: Gox 标准内建对象参考：Object/Array/String/Map/Set/Math/JSON/RegExp/Promise/TypedArray/Proxy/Temporal 逐类要点，全局函数与 setTimeout/严格定时器家族。
---

# 标准内建对象、全局函数与定时器

## 标准内建对象 {#builtins}

下表按"你能直接用的方法"列出,不追求罗列全部原型方法 —— 与 ES 标准一致的部分不重复展开。

### 基础与集合 {#bi-core}

| 对象 | 要点 |
| --- | --- |
| Object | `keys` / `values` / `entries` / `assign` / `freeze` / `create` / `getPrototypeOf` 等;原型上有 `toString` / `hasOwnProperty` / `valueOf` |
| Array | 完整原型方法族:`map` / `filter` / `reduce` / `find` / `flat` / `sort` / `splice` / `at` 等,以及 `Array.from` / `Array.of` / `Array.isArray` |
| String | 原型方法族:`slice` / `split` / `replace(All)` / `padStart` / `trim` / `startsWith` / `match(All)` 等 |
| Number | `MAX_VALUE` / `MIN_VALUE` / `EPSILON` / `MAX_SAFE_INTEGER` 等常量 + `Number.parseInt` / `isInteger` / `toFixed` |
| Boolean / Symbol / BigInt | `Symbol("x")` 创建唯一符号;`BigInt(1n)` 任意精度整数 |
| Map / Set | 完整方法族:`set` / `get` / `has` / `delete` / `size` / `keys` / `values` / `entries` / `forEach` |
| WeakMap / WeakSet | 弱引用集合,键必须是对象 |
| WeakRef / FinalizationRegistry | 弱引用与终结回调 |
| Iterator | 迭代器助手(ES2025),配合 `for...of` 与展开语法 |

### 数值与数学 {#bi-number}

| 对象 | 要点 |
| --- | --- |
| Math | `abs` / `floor` / `ceil` / `round` / `max` / `min` / `pow` / `sqrt` / `hypot` / `random` / `trunc` / `sign` / 三角函数,以及 `PI` / `E` 等常量 |
| Number | 见上;数值字面量支持 `0x` / `0b` / `0o` / 指数 / 下划线分隔 |
| BigInt | 后缀 `n` 字面量(`10n`);与 Number 不能混算 |

### 字符串与正则 {#bi-string}

| 对象 | 要点 |
| --- | --- |
| String | 模板字符串(```a${b}```)是语言层能力;原型方法见上表 |
| RegExp | `test` / `exec` / 命名捕获组 / 标志 `gimsuy`;`String.prototype.replace` 支持替换函数 |
| JSON | `stringify(value, replacer?, space?)` 与 `parse(text, reviver?)` |

```js
console.log(JSON.stringify({ ok: true }, null, 2));
console.log("a-b-c".split("-").map(s => s.toUpperCase()));   // [A, B, C]
console.log(/^(\d+)-(\w+)$/.exec("42-abc")[2]);              // abc
```

### 异步 {#bi-async}

| 对象 | 要点 |
| --- | --- |
| Promise | `new Promise(fn)`、`then` / `catch` / `finally`,静态 `resolve` / `reject` / `all` / `allSettled` / `race` / `any` |
| async / await | 语法层支持。`async function` 与 async 箭头(`async () => {}` / `async x => x`)都可以;顶层不能 `await` |
| delay | Gox 特有的便捷函数:`delay(ms, value?)` 返回一个延时 resolve 的 Promise |

```js
async function main() {
  let v = await delay(10, "timer done");     // 内置便捷函数
  console.log(v);
}
main();

// ⚠ 事件处理器要写成匿名 async 函数表达式
const onClick = async function () {
  const r = await fetch("https://example.com");
  console.log(r.status);
};
```

### 二进制 {#bi-binary}

| 对象 | 要点 |
| --- | --- |
| ArrayBuffer | 固定长度字节缓冲,`byteLength` / `slice` |
| TypedArray 家族 | `Int8Array` / `Uint8Array` / `Uint8ClampedArray` / `Int16Array` / `Uint16Array` / `Int32Array` / `Uint32Array` / `Float32Array` / `Float64Array` / `BigInt64Array` / `BigUint64Array` |
| DataView | 按偏移读写任意类型:`getUint8` / `setInt32` / `getFloat64` 等,可指定大小端 |

```js
let buf = new ArrayBuffer(8);
let view = new DataView(buf);
view.setInt32(0, 258, true);           // 小端写
console.log(view.getInt32(0, true));   // 258

// fs.readBytesSync 返回的正是字节数组
let bytes = fs.readBytesSync("testdata/image_demo.png");
```

### 元编程 {#bi-meta}

| 对象 | 要点 |
| --- | --- |
| Proxy | 拦截对象操作:`get` / `set` / `has` / `deleteProperty` / `apply` / `construct` 等 |
| Reflect | 与 Proxy 陷阱一一对应的函数式 API |
| eval | 在当前作用域求值字符串源码 |

### 错误类型 {#bi-error}

`Error` / `TypeError` / `RangeError` / `ReferenceError` / `SyntaxError` / `AggregateError`, 都可 `new`,带 `message` / `name` / `stack`, 配合 `try` / `catch` / `finally` / `throw` 使用。

```js
try {
  throw new TypeError("bad argument");
} catch (e) {
  console.log(e.name, e.message);      // TypeError bad argument
} finally {
  console.log("cleanup");
}
```

### Temporal 日期时间 {#bi-temporal}

::: warning 没有 Date
Gox **不实现**旧的 `Date` 对象,直接用 ES 的下一代日期时间 API `Temporal`。老代码里的 `new Date()` 会报 `ReferenceError`。
:::

| 成员 | 说明 |
| --- | --- |
| Temporal.Now | 唯一读取系统时钟的入口:`instant()` / `plainDateISO()` / `plainTimeISO()` 等(ISO 后缀的方法固定用 iso8601 日历) |
| Temporal.Instant | 绝对时间点(纳秒精度),如 `Instant.from("2026-09-19T00:00:00Z")` |
| Temporal.PlainDate | 不带时间的日期 |
| Temporal.PlainTime | 不带日期的时间 |
| Temporal.PlainDateTime | 日期 + 时间,无时区 |
| Temporal.ZonedDateTime | 带时区的完整时间 |
| Temporal.Duration | 时长,可加减比较 |
| Temporal.PlainYearMonth / PlainMonthDay | 年月 / 月日 |
| Temporal.TimeZone / Calendar | 时区与日历对象 |

```js
let today = Temporal.Now.plainDateISO();
console.log(today.toString());                       // 2026-09-19

let d = Temporal.PlainDate.from("2026-01-31");
console.log(d.add({ days: 1 }).toString());           // 2026-02-01

let due = Temporal.Duration.from({ hours: 2, minutes: 30 });
console.log(due.total({ unit: "minutes" }));          // 150
```

完整方法集见[运行时实现教程](https://github.com/14752222/Gox/blob/main/docs/js-runtime-api-tutorial.md)。

## 全局函数与常量 {#globals}

| 名称 | 签名 | 说明 |
| --- | --- | --- |
| parseInt | (string, radix?) | 解析整数,遇非法字符即停 |
| parseFloat | (string) | 解析浮点数 |
| isNaN | (value) | 是否为 NaN(会做类型转换) |
| isFinite | (value) | 是否为有限数 |
| eval | (code) | 求值字符串源码 |
| NaN | 常量 | 非数字 |
| Infinity | 常量 | 正无穷 |
| undefined | 常量 | 未定义 |

```js
console.log(parseInt("42px", 10));    // 42
console.log(parseFloat("3.14abc"));   // 3.14
console.log(isNaN(NaN), isFinite(Infinity));   // true false
```

## 定时器与调度 {#timers}

### 常规定时器

| API | 签名 | 说明 |
| --- | --- | --- |
| setTimeout | (fn, ms) => id | 延迟执行一次 |
| setInterval | (fn, ms) => id | 周期执行 |
| clearTimeout | (id) | 取消 |
| clearInterval | (id) | 取消 |
| requestIdleCallback | (fn) => id | 空闲时机回调,不阻塞关键路径 |
| cancelIdleCallback | (id) | 取消空闲回调 |
| delay | (ms, value?) => Promise | Gox 便捷函数:延时 resolve 指定值,写示例与测试很方便 |

### 严格定时器

常规定时器会在事件循环空闲时才跑,实际间隔可能被拖长。对时间敏感的场景用严格定时器家族:

| API | 说明 |
| --- | --- |
| setStrictTimeout | 严格版单次定时器,按目标时刻调度而非"排队" |
| setStrictInterval | 严格版周期定时器 |
| clearStrictTimeout | 取消 |
| clearStrictInterval | 取消 |
| setStrictIntervalMode | 调整周期定时器的补偿模式 |

::: tip 退出语义
脚本**不会**在有未完成定时器或异步回调时立刻退出 —— 事件循环会把它们全部驱动完, 这也就是"顶层调用了 async 函数,过一会儿还能看到它打印结果"的原因。
:::

::: info GUI 应用里的光标闪烁
窗口既没有事件也没有定时器时,事件泵会睡着,输入框光标就冻住。需要持续闪烁的应用挂一个空转的 `requestAnimationFrame` 循环即可。
:::
