<template>
  <div class="palette">
    <div class="palette_wrapper" ref="palette_wrapper">
      <div
        class="eraser"
        @touchstart.stop="eraserStart"
        @touchmove.stop
        @touchend.stop="eraserEnd"
        ref="eraser"
        v-if="isEraser"
      ></div>
      <canvas ref="palette"></canvas>
    </div>
    <div v-if="showbarOption">
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
      <button type="button" @click="showEraser">橡皮擦</button>
    </div>
  </div>
</template>
<script>
const transformKey =
  document.body.style.transform === undefined
    ? "-webkit-transform"
    : "transform";
export default {
  name: "palette",
  props: {
    point: {
      type: String,
      default: ""
    },
    showbarOption: {
      type: Object,
      default: () => {
        return {
          clearBtn: true,
          saveBtn: "png",
          lineBtn: true
        };
      }
    },
    fillStyle: {
      type: String,
      default: "red"
    }
  },
  data() {
    return {
      cans: null,
      ctx: null,
      touchType: "Random",
      startNew: null, //当前点击的点
      startOld: [], //存放之前点过的历史点
      move: {}, //移动的点
      circle: null,
      rectangle: null,
      isEraser: false,
      lastBase64: ""
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 手绘
    startPoint(e) {
      const event = e || window.event;

      this.startNew = {
        x:
          event.targetTouches[0].clientX -
          this.$refs.palette.getBoundingClientRect().left,
        y:
          event.targetTouches[0].clientY -
          this.$refs.palette.getBoundingClientRect().top,
        isPaint: false
      };
      this.startOld.push(this.startNew);

      if (this.touchType == "Random") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.fillStyle;

        this.ctx.arc(
          this.startNew.x - 0.5,
          this.startNew.y - 0.5,
          0.5,
          0,
          360,
          false
        );
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(this.startNew.x - 1, this.startNew.y - 1);
      }

      if (this.touchType == "PaintCircle") {
        this.circle = document.createElement("div");
        this.circle.className = "circle";
        this.circle.style[
          transformKey
        ] = `translate3d(${this.startNew.x}px,${this.startNew.y}px,0)`;
        this.$refs.palette_wrapper.appendChild(this.circle);
      }

      if (this.touchType == "PaintRectangle") {
        this.rectangle = document.createElement("div");
        this.rectangle.className = "rectangle";
        this.rectangle.style[
          transformKey
        ] = `translate3d(${this.startNew.x}px,${this.startNew.y}px,0)`;
        this.$refs.palette_wrapper.appendChild(this.rectangle);
      }

      this.$refs.palette_wrapper.addEventListener(
        "touchmove",
        this.movePoint,
        false
      );
    },
    movePoint(e) {
      const event = e || window.event;
      // this.startNew = null;
      this.move = {
        x:
          event.targetTouches[0].clientX -
          this.$refs.palette.getBoundingClientRect().left,
        y:
          event.targetTouches[0].clientY -
          this.$refs.palette.getBoundingClientRect().top
      };
      if (this.touchType == "Random") {
        this.ctx.fillStyle = "red";
        this.ctx.lineTo(this.move.x - 1, this.move.y - 1);
        this.ctx.stroke();
      }
      if (this.touchType == "PaintCircle") {
        let r =
          Math.abs(this.startNew.x - this.move.x) >
          Math.abs(this.startNew.y - this.move.y)
            ? Math.abs(this.startNew.x - this.move.x)
            : Math.abs(this.startNew.y - this.move.y);
        this.circle.style.cssText = `${transformKey}:translate3d(${this.startNew
          .x - r}px,${this.startNew.y - r}px,0);width:${2 * r}px;height:${2 *
          r}px;`;
      }

      if (this.touchType == "PaintRectangle") {
        this.rectangle.style.width = `${Math.abs(
          this.startNew.x - this.move.x
        )}px`;
        this.rectangle.style.height = `${Math.abs(
          this.startNew.y - this.move.y
        )}px`;
      }
    },
    endPoint() {
      if (this.touchType == "PaintCircle") {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.arc(
          this.startNew.x,
          this.startNew.y,
          this.circle.offsetWidth / 2,
          0,
          2 * Math.PI
        );
        this.ctx.stroke();
        this.$refs.palette_wrapper.removeChild(this.circle);
      }
      if (this.touchType == "PaintRectangle") {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.rect(
          this.startNew.x,
          this.startNew.y,
          this.rectangle.offsetWidth,
          this.rectangle.offsetHeight
        );
        this.ctx.stroke();
        this.$refs.palette_wrapper.removeChild(this.rectangle);
      }

      this.startNew = null;
      this.$refs.palette_wrapper.removeEventListener(
        "touchmove",
        this.movePoint,
        false
      );
    },
    // 画直线
    paintLine() {
      let canuse = this.startOld.findIndex(value => {
        return !value.isPaint;
      });
      // 如果不满足两个活跃的点
      if (canuse == -1 || this.startOld.length - 1 - canuse < 1) {
        this.$emit("paintLine", "You need at least two active points");
        console.log("You need at least two active points");
        return;
      }
      let canuseArr = this.startOld.slice(canuse);
      canuseArr.forEach((item, index, arr) => {
        this.ctx.beginPath();
        if (index < arr.length - 1) {
          this.ctx.moveTo(item.x, item.y);
          this.ctx.lineTo(arr[index + 1].x, arr[index + 1].y);
        } else {
          //画完直线清除数组
          this.startOld = [];
        }
        item.isPaint = true;
        this.ctx.stroke();
      });
    },
    // 画闭合多边形
    paintIrregularPolygon(type = "Hollow") {
      let canuse = this.startOld.findIndex(value => {
        return !value.isPaint;
      });
      // 如果不满足三个活跃的点
      let canuseArr = this.startOld.slice(canuse);
      if (canuseArr.length < 3) {
        this.$emit("paintLine", "You need at least three active points");
        console.log("You need at least three active points");
        return;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(canuseArr[0].x, canuseArr[0].y);
      canuseArr[0].isPaint = true;
      canuseArr.forEach((item, index, arr) => {
        if (index !== 0 && index < arr.length) {
          this.ctx.lineTo(item.x, item.y);
        } else {
          //画完直线清除数组
          this.startOld = [];
        }
        item.isPaint = true;
      });
      if (type == "Hollow") {
        // 画空心
        this.ctx.closePath();
        this.ctx.stroke();
      } else {
        // 画实心
        this.ctx.fill();
      }
    },
    // 画个圆形
    paintCircle() {
      this.touchType = "PaintCircle";
    },
    // 画个矩形
    paintRectangle() {
      this.touchType = "PaintRectangle";
    },
    // 橡皮擦
    showEraser() {
      this.isEraser = !this.isEraser;
    },
    eraserStart() {
      //绘制矩形
      this.ctx.beginPath();
      this.ctx.rect(0, 0, 20, 20);
      this.ctx.closePath();
      this.ctx.fillStyle = "white";
      this.ctx.fill();
      // 每次打开橡皮擦得回到原处
      this.ctx.lineTo(0, 0);
      this.$refs.eraser.addEventListener("touchmove", this.eraserMove, false);
    },
    eraserMove(e) {
      const event = e || window.event;
      this.move = {
        x:
          event.targetTouches[0].clientX -
          this.$refs.palette.getBoundingClientRect().left,
        y:
          event.targetTouches[0].clientY -
          this.$refs.palette.getBoundingClientRect().top
      };
      this.ctx.lineWidth = 20;
      this.ctx.strokeStyle = "white";
      this.ctx.lineTo(this.move.x, this.move.y);
      this.ctx.stroke();
      this.$refs.eraser.style[transformKey] = `translate3d(${this.move.x -
        10}px,${this.move.y - 10}px,0)`;
    },
    // 橡皮拿起的时候不仅要禁止touchmove，还要在橡皮的位置画白色区域
    eraserEnd(e) {
      const event = e || window.event;
      this.move = {
        x:
          event.changedTouches[0].clientX -
          this.$refs.palette.getBoundingClientRect().left,
        y:
          event.changedTouches[0].clientY -
          this.$refs.palette.getBoundingClientRect().top
      };
      this.ctx.beginPath();
      this.ctx.rect(this.move.x - 10, this.move.y - 10, 20, 20);
      this.ctx.closePath();
      this.ctx.fillStyle = "white";
      this.ctx.fill();
      this.$refs.eraser.removeEventListener(
        "touchmove",
        this.eraserMove,
        false
      );
    },
    init() {
      this.cans = this.$refs.palette;
      this.ctx = this.$refs.palette.getContext("2d");
      this.$refs.palette_wrapper.addEventListener(
        "touchstart",
        this.startPoint,
        false
      );
      this.$refs.palette_wrapper.addEventListener(
        "touchend",
        this.endPoint,
        false
      );
    },
    // 清除画布
    clearPalette() {
      this.ctx.clearRect(0, 0, 300, 150);
    },
    savePalette(type = "png") {
      if (type == "png") {
        this.lastBase64 = this.cans.toDataURL("image/png");
      } else if (type == "jpeg") {
        this.lastBase64 = this.cans.toDataURL("image/jpeg", 1);
      }
      this.$emit("savePalette", this.lastBase64);
    }
  }
};
</script>
<style>
.palette_wrapper {
  position: relative;
  width: 300px;
  height: 150px;
  overflow: hidden;
}
.palette_wrapper .eraser {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 20px;
  height: 20px;
  background-color: black;
  z-index: 3;
}
.palette_wrapper .circle {
  box-sizing: border-box;
  position: absolute;
  left: 0px;
  top: 0px;
  border-radius: 50%;
  border: 1px solid black;
  z-index: 2;
}
.palette_wrapper .rectangle {
  box-sizing: border-box;
  position: absolute;
  left: 0px;
  top: 0px;
  border: 1px solid black;
  z-index: 2;
}
.palette_wrapper canvas {
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 1;
}
</style>
