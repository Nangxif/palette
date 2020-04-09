<template>
  <div id="app">
    <palette></palette>
  </div>
</template>

<script>
import palette from '../packages/palette/index';
export default {
  name: 'app',
  components: {
    palette
  }
};
</script>

<style lang="scss">
#app {
  position: absolute;
  left: 0px;
  top: 0px;
  margin: 0px;
  width: 100%;
  height: 100vh;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  position: absolute;
  left: 0px;
  top: 0px;
  margin: 0px;
  width: 100%;
  height: 100vh;
}
</style>
