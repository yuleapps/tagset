<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Submit Your Letter</h2>
      <span class="close fas fa-times-circle" @click="$emit('close')"></span>
      <p>Traditionally, participants in Yuletide may voluntarily submit their public Dear Author letters
        to 'tide everyone through until all requests are made public after assignments go out.</p>
      <p>
        Submitting your letter to the app does <strong>not count as signing up for Yuletide!</strong>
        Go and do that <a href="http://archiveofourown.org/collections/yuletide2018/profile" target="blank">on AO3</a> between October 12 - 21.
      </p>

      <div v-show="!isReview">
        <div :class="['input username', { error: hasError('username')}]">
          <label for="username">AO3 Username:</label>
          <input v-focus id="username" type="text" v-model="username" placeholder="AO3 Username">
        </div>

        <div :class="['input link', , { error: hasError('url')}]">
          <label for="letter">Letter Link:</label>
          <input type="text" id="letter" v-model="url" placeholder="Letter link - must be public!">
        </div>

        <div>
          <fandom-autocomplete
            :hasError="hasError('fandom')"
            v-for="i in max"
            :number="i"
            :fandoms="availableFandoms"
            :key="i"
            @update="update(i - 1, $event)"
          ></fandom-autocomplete>
        </div>


      <!--   <div class="input" v-if="mods">
          <label for="pinchhitter">Pinch hitter?</label>
          <input type="checkbox" v-model="pinchhitter">
        </div>
         -->
      </div>

      <template v-if="isReview && !userKey.length">

        <div class="error" v-if="userExists">This username has already submitted a letter to the app! Please edit it with your key. If you don't remember your key, contact a mod.</div>

        <table class="table" v-else>
          <tbody>
            <tr>
              <th>Username</th>
              <td>{{ username }}</td>
            </tr>
            <tr>
              <th>Letter Link</th>
              <td>{{ url }}</td>
            </tr>
            <tr v-for="(fandom, i) in scrubbedFandoms" :key="fandom.name">
              <th>Fandom {{i + 1}}</th>
              <td>{{ fandom.fandom.name }}</td>
              <td>
                  <ul class="chars">
                    <li v-if="!fandom.characters.length">Any</li>
                    <li v-for="char in fandom.characters" :key="char">{{ char }}</li>
                  </ul>
              </td>
            </tr>
          </tbody>
        </table>

      </template>

      <div v-show="userKey.length">
        <hr class="separator">
        <p>Your letter has been successfully submitted! Your letter key is <strong>{{ this.userKey }}</strong> - NOTE THIS DOWN. You will need it if you want to edit your letter later.</p>

        <p>Here are your requests formatted in HTML so you can easily share them - may we suggest posting to the <a href="https://yuletide.dreamwidth.org/139157.html" target="blank">Letters Post</a>? </p>
        <textarea>{{ getCopypasta() }}</textarea>
      </div>

      <div class="error list" v-if="errors.length">
        <p>Uh oh, looks like you need to fix some things...</p>
        <ul>
          <li v-if="hasError('username')">
            You need a username
          </li>
          <li v-if="hasError('url')">
            You need a valid letter link (including the starting http!)
          </li>
          <li v-if="hasError('fandom')">
            You need at least {{ min }} fandoms
          </li>
        </ul>
      </div>

      <button @click="submit" v-if="showSubmit" class="submit button-primary">{{ submitText }}</button>
      <button v-if="isReview && showSubmit" @click="isReview = false" class="submit button-warn">Edit</button>

      <ul class="notices small">
        <li>Mods will delete any letter that is locked or breaks rules; your AO3 email will be sent a courtesy notice. You may resubmit a fixed letter at any time!</li>
      </ul>

      <button class="cancel" @click="$emit('close')">({{ userKey.length ? 'Close' : 'Cancel' }})</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FandomAutocomplete from './fandom-autocomplete.vue';
import db from '../db.js';
export default {
  components: {
    FandomAutocomplete
  },
  firebase: {
    letters: db.ref('/letters')
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      }
    }
  },
  beforeMount() {
    this.availableFandoms = this.fandoms;
  },
  data() {
    return {
      errors: [],
      max: 6,
      min: 3,
      username: '',
      selectedFandoms: [],
      scrubbedFandoms: [],
      url: '',
      isReview: false,
      availableFandoms: [],
      userExists: false,
      showSubmit: true,
      userKey: ''
    };
  },
  computed: {
    ...mapGetters(['fandoms']),
    submitText() {
      if (this.isReview) {
        return 'Submit!';
      }

      return 'Preview!';
    }
  },
  methods: {
    // https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
    validateUrl(value) {
      return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
        value
      );
    },
    submit() {
      this.errors = [];
      this.scrubFandoms();

      if (this.isReview) {
        this.add();
        return;
      }

      if (!this.username.length) {
        this.errors.push('username');
      }

      if (!this.url.length || !this.validateUrl(this.url)) {
        this.errors.push('url');
      }

      if (this.scrubbedFandoms.length < this.min) {
        this.errors.push('fandom');
      }

      if (this.errors.length) {
        return;
      }

      this.isReview = true;
    },
    scrubFandoms() {
      // put things into a separate array so that index order is preserved
      // if users want to go back and edit
      this.scrubbedFandoms = _.compact(
        _.filter(this.selectedFandoms, f => {
          return f !== null && f !== undefined;
        })
      );
    },
    edit() {
      this.isReview = false;
    },
    hasError(type) {
      return _.includes(this.errors, type);
    },
    update(index, data) {
      let newVal = this.selectedFandoms;

      if (!data.fandom || !data.fandom.name) {
        newVal[index] = null;
      } else {
        newVal[index] = data;
      }

      this.selectedFandoms = [];
      this.selectedFandoms = newVal;

      const selected = [];

      _.each(this.selectedFandoms, o => {
        if (!o) {
          return;
        }
        selected.push(o.fandom['.key']);
      });

      this.availableFandoms = _.filter(this.fandoms, o => {
        return !_.includes(selected, o['.key']);
      });
    },
    getCopypasta() {
      if (!this.scrubbedFandoms.length) {
        return;
      }

      const pasta = [`<p><strong>${this.username}</strong><br>${this.url}</p>`];

      _.each(this.scrubbedFandoms, f => {
        const fandom = f.fandom;
        let chars = f.characters;
        if (!chars.length) {
          chars = ['Any (see tagset)'];
        }
        const s = `<p><strong>${fandom.name}</strong><br>${chars.join(', ')}</p>`;

        pasta.push(s);
      });

      return pasta.join('\n');
    },
    add() {
      db
        .ref('/letterkeys')
        .child(this.username)
        .once('value')
        .then(res => {
          if (!res.val()) {
            this.userKey = (Math.random() + 1).toString(36).substring(7);
            this.showSubmit = false;

            db
              .ref('/letterkeys')
              .child(this.username)
              .set({ key: this.userKey, timestamp: new Date().toISOString() });

            _.each(this.scrubbedFandoms, req => {
              this.$firebaseRefs.letters
                .child(req.fandom['.key'])
                .child(this.username)
                .set({
                  username: this.username,
                  url: this.url,
                  characters: req.characters,
                  isPinchhitter: this.pinchhitter || false
                });

              db
                .ref('/letterkeys')
                .child(this.username)
                .child('fandoms')
                .child(req.fandom['.key'])
                .set({
                  url: this.url,
                  key: req.fandom['.key'],
                  characters: req.characters,
                  isPinchhitter: this.pinchhitter || false
                });
            });

            // this.$emit('close');
          } else {
            this.userExists = true;
            this.showSubmit = false;
            return;
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
label {
  font-weight: bold;
  width: 130px;
  display: inline-block;
}

.fandom-autocomplete {
  margin: 10px 0;
  border-top: 1px solid #cfcfcf;
  padding: 10px 0;
}

.submit {
  padding: 7px 20px;
  font-weight: bold;
}

label {
  font-weight: bold;
}

.error {
  color: red !important;
  padding: 10px 0;
}

.list {
  margin-bottom: 10px;
}

table {
  th {
    vertical-align: top;
    padding: 10px 5px;
  }
}

li {
  margin-left: 25px;
  list-style-type: square;
}

.notices {
  margin: 10px 0;
}

.separator {
  margin: 10px 0;
}
</style>
