<template>
  <!-- list of papers -->
  <div class="papis-list" v-if="show_list === true">
      <div class="card-panel">
          <div class="child scrollable">
              <ul class="collection paper-elements">
                 <li
                 v-bind:class="{'collection-item':true, 'collection-item-active':(sheet === active_sheet)}"
                v-for="sheet in sorted(sheets)" @click="selectSheet(sheet)">
                     <span class="papis-title">{{ sheet.title }}</span>
                     <p class="papis-author">{{ sheet.author }}
                      <span v-if="sheet.transcriber"><i> transribed by {{ sheet.transcriber }}</i></span>
                      <span v-if="sheet.version"> ({{ sheet.version }})</span>
                    </p>
                 </li>
              </ul>
          </div>
      </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {

  computed: mapGetters({
    sheets: 'allSheets',
    active_sheet: 'activeSheet',
    show_list: 'showList',
    filter_query: 'filterQuery'
  }),

  created () {
    this.$store.dispatch('getAllSheets')
  },

  methods: {
    selectSheet(s) {
      this.$store.dispatch('setActiveSheet', s);
    },

    sorted(arr) {
      return arr.filter(e => {
        return e.title.toLowerCase().indexOf(this.filter_query.toLowerCase()) !== -1;
      })

    }


  }

}
</script>
