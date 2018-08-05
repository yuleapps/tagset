<template>
  <div class="modal">
    <div class="modal-content">
      <p>You've {{ enabled ? 'enabled' : 'disabled' }} easter eggs! Press F1 again to toggle.</p> 
      

      <strong>Stats:</strong>
      <p>
        * next to a username indicates an author has been crowdsourced as prolific (3+ fics in the main collection) over the years 2014, 2015, 2016. There may be inaccuracies!
      </p>
      <p>
        Superscripts indicate that the user has signed up for an optional challenge. <strong>It may not apply to the fandom you're looking at</strong>. C = Crueltide, P = Yuleporn, F = Festivus. (N.B. Unlike letters, these challenge lists are updated only once a day or so.)
      </p>
      <p>
        Users with letters: {{ totalLetters }}
      </p>
      <p>
        Who shares the most fandoms with <input type="text" v-model="findPal" placeholder="Enter username">?
        <button @click="getFandomPal()">Go!</button>
        <p v-if="pal && pal.length">
          <ul>
            <li v-for="p in pal">
              <a :href="p.url" target="_blank">{{p.username}} ({{p.count}})</a>
            </li>
          </ul>
        </p>
        <p v-else-if="pal && !pal.length">): No results!</p>
      </p>
      <button class="cancel" @click="$emit('hide')">(Got it)</button>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      enabled: {
        type: Boolean,
        default: false
      },
      fandoms: {
        type: Array,
        default() { return []; }
      }
    },
    data() {
      return {
        findPal: '',
        pal: ''
      }
    },
    computed: {
      totalLetters() {

        if (!this.fandoms) {
          return 'No data - database error!';
        }

        const users = [];

        _.each(this.fandoms, fandom => {
          _.each(fandom.letters, l => {
            users.push(l.username.toLowerCase());
          });
        });

        return _.uniq(users).length;

      }
    },
    methods: {

      // i r good at names
      getFandomPal() {
        const fandoms = _.filter(this.fandoms, fandom => {
          return _.find(fandom.letters, { username: this.findPal });
        });

        const users = [];

        _.each(fandoms, fandom => {
          _.each(fandom.letters, letter => {
            const otherUser = letter.username.toLowerCase();
            if (otherUser !== this.findPal.toLowerCase()) {
              users.push(letter);
            }
          })
        });

        this.pal = [];

        if (users.length) {
          const counts = _.chain(users).countBy(o => o.username).value();

          _.each(counts, (n, key) => {
            this.pal.push({... _.find(users, user => user.username.toLowerCase() === key.toLowerCase()),
              count: n }); 
          });
        }
      },
    }
  };
</script>