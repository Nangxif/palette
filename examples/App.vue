<template>
  <div id="app">
    <palette></palette>
  </div>
</template>

<script>
import preventScroll from "./assets/preventScroll.js";
preventScroll();
export default {
  name: "app"
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  margin: 0px;
  height: 100vh;
}
</style>
