import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {Quasar, Notify} from "quasar";
import quasarLang from "quasar/lang/ja";

import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";

import {createPinia} from 'pinia'
import {createPersistedState} from "pinia-plugin-persistedstate";
import router from './router';

const myApp = createApp(App);
myApp.use(router);
myApp.use(Quasar, {
  plugins: {Notify},
  config: {
    notify: {
      position: "top",
      timeout: 3000,
      color: "red",
      icon: 'announcement'}
  },
  lang: quasarLang,
});

const pinia = createPinia(); // 追加
pinia.use(createPersistedState()); // 追加
myApp.use(pinia);

myApp.mount("#app");
