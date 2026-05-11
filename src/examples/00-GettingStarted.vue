<template>
  <div class="docs-page">
    <div class="docs-content" v-html="html" @click="onDocClick" />
  </div>
</template>

<script setup lang="ts">
import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'
import { useRouter } from 'vue-router'
import content from '../../GETTING-STARTED.md?raw'

// Map markdown links pointing at example source files → in-app routes.
// Keeps the raw GETTING-STARTED.md readable on GitHub (where the paths
// resolve to actual files) and clickable inside the app (where they
// navigate via Vue Router).
const exampleRoutes: Record<string, string> = {
  '01-ContactForm.vue':         '/examples/contact',
  '02-RegistrationForm.vue':    '/examples/registration',
  '03-DynamicItemsForm.vue':    '/examples/dynamic',
  '04-NumericValidation.vue':   '/examples/numeric',
  '05-MessagesShowcase.vue':    '/examples/messages',
  '06-FormStateDebugger.vue':   '/examples/debugger',
  '07-CustomValidation.vue':    '/examples/custom',
  '08-SchemaValidation.vue':    '/examples/schema',
  '09-SingleFieldValidation.vue': '/examples/single-field',
  '10-FormStateCss.vue':        '/examples/form-state-css',
}

function rewriteHref(href: string): string {
  const match = /^src\/examples\/(.+\.vue)$/.exec(href)
  if (!match) return href
  const route = exampleRoutes[match[1]]
  return route ? `#${route}` : href
}

const renderer = new Renderer()
renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
renderer.link = function ({ href, title, tokens }) {
  const rewritten = rewriteHref(href)
  const text = this.parser.parseInline(tokens)
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${rewritten}"${titleAttr}>${text}</a>`
}

marked.use({ renderer })

const html = marked(content) as string

const router = useRouter()

function onDocClick(e: MouseEvent) {
  const anchor = (e.target as HTMLElement | null)?.closest('a')
  if (!anchor) return
  const href = anchor.getAttribute('href') || ''
  // Only intercept in-app links we rewrote (hash-prefixed)
  if (!href.startsWith('#/')) return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  router.push(href.slice(1))
}
</script>

<style>
.docs-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 32px 80px;
}

.docs-content h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px;
}

.docs-content h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 48px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.docs-content h3 {
  font-size: 15px;
  font-weight: 700;
  color: #2d3748;
  margin: 24px 0 8px;
}

.docs-content p {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.7;
  margin: 0 0 12px;
}

.docs-content ul,
.docs-content ol {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.7;
  padding-left: 20px;
  margin: 0 0 12px;
}

.docs-content li {
  margin-bottom: 4px;
}

.docs-content a {
  color: #646cff;
  text-decoration: none;
}

.docs-content a:hover {
  text-decoration: underline;
}

.docs-content hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 40px 0;
}

/* Inline code — light pill */
.docs-content code {
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12.5px;
  background: #f1f5f9;
  color: #1e3a5f;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Code blocks */
.docs-content pre {
  background: #282c34;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0 20px;
  padding: 0;
}

.docs-content pre code {
  display: block;
  padding: 16px 20px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.7;
  background: transparent;
  color: #abb2bf;
  border-radius: 0;
}

/* ── atom-one-dark token colors ── */
.docs-content pre .hljs-comment,
.docs-content pre .hljs-quote       { color: #5c6370; font-style: italic; }

.docs-content pre .hljs-keyword,
.docs-content pre .hljs-selector-tag,
.docs-content pre .hljs-built_in,
.docs-content pre .hljs-name,
.docs-content pre .hljs-tag         { color: #c678dd; }

.docs-content pre .hljs-string,
.docs-content pre .hljs-title,
.docs-content pre .hljs-section,
.docs-content pre .hljs-attribute,
.docs-content pre .hljs-literal,
.docs-content pre .hljs-template-tag,
.docs-content pre .hljs-template-variable,
.docs-content pre .hljs-type,
.docs-content pre .hljs-addition    { color: #98c379; }

.docs-content pre .hljs-deletion,
.docs-content pre .hljs-selector-attr,
.docs-content pre .hljs-selector-pseudo,
.docs-content pre .hljs-meta        { color: #e06c75; }

.docs-content pre .hljs-doctag,
.docs-content pre .hljs-attr        { color: #d19a66; }

.docs-content pre .hljs-symbol,
.docs-content pre .hljs-bullet,
.docs-content pre .hljs-link,
.docs-content pre .hljs-number,
.docs-content pre .hljs-regexp,
.docs-content pre .hljs-variable,
.docs-content pre .hljs-title.hljs-function__,
.docs-content pre .hljs-params      { color: #61aeee; }

.docs-content pre .hljs-emphasis    { font-style: italic; }
.docs-content pre .hljs-strong      { font-weight: bold; }

/* Tables */
.docs-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 12px 0 20px;
}

.docs-content th {
  text-align: left;
  padding: 10px 14px;
  background: #f8fafc;
  color: #374151;
  font-weight: 700;
  border-bottom: 2px solid #e2e8f0;
}

.docs-content td {
  padding: 9px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #374151;
  vertical-align: top;
}

.docs-content tr:last-child td {
  border-bottom: none;
}

.docs-content blockquote {
  border-left: 3px solid #646cff;
  margin: 0 0 16px;
  padding: 10px 16px;
  background: #f5f3ff;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: #4a5568;
}
</style>
