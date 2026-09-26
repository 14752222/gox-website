---
title: Packing into a Standalone Executable
description: "Use the jsbuild packager to bundle a JS script into a single-file executable with its own runtime: GUI apps, cross-compiling for windows/linux/darwin, zero dependencies on the target machine."
---

# Packing into a Standalone Executable

The `packager` (the `packager/` directory in the repo; the command name shown in its own help is `jsbuild`) embeds the entry script and its relative imports into a generated Go project and compiles it into a single-file program with the full runtime built in — the target machine needs neither Gox, nor Go, nor any other runtime installed:

```bash
go run ./packager app.js -o app.exe                    # CLI app
go run ./packager counter.js --gui -o counter.exe      # GUI app
go run ./packager app.js --gui --target linux/amd64    # pure-Go cross-compilation
```

| Option | Description |
| --- | --- |
| `-o, --out <path>` | Output file path (default: `<input filename>.exe`; non-Windows targets default to no `.exe`) |
| `--name <name>` | App name shown in error messages; defaults to the input filename |
| `--windowed` | Windowed mode: no console window (Windows only) |
| `--gui` | GUI app: window message-pump event loop (pairs with gx/gfx render) |
| `--target <os>/<arch>` | Cross-compilation target: windows / linux / darwin × amd64 / arm64 / 386 |
| `-v, --verbose` | Show build output |

::: tip Zero-friction cross-compilation
The entire runtime is pure Go (no cgo), so `--target linux/amd64` builds fine even on Windows — no cross toolchain for the target is needed.
:::

For platform-specific distribution notes (Windows icons and signing, Linux packaging formats, the macOS .app bundle), see [docs/desktop-distribution.md](https://github.com/14752222/Gox/blob/main/docs/desktop-distribution.md).
