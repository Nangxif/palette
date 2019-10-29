import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import palette from "../packages/index";
Vue.use(palette);

new Vue({
  render: h => h(App)
}).$mount("#app");
