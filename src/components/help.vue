<template>
  <div class="modal">
    <div class="modal-content">
      <h2>FAQ</h2>

      <span class="close fas fa-times-circle" @click="$emit('close')"></span>

      <h3>What is this?</h3>
      <p>The app contains the tagset for Yuletide. Before assignments are released, participants can
         submit their letter to this app for public listing, as is tradition!
        Once assignments go out, the full list of the prompts will be available as well.</p>

      <h3>Does submitting a letter mean I'm signed up?</h3>
      <p><strong>No</strong>. You have to <a href="http://archiveofourown.org/collections/yuletide2018/profile" target="blank">sign up for Yuletide on AO3</a>.
      Conversely, you do not have to submit a letter to this app if you don't want to.
      </p>

      <h3>Help! I messed up submitting my letter!</h3>
      <p>Hit up the Contact link on the menu and let a mod know; they will help you out!</p>

      <h3>What? A nominated fandom isn't listed the big table!</h3>
      <p>Fandoms are loaded in increments of 100 to save data. If you tried using your in-browser search (Ctrl-F),
        you may not have loaded enough fandoms! Use the in-app Filter By search box instead, or select Load All to load
        everything. Still not there? Report a bug!
      </p>

      <h3>What happened to the spreadsheet?</h3>
      <p>This app replaces the old spreadsheet, but for those who want this information in spreadsheet format, you can get a magically synced one (excluding characters for brevity) <a href="https://docs.google.com/spreadsheets/d/10uywj4_eDDARH6ykh2uXB5yujfrAXnYa8Jhl-6vWB-Y/edit#gid=0" target="blank">here</a>. The sync happens every 15 minutes.</p>

      <h3>Tools: what does checking Mobile Letter Format do?</h3>
      <p>Where possible, it gives you the "most readable" URLs for letters - e.g. mobile for Google Docs,
         and Tumblr and DW/LJ light themes.
      </p>

      <h3>Letters: what does the "Chars" badge mean?</h3>
      <p>It indicates the number of characters requested in the letter. Click on the badge and, if there are
        characters requested, they will be bolded in the Characters column.
      </p>

      <h3>Bookmarks: How do bookmarks work?</h3>
      <p>Click on a <span class="far fa-heart bookmark"></span> icon to bookmark something. Those become available
      in the Bookmarks tab. You can bookmark fandoms, letters, and prompts (once available). An already-bookmarked thing
      is denoted by a solid <span class="fas fa-heart bookmark"></span>.</p>
      <p>Bookmarks are saved <em>in your browser memory</em>,
         so they should persist unless you clear your cache. However, that means you <strong>cannot sync</strong> bookmarks
         between browsers or devices.
      </p>

      <h3>I found a problem!</h3>
      <p>Whether it's an app bug, a typo, a problem with the tagset, or an issue with a letter or prompt,
        all problems should be reported to the official post on <a href="http://yuletide-admin.dreamwidth.org" target="blank">
         the Yuletide Admin DW community</a>.
      </p>



      <button class="cancel" @click="$emit('close')">(Close)</button>
    </div>
  </div>
</template>

<script>
export default {};
</script>

