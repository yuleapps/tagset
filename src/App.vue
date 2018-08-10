<template>
	<div id="app">
		<h1>Yuletide 2018 App</h1>

    <help v-if="showHelp" @close="showHelp = false"></help>

    <div v-if="!loaded || !loadedChars" class="loader">Loading...</div>

    <template v-if="loaded && loadedChars && !maintenance">
      <div class="scroll-top" @click="scrollToTop">(^)</div>

      <div :class="['menu', { sticky: sticky }]">
        <ul>
          <li class="submit-letter"  @click="showLetterModal = true">
            Submit Letter
          </li>
          <li class="bookmarks" @click="expandBookmarks = !expandBookmarks">
            Bookmarks
          </li>
          <li class="contact">Contact</li>
          <li class="help" @click="showHelp = true">
            <span class="fas fa-question-circle fa-xxl" ></span>
          </li>
        </ul>
      </div>

      <bookmarks :force-expand="expandBookmarks" @toggle="expandBookmarks = !expandBookmarks"></bookmarks>
      <add-letter
        v-if="showLetterModal"
        @close="showLetterModal = false">
      </add-letter>
      <easter-eggs
        class="modal"
        v-if="showEggHelp"
        @hide="showEggHelp = false"
      ></easter-eggs>

      <user-lookup></user-lookup>
      <options></options>

      <table class="main">
        <thead>
          <tr>
            <th class="fandom">Fandom</th>
            <th class="characters" v-if="!options.hideCharacters">Characters</th>
            <th class="letters">Letters</th>
            <th v-if="unlock" class="prompts">Prompts</th>
          </tr>
        </thead>
        <tbody>
          <tr class="overlay" v-if="updating">
            <td><div></div></td>
          </tr>
          <tr
          v-if="options.loadAll || index <= scrollPosition"
          v-for="(fandom, index) in filtered"
          :key="index"
          :class="{odd: index % 2 !== 0 }"
        >
          <td class="fandom" data-label="Fandom">
            {{ fandom.name }}
            <button
                class="bookmark"
                @click="toggle(fandom)"
                >
                  <span v-if="hasBookmark(fandom)" class="fas fa-heart"></span>
                  <span v-else class="far fa-heart"></span>
              </button>
            <div class="meta">
              <div v-if="maintenance">
                Key: {{ fandom['.key'] }}
              </div>
              <span class="category meta-tag" v-if="!options.hideCategory">{{fandom.category}}</span>

            </div>
          </td>
          <td class="characters" v-if="!options.hideCharacters">
            <ul>
              <li
                v-for="char in getCharacters(fandom['.key'], 'char li')"
                :class="{ highlight: letterHasChar(fandom['.key'], char) }"
                :key="char"
              >
                {{char}}
              </li>
            </ul>
          </td>
          <td class="letters">
            <ul>
              <li v-for="letter in letters[fandom['.key']]" :key="letter.username" class="letter">
                <a
                  class="user"
                  :href="formatUrl(letter.url)" target="_blank"
                >{{ letter.username }}</a>
                <button
                  class="bookmark-letter"
                  @click="toggleLettermark(letter, fandom)"
                >
                  <span v-if="hasLettermark(letter, fandom)" class="fas fa-heart"></span>
                <span v-else class="far fa-heart"></span>
                </button>
                <div class="meta">
                  <!-- TODO: meta stuff -->
                  <span v-if="isProlific(letter.username)">*</span>
                  <sup v-if="showEasterEggs">{{ challenges(letter.username).join(' ') }}</sup>
                  <button class="char-count meta-tag" @click="highlightChars(letter, fandom['.key'])" @mouseleave="letterChars = []">
                    Chars: {{ letter.characters === undefined ? 'Any' : letter.characters.length }}
                  </button>
                </div>

              </li>
            </ul>
          </td>
          <!-- HERE BE PROMPTS -->
          <td v-if="unlock" class="prompts">
            <button v-if="!prompts[fandom['.key']] && hasPrompts[fandom['.key']]" @click="getPrompts(fandom['.key'])">Get Prompts</button>
            <div v-if="prompts[fandom['.key']] === 'loading'">Loading...</div>
            <template v-if="prompts[fandom['.key']] && prompts[fandom['.key']].length && prompts[fandom['.key']] !== 'loading'">
              <a href="javascript:void(0);" @click="collapse">Collapse</a>
              <table class="prompts">
                <thead>
                  <tr>
                    <th class="fave">&hearts;</th>
                    <th class="username">Username</th>
                    <th class="characters">Characters</th>
                    <th class="prompts">Prompts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(prompt, index) in prompts[fandom['.key']]"
                    :key="index"
                  >
                    <td>
                      <button
                        class="bookmark-prompt"
                        v-if="!hasPromptmark(prompt)"
                        @click="addPromptmark(prompt)">&hearts;
                      </button>
                    </td>
                    <td>
                      {{ prompt.username }}
                      <span v-if="isProlific(prompt.username)">*</span>
                      <sup v-if="showEasterEggs">{{ challenges(prompt.username).join(' ') }}</sup>
                      <a @click="getUserPrompts(prompt.username)"> (see all)</a>
                    </td>
                    <td>
                      <ul v-if="prompt.characters">
                        <li v-for="c in prompt.characters.split(',')">{{ c }}</li>
                      </ul>
                    </td>
                    <td class="prompt" v-html="prompt.prompt"></td>
                  </tr>
                </tbody>
              </table>
            </template>
            <span v-else-if="!hasPrompts[fandom['.key']]">No prompts ):</span>
          </td>
        </tr>
        </tbody>

      </table>

      <caveats></caveats>
    </template>

    <maintenance v-else></maintenance>
	</div>
</template>

<script>
// TODO: pinchitters
import AddLetter from './components/add-letter.vue';
import Bookmarks from './components/bookmarks.vue';
import Caveats from './components/caveats.vue';
import EasterEggs from './components/easter-eggs.vue';
import Help from './components/help.vue';
import Maintenance from './components/maintenance.vue';
import Options from './components/options.vue';
import UserLookup from './components/user-lookup.vue';

// third party
import _ from 'lodash';
import db from './db.js';
import { mapGetters } from 'vuex';

// internal
// import hasPrompts from './data/prompts.js';
import utils from './components/utils.js';

// Remove english articles from fandom names
function removeArticlesCompare(o) {
  if (!o) {
    return;
  }
  const regex = /^(the\s|a\s|an\s)/i;
  if (!o.name) {
    return o;
  }
  return o.name.toLowerCase().replace(regex, '');
}

export default {
  name: 'app',
  components: {
    AddLetter,
    Bookmarks,
    Caveats,
    EasterEggs,
    Help,
    Maintenance,
    Options,
    UserLookup
  },
  beforeMount() {
    const bookmarksJson = this.$localStorage.get('bookmarks');
    if (bookmarksJson) {
      this.$store.commit('setBookmarks', JSON.parse(bookmarksJson));
    }

    const lettermarksJson = this.$localStorage.get('lettermarks');
    if (lettermarksJson) {
      this.$store.commit('setLettermarks', JSON.parse(lettermarksJson));
    }

    const promptmarksJson = this.$localStorage.get('promptmarks');
    if (promptmarksJson) {
      this.$store.commit('setPromptmarks', JSON.parse(promptmarksJson));
    }
  },
  created() {
    document.addEventListener('keydown', this.easterEggs);
    document.addEventListener('keydown', this.unlockModTools);
    document.addEventListener('keyup', this.unlockModTools);
    window.addEventListener('scroll', this.lazyload);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.easterEggs);
    document.removeEventListener('keydown', this.unlockModTools);
    document.removeEventListener('keyup', this.unlockModTools);
    window.removeEventListener('scroll', this.lazyload);
  },
  data() {
    return {
      showLetterModal: false,
      maintenance: false,
      showEggHelp: false,
      showHelp: false,
      // hasPrompts,
      expandBookmarks: false,
      down: {},
      mods: false,
      scrollPosition: 100,
      letterChars: {
        fandom: '',
        characters: []
      },
      timesCalled: 0,
      filtered: [],
      updating: true,
      sticky: false
    };
  },
  computed: {
    lastUpdated() {
      const data = _.find(this.meta, { '.key': 'lastUpdated' });

      if (!data) {
        return '';
      }

      return new Date(data['.value']).toString();
    },
    ...mapGetters([
      'letters',
      'fandoms',
      'loaded',
      'bookmarks',
      'characters',
      'categories',
      'lettermarks',
      'promptmarks',
      'unlock',
      'options',
      'user',
      'prompts',
      'showEasterEggs',
      'loadedChars',
      'loadAll'
    ])
  },
  watch: {
    options: {
      deep: true,
      handler(val) {
        this.updating = true;
        if (val.loadAll && !this.loadAll.characters) {
          const data = db
            .ref('/characters')
            .orderByKey()
            .startAt(String(0))
            .endAt(String(this.fandoms.length - 1))
            .once('value')
            .then(res => {
              const backFill = res.val();
              // TODO: backfill null values in JSON in chars that should exist in fandoms
              // so that the characters database.length === fandoms.length
              const newVal = { ...this.characters, ...backFill };
              this.$store.commit('loadAllChars', true);
              this.$store.commit('setCharacters', {});
              this.$store.commit('setCharacters', newVal);
              return (this.scrollPosition = this.fandoms.length);
            });
        } else {
          this.updateFilter();
        }
      }
    },
    loaded() {
      this.updateFilter();
    },
    scrollPosition() {
      this.updateFilter();
    }
  },
  methods: {
    ...utils,
    updateFilter() {
      this.updating = true;

      if (
        !this.options.onlyLetters &&
        !this.options.onlyPrompts &&
        !this.options.filter.term.length &&
        !this.options.onlyBookmarks &&
        !this.options.onlyPHs &&
        !this.options.filter.category.length
      ) {
        this.filtered = _.take(
          _.sortBy(this.fandoms, ['category', removeArticlesCompare]),
          this.scrollPosition
        );
        this.updating = false;
      }

      let arr = this.fandoms;

      if (this.options.onlyPrompts) {
        arr = _.filter(arr, o => {
          return this.hasPrompts[o['.key']];
        });
      }

      if (this.options.onlyLetters) {
        arr = _.filter(arr, o => {
          return this.letters[o['.key']] !== undefined;
        });
      }

      if (this.options.onlyBookmarks) {
        const bookmarkedFandoms = [];
        _.each(this.bookmarks, b => {
          bookmarkedFandoms.push(b['.key']);
        });

        arr = _.filter(arr, o => {
          return _.includes(bookmarkedFandoms, o['.key']);
        });
      }

      if (this.options.onlyPHs) {
        arr = _.filter(arr, o => {
          return _.filter(o.letters, l => {
            return l.isPinchhitter;
          }).length;
        });
      }

      if (this.options.filter.category.length) {
        arr = _.filter(arr, o => {
          return o.category === this.options.filter.category;
        });
      }

      if (this.options.filter.term.length) {
        arr = _.filter(arr, o => {
          return o.name.toLowerCase().indexOf(this.options.filter.term.toLowerCase()) > -1;
        });
      }

      // If filtering by term, preload everything if there are more than a few
      if (
        (this.options.filter.term.length || this.options.filter.category.length) &&
        !this.loadAll.characters &&
        arr.length > 5
      ) {
        const data = db
          .ref('/characters')
          .orderByKey()
          .startAt(String(0))
          .endAt(String(this.fandoms.length - 1))
          .once('value')
          .then(res => {
            const backFill = res.val();
            // TODO: backfill null values in JSON in chars that should exist in fandoms
            // so that the characters database.length === fandoms.length
            const newVal = { ...this.characters, ...backFill };
            this.$store.commit('loadAllChars', true);
            this.$store.commit('setCharacters', {});
            this.$store.commit('setCharacters', newVal);
            this.filtered = _.take(
              _.sortBy(arr, ['category', removeArticlesCompare]),
              this.scrollPosition
            );
            this.updating = false;
          });
        // Otherwise, just take the i/o hit
      } else {
        this.filtered = _.take(
          _.sortBy(arr, ['category', removeArticlesCompare]),
          this.scrollPosition
        );
        this.updating = false;
      }
    },
    lazyload() {
      const y = window.scrollY;
      const totalHeight = document.body.scrollHeight;

      if (window.pageYOffset > 100) {
        this.sticky = true;
      } else {
        this.sticky = false;
      }

      if (totalHeight - y - (document.documentElement.scrollTop || document.body.scrollTop) < 50) {
        if (this.scrollPosition < this.fandoms.length) {
          const prevPosition = this.scrollPosition + 1 || 101;
          const newPosition = this.scrollPosition + 100;

          const data = db
            .ref('/characters')
            .orderByKey()
            .startAt(String(prevPosition))
            .endAt(String(newPosition))
            .once('value');

          data.then(res => {
            const backFill = res.val();
            const newVal = { ...this.characters, ...backFill };
            this.$store.commit('setCharacters', {});
            this.$store.commit('setCharacters', newVal);
            this.scrollPosition = newPosition;
          });
        }
      }
    },
    collapse(e) {
      e.target.innerText = e.target.innerText === 'Expand' ? 'Collapse' : 'Expand';
      e.target.nextElementSibling.classList.toggle('hide');
    },
    getUserPrompts(username) {
      this.$store.commit('setUser', 'Loading');

      db
        .ref('/users/' + username)
        .once('value')
        .then(snapshot => {
          let results = snapshot.val();

          this.$store.commit('setUser', username);

          if (results && results.length) {
            this.$store.commit('setUserPrompts', results);
          } else {
            this.$store.commit('setUserPrompts', []);
          }
        });
    },
    unlockModTools(e) {
      if (e.type === 'keydown') {
        this.down[e.keyCode] = true;

        // shift + 1 + 2
        if (this.down[16] && this.down[49] && this.down[50]) {
          this.mods = !this.mods;
        }
      }

      if (e.type === 'keyup') {
        this.down[e.keyCode] = false;
      }
    },
    // show easter eggs on F1
    easterEggs(e) {
      if (e.keyCode !== 112) {
        return;
      }

      this.$store.commit('setEggs', !this.showEasterEggs);
      this.showEggHelp = true;
    },
    // utilities
    scrollToTop() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }
};
</script>

<style lang="scss">
@import './styles/app.scss';
@import './styles/mobile.scss';
</style>
