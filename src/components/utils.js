export default {
  hasBookmark(fandom) {
    return _.find(this.bookmarks, o => { return o['.key'] === fandom['.key']; });
  },
  hasLettermark(letter, fandom) {
    return _.find(this.lettermarks, o => { 
      return o.username === letter.username && o.key === fandom['.key']; 
    });
  },
  hasPromptmark(prompt) {
    return _.find(this.promptmarks, o => { 
      return o.username === prompt.username && o.fandom === prompt.fandom; 
    });
  },
  addPromptmark(prompt) {
    if (_.find(this.promptmarks, o => {
      return o.username === prompt.username && o.fandom === prompt.fandom;  
    })) {
      return false;
    }

    const newVal = this.promptmarks;
    newVal.push({ 
      ...prompt 
    });

    this.$store.commit('setPrompts', newVal);

    this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
  },
  collapse(e) {
    e.target.innerText = e.target.innerText === 'Expand' 
      ? 'Collapse'
      : 'Expand'; 
    e.target.nextElementSibling.classList.toggle('hide');
  },
  isProlific(name) {
    if (!this.showEasterEggs) {
      return false;
    }

    if (_.includes(this.PROLIFIC_WRITERS, name.trim().toLowerCase())) {
      return true;
    }

    return false;
  },
  formatUrl(url) {
    if (!this.destyle || !url) {
      return url;
    }

    url = url.trim();

    const isDW = url.indexOf('dreamwidth.org') > -1;
    const isLJ = url.indexOf('livejournal.com') > -1;
    const isTumblr = url.indexOf('tumblr.com') > -1;
    const isDocs = url.indexOf('docs.google') > -1;

    if (isDW) {

      if (url.indexOf('?style=') === -1 && url.indexOf('&style=') === -1) {
        if (url.indexOf('?') > -1) {
          return `${url}&style=site`;
        }

        return `${url}?style=site`;

      }
    }

    if (isLJ) {

      if (url.indexOf('?style=') === -1 && url.indexOf('&style=') === -1 && url.indexOf('format=') === -1) {
        if (url.indexOf('?') > -1) {
          return `${url}&format=light`;
        }

        return `${url}?format=light`;

      }
    }

    if (isTumblr) {

      if (url.indexOf('/mobile') === -1) {      
        return `${url}/mobile`;
      }
    }

    if (isDocs) {
      if (url.indexOf('/mobilebasic') === -1) {
        return `${url.replace(/\/edit.*$/, '')}/mobilebasic`;
      }
    }

    return url;
  }
};