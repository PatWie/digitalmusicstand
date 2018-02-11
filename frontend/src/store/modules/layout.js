
// initial state
const state = {
  show_list: true,
  // show_details:false,
  // show_pdf: true
}

// getters
const getters = {
  showList: state => state.show_list,
  // showDetails: state => state.show_details,
  // showPdf: state => state.show_pdf
}


const actions = {

  toggleShowList ({ state, commit } ) {
    commit('toggleShowList')
  },

  // toggleShowDetails ({ state, commit } ) {
  //   commit('toggleShowDetails')
  // },

  // toggleShowPdf ({ state, commit } ) {
  //   commit('toggleShowPdf')
  // }

}


// mutations
const mutations = {

  toggleShowList (state) {
    state.show_list = !state.show_list;
  },

  // toggleShowDetails (state) {
  //   state.show_details = !state.show_details;
  // },

  // toggleShowPdf (state) {
  //   state.show_pdf = !state.show_pdf;
  // }


}



export default {
  state,
  getters,
  actions,
  mutations
}