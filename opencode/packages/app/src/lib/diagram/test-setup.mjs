import { describe, it, expect } from "node:test"
import assert from "node:assert"

// Polyfill bun:test compatibility
globalThis.describe = describe
globalThis.it = it
globalThis.expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected),
  toEqual: (expected) => assert.deepStrictEqual(actual, expected),
  toBeDefined: () => assert.notStrictEqual(actual, undefined),
  toBeUndefined: () => assert.strictEqual(actual, undefined),
  toBeNull: () => assert.strictEqual(actual, null),
  toBeTruthy: () => assert.ok(actual),
  toBeFalsy: () => assert.ok(!actual),
  toContain: (expected) => assert.ok(actual.includes(expected)),
  toHaveLength: (expected) => assert.strictEqual(actual.length, expected),
  toBeGreaterThan: (expected) => assert.ok(actual > expected),
  toBeLessThan: (expected) => assert.ok(actual < expected),
  toBeGreaterThanOrEqual: (expected) => assert.ok(actual >= expected),
  toBeLessThanOrEqual: (expected) => assert.ok(actual <= expected),
  toMatch: (pattern) => assert.ok(pattern.test(actual)),
  toThrow: () => {
    try {
      actual()
      assert.fail("Expected function to throw")
    } catch (e) {
      assert.ok(e)
    }
  },
  not: {
    toBe: (expected) => assert.notStrictEqual(actual, expected),
    toEqual: (expected) => assert.notDeepStrictEqual(actual, expected),
    toContain: (expected) => assert.ok(!actual.includes(expected)),
  },
})

// Mock ClipboardItem for tests
if (typeof globalThis.ClipboardItem === "undefined") {
  globalThis.ClipboardItem = class {
    constructor(data) {
      this.data = data
    }
  }
}

// Mock navigator.clipboard
if (!globalThis.navigator) {
  globalThis.navigator = {}
}
if (!globalThis.navigator.clipboard) {
  globalThis.navigator.clipboard = {
    write: async () => {},
    writeText: async () => {},
    readText: async () => "",
  }
}

// Mock Image for PNG export tests
if (typeof globalThis.Image === "undefined") {
  globalThis.Image = class {
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload()
      }, 0)
    }
  }
}

// Mock document.createElement for export tests
if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    createElement: (tag) => {
      if (tag === "canvas") {
        return {
          getContext: () => ({
            scale: () => {},
            drawImage: () => {},
          }),
          toBlob: (cb) => {
            cb(new Blob(["fake"], { type: "image/png" }))
          },
          width: 100,
          height: 100,
        }
      }
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: () => {},
        }
      }
      return {}
    },
  }
}

// Mock Blob and URL
if (typeof globalThis.Blob === "undefined") {
  globalThis.Blob = class {
    constructor(parts, options) {
      this.parts = parts
      this.type = options?.type || ""
    }
  }
}

if (typeof globalThis.URL === "undefined") {
  globalThis.URL = {
    createObjectURL: () => "blob:fake",
    revokeObjectURL: () => {},
  }
}

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsDataURL() {
      this.result = "data:image/png;base64,fake"
      if (this.onloadend) this.onloadend()
    }
  }
}

export { describe, it, expect }
