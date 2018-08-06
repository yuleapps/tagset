const state = {
  loaded: false,
  characters: {},
  fandoms: [],
  letters: {},
  prompts: {},
  bookmarks: [],
  lettermarks: [],
  promptmarks: [],
  user: null,
  userPrompts: [],
  categories: [],
  unlock: true,
  showEasterEggs: false,
  options: {
    filter: {
      category: '',
      term: ''
    },
    onlyLetters: false,
    onlyBookmarks: false,
    onlyPrompts: false,
    onlyPHs: false,
    destyle: false,
    loadAll: false,
    hideCharacters: false,
    hideCategory: false
  }
};

const mutations = {
  setCharacters(state, characters) {
    state.characters = characters;
  },

  setLetters(state, letters) {
    state.letters = letters;
  },

  setDbLoaded(state, val) {
    state.loaded = val;
  },

  setFandoms(state, fandoms) {
    state.fandoms = fandoms;
  },

  setPrompts(state, prompts) {
    state.prompts = prompts;
  },

  setPromptmarks(state, promptmarks) {
    state.promptmarks = promptmarks;
  },

  setBookmarks(state, bookmarks) {
    state.bookmarks = bookmarks;
  },

  setLettermarks(state, lettermarks) {
    state.lettermarks = lettermarks;
  },

  setUser(state, user) {
    state.user = user;
  },

  setUserPrompts(state, prompts) {
    state.userPrompts = prompts;
  },

  setCategories(state, categories) {
    state.categories = categories;
  },

  setOptions(state, options) {
    state.options = options;
  },

  setUnlock(state, unlock) {
    state.unlock = unlock;
  },

  setEggs(state, val) {
    state.showEasterEggs = val;
  }
};

const getters = {
  characters: state => state.characters,
  letters: state => state.letters,
  loaded: state => state.loaded,
  fandoms: state => state.fandoms,
  prompts: state => state.prompts,
  categories: state => state.categories,
  bookmarks: state => state.bookmarks,
  lettermarks: state => state.lettermarks,
  promptmarks: state => state.promptmarks,
  user: state => state.user,
  userPrompts: state => state.userPrompts,
  options: state => state.options,
  unlock: state => state.unlock,
  showEasterEggs: state => state.showEasterEggs
};

export default {
  state,
  mutations,
  getters
};