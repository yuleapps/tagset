<template>
  <div class="modal">
    <div class="modal-content">
      <h2>FAQ</h2>

      <h3>What is this?</h3>
      <p>The app contains the tagset for Yuletide, along with a voluntarily list of participant-submitted
        letters (before Madness) and a full list of the prompts (after Madness).</p>

      <h3>Does submitting a letter mean I'm signed up?</h3>
      <p>No. You have to sign up for Yuletide on AO3.</p>

      <h3>Letters: what does the "Chars" badge mean?</h3>
      <p>It indicates the number of characters requested in the letter. Click on the badge and, if there are
        characters requested, they will be bolded in the Characters column.
      </p>

      <h3>How do bookmarks work?</h3>
      <p>Click on a <span class="far fa-heart bookmark"></span> icon to bookmark something. An already-bookmarked thing
      is denoted by a solid <span class="fas fa-heart bookmark"></span>. That can be a whole fandom, an individual letter, or
         - once they're published - an individual prompt. Bookmarks are saved <em>in your browser memory</em>,
         so they should persist unless you clear your cache. However, that means you can't get sync bookmarks
         between browsers or devices.
      </p>

      <h3>I found a problem!</h3>
      <p>Whether it's an app bug, a typo, a problem with the tagset, or an issue with a letter or prompt,
        all problems should be reported to the official post HERE.
      </p>

      <h3>Help! I can't find my fandom!</h3>
      <p>Fandoms are loaded in increments of 100. If you tried using your in-browser search (Ctrl-F),
        you may not have loaded enough fandoms! Use the in-app filter instead, or select Load All to load
        everything.
      </p>

      <button class="cancel" @click="$emit('close')">(Close)</button>
    </div>
  </div>
</template>

<script>
export default {};
</script>
