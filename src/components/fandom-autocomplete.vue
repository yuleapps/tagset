<template>
  <div class="fandom-autocomplete">
    <label :class="{ error: hasError }" for="fandom">Fandom {{ number }}:</label>
    <span v-if="fandom.name">
      {{ fandom.name }}
      <button class="remove" @click="removeFandom"><span class="far fa-times-circle"></span></button>
    </span>

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
        <p><em>Available options:</em></p>
        <span
          :class="['option', { focused: i === selectedIndex }]"
          v-for="(option, i) in options"
          :key="option['.key']"
          @mouseenter="selectedIndex = i"
          @mouseleave="selectedIndex = -1"
          @click="select"
          v-html="highlight(option.name, 'f')"
        >
        </span>
      </div>
    </template>

    <div v-else>
      <label for="chars">Characters:</label>

      <input type="text"
        placeholder="Filter..."
        @keydown.enter.prevent="select('char')"
        @keydown.down="next"
        @keydown.up="prev"
        @keyup="autocomplete"
        v-model="term"
      >

      <div class="badges">
        <span class="character" v-for="char in chars" >
          {{ char }}
          <button class="remove" @click="removeChar(char)"><span class="far fa-times-circle"></span></button>
        </span>
      </div>

      <p v-if="charsLoading">Loading character options...</p>

      <div v-if="Object.keys(options).length && chars && chars.length < maxChars">
        <p><em>Available options:</em></p>
        <span
          :class="['option', { focused: i === selectedIndex }]"
          v-for="(option, i) in options"
          :key="option"
          v-html="highlight(option, 'c')"
          @mouseenter="selectedIndex = i"
          @mouseleave="selectedIndex = -1"
          @click="select('char')"
        >
        </span>
      </div>
      <p v-else-if="Object.keys(options).length === 0 && !chars.length">No characters were nominated</p>
    </div>

    <p class="msg" v-if="msg"> {{ msg }}</p>

  </div>
</template>

<script>
import _ from 'lodash';
import db from '../db.js';
import { mapGetters } from 'vuex';
export default {
  props: {
    savedData: {
      type: Object,
      default() {
        return null
      }
    },
    hasError: {
      type: Boolean,
      default: false
    },
    fandoms: {
      type: Array,
      default() {
        return [];
      }
    },
    maxChars: {
      type: Number,
      default: 4
    },
    number: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      msg: '',
      term: '',
      fandom: {},
      chars: [],
      options: [],
      selectedIndex: -1,
      charsLoading: false
    };
  },
  computed: {
    ...mapGetters(['characters'])
  },
  watch: {
    term(val, oldVal) {
      if (val !== oldVal) {
        this.selectedIndex = -1;
        this.msg = null;
      }
    },
    chars: {
      deep: true,
      handler() {
        this.update();
      }
    },
    fandom: {
      deep: true,
      handler() {
        this.update();
      }
    },
    savedData: {
      deep: true,
      handler() {
        this.loadSaved();
      }
    }
  },
  beforeMount() {
    if (this.savedData !== null) {
      this.loadSaved();
    }
  },
  methods: {
    loadSaved() {
      this.chars = this.savedData.characters || [];
      this.fandom = this.fandoms[this.savedData.key];
      this.autocomplete();
    },
    update() {
      this.$emit('update', {
        fandom: {
          name: this.fandom.name,
          '.key': this.fandom['.key']
        },
        characters: this.chars
      });
    },
    autocomplete(type) {
      if (this.chars.length === this.maxChars) {
        this.msg = 'You cannot select any more characters!';
        return;
      }
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
        const fandomKey = this.fandom['.key'];
        const results = _.filter(this.characters[fandomKey], o => {
          if (!o) {
            o = '';
          }
          return o.toLowerCase().indexOf(this.term.toLowerCase()) > -1;
        });

        this.options = _.difference(results, this.chars) || [];
      }
    },
    removeFandom() {
      this.fandom = '';
      this.chars = [];
      this.options = [];
      this.selectedIndex = -1;
      this.term = '';
      this.msg = '';
    },
    removeChar(char) {
      this.chars = _.filter(this.chars, o => {
        return o !== char;
      });

      this.options = _.difference(this.characters[this.fandom['.key']], this.chars);
    },
    highlight(option, type) {
      if (!option) {
        return;
      }
      // highlight any char
      const regex = new RegExp(this.term, 'ig');
      return option.replace(regex, '<strong>$&</strong>');
    },
    select(type) {
      if (this.selectedIndex < 0 || this.selectedIndex > this.options.length - 1) {
        this.msg = 'You must select from the available options!';
        return;
      }

      if (type !== 'char') {
        this.show = null;
        this.fandom = this.options[this.selectedIndex];
        this.term = '';
        const fandomKey = this.fandom['.key'];
        this.options = [];

        if (!this.characters[fandomKey]) {
          this.charsLoading = true;

          db
            .ref('/characters/' + fandomKey)
            .once('value')
            .then(res => {
              const result = res.toJSON();
              this.$store.commit('addChar', { key: fandomKey, result });

              this.options = result || [];
              this.charsLoading = false;
            });
        } else {
          this.options = this.characters[fandomKey] || [];
        }
        return;
      }



      this.chars.push(this.options[this.selectedIndex]);
      this.term = '';
      this.options = _.filter(this.options, o => {
        return !_.includes(this.chars, o);
      });
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
  width: 90px;
  display: inline-block;
}

.msg,
.error {
  font-weight: bold;
  color: #e74c3c;
}

.option {
  cursor: pointer;
  display: block;
  margin-bottom: 3px;
  &.focused {
    font-weight: bold;
    background-color: rgba($color: #e4a6a6, $alpha: 0.3);
  }
}

.character {
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  padding: 2px;
  display: inline-block;
  margin: 5px 5px 5px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
  }
}

.remove {
  border: 0;
  border-radius: 2px;
  color: #e74c3c !important;
  font-size: 14px;
  background-color: transparent !important;
  padding: 0;

  &:hover {
    font-weight: bold;
  }
}
</style>
