<template>
  <div :class="['bookmarks', { collapsed: !expand, large: largeBookmarks }]">
    <h4>Bookmarks (L: {{ lettermarks.length }}, F: {{ bookmarks.length }}<template v-if="unlock">, P: {{ promptmarks.length }}</template>)
      <a @click="expand = !expand">
        {{ expand ? '(Collapse)' : '(Expand)' }}
      </a>
    </h4>
    <div v-show="expand">
      <div class="option">
        <input type="checkbox" id="expand-bookmarks" v-model="largeBookmarks">
        <label for="expand-bookmarks">Make this wider</label>
      </div>

      <div>
        <h3>Letters:</h3>
        <ul v-if="lettermarks.length">
          <li v-for="letter in lettermarks">
            <template v-if="letter.isPinchhitter">(</template>
            <a :href="formatUrl(letter.url)" target="_blank">{{ letter.username }}</a> ({{ letter.name }})
            <template v-if="letter.isPinchhitter">)</template>

            (<a @click="removeLettermark(letter)">remove</a>)
          </li>
        </ul>
        <span v-else>You haven't bookmarked any letters yet ):</span>
      </div>

      <hr />

      <h3>Fandoms</h3>

      <table v-if="bookmarksData.length">
        <thead>
          <tr>
            <th class="fandom">Fandom</th>
            <th class="category"  v-if="!options.hideCategory">Category</th>
            <th class="characters" v-if="!options.hideCharacters">Characters</th>
            <th class="letters">Letters</th>
            <th class="prompts" v-if="unlock">Prompts</th>
          </tr>
        </thead>
        <tr
          v-for="(fandom, index) in bookmarksData"
          :class="{ odd: index % 2 !== 0 }"
        >
          <td class="fandom">
            {{ fandom.name }}
            <a @click="remove(fandom)">(Remove)</a>
          </td>
          <td class="category" v-if="!options.hideCategory">{{fandom.category}}</td>
          <td class="characters" v-if="!options.hideCharacters">
            <ul>
              <li v-for="char in getCharacters(fandom['.key'])" :class="{ highlight: letterHasChar(char) }">{{char}}</li>
            </ul>
          </td>
          <td class="letters">
            <ul v-for="letter in letters[fandom['.key']]">
              <li @mouseenter="highlightChars(letter)" @mouseleave="letterChars = []">
                <template v-if="letter.isPinchhitter">(</template>
                <a :href="formatUrl(letter.url)" target="_blank">{{ letter.username }}</a>
                <span v-if="isProlific(letter.username)">*</span>
              <template v-if="letter.isPinchhitter">)</template>

                <button class="bookmark-letter" @click="toggleLettermark(letter, fandom)">
                  <span v-if="hasLettermark(letter, fandom)" class="fas fa-heart"></span>
                  <span v-else class="far fa-heart"></span>
                </button>
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
            <span v-if="!hasPrompts[fandom['.key']]">No prompts ):</span>
          </td>
        </tr>
      </table>
      <span v-else>You haven't bookmarked any fandoms yet ):</span>

      <hr />n

      <div v-if="unlock && promptmarks.length">
        <strong>Prompts:</strong>

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
              <tr v-for="prompt in promptmarks">
                <td>
                  <button
                    class="remove-prompt"
                    @click="removePromptmark(prompt)">x
                  </button>
                </td>
                <td>
                  {{ prompt.username }}
                  <span v-if="isProlific(prompt.username)">*</span>
                  <sup v-if="showEasterEggs">{{ challenges(prompt.username).join(' ') }}</sup>
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
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import hasPrompts from '../data/prompts.js';
import { mapGetters } from 'vuex';
import utils from './utils.js';
export default {
  beforeMount() {
    const data = [];
    _.each(this.bookmarks, o => {
      const fandom = _.find(this.fandoms, fandom => {
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
      console.log('hello');
      const data = [];
      _.each(this.bookmarks, o => {
        const fandom = _.find(this.fandoms, fandom => {
          return fandom['.key'] === o['.key'];
        });

        if (fandom) {
          data.push(fandom);
        }
      });

      this.bookmarksData = data;
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
    ])
  },
  data() {
    return {
      letterChars: [],
      hasPrompts,
      expand: false,
      bookmarksData: [],
      largeBookmarks: false
    };
  },
  methods: {
    ...utils
  }
};
</script>
