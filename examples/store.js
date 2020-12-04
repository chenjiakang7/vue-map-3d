import Vue from 'vue';
import Vuex from 'vuex';
// ########################
import getters from './store/getters.js'
import app from './store/modules/app.js'
import user from './store/modules/user.js';
import permission from './store/modules/permission.js'
// ########################

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission
  },
  getters
});

export default store
