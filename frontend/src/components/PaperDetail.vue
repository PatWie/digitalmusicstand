<template>
 <div class="papis-details" v-if="show_list === true && active_sheet">
     <article>
         <h1>{{active_sheet.title}}</h1>
         <p class="authors">{{active_sheet.author}}</p>
         <img style="width:100%; height:auto;" :src="active_sheet.preview + '?rnd=' + randomNumber()" />
     </article>
 </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {

  computed: mapGetters({
    active_sheet: 'activeSheet',
    show_list: 'showList',
  }),



  created () {

  },

  methods : {
    randomNumber : function(){
      return Math.random();
    }
  }

}
</script>
