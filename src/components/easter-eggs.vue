<template>
  <div class="modal">
    <div class="modal-content">
      <p>You've {{ showEasterEggs ? 'enabled' : 'disabled' }} easter eggs! Press F1 again to toggle.</p>


      <strong>Stats:</strong>

      <p>
        Fandoms with letters: {{ totalLetters }}
      </p>

      <p>No other easter eggs available this year, sorry! ):</p>

      <button class="cancel" @click="$emit('hide')">(Got it)</button>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    data() {
      return {
        findPal: '',
        pal: ''
      }
    },
    computed: {
      ...mapGetters([
        'fandoms',
        'showEasterEggs',
        'letters'
      ]),
      totalLetters() {
        if (!this.letters) {
          return 'No data - database error!';
        }

       return Object.keys(this.letters).length;
      }
    }
  };
</script>
