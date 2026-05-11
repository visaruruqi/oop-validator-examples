<template>
  <ExampleLayout
    title="09 · Single-Field Validation"
    description="Sometimes you don't have a form — just one input that needs rules. useValidation(ref, rules) wraps a single reactive value and returns { errors, isValid, validate }. No <form>, no plugin, no directives."
  >
    <div class="snippet">
      <code>const { errors, isValid, validate } = useValidation(value, [...rules])</code>
    </div>

    <!-- 1. Search box -->
    <section class="card">
      <h3 class="card-title">Search box</h3>
      <p class="card-hint">A header search input — needs at least 3 characters before it submits.</p>

      <div class="search-row">
        <input
          v-model="searchValue"
          type="text"
          placeholder="Search articles…"
          :class="{ 'is-invalid': searchValue && !search.isValid.value }"
        />
        <button
          class="btn btn-primary btn-sm"
          :disabled="!search.isValid.value"
          @click="onSearch"
        >
          Search
        </button>
      </div>
      <div v-if="searchValue && !search.isValid.value" class="errors">
        <span v-for="e in search.errors.value" :key="e" class="err">{{ e }}</span>
      </div>
      <div v-if="searchResult" class="result">→ Searched for: <strong>{{ searchResult }}</strong></div>
    </section>

    <!-- 2. Coupon code -->
    <section class="card">
      <h3 class="card-title">Coupon code</h3>
      <p class="card-hint">Uppercase letters &amp; digits only, 6–10 chars. Validates on each keystroke.</p>

      <div class="search-row">
        <input
          v-model="couponValue"
          type="text"
          placeholder="ACME2026"
          :class="{ 'is-invalid': couponValue && !coupon.isValid.value }"
        />
        <button
          class="btn btn-primary btn-sm"
          :disabled="!coupon.isValid.value"
          @click="onApply"
        >
          Apply
        </button>
      </div>
      <div v-if="couponValue && !coupon.isValid.value" class="errors">
        <span v-for="e in coupon.errors.value" :key="e" class="err">{{ e }}</span>
      </div>
      <div v-if="couponApplied" class="result">→ Coupon <strong>{{ couponApplied }}</strong> applied.</div>
    </section>

    <!-- 3. URL slug -->
    <section class="card">
      <h3 class="card-title">URL slug</h3>
      <p class="card-hint">Pure inline feedback — no button, just a regex rule (<code>^[a-z0-9-]+$</code>) validating as you type. Try one of the samples:</p>

      <div class="sample-row">
        <button
          v-for="sample in slugSamples"
          :key="sample.value"
          type="button"
          class="sample-chip"
          :class="{ 'sample-chip--bad': !sample.valid }"
          @click="slugValue = sample.value"
        >
          {{ sample.value || '(empty)' }}
        </button>
      </div>

      <div class="slug-row">
        <span class="slug-prefix">example.com/</span>
        <input
          v-model="slugValue"
          type="text"
          placeholder="my-cool-post"
          :class="{ 'is-invalid': slugValue && !slug.isValid.value }"
        />
      </div>

      <div v-if="slugValue && !slug.isValid.value" class="errors">
        <span v-for="e in slug.errors.value" :key="e" class="err">{{ e }}</span>
      </div>

      <div v-if="slugValue" class="slug-preview" :class="{ 'slug-preview--bad': !slug.isValid.value }">
        <span class="slug-preview-label">{{ slug.isValid.value ? 'Resulting URL:' : 'Would be rejected:' }}</span>
        <code>example.com/{{ slugValue }}</code>
      </div>
    </section>

    <!-- 4. Email signup (single field) -->
    <section class="card">
      <h3 class="card-title">Newsletter signup</h3>
      <p class="card-hint">A single email input in a footer or modal — useValidation handles the whole thing.</p>

      <div class="search-row">
        <input
          v-model="emailValue"
          type="email"
          placeholder="you@example.com"
          :class="{ 'is-invalid': emailValue && !emailField.isValid.value }"
        />
        <button
          class="btn btn-primary btn-sm"
          :disabled="!emailField.isValid.value"
          @click="onSubscribe"
        >
          Subscribe
        </button>
      </div>
      <div v-if="emailValue && !emailField.isValid.value" class="errors">
        <span v-for="e in emailField.errors.value" :key="e" class="err">{{ e }}</span>
      </div>
      <div v-if="subscribed" class="result">→ Subscribed: <strong>{{ subscribed }}</strong></div>
    </section>

    <details class="howto">
      <summary>How is each input wired?</summary>
<pre><code>// search box
const searchValue = ref('')
const search = useValidation(searchValue, [
  { rule: 'min', params: { length: 3 } },
])

// coupon code
const couponValue = ref('')
const coupon = useValidation(couponValue, [
  'required',
  { rule: 'min', params: { length: 6 } },
  { rule: 'max', params: { length: 10 } },
  { rule: 'regex', params: { regex: '^[A-Z0-9]+$' } },
])

// slug
const slugValue = ref('')
const slug = useValidation(slugValue, [
  { rule: 'regex', params: { regex: '^[a-z0-9-]+$' } },
])

// newsletter
const emailValue = ref('')
const emailField = useValidation(emailValue, ['required', 'email'])
</code></pre>
    </details>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExampleLayout from './ExampleLayout.vue'
import { useValidation } from 'oop-validator/vue'

// 1 · search
const searchValue = ref('')
const search = useValidation(searchValue, [
  { rule: 'min', params: { length: 3 } },
])
const searchResult = ref('')
function onSearch() {
  if (search.isValid.value) searchResult.value = searchValue.value
}

// 2 · coupon
const couponValue = ref('')
const coupon = useValidation(couponValue, [
  'required',
  { rule: 'min', params: { length: 6 }, message: 'At least 6 characters.' },
  { rule: 'max', params: { length: 10 }, message: 'No more than 10 characters.' },
  { rule: 'regex', params: { regex: '^[A-Z0-9]+$' }, message: 'Uppercase letters and digits only.' },
])
const couponApplied = ref('')
function onApply() {
  if (coupon.isValid.value) couponApplied.value = couponValue.value
}

// 3 · slug
const slugValue = ref('')
const slug = useValidation(slugValue, [
  { rule: 'regex', params: { regex: '^[a-z0-9-]+$' }, message: 'Lowercase letters, digits, hyphens only.' },
])
const slugSamples = [
  { value: 'my-cool-post', valid: true },
  { value: 'hello-world-2026', valid: true },
  { value: 'My Post', valid: false },
  { value: 'café-au-lait', valid: false },
  { value: 'hello_world', valid: false },
]

// 4 · newsletter
const emailValue = ref('')
const emailField = useValidation(emailValue, ['required', 'email'])
const subscribed = ref('')
function onSubscribe() {
  if (emailField.isValid.value) subscribed.value = emailValue.value
}
</script>

<style scoped>
.snippet {
  background: #1e2637;
  color: #cdd4e0;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  margin-bottom: 28px;
}
.snippet code { background: transparent; color: #cdd4e0; }

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px 20px;
  margin-bottom: 18px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px;
}

.card-hint {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0 0 12px;
  line-height: 1.5;
}

.search-row, .slug-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.search-row input,
.slug-row input {
  flex: 1;
  padding: 9px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.search-row input:focus,
.slug-row input:focus {
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

input.is-invalid { border-color: #e53e3e; }

.sample-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 10px;
}

.sample-chip {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  padding: 4px 10px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;
}

.sample-chip:hover { background: #dcfce7; }
.sample-chip:active { transform: translateY(1px); }

.sample-chip--bad {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.sample-chip--bad:hover { background: #fee2e2; }

.slug-preview {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.slug-preview--bad {
  background: #fef2f2;
  border-color: #fecaca;
}

.slug-preview-label {
  font-weight: 600;
  color: #475569;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slug-preview--bad .slug-preview-label { color: #b91c1c; }

.slug-preview code {
  background: transparent;
  font-family: 'Fira Code', monospace;
  color: #1e293b;
}

.slug-preview--bad code { color: #991b1b; text-decoration: line-through; }

.slug-prefix {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  background: #f1f5f9;
  border: 1.5px solid #d1d5db;
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  color: #475569;
}

.slug-row input {
  border-radius: 0 6px 6px 0;
}

.errors {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.err {
  font-size: 12px;
  color: #e74c3c;
}

.result {
  margin-top: 10px;
  font-size: 13px;
  color: #166534;
  background: #f0fdf4;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #86efac;
}

.btn {
  padding: 9px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}
.btn-primary { background: #646cff; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #535bf2; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-sm { padding: 9px 14px; }

.howto {
  margin-top: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.howto summary {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  outline: none;
}

.howto pre {
  background: #1e2637;
  color: #cdd4e0;
  padding: 14px 16px;
  border-radius: 6px;
  font-size: 12.5px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  margin: 12px 0 0;
  overflow-x: auto;
}
.howto code { background: transparent; color: inherit; }
</style>
