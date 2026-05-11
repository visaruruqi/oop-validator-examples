<template>
  <ExampleLayout
    title="10 · Form-State CSS (v1.1.0+)"
    description="Since v1.1.0, the <form> element gets aggregate state classes — v-form-pristine, v-form-dirty, v-form-touched, v-form-submitted, v-form-pending, v-form-untouched. Style whole-form regions without watching reactive state in JS. Interact with the form below and watch the badges light up."
  >
    <!-- Live class indicator strip -->
    <div class="class-strip">
      <span
        v-for="cls in trackedClasses"
        :key="cls"
        class="chip"
        :class="{ 'chip--active': activeClasses.has(cls) }"
        :title="descriptions[cls]"
      >
        .{{ cls }}
      </span>
    </div>

    <p class="hint">
      <strong>Try:</strong> type in a field (→ <code>v-form-dirty</code>),
      blur it (→ <code>v-form-touched</code>),
      click <em>Save</em> (→ <code>v-form-submitted</code>),
      then watch the <em>Async check</em> field fire <code>v-form-pending</code>.
    </p>

    <form ref="formEl" name="stateDemo" v-submit="onSave" novalidate>
      <div class="field-group">
        <label for="d-name">Your name <span class="required">*</span></label>
        <input
          id="d-name"
          name="name"
          type="text"
          v-model="data.name"
          v-required
          v-minlength="2"
        />
        <div
          v-show="form.name?.$touched || form.$submitted.value"
          v-messages="form.name?.$error ?? {}"
          class="error-list"
        >
          <span class="err" v-message="'required'">Name is required.</span>
          <span class="err" v-message="'minlength'">At least 2 characters.</span>
        </div>
      </div>

      <div class="field-group">
        <label for="d-handle">Async-checked handle <span class="required">*</span></label>
        <input
          id="d-handle"
          name="handle"
          type="text"
          v-model="data.handle"
          v-required
          v-minlength="3"
          placeholder="anything except 'taken'"
        />
        <div class="hint-row">
          <span v-if="form.handle?.$pending" class="pending">Checking availability…</span>
          <span v-else-if="form.handle?.$valid && form.handle?.$dirty" class="ok">Available ✓</span>
        </div>
        <div
          v-show="form.handle?.$touched || form.$submitted.value"
          v-messages="form.handle?.$error ?? {}"
          class="error-list"
        >
          <span class="err" v-message="'required'">Handle is required.</span>
          <span class="err" v-message="'minlength'">At least 3 characters.</span>
          <span class="err" v-message="'taken'">That handle is already taken.</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn btn-secondary" @click="form.$reset()">Reset</button>
      </div>
    </form>

    <!-- The whole-form region that reacts to the form classes -->
    <div class="banner-stack">
      <div class="banner banner-dirty">
        <strong>.v-form-dirty</strong> — shown only when at least one field has changed.
        Use for "unsaved changes" prompts.
      </div>
      <div class="banner banner-pending">
        <strong>.v-form-pending</strong> — shown during async validation. Dim sections so users
        know not to click yet.
      </div>
      <div class="banner banner-submitted">
        <strong>.v-form-submitted</strong> — shown after the user clicks Save once. Use it to
        reveal a summary or error list that should only appear after submit.
      </div>
    </div>

    <details class="howto">
      <summary>The CSS driving this page</summary>
<pre><code>/* These selectors target the &lt;form&gt; itself
   — no JS, no v-bind, just classes the library applies for you. */

form.v-form-dirty ~ .banner-stack .banner-dirty       { display: block; }
form.v-form-pending ~ .banner-stack .banner-pending   { display: block; }
form.v-form-submitted ~ .banner-stack .banner-submitted { display: block; }

form.v-form-pending { opacity: 0.6; pointer-events: none; }
</code></pre>
    </details>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import ExampleLayout from './ExampleLayout.vue'
import { useForm } from 'oop-validator/vue'

const data = reactive({
  name: '',
  handle: '',
})

const form = useForm('stateDemo', data, {
  asyncValidators: {
    handle: {
      taken: async (value: any) => {
        await new Promise(r => setTimeout(r, 700))
        return value !== 'taken'
      },
    },
  },
  debounce: 250,
})

function onSave() {
  // Reaching here means form is valid — v-submit handles that gate.
}

// ── live class observation for the chip strip ───────────────────────
const formEl = ref<HTMLFormElement | null>(null)
const activeClasses = ref<Set<string>>(new Set())
let observer: MutationObserver | null = null

const trackedClasses = [
  'v-form-pristine',
  'v-form-dirty',
  'v-form-untouched',
  'v-form-touched',
  'v-form-submitted',
  'v-form-pending',
] as const

const descriptions: Record<string, string> = {
  'v-form-pristine': 'No field has been changed yet.',
  'v-form-dirty': 'At least one field changed value.',
  'v-form-untouched': 'No field has been blurred.',
  'v-form-touched': 'At least one field has been blurred (or touchAll was called).',
  'v-form-submitted': '$submit() / v-submit has been triggered at least once.',
  'v-form-pending': 'Async validation is currently running.',
}

function syncClasses() {
  if (!formEl.value) return
  const next = new Set<string>()
  for (const cls of trackedClasses) {
    if (formEl.value.classList.contains(cls)) next.add(cls)
  }
  activeClasses.value = next
}

onMounted(() => {
  if (!formEl.value) return
  syncClasses()
  observer = new MutationObserver(syncClasses)
  observer.observe(formEl.value, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.class-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  background: #1e2637;
  border-radius: 8px;
  margin-bottom: 12px;
}

.chip {
  font-family: 'Fira Code', monospace;
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #2d3a50;
  color: #7a8899;
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  cursor: help;
}

.chip--active {
  background: #1f6feb;
  color: #fff;
  border-color: #4493f8;
  box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.25);
}

.hint {
  font-size: 13px;
  color: #4a5568;
  background: #fef9c3;
  border-left: 3px solid #facc15;
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  margin: 0 0 20px;
  line-height: 1.6;
}

.hint code {
  background: #fff7ed;
  border: 1px solid #fde68a;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #92400e;
}

.field-group { margin-bottom: 20px; }
.field-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

input[type="text"] {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus { border-color: #646cff; box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1); }
input.v-invalid.v-touched { border-color: #e53e3e; }
input.v-valid.v-dirty { border-color: #38a169; }

.hint-row { margin-top: 4px; font-size: 12px; min-height: 16px; }
.pending { color: #3498db; }
.ok { color: #2f855a; }

.error-list { margin-top: 4px; }
.err { display: block; font-size: 12px; color: #e74c3c; margin-top: 2px; }
.required { color: #e74c3c; }

.form-actions { display: flex; gap: 12px; margin-top: 24px; }
.btn {
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-primary { background: #646cff; color: #fff; }
.btn-primary:hover { background: #535bf2; }
.btn-secondary { background: #e2e8f0; color: #374151; }
.btn-secondary:hover { background: #cbd5e0; }

/* ───────────────────────────────────────────────────────────────────
   The whole point of this page: banner visibility driven by form
   classes alone — no v-if, no reactive guards.
   ───────────────────────────────────────────────────────────────── */
.banner-stack { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }

.banner {
  display: none;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  line-height: 1.5;
}

.banner-dirty {
  background: #fff7ed;
  border-color: #fdba74;
  color: #9a3412;
}

.banner-pending {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}

.banner-submitted {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

/* The actual class-driven selectors — these are the demo */
form.v-form-dirty ~ .banner-stack .banner-dirty { display: block; }
form.v-form-pending ~ .banner-stack .banner-pending { display: block; }
form.v-form-submitted ~ .banner-stack .banner-submitted { display: block; }

form.v-form-pending {
  opacity: 0.65;
  transition: opacity 0.2s;
}

.howto {
  margin-top: 28px;
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
