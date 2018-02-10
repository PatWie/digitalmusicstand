<template>
  <div class="papis-content">
    <LeftMenu/>
    <PapersList/>
    <PaperDetail/>
    <PaperRead/>
  </div>
</template>

<script>

import LeftMenu from './LeftMenu'
import PapersList from './PapersList'
import PaperDetail from './PaperDetail'
import PaperRead from './PaperRead'


export default {
  name: 'Content',
  components: {
    LeftMenu,
    PapersList,
    PaperDetail,
    PaperRead
  }
}
</script>
