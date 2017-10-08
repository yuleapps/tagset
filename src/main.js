// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import VueFire from 'vuefire';
import VueLocalStorage from 'vue-localstorage';

Vue.config.productionTip = false;
Vue.use(VueFire);
Vue.use(VueLocalStorage);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<app></app>',
  components: { 
    App 
  }
});
