// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import appStore from './store/index.js';
import VueFire from 'vuefire';
import VueLocalStorage from 'vue-localstorage';

Vue.config.productionTip = false;
Vue.use(VueFire);
Vue.use(VueLocalStorage);
Vue.use(Vuex);

const store = new Vuex.Store(appStore);

/* eslint-disable no-new */
new Vue({
  store,
  el: '#app',
  template: '<app></app>',
  components: { 
    App 
  }
});
