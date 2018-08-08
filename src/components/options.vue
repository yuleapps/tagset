<template>
<div class="options">
  <div class="filters">
    <span class="label">Filter By:</span>

    <label for="fandom-filter">Fandom:</label>
    <input id="fandom-filter" type="text" placeholder="Filter..." v-model='options.filter.term'>

    <label for="category-filter">Category:</label>
    <select id="category-filter" v-model="options.filter.category">
      <option value=''>All</option>
      <option v-for="category in categories">{{ category }}</option>
    </select>
  </div>
  <div>

    <span class="label">Show Only:</span>
    <div class="option" v-if="unlock">
      <input type="checkbox" id="prompts-fandoms" v-model="options.onlyPrompts">
      <label for="prompts-fandoms">Fandoms with prompts</label>
    </div>
    <div class="option">
      <input type="checkbox" id="bookmarked-fandoms" v-model="options.onlyBookmarks">
      <label for="bookmarked-fandoms">Bookmarked fandoms</label>
    </div>
    <div class="option">
      <input type="checkbox" id="letters-fandoms" v-model="options.onlyLetters">
      <label for="letters-fandoms">Fandoms with letters<span v-if="unlock">*</span></label>
    </div>
    <div class="option" v-if="unlock">
      <input type="checkbox" id="ph" v-model="options.onlyPHs">
      <label for="ph">Only fandoms with pinch hitters</label>
    </div>

    <div class="clear" v-if="unlock">
      <small>* these apply only to the letters column, not to prompts</small>
    </div>
  </div>

  <div>
    <span class="label">Tools:</span>
    <div class="option">
      <input type="checkbox" id="load-all" v-model="options.loadAll">
      <label for="load-all">Load everything!</label>
      <sup><span class="fas fa-exclamation-circle warn" @click="showMsg = !showMsg"></span></sup>
    </div>
    <div class="option">
      <input type="checkbox" id="hide-chars" v-model="options.hideCharacters">
      <label for="hide-chars">Hide Characters</label>
    </div>
    <div class="option">
      <input type="checkbox" id="journal-style" v-model="options.destyle">
      <label for="journal-style">Mobile letter format<span v-if="unlock">*</span></label>
    </div>

    <div class="clear" v-if="showMsg">
      <small>** <strong :style="{ color: 'red'}">This may take your browser a bit.</strong></small>
    </div>
  </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex';
import db from '../db.js';
import _ from 'lodash';
export default {
  computed: {
    ...mapGetters([
      'unlock',
      'categories',
      'loadAll'
    ])
  },
  watch: {
    options: {
      handler(val) {
        _.debounce(() => {
          this.$store.commit('setOptions', val);
        }, 400)();
      },
      deep: true
    }
  },
  data() {
    return {
      showMsg: false,
      options: {
        filter: {
          category: '',
          term: ''
        },
        onlyLetters: false,
        onlyBookmarks: false,
        onlyPrompts: false,
        onlyPHs: false,
        destyle: false,
        loadAll: false,
        hideCharacters: false,
        hideCategory: false
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.options {
  overflow: hidden;
  margin-bottom: 10px;

  .label {
    font-weight: bold;
    width: 100px;
    display: inline-block;
  }

  .option {
    display: inline-block;
    width: 180px;
  }

  .clear {
    max-width: 750px;
    color: rgba(0, 0, 0, 0.5);
    line-height: 14px;
    margin-bottom: 3px;
  }
}

.warn {
  color: #e4a95c;
  padding-left: 2px;
}
</style>
