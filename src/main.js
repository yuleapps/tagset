// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import appStore from './store/index.js';
import VueFire from 'vuefire';
import VueLocalStorage from 'vue-localstorage';
import db from './db.js';
let fandomsRef = db.ref('/fandoms');
let metaRef = db.ref('/meta');


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
  },
  firebase: {
    fandoms: {
      source: fandomsRef,
      readyCallback() {
        store.commit('setDbLoaded', true);
        store.commit('setFandoms', this.fandoms);
        store.commit('setCategories', _.uniq(_.map(this.fandoms, o => { return o.category; })));
      }
    },
    letters: {
      source: db.ref('/letters'),
      asObject: true,
      readyCallback() {
        store.commit('setLetters', this.letters);
      }
    },
    meta: {
      source: metaRef
    }
  }
});
