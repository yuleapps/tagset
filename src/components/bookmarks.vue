<template>
  <div :class="['bookmarks', { collapsed: !expand, large: largeBookmarks }]">
    <div class="header">
      <span
          @click="expand = !expand; $emit('toggle')"
          :class="['fas expand', { 'fa-angle-double-right': expand, 'fa-angle-double-left': !expand }]"
        >
        </span>
      <h2 class="title">Bookmarks <span v-if="expand" @click="showHelp = !showHelp" class="fas fa-question-circle"></span></h2>
    </div>
    <div class="bookmarks-meta">
      <div class="counts" v-if="!expand">
        <ul>
          <li>
            Letters: {{ lettermarks.length }}
          </li>
          <li>
            Fandoms: {{ bookmarks.length }}
          </li>
          <li v-if="unlock">
            Prompts: {{ promptmarks.length }}
          </li>
        </ul>
      </div>
    </div>
    <div class="content" v-show="expand">
      <div class="options">
        <input type="checkbox" id="expand-bookmarks" v-model="largeBookmarks">
        <label for="expand-bookmarks">Make this wider</label>
      </div>
      <p v-if="showHelp">You can bookmark fandoms, letters, and - when they become available after Madness - individual
        prompts by clicking on the <span class="far fa-heart"></span> icon. This data is saved in your browser,
        and will remain for as long as you do not clear the cache.
      </p>
      <p>
        <a @click="showLoad = !showLoad" class="show-load">
          {{ showLoad ? 'Hide' : 'Show'}} Backup/Load
        </a>
      </p>
      <div v-if="showLoad" class="load-wrapper">
        <div class="load-info">
          <p>To transfer your bookmarks between browsers or computers, copy <em>exactly</em> the text in the "Copy" field. In the browser you want to load your bookmarks in, paste it into the "Load" field, then hit this button:
            <button class="button-primary load" @click="loadSaved">Load!</button>
          </p>
        </div>
        <div class="area">
          <strong>Copy:</strong> <textarea cols="10" rows="2" >{{ marks }}</textarea>
        </div>
        <div class="area">
          <strong>Load:</strong>
          <textarea cols="10" rows="2" v-model="saved"></textarea>
        </div>

      </div>
      <hr  />

      <div class="letters">
        <h3>Letters</h3>
        <ul v-if="lettermarks.length">
          <li v-for="letter in lettermarks" :key="letter.url">
            <template v-if="letter.isPinchhitter">(</template>
            <a :href="formatUrl(letter.url)" target="_blank">{{ letter.username }}</a> ({{ letter.name }})
            <template v-if="letter.isPinchhitter">)</template>
            <span @click="removeLettermark(letter)" class="remove far fa-times-circle"></span>
          </li>
        </ul>
        <span v-else>You haven't bookmarked any letters yet ):</span>
      </div>

      <div class="fandoms">
        <h3>Fandoms</h3>
        <table v-if="bookmarksData.length">
          <thead>
            <tr>
              <th class="fandom">Fandom</th>
              <th class="characters" v-if="!options.hideCharacters">Characters</th>
              <th class="letters">Letters</th>
              <th class="prompts" v-if="unlock">Prompts</th>
            </tr>
          </thead>
          <tr
            v-for="(fandom, index) in bookmarksData"
            :class="{ odd: index % 2 !== 0 }"
            :key="fandom.name"
          >
            <td class="fandom">
              {{ fandom.name }}
              <span @click="remove(fandom)" class="remove far fa-times-circle"></span>
              <div class="meta">
                <span class="category meta-tag" v-if="!options.hideCategory">{{fandom.category.join(', ')}}</span>
              </div>
            </td>

            <td class="characters" v-if="!options.hideCharacters">
              <ul>
                <li v-for="char in getCharacters(fandom['.key'])"
                  :key="char"
                  :class="{ highlight: letterHasChar(fandom['.key'], char) }">
                  {{char}}
                </li>
              </ul>
            </td>
            <td class="letters">
              <ul
                  v-for="letter in letters[fandom['.key']]"
                  :key="letter.username"
                >
                  <li class="letter">
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
            <td v-if="unlock" class="prompts">
              <button v-if="!prompts[fandom['.key']] && hasPrompts[fandom['.key']]" @click="getPrompts( fandom['.key'])">Get Prompts</button>
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
                    <tr v-for="prompt in prompts[fandom['.key']]">
                      <td>
                        <button
                          class="bookmark"
                          @click="togglePromptmark(prompt)"
                        >
                          <span v-if="hasPromptmark(prompt)" class="fas fa-heart"></span>
                          <span v-else class="far fa-heart"></span>
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
                          <li v-for="c in prompt.characters">{{ c }}</li>
                        </ul>
                      </td>
                      <td class="prompt">
                        <div v-html="prompt.prompt"></div>
                        <a v-if="prompt.letter" :href="formatUrl(prompt.letter)" target="blank">Letter</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <span v-if="!hasPrompts[fandom['.key']]">No prompts ):</span>
            </td>
          </tr>
        </table>
        <span v-else>You haven't bookmarked any fandoms yet ):</span>
      </div>

      <template v-if="unlock">
        <hr />
        <h3>Prompts</h3>

        <div v-if="promptmarks.length">
          <strong>Prompts:</strong>

            <table class="prompts">
              <thead>
                <tr>
                  <th class="fave"><span class="fas fa-heart"></span></th>
                  <th class="username">Username</th>
                  <th class="characters">Characters</th>
                  <th class="prompts">Prompts</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prompt in promptmarks">
                  <td>
                    <button
                        class="bookmark"
                        @click="togglePromptmark(prompt)"
                      >
                          <span v-if="hasPromptmark(prompt)" class="fas fa-heart"></span>
                          <span v-else class="far fa-heart"></span>
                      </button>
                  </td>
                  <td>
                    {{ prompt.username }}
                    <span v-if="isProlific(prompt.username)">*</span>
                    <sup v-if="showEasterEggs">{{ challenges(prompt.username).join(' ') }}</sup>
                  </td>
                  <td>
                    <ul v-if="prompt.characters"  class="characters">
                      <li v-for="c in prompt.characters">{{ c }}</li>
                    </ul>
                  </td>
                  <td class="prompt">
                    <div v-html="prompt.prompt"></div>
                    <a v-if="prompt.letter" :href="formatUrl(prompt.letter)" target="blank">Letter</a>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
        <span v-else>You haven't bookmarked any prompts yet ):</span>
      </template>
    </div>
  </div>
</template>

<script>
import { each, find } from 'lodash';
import hasPrompts from '../data/hasPrompts.js';
import { mapGetters } from 'vuex';
import utils from './utils.js';
export default {
  beforeMount() {
    const data = [];
    find(this.bookmarks, o => {
      const fandom = find(this.fandoms, fandom => {
        return fandom['.key'] === o['.key'];
      });

      if (fandom) {
        data.push(fandom);
      }
    });

    this.bookmarksData = data;
  },
  watch: {
    bookmarks() {
      const data = [];
      find(this.bookmarks, o => {
        const fandom = find(this.fandoms, fandom => {
          return fandom['.key'] === o['.key'];
        });

        if (fandom) {
          data.push(fandom);
        }
      });

      this.bookmarksData = data;
    },
    forceExpand(val) {
      this.expand = val;
    }
  },
  computed: {
    ...mapGetters([
      'letters',
      'options',
      'fandoms',
      'bookmarks',
      'characters',
      'promptmarks',
      'lettermarks',
      'prompts',
      'unlock',
      'showEasterEggs',
      'loadAll'
    ]),
    marks() {
      const marks = {
        fandoms: this.bookmarks,
        letters: this.lettermarks,
        prompts: this.promptsmarks
      };

      return JSON.stringify(marks);
    }
  },
  props: {
    forceExpand: false
  },
  data() {
    return {
      letterChars: [],
      hasPrompts,
      showHelp: false,
      expand: false,
      bookmarksData: [],
      largeBookmarks: false,
      saved: null,
      showLoad: false
    };
  },
  methods: {
    ...utils,
    loadSaved() {

      if (!confirm('Are you sure you want to load bookmarks? Your current bookmarks will be wiped!')) {
        return;
      }

      let parsed;

      try {
        parsed = JSON.parse(this.saved);
      } catch (e) {
        alert('Your bookmarks were invalid!');
        return;
      }

      if (!this.saved || !this.saved.length) {
        return;
      }
      this.$localStorage.set('lettermarks', JSON.stringify(parsed.letters));
      this.$localStorage.set('bookmarks', JSON.stringify(parsed.fandoms));
      this.$localStorage.set('promptmarks', JSON.stringify(parsed.prompts || []));
      this.$store.commit('setPromptmarks', parsed.prompts || []);
      this.$store.commit('setBookmarks', parsed.fandoms);
      this.$store.commit('setLettermarks', parsed.letters);
    }
  }
};
</script>

<style lang="scss" scoped>
.bookmarks {
  z-index: 2;
  position: fixed;
  top: 100px;
  right: 0;
  padding: 10px;
  padding-top: 30px;
  background: #fafafa;
  width: 60%;
  border: 1px solid #cfcfcf;
  max-height: 600px;
  overflow-y: auto;

  .mobile-expand,
  .expand {
    color: #e74c3c;
    font-size: 20px;
  }

  .title {
    display: inline-block;
    margin: 0;
  }

  .header {
    position: fixed;
    z-index: 1;
    top: 101px;
    padding-top: 10px;
    height: 40px;
    width: 100%;
    background-color: #fafafa;
  }

  &.large {
    width: 95%;
  }

  &.collapsed {
    width: 130px;
    padding-top: 10px;

    .title,
    .expand {
      font-size: 16px;
    }

    .header {
      position: unset;
      height: auto;
      z-index: 0;
    }
  }

  th.characters {
    width: 200px !important;
  }

  .letters {
    li {
      padding-left: 10px;
    }
  }

  .options,
  .letters,
  .fandoms {
    margin-top: 10px;
  }

  .counts {
    font-size: 13px;
    margin-left: 22px;
  }

  .remove {
    color: #e74c3c;
    &:hover {
      color: #e4a6a6;
    }
  }

  .show-load {
    cursor: pointer;
  }

  .load-wrapper {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
  }

  .load-info {
    flex: 0 0 100%;
  }

  .area {
    flex: 0 0 50%;
    textarea {
      vertical-align: top;
    }
  }

  .load {
    padding: 7px;
    font-weight: bold;
  }
}

@media screen and (max-width: 767px) {
}
</style>
