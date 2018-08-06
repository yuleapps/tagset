<template>
  <div class="modal">
    <div class="modal-content">
      <p>
        Add Your Letter</strong>
      </p>

      <div class="autocomplete">
        <label for="fandom-1">Fandom:</label>
        <template v-if="show">
          <input type="text"
            @keydown.enter.prevent="select"
            @keydown.down="next"
            @keydown.up="prev"
            @keyup="autocomplete"
            v-model="term"
          >
          <p v-if="options.length">
            <span
              :class="['option', { focused: i === selectedIndex }]" 
              v-for="(option, i) in options" 
              :key="option['.key']"
            >
              {{ option.name }}
            </span>
          </p>
        </template>


        <template v-else>

          <strong>{{ fandom.name }}</strong>

          <br>

          <label for="fandom-1">Characters:</label>
          <div class="badges">
            <span
              class="character"
              v-for="char in characters" 
            >
              {{ char }}

              <i>(X)</i>
            </span>
          </div>
          <input type="text"
            @keydown.enter.prevent="select('char')"
            @keydown.down="next"
            @keydown.up="prev"
            @keyup="autocomplete"
            v-model="term"
          >

          <p v-if="options.length">
            <span
              :class="['option', { focused: i === selectedIndex }]" 
              v-for="(option, i) in options" 
              :key="option"
            >
              {{ option }}
            </span>
          </p>
          
        </template>


        {{ msg }}

      </div>
      
     <!--  <div class="input">
        <label for="username">Username:</label>
        <input v-focus="show" ref="username" id="username" type="text" v-model="username" placeholder="Username"> 
      </div>

      <div class="input">
        <label for="letter">Letter Link:</label>
        <input type="text" id="letter" v-model="url" placeholder="Letter link">
      </div>

      <div class="input" v-if="mods">
        <label for="pinchhitter">Pinch hitter?</label>
        <input type="checkbox" v-model="pinchhitter">
      </div>
      
      
      <button class="add-letter" @click="addLetter">Add!</button>  
      <button class="cancel" @click="cancel">(Cancel)</button> -->
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';
  import { mapGetters } from 'vuex';
  export default {
    data() {
      return {
        msg: '',
        show: true,
        term: '',
        fandom: '',
        characters: [],
        selected: '',
        options: [],
        selectedIndex: -1,
        maxChars: 10
      };
    },
    computed: {
      ...mapGetters([
        'fandoms'
      ])
    },
    watch: {
      term(val, oldVal) {
        if (val !== oldVal) {
          this.selectedIndex = -1;
        }
      }
    },
    methods: {
      warn() {
        this.msg = 'You must choose from the dropdown!'
      },
      autocomplete(type) {
        this.msg = null;
        if (!this.term.length && !this.fandom.name) {
          this.options = [];
        }

        if (!this.fandom.name) {
          this.options = _.filter(this.fandoms, o => {
            return o.name.toLowerCase().indexOf(this.term.toLowerCase()) > -1;
          });
        } else {

          if (!this.options.length) {
            console.log('no length');
            this.options = _.filter(this.fandom.characters, o => {
              return o.toLowerCase().indexOf(this.term.toLowerCase()) > -1;
            });            
          } else {
            this.options = _.filter(this.options, o => {
              return o.toLowerCase().indexOf(this.term.toLowerCase()) > -1;
            });

          }
        }

      },
      select(type) {

        if (this.selectedIndex < 0 || this.selectedIndex > this.options.length -1) {
          this.msg = 'You must choose from the dropdown!'
          return;
        }

        if (type !== 'char') {
          this.show = null;
          this.fandom = this.options[this.selectedIndex];
          this.term = '';
          this.options = this.fandom.characters;
          return;
        }

        if (this.characters.length === this.maxChars) {
          this.msg = 'You cannot select any more characters!'
          return;
        }

        this.characters.push(this.options[this.selectedIndex]);
        this.term = '';
        this.options = _.filter(this.options, o => {
          return !_.includes(this.characters, o);
        })

      },
      next() {
        if (this.selectedIndex === this.options.length - 1) {
          return;
        }
        this.selectedIndex++;
      },
      prev() {
        if (this.selectedIndex <= 0) {
          this.selectedIndex = -1;
        }
        this.selectedIndex--;
      }
    }
  };
</script>

<style lang="scss">

.option {
  display: block;
  margin-bottom: 3px;
  &.focused {
    font-weight: bold;
    background-color: #fcfc;
  }
}
  
</style>