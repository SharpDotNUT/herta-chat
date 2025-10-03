import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Varlet, { Input, Select, StyleProvider, Themes } from '@varlet/ui';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Varlet);

app.mount('#vue-app');

import '@varlet/ui/es/style';
import './style/main.css';

StyleProvider(Themes.md3Light);
Input.setPropsDefaults({
  variant: 'outlined'
});
Select.setPropsDefaults({
  variant: 'outlined'
});
