# Getting Started with oop-validator

A progressive guide from zero to advanced — each concept builds on the previous one.

---

## Which API should I use?

`oop-validator` ships **four ways** to validate. Pick the one that fits your code style — they all share the same rule engine underneath, so there's no lock-in.

| You need… | Use | Style | Example |
|---|---|---|---|
| One reactive input validated (search box, coupon, slug) | `useValidation(ref, rules)` | Imperative, no `<form>` needed | [09 · Single-Field](src/examples/09-SingleFieldValidation.vue) |
| A whole form, rules in a config object | `useFormValidation(values, schema)` | Schema-driven, no template wiring | [08 · Schema Validation](src/examples/08-SchemaValidation.vue) |
| A whole form, rules co-located with inputs | `useForm` + `v-*` directives | AngularJS-style, declarative markup | [01 · Contact Form](src/examples/01-ContactForm.vue) |
| Validation outside Vue (Node, vanilla JS, React) | `ValidationEngine` / `FormValidationEngine` | Framework-agnostic core | §3 below |

> **Rule of thumb:** start with `useForm` + directives for forms, drop down to `useFormValidation` when rules need to come from JSON / a backend, and use `useValidation` for one-off inputs that aren't part of a form.

---

## 1. Installation

```bash
npm install oop-validator
```

Two entry points — import only what you need:

```ts
// Framework-agnostic core (works in React, Node.js, vanilla JS)
import { ValidationEngine, FormValidationEngine } from 'oop-validator'

// Vue layer — composables, directives, plugin
import { useForm, VueValidationPlugin } from 'oop-validator/vue'
```

---

## 2. Register the plugin (Vue)

Do this once in `main.ts`. It globally registers all `v-*` directives.

```ts
import { createApp } from 'vue'
import { VueValidationPlugin } from 'oop-validator/vue'
import App from './App.vue'

createApp(App).use(VueValidationPlugin).mount('#app')
```

---

## 3. Core concept — ValidationEngine (no framework)

`ValidationEngine` validates a single value against a list of rules.
This is the foundation everything else builds on.

```ts
import { ValidationEngine } from 'oop-validator'

const engine = new ValidationEngine(['required', 'email'])

const result = engine.validateValue('not-an-email')
console.log(result.isValid) // false
console.log(result.errors)  // ['This field must be a valid email address.']
```

Rules can be strings (built-in), objects (with params/message), or class instances (custom):

```ts
const engine = new ValidationEngine([
  'required',
  { rule: 'min', params: { length: 3 }, message: 'At least 3 characters.' },
])
```

### Stateful API

`ValidationEngine` also remembers the last result — useful for inspecting state
without re-validating, or clearing errors after a successful submit:

```ts
engine.validateValue('not-an-email')

engine.getIsValid()  // false  — no re-run, just reads stored state
engine.getErrors()   // ['This field must be a valid email address.']

engine.reset()       // clears: isValid → true, errors → []
```

Use this when, e.g. the user starts typing again and you want to wipe the previous error without running validation yet.

---

## 4. Single value in Vue — `useValidation`

When you only have one input — a search box, a coupon code, an inline slug field —
spinning up a whole `<form>` is overkill. `useValidation` wraps a `ref` with
a rule list and gives you back reactive `errors` and `isValid`.

```ts
import { ref } from 'vue'
import { useValidation } from 'oop-validator/vue'

const coupon = ref('')
const { errors, isValid, validate } = useValidation(coupon, [
  'required',
  { rule: 'min', params: { length: 6 } },
  { rule: 'regex', params: { regex: '^[A-Z0-9]+$' } },
])
```

```html
<input v-model="coupon" @input="validate()" />
<span v-for="e in errors" :key="e">{{ e }}</span>
<button :disabled="!isValid">Apply</button>
```

No plugin, no `<form>` element, no directives — just rules and a value.

**→ See it in action:** [09-SingleFieldValidation.vue](src/examples/09-SingleFieldValidation.vue)

---

## 5. Schema-driven form — `useFormValidation`

If you'd rather define rules in a config object than sprinkle them across markup
(e.g. because rules come from a backend, or your UI library's inputs don't accept
custom directives), use `useFormValidation` directly. It returns the same field
state you get from `useForm`, minus the directive auto-wiring.

```ts
import { reactive } from 'vue'
import { useFormValidation } from 'oop-validator/vue'

const data = reactive({ email: '', password: '' })

const form = useFormValidation(data, {
  email:    ['required', 'email'],
  password: ['required', { rule: 'min', params: { length: 8 } }],
})

form.fields.value.email.$valid     // reactive
form.fields.value.email.$error     // { required: true, email: false }
form.$submit(() => save(data))     // validates, touches all, runs callback if valid
```

```html
<input v-model="data.email" @blur="form.touch('email')" />
<span v-if="form.fields.value.email?.$error.email">Invalid email.</span>
```

You manage the bindings yourself (`v-model`, `@blur` for touch) — but rules stay in JS.

**→ See it in action:** [08-SchemaValidation.vue](src/examples/08-SchemaValidation.vue)

---

## 6. Form concept — useForm + v-* directives

`useForm` binds a reactive data object to a `<form>` element. The `v-*` directives
on child inputs register their rules automatically — no manual wiring.

```ts
import { reactive } from 'vue'
import { useForm } from 'oop-validator/vue'

const data = reactive({ email: '' })
const form = useForm('myForm', data)
```

```html
<form name="myForm" v-submit="handleSubmit">
  <input name="email" type="email" v-model="data.email" v-required v-type />
</form>
```

**Key rules:**
- The `name` on `<form>` must match the first argument of `useForm()`
- Each `<input>` must have a `name` attribute — this is the field key
- `v-submit` replaces `@submit.prevent` — calls your handler only when the form is valid

**→ See it in action:** [01-ContactForm.vue](src/examples/01-ContactForm.vue)

---

## 7. Accessing field state

`useForm` returns a Proxy. Access any field directly:

```ts
form.email.$error      // { required: true, type: false }
form.email.$touched    // true after user blurs the field
form.email.$valid      // true when all rules pass
form.email.$dirty      // true after value changes
form.email.$pending    // true during async validation
```

Form-level state:

```ts
form.$valid.value      // true when all fields pass
form.$submitted.value  // true after first submit attempt
form.$dirty.value      // true when any field has changed
```

---

## 8. Showing error messages — v-messages + v-message

`v-messages` is a container that receives the field's `$error` map.
`v-message` children show/hide based on which rule is failing.

```html
<div v-messages="form.email?.$error ?? {}">
  <span v-message="'required'">Email is required.</span>
  <span v-message="'type'">Enter a valid email address.</span>
</div>
```

Show all errors at once (default shows only first):

```html
<div v-messages.multiple="form.password?.$error ?? {}">
  <span v-message="'required'">Password is required.</span>
  <span v-message="'minlength'">At least 8 characters.</span>
</div>
```

**→ See it in action:** [05-MessagesShowcase.vue](src/examples/05-MessagesShowcase.vue)

---

## 9. CSS classes — styling validation state

Directives automatically toggle CSS classes on each input. You style them:

```css
input.v-invalid.v-touched { border-color: #e53e3e; }
input.v-valid.v-dirty     { border-color: #38a169; }
input.v-pending           { border-color: #3498db; }
```

Per-rule classes are also injected — e.g. for an input with `v-required v-type`:

```
v-invalid-required   v-valid-required
v-invalid-type       v-valid-type
```

Full class list — on each `<input>`:

| Class | When |
|---|---|
| `v-valid` / `v-invalid` | all rules pass / any fails |
| `v-pristine` / `v-dirty` | unchanged / changed since mount |
| `v-touched` / `v-untouched` | blurred / never blurred |
| `v-pending` | async validation running |
| `v-valid-{rule}` / `v-invalid-{rule}` | per-rule pass/fail |

### Form-level classes (since v1.1.0)

The `<form>` element itself gets aggregate state classes — useful for whole-form styling (e.g. dim a section while pending, show an unsaved-changes banner):

| Class | When |
|---|---|
| `v-form-pristine` / `v-form-dirty` | no field changed / at least one field changed |
| `v-form-touched` / `v-form-untouched` | any field blurred (or `touchAll()`) / nothing touched yet |
| `v-form-submitted` | `$submit()` or `v-submit` has been triggered |
| `v-form-pending` | async validation in progress on any field |

```css
form.v-form-dirty .save-button     { animation: pulse 1s infinite; }
form.v-form-pending                { opacity: 0.6; pointer-events: none; }
form.v-form-submitted.v-form-invalid .error-summary { display: block; }
```

**→ See it in action:** [10-FormStateCss.vue](src/examples/10-FormStateCss.vue)

---

## 10. All available directives

| Directive | Purpose | Example |
|---|---|---|
| `v-required` | Field must not be empty | `v-required` / `v-required="true"` |
| `v-minlength` | Minimum string length | `v-minlength="3"` |
| `v-maxlength` | Maximum string length | `v-maxlength="50"` |
| `v-pattern` | Regex match | `v-pattern="/^[a-z]+$/"` |
| `v-min` | Minimum numeric value | `v-min="0"` |
| `v-max` | Maximum numeric value | `v-max="100"` |
| `v-type` | Type-based rule from `input[type]` | `v-type` / `v-type="'url'"` |
| `v-messages` | Error message container | `v-messages="form.email?.$error ?? {}"` |
| `v-message` | Per-rule error span | `v-message="'required'"` |
| `v-submit` | Submit handler (valid only) | `v-submit="handleSubmit"` |
| `v-form-group` | Mirror field classes on wrapper | `v-form-group="'email'"` |

---

## 11. Async validation

Pass an `asyncValidators` option to `useForm`. The shape is
`{ [fieldName]: { [ruleKey]: (value) => Promise<boolean> } }` — return `true`
for valid, `false` for invalid. Validators are internally debounced and
cancelled when a newer call supersedes them; `$pending` is `true` while
they run.

```ts
const form = useForm('register', data, {
  asyncValidators: {
    email: {
      uniqueEmail: async (value) => {
        const res = await fetch(`/api/check-email?email=${value}`)
        const { taken } = await res.json()
        return !taken   // true = valid, false = invalid
      }
    }
  },
  debounce: 500,
})
```

The `ruleKey` you choose (`uniqueEmail` above) is what you reference in `v-message`:

```html
<div v-messages="form.email?.$error ?? {}">
  <span v-message="'uniqueEmail'">This email is already taken.</span>
</div>
```

```html
<span v-if="form.email?.$pending">Checking...</span>
```

**→ See it in action:** [02-RegistrationForm.vue](src/examples/02-RegistrationForm.vue)

---

## 12. Dynamic fields — v-if and v-for

Fields are automatically registered when their directive mounts and unregistered
when it unmounts. This means `v-if` and `v-for` work naturally.

```html
<!-- Field disappears from validation when hidden -->
<input v-if="hasMiddleName" name="middleName" v-required />

<!-- Dynamic list — each item gets its own rule set -->
<div v-for="(item, i) in items" :key="item.id">
  <input :name="`item_${i}`" v-required v-minlength="2" />
</div>
```

**→ See it in action:** [03-DynamicItemsForm.vue](src/examples/03-DynamicItemsForm.vue)

---

## 13. Custom validation rules

Implement `IValidationRule` for any business-specific logic:

```ts
import type { IValidationRule } from 'oop-validator'

class HexColorRule implements IValidationRule {
  ruleKey = 'hexcolor'                       // required since v1.1.0
  private msg = 'Must be a valid hex colour (e.g. #FF5733).'

  isValid(value: any): [boolean, string] {
    if (!value) return [true, '']
    const ok = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
    return [ok, ok ? '' : this.msg]
  }
  isMatch(type: string) { return type.toLowerCase() === 'hexcolor' }
  setParams(_: any) {}
  setErrorMessage(m: string) { this.msg = m }
}

// Register after useForm()
form.registerRule('color', 'hexcolor', new HexColorRule())
```

For rules that need to read another field (e.g. password confirm), implement `setContext()`:

```ts
class MustMatchRule implements IValidationRule {
  ruleKey = 'mustmatch'
  private context: Record<string, any> = {}
  private targetField = ''

  isValid(value: any): [boolean, string] {
    const ok = value === this.context[this.targetField]
    return [ok, ok ? '' : 'Values do not match.']
  }
  setContext(ctx: Record<string, any>) { this.context = ctx }
  setParams(p: { field: string }) { this.targetField = p.field }
  isMatch(type: string) { return type === 'mustmatch' }
  setErrorMessage(m: string) {}
}
```

**→ See it in action:** [07-CustomValidation.vue](src/examples/07-CustomValidation.vue)

---

## 14. Programmatic API

Everything is accessible without directives if needed:

```ts
form.validate()          // run validation manually
form.touch('email')      // mark one field as touched
form.touchAll()          // mark all fields as touched
form.$reset()            // reset all state (optionally pass new values)
form.$submit(callback)   // validate + touch all + call callback if valid

// Inject a server-side error
form.$setValidity('email', 'server', false)  // mark as failing
form.$setValidity('email', 'server', true)   // clear it

// Read raw form state
form.$valid.value
form.$submitted.value
form.fields.value.email.$error
```

### Programmatic validate (since v1.1.0)

Calling `form.validate()` (or `form.$validate()`) now paints the `v-valid` / `v-invalid` classes onto inputs immediately — you no longer need to wait for a blur/focus cycle. Handy for "Save" buttons in toolbars where the form might still be untouched:

```ts
async function handleSave() {
  const result = form.validate()
  if (!result.isValid) return    // invalid inputs already show .v-invalid
  await api.save(formData)
}
```

> **Gotcha:** `validate()` does **not** mark fields as touched. If your CSS gates errors behind `.v-touched.v-invalid` (the recommended pattern), call `form.touchAll()` first, or just use `form.$submit(handleSave)` — it does both.

**→ See it in action:** [06-FormStateDebugger.vue](src/examples/06-FormStateDebugger.vue)

---

## Summary — concept progression

```
ValidationEngine          → single value,    no framework
FormValidationEngine      → multiple fields, no framework
useValidation             → single value,    reactive Vue state
useFormValidation         → multiple fields, reactive Vue state, schema-driven
useForm + v-* directives  → full AngularJS-style declarative forms
custom IValidationRule    → business-specific logic
async validators          → server-side checks with debounce
dynamic fields            → v-if / v-for with auto register/unregister
programmatic API          → $submit, $reset, $setValidity, touch
```
