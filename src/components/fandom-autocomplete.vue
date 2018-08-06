<template>
  <div class="fandom-autocomplete">
    <label :class="{ error: hasError }" for="fandom">Fandom {{ number }}:</label> <span v-if="fandom.name">{{ fandom.name }} <button class="remove" @click="removeFandom">(X)</button></span> 

    <template v-if="!fandom.name">
      <input type="text"
        placeholder="Search..."
        @keyup="autocomplete"
        @keydown.enter.stop="select"
        @keydown.down="next"
        @keydown.up="prev"
        v-model="term"
      >

      <div v-if="options.length">
        <p><em>Available selections:</em></p>
        <span
          :class="['option', { focused: i === selectedIndex }]" 
          v-for="(option, i) in options" 
          :key="option['.key']"
          @mouseenter="selectedIndex = i"
          @mouseleave="selectedIndex = -1"
          @click="select"
          v-html="highlight(option.name)"
        >
        </span>
      </div>
    </template>

    <template v-else>
      <br>
      <label for="characters">Characters:</label>
      
      <input type="text"
        placeholder="Filter..."
        @keydown.enter.prevent="select('char')"
        @keydown.down="next"
        @keydown.up="prev"
        @keyup="autocomplete"
        v-model="term"
      >

      <div class="badges">
        <span class="character" v-for="char in characters" >
          {{ char }}
          <button class="remove" @click="removeChar(char)">(X)</button>
        </span>
      </div>
      <br>

      <div v-if="options.length && characters && characters.length < maxChars">
        <p><em>Available selections:</em></p>
        <span
          :class="['option', { focused: i === selectedIndex }]" 
          v-for="(option, i) in options" 
          :key="option"
          v-html="highlight(option)"
          @mouseenter="selectedIndex = i"
          @mouseleave="selectedIndex = -1"
          @click="select('char')"
        >
        </span>

      </div>
      <span v-else-if="!fandom.characters">No characters were nominated</span>

      
    </template>

    <p class="msg"> {{ msg }}</p>

  </div>
</template>

<script>
  import _ from 'lodash';
  import { mapGetters } from 'vuex';
  export default {
    props: {
      hasError: {
        type: Boolean,
        default: false
      },
      fandoms: {
        type: Array,
        default() { return []; }
      },
      maxChars: {
        type: Number,
        default: 4
      },
      number: {
        type: Number,
        default: 1
      },
    },
    data() {
      return {
        msg: '',
        term: '',
        fandom: {},
        characters: [],
        options: [],
        selectedIndex: -1
      };
    },
    watch: {
      term(val, oldVal) {
        if (val !== oldVal) {
          this.selectedIndex = -1;
          this.msg = null;
        }
      },
      characters: {
        deep: true,
        handler() {
          this.update()
        }
      },
      fandom: {
        deep: true,
        handler() {
          this.update();
        }
      }
    },
    methods: {
      update() {
        this.$emit('update', { 
          fandom: {
            name: this.fandom.name,
            '.key': this.fandom['.key']
          },
          characters: this.characters
        });
      },
      autocomplete(type) {
        if (!this.term.length && !this.fandom.name) {
          this.options = [];
          return;
        }

        if (!this.fandom.name) {
          this.options = _.filter(this.fandoms, o => {
            return o.name.toLowerCase().indexOf(this.term.toLowerCase()) > -1;
          });
          return;
        } else {
          if (!this.fandom.characters) {
            this.options = []; 
            return;
          }

          const results = _.filter(this.fandom.characters, o => {
            if (!o) {
              o = '';
            }
            return o.toLowerCase().indexOf(this.term.toLowerCase()) > -1;
          }); 

          this.options = _.difference(results, this.characters) || [];
        }
      },
      removeFandom() {
        this.fandom = '';
        this.characters = [];
        this.options = [];
        this.selectedIndex = -1;
        this.term = '';
      },
      removeChar(char) {
        this.characters = _.filter(this.characters, o => {
          return o !== char;
        });

        this.options = _.difference(this.fandom.characters, this.characters);

      },
      highlight(option) {

        if (!option) {
          return;
        }
        // highlight any char
        const regex = new RegExp(this.term, 'ig');
        return option.replace(regex, '<strong>$&</strong>');

      },
      select(type) {
        if (this.selectedIndex < 0 || this.selectedIndex > this.options.length -1) {
          this.msg = 'You must select from the available options!'
          return;
        }

        if (type !== 'char') {
          this.show = null;
          this.fandom = this.options[this.selectedIndex];
          this.term = '';
          this.options = this.fandom.characters || [];
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

<style lang="scss" scoped>

label {
  font-weight: bold;
}

input {
  height: 24px;
  font-size: 14px;
}

.msg,
.error {
  font-weight: bold;
  color: #d63939;
}

.option {
  cursor: pointer;
  display: block;
  margin-bottom: 3px;
  &.focused {
    font-weight: bold;
    background-color: #fcfc;
  }
}

.character {
  cursor: pointer;

  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  padding: 2px;
  display: inline-block;
  margin: 3px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
  }
}

.remove {
  border: 0;
  border-radius: 2px;
  color: #d63939 !important;
  font-size: 14px;
  background-color: transparent !important;
  padding: 0;

  &:hover{
    font-weight: bold;
  }
}
  
</style>