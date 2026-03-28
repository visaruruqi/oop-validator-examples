import { createRouter, createWebHashHistory } from 'vue-router'
import GettingStarted from './examples/00-GettingStarted.vue'
import ContactForm from './examples/01-ContactForm.vue'
import RegistrationForm from './examples/02-RegistrationForm.vue'
import DynamicItemsForm from './examples/03-DynamicItemsForm.vue'
import NumericValidation from './examples/04-NumericValidation.vue'
import MessagesShowcase from './examples/05-MessagesShowcase.vue'
import FormStateDebugger from './examples/06-FormStateDebugger.vue'
import CustomValidation from './examples/07-CustomValidation.vue'

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
  ]
})

export default router
