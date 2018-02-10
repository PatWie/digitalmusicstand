<template>
 <div
 v-shortkey="{left: [1], right: ['2']}" @shortkey="scroll_horizontal"
 class="papis-pdf" v-if="show_list === false">

    <img class="score" :src="page.url" v-for="page in pages"/>

 </div>
</template>

<script>
window.$ = window.jQuery = require('jquery');
import { mapGetters, mapActions } from 'vuex'

export default {

  computed: {
    ...mapGetters({
      active_sheet: 'activeSheet',
      show_list: 'showList',
    }),

    pages: function(){
      console.log(+this.active_sheet.pages);
      var data = []
      for (var i = 1; i < (+this.active_sheet.pages) + 1; i++) {
        data.push({url: 'http://localhost:8888/page/' + i + '/' + this.active_sheet.file})
        // data.push({url: '/page/' + i + '/' + this.active_sheet.file})
      }
      return data;
    },

  },


  created () {

  },


  methods : {
    randomNumber : function(){
      return Math.random();
    },
  scroll_horizontal: function(event) {
    switch(event.srcKey){
      case "left":
        var w = $(".score").first().get(0).width;
        $( ".papis-pdf" ).scrollLeft( $( ".papis-pdf" ).scrollLeft() - w );
        break;
      case "right":
        var w = $(".score").first().get(0).width;
        $( ".papis-pdf" ).scrollLeft( $( ".papis-pdf" ).scrollLeft() + w );
        break;
    }
  }
}


}




</script>

<style scoped>
  div.papis-pdf{
    background-color: #171A1C;
    height:100%;
    width:90%;
    white-space: nowrap; /*Prevents Wrapping*/
    overflow-x: scroll;
    overflow-y: hidden;

  }
  div.papis-pdf > img{
    zoom: 1;  //increase if you have very small images
    display: block;
    margin: auto;
    height: 100%;
    margin-left:10px;


  }


</style>