<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Add Your Letter</h2>

      <p>Remember that adding your letter does <strong>not count as signing up for Yuletide!</strong> Go and do that first <a href="#">on AO3</a>.</p>

      <p><small>* <strong>Made a mistake in an earlier submission?</strong> Or found an app bug? Contact us at SOMEPLACE.</small></p>

      <p><small>* The mods will delete any letter that is locked or otherwise breaks rules; your AO3 email will be sent a courtesy notice. You may resubmit your fixed letter at any time!</small></p>

      <div v-show="!isReview">
        <div :class="['input username', { error: hasError('username')}]">
          <label for="username">Username:</label>
          <input v-focus id="username" type="text" v-model="username" placeholder="Username"> 
          <span class="help"><small>AO3 username</small></span>
        </div>
        <div :class="['input link', , { error: hasError('url')}]">
          <label for="letter">Letter Link:</label>
          <input type="text" id="letter" v-model="url" placeholder="Letter link">
          <span class="help"><small>No locked letters! :(</small></span>

        </div>

          
        <div :class="{ error: hasError('fandom')}">
          <fandom-autocomplete
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

      <template v-if="isReview">

        <table class="table">
          <tbody>
            <tr>
              <th>Username</th>
              <td>{{ username }}</td>
            </tr>
            <tr>
              <th>Letter Link</th>
              <td>{{ url }}</td>
            </tr>
            <tr v-for="(fandom, i) in selectedFandoms">
              <th>Fandom {{i + 1}}</th>
              <td>{{ fandom.fandom.name }}</td>
              <td>
                  <ul class="chars">
                    <li v-if="!fandom.characters.length">Any</li>
                    <li v-for="char in fandom.characters">{{ char }}</li>
                  </ul>
              </td>
            </tr>
          </tbody>
        </table>

      </template>


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
      
      <button @click="submit" class="submit">{{ submitText }}</button> 
      <button v-if="isReview" @click="isReview = false" class="submit">Edit Again</button>  
      <button class="cancel" @click="$emit('close')">(Cancel)</button>

      
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import FandomAutocomplete from './fandom-autocomplete.vue';
  export default {
    components: {
      FandomAutocomplete
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
        url: '',
        isReview: false,
        availableFandoms: []
      };
    },
    computed: {
      ...mapGetters([
        'fandoms'
      ]),
      submitText() {
        if (this.isReview) {
          return 'Add!';
        }

        return 'Preview!'
      }
    },
    methods: {
      // https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
      validateUrl(value) {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
      },
      submit() {
        this.errors = [];
        if (this.isReview) {
          // submit
          return;
        }

        if (!this.username.length) {
          this.errors.push('username');
        }

        if (!this.url.length || !this.validateUrl(this.url)) {
          this.errors.push('url')
        }

        if (this.selectedFandoms.length < this.min) {
          this.errors.push('fandom');
        }

        if (this.errors.length) {
          return;
        }

        this.isReview = true;
      },
      edit() {
        this.isReview = false;
      },
      hasError(type) {
        return _.includes(this.errors, type);
      },
      update(index, data) {
        this.selectedFandoms[index] = data;
        const selected = _.map(this.selectedFandoms, o => {
          return o.fandom['.key'];
        });

        this.availableFandoms = _.filter(this.fandoms, o => {
          return !_.includes(selected, o['.key']);
        });
      }
    }
  };
</script>

<style lang="scss" scoped>

.fandom-autocomplete {
  border-top: 1px solid grey;
  padding: 10px 0;
}


.submit {
  padding: 7px 20px;
  font-weight: bold;
  font-size: 14px;
}

label {
  font-weight: bold;
}

.error {
  color: red !important;
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

input {
  height: 24px;
  font-size: 14px;
}

li {
  margin-left: 25px;
  list-style-type: square;
}
  
</style>