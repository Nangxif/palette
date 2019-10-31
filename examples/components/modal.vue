<template>
  <div class="modal">
    <div class="modal_wrapper"></div>
  </div>
</template>
<script>
export default {
  name: "modal",
  data() {
    return {};
  }
};
</script>
<style scoped>
.modal {
  margin: auto;
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  z-index: 99;
}
.modal_wrapper {
  margin: auto;
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  width: 200px;
  height: 150px;
  z-index: 100;
}
</style>
