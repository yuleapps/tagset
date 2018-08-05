<template>
  <div :class="['user-lookup', { collapsed: !user }]">
    <div class="heading"><strong>{{ user }}'s</strong> prompts</div>
    <a @click="close" class="close-lookup">(x)</a>
    <table class="prompts">
      <thead>
        <tr>
          <th class="fave">&hearts;</th>
          <th class="username">Fandom</th>
          <th class="characters">Characters</th>
          <th class="prompts">Prompts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prompt in userPrompts">
          <td>
            <button 
              class="bookmark-prompt" 
              v-if="!hasPromptmark(prompt)"
              @click="addPromptmark(prompt)">&hearts;
            </button>
          </td>
          <td>
            {{ prompt.fandom }}
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
</template>

<script>
  import { mapGetters } from 'vuex';
  import utils from './utils.js';
  export default {
    computed: {
      ...mapGetters([
        'userPrompts',
        'user',
        'promptmarks'
      ])
    },
    methods: {
      hasPromptmark: utils.hasPromptmark,
      addPromptmark: utils.addPromptmark,
      close() {
        this.$store.commit('setUser', null);
        this.$store.commit('setUserPrompts', []);
      }
    }
  };
</script>