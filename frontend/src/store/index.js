import Vue from 'vue'
import Vuex from 'vuex'
import sheets from './modules/sheets'
import layout from './modules/layout'
// import createLogger from '../plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    sheets,
    layout
  },
  strict: debug,
  // plugins: debug ? [createLogger()] : []
})