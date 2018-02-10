import sheetserver from '../../api/sheetserver'
import {_} from 'vue-underscore';


// initial state
// shape: [{ filename, title, author, preview }]
const state = {
  entries: [],
  selected_entry: null
}

// getters
const getters = {
  activeSheet: state => state.selected_entry,
  allSheets: state => state.entries
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
  }

}


// mutations
const mutations = {
  setSheets (state, sheets) {
    state.entries = sheets
  },

  setActiveSheet(state, sheet){
    state.selected_entry = sheet
  }
}



export default {
  state,
  getters,
  actions,
  mutations
}