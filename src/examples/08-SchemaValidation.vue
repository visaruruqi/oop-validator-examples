<template>
  <ExampleLayout
    title="08 · Schema Validation (no directives)"
    description="Same form as Example 01, but rules live in a JS config object instead of v-* directives. Useful when rules come from a backend, when your inputs can't accept directives, or when you simply prefer schema over markup."
  >
    <div class="layout">
      <!-- LEFT: the form -->
      <div class="layout-form">
        <div v-if="submitted" class="success-banner">
          Submitted! Schema-driven validation passed.
          <button type="button" class="btn btn-sm" @click="submitted = false; $reset()">Send another</button>
        </div>

        <form v-else @submit.prevent="onSubmit" novalidate>
          <!-- Full Name -->
          <div class="field-group">
            <label for="s-fullName">Full Name <span class="required">*</span></label>
            <input
              id="s-fullName"
              type="text"
              v-model="formData.fullName"
              @blur="touch('fullName')"
              :class="fieldClass('fullName')"
              placeholder="Jane Smith"
            />
            <div v-if="showErrors('fullName')" class="error-list">
              <span class="error-msg" v-if="fields.fullName?.$error.required">Full name is required.</span>
              <span class="error-msg" v-if="fields.fullName?.$error.min">Must be at least 2 characters.</span>
              <span class="error-msg" v-if="fields.fullName?.$error.max">Cannot exceed 100 characters.</span>
            </div>
          </div>

          <!-- Email -->
          <div class="field-group">
            <label for="s-email">Email <span class="required">*</span></label>
            <input
              id="s-email"
              type="email"
              v-model="formData.email"
              @blur="touch('email')"
              :class="fieldClass('email')"
              placeholder="jane@example.com"
            />
            <div v-if="showErrors('email')" class="error-list">
              <span class="error-msg" v-if="fields.email?.$error.required">Email is required.</span>
              <span class="error-msg" v-if="fields.email?.$error.email">Enter a valid email address.</span>
            </div>
          </div>

          <!-- Subject -->
          <div class="field-group">
            <label for="s-subject">Subject <span class="required">*</span></label>
            <select
              id="s-subject"
              v-model="formData.subject"
              @blur="touch('subject')"
              :class="fieldClass('subject')"
            >
              <option value="">— Select a subject —</option>
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="billing">Billing</option>
            </select>
            <div v-if="showErrors('subject')" class="error-list">
              <span class="error-msg" v-if="fields.subject?.$error.required">Please select a subject.</span>
            </div>
          </div>

          <!-- Message -->
          <div class="field-group">
            <label for="s-message">
              Message <span class="required">*</span>
              <span class="char-count">{{ formData.message.length }} / 2000</span>
            </label>
            <textarea
              id="s-message"
              v-model="formData.message"
              @blur="touch('message')"
              :class="fieldClass('message')"
              rows="5"
              placeholder="Describe your question or issue in detail…"
            ></textarea>
            <div v-if="showErrors('message')" class="error-list">
              <span class="error-msg" v-if="fields.message?.$error.required">Message is required.</span>
              <span class="error-msg" v-if="fields.message?.$error.min">Must be at least 10 characters.</span>
              <span class="error-msg" v-if="fields.message?.$error.max">Cannot exceed 2000 characters.</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="$submitted && $invalid">
              Submit
            </button>
            <button type="button" class="btn btn-secondary" @click="$reset()">
              Reset
            </button>
          </div>

          <div v-if="$submitted && $invalid" class="form-error-summary">
            Please fix the errors above before submitting.
          </div>
        </form>
      </div>

      <!-- RIGHT: the schema, side-by-side -->
      <aside class="layout-schema">
        <div class="schema-header">The schema driving this form</div>
        <pre class="schema-code"><code>{{ schemaPreview }}</code></pre>
        <p class="schema-note">
          Rules live in JS, not in markup. Swap them at runtime, load them from
          a backend, or generate them from a Zod / JSON-schema converter.
        </p>
      </aside>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import ExampleLayout from './ExampleLayout.vue'
import { useFormValidation } from 'oop-validator/vue'
import type { FormConfig } from 'oop-validator'

const formData = reactive({
  fullName: '',
  email: '',
  subject: '',
  message: '',
})

const schema: FormConfig = {
  fullName: [
    'required',
    { rule: 'min', params: { length: 2 } },
    { rule: 'max', params: { length: 100 } },
  ],
  email: ['required', 'email'],
  subject: ['required'],
  message: [
    'required',
    { rule: 'min', params: { length: 10 } },
    { rule: 'max', params: { length: 2000 } },
  ],
}

const form = useFormValidation(formData, schema)
const { fields, touch, $submit, $reset } = form
const $submitted = computed(() => form.$submitted.value)
const $invalid = computed(() => form.$invalid.value)

const submitted = ref(false)

async function onSubmit() {
  await $submit(() => { submitted.value = true })
}

function fieldClass(name: string) {
  const f = fields.value[name]
  if (!f) return ''
  return [
    f.$valid ? 'v-valid' : 'v-invalid',
    f.$touched ? 'v-touched' : 'v-untouched',
    f.$dirty ? 'v-dirty' : 'v-pristine',
  ]
}

function showErrors(name: string) {
  const f = fields.value[name]
  return !!(f && (f.$touched || $submitted.value))
}

const schemaPreview =
`{
  fullName: [
    'required',
    { rule: 'min', params: { length: 2 } },
    { rule: 'max', params: { length: 100 } },
  ],
  email:   ['required', 'email'],
  subject: ['required'],
  message: [
    'required',
    { rule: 'min', params: { length: 10 } },
    { rule: 'max', params: { length: 2000 } },
  ],
}`
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
  gap: 32px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.layout-schema {
  position: sticky;
  top: 16px;
}

.schema-header {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 8px;
}

.schema-code {
  background: #1e2637;
  color: #cdd4e0;
  padding: 14px 16px;
  border-radius: 8px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  margin: 0 0 10px;
  overflow-x: auto;
  white-space: pre;
}

.schema-note {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.field-group { margin-bottom: 20px; }
.field-group label:first-child {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

input[type="text"],
input[type="email"],
select,
textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  color: #1a202c;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

textarea { resize: vertical; }

input.v-invalid.v-touched,
select.v-invalid.v-touched,
textarea.v-invalid.v-touched {
  border-color: #e53e3e;
}

.error-list { margin-top: 4px; }
.error-msg {
  display: block;
  font-size: 12px;
  color: #e74c3c;
  margin-top: 2px;
}

.required { color: #e74c3c; }
.char-count {
  float: right;
  font-size: 11px;
  color: #9ca3af;
  font-weight: normal;
}

.form-actions { display: flex; gap: 12px; margin-top: 28px; }
.btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-primary { background: #646cff; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #535bf2; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #e2e8f0; color: #374151; }
.btn-secondary:hover { background: #cbd5e0; }
.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
  background: #fff;
  color: #1a202c;
  border: 1px solid #d1d5db;
  margin-left: 12px;
}

.form-error-summary {
  margin-top: 12px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 13px;
  color: #dc2626;
}

.success-banner {
  padding: 20px 24px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  font-size: 15px;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
