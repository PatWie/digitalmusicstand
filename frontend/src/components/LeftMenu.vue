<template>
  <div class="papis-sidebar">
      <!-- side menu -->
      <div class="col s12">
          <ul>

              <li>
                  <a href="#!">
                      <i class="material-icons" @click="reloadSheets">refresh</i>
                  </a>
              </li>
              <li>
                  <a href="#!">
                      <i class="material-icons" @click="toggleList">reorder</i>
                  </a>
              </li>
             <!--  <li>
                  <a href="#!">
                      <i class="material-icons" @click="toggleDetails">info</i>
                  </a>
              </li>
              <li>
                  <a href="#!">
                      <i class="material-icons" @click="togglePdf">aspect_ratio</i>
                  </a>
              </li> -->
          </ul>
      </div>
      <!-- side menu -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'LeftMenu',


  methods: {
    reloadSheets() {
      this.$store.dispatch('getAllSheets')
    },
    // toggleDetails() {
    //   this.$store.dispatch('toggleShowDetails')
    // },
    toggleList() {
      this.$store.dispatch('toggleShowList')
    },
    // togglePdf() {
    //   this.$store.dispatch('toggleShowPdf')
    // },

}

}

</script>

