<template>
  <div :class="['user-lookup', { collapsed: !user }]">
    <div class="heading"><strong>{{ user }}'s</strong> prompts</div>
    <a @click="close" class="close-lookup">(x)</a>
    <table class="prompts">
      <thead>
        <tr>
          <th class="fave"><span class="fas fa-heart"></span></th>
          <th class="username">Fandom</th>
          <th class="characters">Characters</th>
          <th class="prompts">Prompts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prompt in userPrompts">
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
            {{ prompt.fandom }}
          </td>
          <td>
            <ul v-if="prompt.characters" class="characters">
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
</template>

<script>
  import { mapGetters } from 'vuex';
  import utils from './utils.js';
  export default {
    computed: {
      ...mapGetters([
        'userPrompts',
        'user',
        'promptmarks',
        'options'
      ])
    },
    methods: {
      hasPromptmark: utils.hasPromptmark,
      togglePromptmark: utils.togglePromptmark,
      formatUrl: utils.formatUrl,
      close() {
        this.$store.commit('setUser', null);
        this.$store.commit('setUserPrompts', []);
      }
    }
  };
</script>
