import { createRouter, createWebHashHistory } from 'vue-router'
import GettingStarted from './examples/00-GettingStarted.vue'
import ContactForm from './examples/01-ContactForm.vue'
import RegistrationForm from './examples/02-RegistrationForm.vue'
import DynamicItemsForm from './examples/03-DynamicItemsForm.vue'
import NumericValidation from './examples/04-NumericValidation.vue'
import MessagesShowcase from './examples/05-MessagesShowcase.vue'
import FormStateDebugger from './examples/06-FormStateDebugger.vue'
import CustomValidation from './examples/07-CustomValidation.vue'
import SchemaValidation from './examples/08-SchemaValidation.vue'
import SingleFieldValidation from './examples/09-SingleFieldValidation.vue'
import FormStateCss from './examples/10-FormStateCss.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/getting-started' },
    { path: '/getting-started', component: GettingStarted },
    { path: '/examples/contact', component: ContactForm },
    { path: '/examples/registration', component: RegistrationForm },
    { path: '/examples/dynamic', component: DynamicItemsForm },
    { path: '/examples/numeric', component: NumericValidation },
    { path: '/examples/messages', component: MessagesShowcase },
    { path: '/examples/debugger', component: FormStateDebugger },
    { path: '/examples/custom', component: CustomValidation },
    { path: '/examples/schema', component: SchemaValidation },
    { path: '/examples/single-field', component: SingleFieldValidation },
    { path: '/examples/form-state-css', component: FormStateCss },
  ]
})

export default router
