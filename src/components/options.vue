<template>
  <div>
    <div class="filters"> 
    <h3>Filters & Options</h3>
    <label for="fandom-filter">Fandom:</label>
    <input id="fandom-filter" type="text" v-model='options.filter.term'>

    <label for="category-filter">Category:</label>
    <select id="category-filter" v-model="options.filter.category">
      <option value=''>All</option>
      <option v-for="category in categories">{{ category }}</option> 
    </select>
  </div>

  <div class="options">
    <div class="option" v-if="unlock">
      <input type="checkbox" id="prompts-fandoms" v-model="options.onlyPrompts">
      <label for="prompts-fandoms">Only fandoms with prompts</label>  
    </div>
    <div class="option">
      <input type="checkbox" id="bookmarked-fandoms" v-model="options.onlyBookmarks">
      <label for="bookmarked-fandoms">Only bookmarked fandoms</label>  
    </div>
    <div class="option">
      <input type="checkbox" id="letters-fandoms" v-model="options.onlyLetters">
      <label for="letters-fandoms">Only fandoms with letters<span v-if="unlock">*</span></label>  
    </div>
    <div class="option" v-if="unlock">
      <input type="checkbox" id="ph" v-model="options.onlyPHs">
      <label for="ph">Only fandoms with pinch hitters</label>  
    </div>
    <div class="option">
      <input type="checkbox" id="journal-style" v-model="options.destyle">
      <label for="journal-style">Gimme mobile/readable URLs<span v-if="unlock">*</span></label> 
    </div>
    <div class="clear" v-if="unlock">
      <small>* these apply only to the letters column, not to prompts</small>
    </div>
  </div>

  <div class="options">
    <div class="option">
      <input type="checkbox" id="load-all" v-model="options.loadAll">
      <label for="load-all">Load everything!**</label> 
    </div>

    <div class="option">
      <input type="checkbox" id="hide-chars" v-model="options.hideCharacters">
      <label for="hide-chars">Hide characters</label> 
    </div>
    <div class="option">
      <input type="checkbox" id="hide-cat" v-model="options.hideCategory">
      <label for="hide-chars">Hide category</label> 
    </div>
    <div class="clear">
      <small>** <strong :style="{ color: 'red'}">This may take your browser a bit.</strong></small>
    </div>
  </div>
  <div class="meta">
    <a href="https://yuletide.dreamwidth.org/97965.html" target="_blank">Contact/Donate</a>
  </div>
</div>  
  
</template>

<script>
  import { mapGetters } from 'vuex';
  import db from '../db.js';
  export default {
    computed: {
      ...mapGetters([
        'unlock',
        'categories'
      ])
    },
    watch: {
      options: {
        handler (val) {
          this.$store.commit('setOptions', val);

          if (val.loadAll && !this.loadedAll) {
            db.ref('/characters').once('value').then(res => {
              const result = res.val();
              this.$store.commit('setCharacters', {});
              this.$store.commit('setCharacters', result);
              this.loadedAll = true;
            });
          }
        },
        deep: true
      }
    },
    data() {
      return {
        options: {
          filter: {
            category: '',
            term: ''
          },
          loadedAll: false,
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