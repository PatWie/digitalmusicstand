<template>
  <nav>
      <div class="nav-wrapper">
          <div class="left col s5">
              <!-- <ul>
                  <li>
                      <a href="#!" class="papis-menu">
                          <i class="material-icons">menu</i>
                      </a>
                  </li>
              </ul> -->
          </div>
          <div class="searchbar">
              <i class="material-icons">search</i>
              <input type="text" name="Search" class="searchtext z-depth-2"
              v-model="filter_query"
              placeholder="Explore Sheets" style="">
          </div>
          <div class="col l7">
              <ul class="right">
                  <li>
                      <a href="#!">
                          <i class="material-icons">more_vert</i>
                      </a>
                  </li>
              </ul>
          </div>
      </div>
    </nav>
</template>

<script>
export default {
  name: 'NavBar',

  computed: {
    filter_query: {
        get () {
          console.log('get', this.$store.state.filter_query)
          return this.$store.state.filter_query
        },
        set (value) {
          console.log('set', value)
          this.$store.dispatch('setFilterQuery', value);
          // console.log(value)
          // this.$store.dispatch('getAllSheets')
          // this.$store.commit('setFilterQuery', value)
        }
      }
  },

  data () {
    return {
      msg: 'Papis'
    }
  }
}
</script>


<style scoped>
</style>
