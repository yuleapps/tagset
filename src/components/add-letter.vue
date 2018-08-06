<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Add Your Letter</h2>

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


      <div class="error" v-if="errors.length">
        <ul>
          <li v-if="hasError('username')">
            You need a username
          </li>
          <li v-if="hasError('url')">
            You need a letter link
          </li>
          <li v-if="hasError('fandom')">
            You need at least {{ min }} fandoms
          </li>
        </ul>
      </div>
      
      <button @click="submit" class="submit">{{ submitText }}</button> 
      <button v-if="isReview" @click="isReview = false" class="submit">Edit Again</button>  
      <button class="cancel" @click="$emit('close')">(Cancel)</button>

      <p><small>* <strong>Made a mistake in an earlier submission?</strong> Contact the mods at SOMEPLACE.</small></p>

      <p><small>* The Yuletide mods reserve the right to delete any letter that is locked or includes requests that INSERT NICE WORDING HERE, GUYS. Mods will do their best to contact you about the problem! You may resubmit your fixed letter at any time.</small></p>
      <p><small>* For those new to Yuletide: only nominated fandoms and characters are available for selection. Don't see your favourite? Double check the official tagset - they may not have been nominated!</small></p>
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
      submit() {
        this.errors = [];
        if (this.isReview) {
          // submit
          return;
        }

        if (!this.username.length) {
          this.errors.push('username');
        }

        if (!this.url.length) {
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