<template>
  <div id="app">
    <palette></palette>
    <!-- <div>
      <button type="button" @click="clearPalette" v-if="showbarOption.clearBtn">
        清除
      </button>
      <button
        type="button"
        @click="savePalette(showbarOption.save)"
        v-if="showbarOption.saveBtn"
      >
        生成图片
      </button>
      <button type="button" @click="paintLine" v-if="showbarOption.lineBtn">
        画直线
      </button>
      <button type="button" @click="paintIrregularPolygon('Hollow')">
        画空心不规则多边形
      </button>
      <button type="button" @click="paintIrregularPolygon('Solid')">
        画实心不规则多边形
      </button>
      <button type="button" @click="paintCircle">画圆形</button>
      <button type="button" @click="paintRectangle">画矩形</button>
      <button type="button" @click="paintText">插入文字</button>
      <button type="button" @click="showEraser">橡皮擦</button>
    </div> -->
  </div>
</template>

<script>
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
