import sheetserver from '../../api/sheetserver'
import {_} from 'vue-underscore';


// initial state
// shape: [{ filename, title, author, preview }]
const state = {
  entries: [],
  selected_entry: [],
  filter_query: ""
}

// getters
const getters = {
  activeSheet: state => state.selected_entry,
  allSheets: state => state.entries,
  filterQuery: state => state.filter_query
}


const actions = {
  getAllSheets ({ commit }) {
    sheetserver.getSheets(sheets => {
      commit('setSheets', sheets)
    })
  },

  setActiveSheet ({ state, commit }, sheet) {
    const selected_item = state.entries.find(item => item.file === sheet.file)
    commit('setActiveSheet', selected_item)
  },

  setFilterQuery ({ state, commit }, query) {
    commit('setFilterQuery', query)
  }

}


// mutations
const mutations = {
  setSheets (state, sheets) {
    state.entries = sheets
  },

  setActiveSheet(state, sheet){
    state.selected_entry = sheet
  },

  setFilterQuery(state, query){
    console.log('got to set', query)
    state.filter_query = query
  }
}



export default {
  state,
  getters,
  actions,
  mutations
}