<template>
<div id="app">
  <NavBar/>
  <Content/>

</div>
</template>

<script>
import NavBar from './components/NavBar'
import Content from './components/Content'

export default {
  name: 'App',
  components: {
    NavBar,
    Content
  }
}
</script>

<style>

</style>
