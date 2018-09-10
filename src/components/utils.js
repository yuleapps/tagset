import _ from 'lodash';
import db from '../db.js';
import { PROLIFIC_WRITERS, CRUELTIDE, YULEPORN, FESTIVUS } from '../data/lists';

export default {
  getCharacters(fandomKey) {
    const chars = this.characters[fandomKey];
    if (chars !== undefined) {
      return chars;
    }

    if (this.loadAll.characters) {
      return null;
    }

    db.ref('/characters/' + fandomKey)
      .once('value')
      .then(res => {
        const result = res.toJSON();
        this.$store.commit('addChar', { key: fandomKey, result });
        return result;
      });
  },
  letterHasChar(key, char) {
    return this.letterChars.fandom === key && _.includes(this.letterChars.characters, char);
  },
  highlightChars(letter, key) {
    this.letterChars = {
      fandom: key,
      characters: letter.characters
    };
  },
  toggle(fandom) {
    if (_.includes(this.bookmarks, fandom)) {
      this.remove(fandom);
      return false;
    }
    const newVal = this.bookmarks;
    newVal.push(fandom);
    this.$store.commit('setBookmarks', newVal);
    this.$localStorage.set('bookmarks', JSON.stringify(this.bookmarks));
  },
  toggleLettermark(letter, fandom) {
    if (
      _.find(this.lettermarks, o => {
        return o.username === letter.username && o.key === fandom['.key'];
      })
    ) {
      this.removeLettermark(letter);
      return false;
    }

    const newVal = this.lettermarks;

    newVal.push({
      ...letter,
      name: fandom.name,
      key: fandom['.key']
    });

    this.$store.commit('setLettermarks', newVal);
    this.$localStorage.set('lettermarks', JSON.stringify(this.lettermarks));
  },
  addPromptmark(prompt) {
    if (
      _.find(this.promptmarks, o => {
        return o.username === prompt.username && o.fandom === prompt.fandom;
      })
    ) {
      return false;
    }

    const newVal = this.promptmarks;
    newVal.push({
      ...prompt
    });

    this.$store.commit('setPromptmarks', newVal);
    this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
  },
  remove(fandom) {
    this.$store.commit(
      'setBookmarks',
      _.filter(this.bookmarks, o => {
        return o['.key'] !== fandom['.key'];
      })
    );
    this.$localStorage.set('bookmarks', JSON.stringify(this.bookmarks));
  },
  removeLettermark(letter) {
    this.$store.commit(
      'setLettermarks',
      _.filter(this.lettermarks, o => {
        return !(o.username === letter.username && o.key === letter.key);
      })
    );
    this.$localStorage.set('lettermarks', JSON.stringify(this.lettermarks));
  },
  removePromptmark(prompt) {
    this.$store.commit(
      'setPromptmarks',
      _.filter(this.promptmarks, o => {
        return (
          (o.username !== prompt.username && o.fandom === prompt.fandom) ||
          o.fandom !== prompt.fandom
        );
      })
    );
    this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
  },
  hasBookmark(fandom) {
    return _.find(this.bookmarks, o => {
      return o['.key'] === fandom['.key'];
    });
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
    if (
      _.find(this.promptmarks, o => {
        return o.username === prompt.username && o.fandom === prompt.fandom;
      })
    ) {
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
    e.target.innerText = e.target.innerText === 'Expand' ? 'Collapse' : 'Expand';
    e.target.nextElementSibling.classList.toggle('hide');
  },
  isProlific(name) {
    if (!this.showEasterEggs) {
      return false;
    }

    if (_.includes(PROLIFIC_WRITERS, name.trim().toLowerCase())) {
      return true;
    }

    return false;
  },
  challenges(name) {
    if (!this.showEasterEggs) {
      return false;
    }

    const data = [];

    _.includes(this.crueltide, name.trim().toLowerCase()) ? data.push('C') : null;
    _.includes(this.yuleporn, name.trim().toLowerCase()) ? data.push('P') : null;
    _.includes(this.festivus, name.trim().toLowerCase()) ? data.push('F') : null;

    return data;
  },
  getPrompts(fandomKey) {
    const newVal = this.prompts;
    newVal[fandomKey] = 'loading';
    this.$store.commit('setPrompts', {});
    this.$store.commit('setPrompts', newVal);

    db.ref('/prompts/' + fandomKey)
      .once('value')
      .then(snapshot => {
        let results = snapshot.val();

        if (results && results.length) {
          results = _.sortBy(results, o => o.username.toLowerCase());
          newVal[fandomKey] = results;
        } else {
          newVal[fandomKey] = [];
        }

        this.$store.commit('setPrompts', {});

        this.$store.commit('setPrompts', newVal);
      });
  },
  formatUrl(url) {
    if (!this.options.destyle || !url) {
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
      if (
        url.indexOf('?style=') === -1 &&
        url.indexOf('&style=') === -1 &&
        url.indexOf('format=') === -1
      ) {
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
