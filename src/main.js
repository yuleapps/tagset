// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import App from './LockedApp';
import appStore from './store/index.js';
import VueFire from 'vuefire';
import VueLocalStorage from 'vue-localstorage';
import db from './db.js';
let fandomsRef = db.ref('/fandomsonly');
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
  watch: {
    letters: {
      deep: true,
      handler(val) {
        store.commit('setLetters', val);
      }
    }
  },
  data() {
    return {
      letters: {}
    };
  },
  beforeMount() {
    db
      .ref('/characters')
      .limitToFirst(100)
      .once('value')
      .then(res => {
        const result = res.toJSON();
        store.commit('setCharsLoaded', true);
        store.commit('setCharacters', result);
      });
    db
      .ref('/fandomsonly')
      .once('value')
      .then(res => {
        let result = res.val();
        store.commit('setDbLoaded', true);
        result = _.map(result, (o, i) => {
          return {
            ...o,
            '.key': i
          };
        });
        store.commit('setFandoms', result);
        const categories = [];
        _.each(result, o => {
          if (!o) {
            return;
          }
          _.each(o.category, cat => {
            if (!cat.length) {
              return;
            }
            categories.push(cat);
          });
        });
        store.commit('setCategories', _.uniq(categories));
      });
  },
  firebase: {
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
