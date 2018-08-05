const state = {
  prompts: [],
  bookmarks: [],
  lettermarks: [],
  promptmarks: [],
  user: null,
  userPrompts: [],
  categories: []  
};

const mutations = {
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
  }
};

const getters = {
  prompts: state => state.prompts,
  categories: state => state.categories,
  bookmarks: state => state.bookmarks,
  lettermarks: state => state.lettermarks,
  promptmarks: state => state.promptmarks,
  user: state => state.user,
  userPrompts: state => state.userPrompts
};

export default {
  state,
  mutations,
  getters
};