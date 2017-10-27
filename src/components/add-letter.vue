<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <p>
        Add A Letter To <strong>{{ selectedFandom }}</strong>
      </p>
      <p>
        <small class="warn">Warning: update and delete functionality pending. Check before you add! If you make a mistake, ping the letters app post on the DW yuletide community.</small><br>
      </p>
      
      <div class="input">
        <label for="username">Username:</label>
        <input v-focus="show" ref="username" id="username" type="text" v-model="username" placeholder="Username"> 
      </div>

      <div class="input">
        <label for="letter">Letter Link:</label>
        <input type="text" id="letter" v-model="url" placeholder="Letter link">
      </div>
      
      
      <button class="add-letter" @click="addLetter">Add!</button>  
      <button class="cancel" @click="cancel">(Cancel)</button>
    </div>
  </div>

</template>

<script>

export default {
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      }
    }
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    selectedFandom: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      username: '',
      url: ''
    };
  },
  methods: {
    cancel() {
      this.$emit('close');
      this.username = null;
      this.url = null;
    },
    addLetter(key) {
      if (!this.selectedFandom || !this.username || !this.url) {
        return;
      }

      this.$firebaseRefs.fandoms.child(this.selectedFandom['.key']).child('letters').push({
        username: this.username,
        url: this.url
      });

      this.$firebaseRefs.meta.child('lastUpdated').set(new Date().toJSON());

      this.cancel();
    }
  }
}
</script>
