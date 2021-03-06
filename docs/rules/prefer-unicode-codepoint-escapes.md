---
pageClass: "rule-details"
sidebarDepth: 0
title: "regexp/prefer-unicode-codepoint-escapes"
description: "enforce use of unicode codepoint escapes"
---
# regexp/prefer-unicode-codepoint-escapes

> enforce use of unicode codepoint escapes

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the use of Unicode codepoint escapes instead of Unicode escapes using surrogate pairs.

<eslint-code-block fix>

```js
/* eslint regexp/prefer-unicode-codepoint-escapes: "error" */

/* ✓ GOOD */
var foo = /\u{1f600}/u
var foo = /😀/u

/* ✗ BAD */
var foo = /\ud83d\ude00/u
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-regexp/blob/master/lib/rules/prefer-unicode-codepoint-escapes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-regexp/blob/master/tests/lib/rules/prefer-unicode-codepoint-escapes.ts)