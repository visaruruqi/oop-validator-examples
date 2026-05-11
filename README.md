# oop-validator-examples

A standalone Vue 3 demo app showcasing the [oop-validator](https://www.npmjs.com/package/oop-validator) library — its Vue directives, composables, and validation patterns.

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## What's inside

10 example pages, each focused on a different feature set:

| Example | What it demonstrates |
|---|---|
| 01 · Contact Form | `v-required`, `v-minlength`, `v-maxlength`, `v-pattern`, `v-type` on text, email, select, textarea, radio, checkbox |
| 02 · Registration Form | Async validation (email uniqueness), cross-field match (confirm password), `v-messages.multiple`, `$pending` spinner |
| 03 · Dynamic Items Form | Adding/removing fields at runtime, `registerField` / `unregisterField`, dynamic rule toggling |
| 04 · Numeric Validation | Side-by-side comparison of `v-min`/`v-max` (numeric value) vs `v-minlength`/`v-maxlength` (string length) |
| 05 · Messages Showcase | All `v-messages` / `v-message` patterns, single vs multiple error display, custom error text |
| 06 · Form State Debugger | Live view of all field state (`$touched`, `$dirty`, `$valid`, `$error`, `$pending`) as you interact |
| 07 · Custom Validation Rules | Writing `IValidationRule` classes, registering them via `useForm`, `ref()` vs `reactive()` as form data |
| 08 · Schema Validation | `useFormValidation(values, schema)` — same form as 01, but rules live in a JS config object instead of `v-*` directives |
| 09 · Single-Field Validation | `useValidation(ref, rules)` — standalone inputs (search, coupon, slug, newsletter) without a `<form>` |
| 10 · Form-State CSS | The new `v-form-pristine` / `v-form-dirty` / `v-form-touched` / `v-form-submitted` / `v-form-pending` classes (v1.1.0+) — live demo showing each one lighting up as you interact |

## How it works

The app installs `oop-validator` from npm and uses its Vue layer:

```ts
// main.ts
import { VueValidationPlugin } from 'oop-validator/vue'
createApp(App).use(VueValidationPlugin).mount('#app')
```

```ts
// any component
import { useForm } from 'oop-validator/vue'

const data = reactive({ email: '', name: '' })
const form = useForm('myForm', data)
```

```html
<form name="myForm" v-submit="handleSubmit">
  <input name="email" type="email" v-model="data.email" v-required v-type />
</form>
```

## Package structure

`oop-validator` ships two entry points:

| Import | Contents |
|---|---|
| `oop-validator` | Core rules + engines (framework-agnostic) |
| `oop-validator/vue` | Composables + directives + `VueValidationPlugin` |

## Available directives

`v-required` `v-minlength` `v-maxlength` `v-pattern` `v-min` `v-max` `v-type` `v-messages` `v-message` `v-submit` `v-form-group`

## CSS classes injected automatically

Directives toggle these classes on each input — style them however you like:

```
v-valid        v-invalid
v-pristine     v-dirty
v-touched      v-untouched
v-pending

v-valid-{rule}    v-invalid-{rule}
```

## Links

- [oop-validator on npm](https://www.npmjs.com/package/oop-validator)
- [GitHub](https://github.com/visaruruqi/oop-validator)
