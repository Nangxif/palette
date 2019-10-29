import Palette from "./src/main.vue";

Palette.install = function(Vue) {
  Vue.compoent(Palette.name, Palette);
};

export default Palette;
