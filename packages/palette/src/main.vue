<template>
  <div class="palette">
    <p class="palette_tip">
      Nangxi's drawing board<button
        type="button"
        class="tip_btn"
        @click="showBar"
      >
        编辑面板
      </button>
    </p>
    <div
      class="palette_wrapper"
      ref="palette_wrapper"
      :style="
        `width:${canvasStyles.width}px;height:${canvasStyles.height}px;border:${canvasStyles.borderStyle} ${canvasStyles.borderWidth}px ${canvasStyles.borderColor};`
      "
    >
      <div
        class="eraser"
        @touchstart.stop="eraserStart"
        @touchmove.stop
        @touchend.stop="eraserEnd"
        @mousedown.stop="eraserStart"
        @mousemove.stop
        @mouseup.stop="eraserEnd"
        ref="eraser"
        v-if="isEraser"
        :style="
          `width:${eraserOptions.size}px;height:${
            eraserOptions.size
          }px;background-color:${eraserOptions.backgroundColor};${
            eraserOptions.isRect ? '' : 'border-radius:50%;'
          }`
        "
      ></div>
      <canvas
        ref="palette"
        :width="canvasStyles.width - 2 * canvasStyles.borderWidth"
        :height="canvasStyles.height - 2 * canvasStyles.borderWidth"
      ></canvas>
    </div>
    <!-- 历史记录 -->
    <div class="historyBar" ref="historyBar">
      <div class="historyBar_close" @click="showHistory">&times;</div>
      <p class="historyBar_title">所有操作记录</p>
      <div class="history_item" v-for="(item, index) in history" :key="index">
        {{ item.time }}{{ item.text }}
      </div>
    </div>
    <!-- 编辑画板 -->
    <div class="showBar" ref="showBar">
      <div class="showBar_close" @click="showBar">&times;</div>
      <p class="showBar_title">当前画笔状态：{{ currentStatus }}</p>
      <div class="showBar_wrapper scrollable">
        <div class="showBar_item">
          <button type="button" @click="prevPaint">
            回撤
          </button>
          <button type="button" @click="nextPaint">
            前进
          </button>
          <span style="font-size:14px;" @click="showHistory"
            >共有{{ history.length }}条记录，当前第{{
              currectHistory + 1
            }}条<span style="color:#fed640;">>></span></span
          >
        </div>
        <div v-if="showbarOption.clearBtn" class="showBar_item">
          <button type="button" @click="clearPalette">
            清除
          </button>
          <span>当前清理次数{{ clearTimes }}</span>
        </div>
        <div class="showBar_item">
          <button type="button" @click="paintRandom">
            普通画笔
          </button>
        </div>
        <div v-if="showbarOption.lineBtn" class="showBar_item">
          <button type="button" @click="paintLine">
            直线画笔
          </button>
        </div>
        <div
          class="showBar_item"
          v-if="showbarOption.hollowIrregularPolygonBtn"
        >
          <button type="button" @click="paintIrregularPolygon('Hollow')">
            空心不规则多边形画笔
          </button>
        </div>
        <div class="showBar_item" v-if="showbarOption.solidIrregularPolygonBtn">
          <button type="button" @click="paintIrregularPolygon('Solid')">
            实心不规则多边形画笔
          </button>
        </div>
        <div class="showBar_item" v-if="showbarOption.paintCircleBtn">
          <button type="button" @click="paintCircle">
            圆形画笔
          </button>
        </div>
        <div class="showBar_item" v-if="showbarOption.paintRectangleBtn">
          <button type="button" @click="paintRectangle">
            矩形画笔
          </button>
        </div>
        <div class="showBar_item" v-if="showbarOption.paintTextBtn">
          <button type="button" @click="paintText">
            插入文字
          </button>
        </div>
        <div class="showBar_item" v-if="showbarOption.eraserBtn">
          <button type="button" @click="showEraser">
            橡皮擦
          </button>
        </div>
        <div v-if="showbarOption.saveBtn.isShow" class="showBar_item">
          <button
            type="button"
            @click="savePalette(showbarOption.saveBtn.imageType)"
            v-if="showbarOption.saveBtn.isShow"
          >
            生成图片
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const transformKey =
  document.body.style.transform === undefined
    ? "-webkit-transform"
    : "transform";
const documentWidth = document.body.offsetWidth - 20;
const documentHeight = document.body.offsetHeight - 75;
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
          saveBtn: {
            isShow: true,
            imageType: "png"
          },
          lineBtn: true,
          hollowIrregularPolygonBtn: true,
          solidIrregularPolygonBtn: true,
          paintCircleBtn: true,
          paintRectangleBtn: true,
          paintTextBtn: true,
          eraserBtn: true
        };
      }
    },
    // canvas样式
    canvasStyle: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 全局默认颜色
    defaultColor: {
      type: String,
      default: "black"
    },
    // 全局默认线条宽度
    defaultLineWidth: {
      type: Number,
      default: 2
    },
    // 橡皮擦样式
    eraserOption: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      canvasStyles: {
        width: documentWidth,
        height: documentHeight,
        backgroundColor: "white",
        borderStyle: "solid",
        borderColor: "#fed640",
        borderWidth: 5
      },
      cans: null,
      ctx: null,
      currentStatus: "普通画笔",
      touchType: "Random",
      startNew: null, //当前点击的点
      startOld: [], //存放之前点过的历史点
      move: {}, //移动的点
      circle: null,
      rectangle: null,
      text: null,
      isTextEdit: false, //是否进入字体编辑状态
      isEraser: false,
      eraserOptions: {
        size: 20,
        backgroundColor: "black",
        isRect: false
      },
      isHistory: false, //是否显示历史记录
      history: [], //存放历史操作数组
      historyTextArr: [
        { operation: "Random", text: "画了一条不规则线" },
        { operation: "PaintCircle", text: "画了一个圆" },
        { operation: "PaintRectangle", text: "画了一个矩形" },
        { operation: "PaintText", text: "插入文本" }
      ],
      currectHistory: -1, //当前所在历史位置
      isShowBar: false,
      clearTimes: 0,
      lastBase64: ""
    };
  },
  mounted() {
    Object.assign(this.canvasStyles, this.canvasStyle);
    Object.assign(this.eraserOptions, this.eraserOption);
    this.init();
  },
  methods: {
    // 手绘
    startPoint(e) {
      const event = e || window.event;
      this.startNew = {
        x: event.clientX
          ? event.clientX - this.$refs.palette.getBoundingClientRect().left
          : event.targetTouches[0].clientX -
            this.$refs.palette.getBoundingClientRect().left,
        y: event.clientY
          ? event.clientY - this.$refs.palette.getBoundingClientRect().top
          : event.targetTouches[0].clientY -
            this.$refs.palette.getBoundingClientRect().top,
        isPaint: false
      };
      this.startOld.push(this.startNew);

      // 如果在触摸或者鼠标按下的时候是随机线的状态
      if (this.touchType == "Random") {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.defaultLineWidth;
        this.ctx.moveTo(this.startNew.x, this.startNew.y);
      }
      // 如果在触摸或者鼠标按下的时候是画圆的状态
      if (this.touchType == "PaintCircle") {
        this.circle = document.createElement("div");
        this.circle.className = "circle";
        this.circle.style[
          transformKey
        ] = `translate3d(${this.startNew.x}px,${this.startNew.y}px,0)`;
        this.$refs.palette_wrapper.appendChild(this.circle);
      }
      // 如果在触摸或者鼠标按下的时候是画矩形的状态
      if (this.touchType == "PaintRectangle") {
        this.rectangle = document.createElement("div");
        this.rectangle.className = "rectangle";
        this.rectangle.style[
          transformKey
        ] = `translate3d(${this.startNew.x}px,${this.startNew.y}px,0)`;
        this.$refs.palette_wrapper.appendChild(this.rectangle);
      }

      if (this.touchType == "PaintText") {
        this.isTextEdit = true;
        this.text = document.createElement("div");
        this.text.className = "text";
        this.text.setAttribute("contenteditable", "true");
        this.text.style[
          transformKey
        ] = `translate3d(${this.startNew.x}px,${this.startNew.y}px,0)`;
        this.$refs.palette_wrapper.appendChild(this.text);
        this.$refs.palette_wrapper.removeEventListener(
          "touchstart",
          this.startPoint,
          false
        );
        this.$refs.palette_wrapper.removeEventListener(
          "mousedown",
          this.startPoint,
          false
        );
      }

      this.$refs.palette_wrapper.addEventListener(
        "touchmove",
        this.movePoint,
        false
      );
      this.$refs.palette_wrapper.addEventListener(
        "mousemove",
        this.movePoint,
        false
      );
    },
    movePoint(e) {
      const event = e || window.event;
      // this.startNew = null;
      this.move = {
        x: event.clientX
          ? event.clientX - this.$refs.palette.getBoundingClientRect().left
          : event.targetTouches[0].clientX -
            this.$refs.palette.getBoundingClientRect().left,
        y: event.clientY
          ? event.clientY - this.$refs.palette.getBoundingClientRect().top
          : event.targetTouches[0].clientY -
            this.$refs.palette.getBoundingClientRect().top
      };
      // 如果鼠标按下或者触摸事件被触发，那么isPaint就不能为false，因为这个点不可能成为不规则折线的折点了
      // 这一块，谷歌浏览器的mousedown和mousemove一起执行了，很奇怪，所以通过判断mousedown和mousemove的位置是否相同来判断是否真正触发mousemove
      if (this.startNew.x != this.move.x || this.startNew.y != this.move.y) {
        this.startOld[this.startOld.length - 1].isPaint = true;
      }
      if (this.touchType == "Random") {
        this.ctx.lineWidth = this.defaultLineWidth;
        this.ctx.fillStyle = this.defaultColor;
        this.ctx.lineTo(this.move.x, this.move.y);
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

      // 正方形的拖动分四个角的拖动
      if (this.touchType == "PaintRectangle") {
        this.rectangle.style.width = `${Math.abs(
          this.startNew.x - this.move.x
        )}px`;
        this.rectangle.style.height = `${Math.abs(
          this.startNew.y - this.move.y
        )}px`;
        if (this.startNew.x - this.move.x <= 0) {
          if (this.startNew.y - this.move.y > 0) {
            this.rectangle.style[
              transformKey
            ] = `translate3d(${this.startNew.x}px,${this.move.y}px,0)`;
            this.rectangle.dataset.x = this.startNew.x;
            this.rectangle.dataset.y = this.move.y;
          } else {
            this.rectangle.dataset.x = this.startNew.x;
            this.rectangle.dataset.y = this.startNew.y;
          }
        } else {
          if (this.startNew.y - this.move.y > 0) {
            this.rectangle.style[
              transformKey
            ] = `translate3d(${this.move.x}px,${this.move.y}px,0)`;
            this.rectangle.dataset.x = this.move.x;
            this.rectangle.dataset.y = this.move.y;
          } else {
            this.rectangle.style[
              transformKey
            ] = `translate3d(${this.move.x}px,${this.startNew.y}px,0)`;
            this.rectangle.dataset.x = this.move.x;
            this.rectangle.dataset.y = this.startNew.y;
          }
        }
      }

      if (this.touchType == "PaintText") {
        this.text.style.width = `${Math.abs(this.startNew.x - this.move.x)}px`;
        this.text.style.height = `${Math.abs(this.startNew.y - this.move.y)}px`;
      }
    },
    endPoint() {
      if (this.touchType == "Random") {
        if (this.startNew) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.defaultColor;

          this.ctx.arc(
            this.startNew.x,
            this.startNew.y,
            this.defaultLineWidth / 2,
            0,
            360,
            false
          );
          this.ctx.fillStyle = this.defaultColor;
          this.ctx.fill();
        }
      }
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
          this.rectangle.dataset.x,
          this.rectangle.dataset.y,
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
      this.$refs.palette_wrapper.removeEventListener(
        "mousemove",
        this.movePoint,
        false
      );

      this.currectHistory++;
      let t = new Date();
      if (this.currectHistory == this.history.length) {
        this.history.push({
          time: `${t.getHours() < 10 ? "0" + t.getHours() : t.getHours()}:${
            t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes()
          }:${t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds()}`,
          text: this.historyTextArr.find(item => {
            return item.operation == this.touchType;
          }).text,
          data: this.ctx.getImageData(
            0,
            0,
            this.canvasStyles.width - 2 * this.canvasStyles.borderWidth,
            this.canvasStyles.height - 2 * this.canvasStyles.borderWidth
          )
        });
      } else {
        // 如果当前所在位置不是最后一条历史记录，而且还重新操作了，那么后面的历史记录要清除
        this.history = this.history.slice(this.currectHistory).push({
          time: `${t.getHours() < 10 ? "0" + t.getHours() : t.getHours()}:${
            t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes()
          }:${t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds()}`,
          text: this.historyTextArr.find(item => {
            return item.operation == this.touchType;
          }).text,
          data: this.ctx.getImageData(
            0,
            0,
            this.canvasStyles.width - 2 * this.canvasStyles.borderWidth,
            this.canvasStyles.height - 2 * this.canvasStyles.borderWidth
          )
        });
      }
    },
    // 画直线
    paintLine() {
      // 这里不能用map，用map过滤出来的数组元素个数还是跟原数组一样，除非在下面有做处理
      let canuse = this.startOld.filter(item => {
        if (!item.isPaint) return item;
      });
      // 如果不满足两个活跃的点
      if (canuse.length < 2) {
        this.$emit("paintLine", "You need at least two active points");
        console.log("You need at least two active points");
        return;
      }
      canuse.forEach((item, index, arr) => {
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
      let canuse = this.startOld.filter(item => {
        if (!item.isPaint) return item;
      });
      // 如果不满足三个活跃的点
      if (canuse.length < 3) {
        this.$emit("paintLine", "You need at least three active points");
        console.log("You need at least three active points");
        return;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(canuse[0].x, canuse[0].y);
      canuse[0].isPaint = true;
      canuse.forEach((item, index, arr) => {
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
    // 随便画
    paintRandom() {
      this.touchType = "Random";
      this.currentStatus = "普通画笔";
    },
    // 画个圆形
    paintCircle() {
      this.touchType = "PaintCircle";
      this.currentStatus = "圆形画笔";
    },
    // 画个矩形
    paintRectangle() {
      this.touchType = "PaintRectangle";
      this.currentStatus = "矩形画笔";
    },
    // 写文字
    paintText() {
      this.touchType = "PaintText";
      this.currentStatus = "文字画笔";
    },
    // 橡皮擦
    showEraser() {
      this.isEraser = !this.isEraser;
    },
    eraserStart() {
      this.ctx.beginPath();
      this.ctx.rect(0, 0, 20, 20);
      this.ctx.closePath();
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fill();
      // 每次打开橡皮擦得回到原处
      this.ctx.lineTo(0, 0);
      this.$refs.eraser.addEventListener("touchmove", this.eraserMove, false);
      this.$refs.eraser.addEventListener("mousemove", this.eraserMove, false);
    },
    eraserMove(e) {
      const event = e || window.event;
      this.move = {
        x: event.clientX
          ? event.clientX - this.$refs.palette.getBoundingClientRect().left
          : event.targetTouches[0].clientX -
            this.$refs.palette.getBoundingClientRect().left,
        y: event.clientY
          ? event.clientY - this.$refs.palette.getBoundingClientRect().top
          : event.targetTouches[0].clientY -
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
        x: event.clientX
          ? event.clientX - this.$refs.palette.getBoundingClientRect().left
          : event.changedTouches[0].clientX -
            this.$refs.palette.getBoundingClientRect().left,
        y: event.clientY
          ? event.clientY - this.$refs.palette.getBoundingClientRect().top
          : event.changedTouches[0].clientY -
            this.$refs.palette.getBoundingClientRect().top
      };
      this.ctx.beginPath();
      this.ctx.rect(this.move.x - 10, this.move.y - 10, 20, 20);
      this.ctx.closePath();
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fill();
      this.$refs.eraser.removeEventListener(
        "touchmove",
        this.eraserMove,
        false
      );
      this.$refs.eraser.removeEventListener(
        "mousemove",
        this.eraserMove,
        false
      );
    },
    // 撤回上一步，前进下一步
    prevPaint() {
      if (this.currectHistory > -1) {
        //历史记录位置不能小于原来起始位
        this.ctx.clearRect(
          0,
          0,
          this.canvasStyles.width - 2 * this.canvasStyles.borderWidth,
          this.canvasStyles.height - 2 * this.canvasStyles.borderWidth
        );
        this.ctx.putImageData(this.history[--this.currectHistory].data, 0, 0);
      } else {
        this.currectHistory = -1;
      }
    },
    nextPaint() {
      if (this.currectHistory < this.history.length - 1) {
        this.ctx.clearRect(
          0,
          0,
          this.canvasStyles.width - 2 * this.canvasStyles.borderWidth,
          this.canvasStyles.height - 2 * this.canvasStyles.borderWidth
        );
        this.ctx.putImageData(this.history[++this.currectHistory].data, 0, 0);
      } else {
        this.currectHistory = this.history.length - 1;
      }
    },
    // 初始化画布
    init() {
      this.cans = this.$refs.palette;
      this.ctx = this.$refs.palette.getContext("2d");
      this.$refs.palette_wrapper.addEventListener(
        "touchstart",
        this.startPoint,
        false
      );
      this.$refs.palette_wrapper.addEventListener(
        "mousedown",
        this.startPoint,
        false
      );
      this.$refs.palette_wrapper.addEventListener(
        "touchend",
        this.endPoint,
        false
      );
      this.$refs.palette_wrapper.addEventListener(
        "mouseup",
        this.endPoint,
        false
      );
    },
    // 清除画布
    clearPalette() {
      this.clearTimes++;
      this.ctx.clearRect(
        0,
        0,
        this.canvasStyles.width - 2 * this.canvasStyles.borderWidth,
        this.canvasStyles.height - 2 * this.canvasStyles.borderWidth
      );
      this.startNew = null;
      this.startOld = [];
      this.history = [];
      this.currectHistory = -1;
    },
    // 将画布转为图片
    savePalette(type = "png") {
      if (type == "png") {
        this.lastBase64 = this.cans.toDataURL("image/png");
      } else if (type == "jpeg") {
        this.lastBase64 = this.cans.toDataURL("image/jpeg", 1);
      }
      this.$emit("savePalette", this.lastBase64);
    },
    // 显示编辑画板
    showBar() {
      if (!this.isShowBar) {
        this.$refs.showBar.style[transformKey] = "translate3d(0,0,0)";
        this.isShowBar = true;
      } else {
        this.$refs.showBar.style[transformKey] = "translate3d(0,110%,0)";
        this.isShowBar = false;
      }
    },
    // 显示历史记录
    showHistory() {
      // 先关闭编辑画板
      this.showBar();
      if (!this.isHistory) {
        this.$refs.historyBar.style[transformKey] = "translate3d(0,0,0)";
        this.isHistory = true;
      } else {
        this.$refs.historyBar.style[transformKey] = "translate3d(100%,0,0)";
        this.isHistory = false;
      }
    }
  }
};
</script>
<style>
* {
  margin: 0px;
}
.palette {
  overflow: hidden;
}
.palette_tip {
  margin: 10px 15px;
  padding: 10px 0px;
  font-size: 24px;
  line-height: 24px;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid #eeeeee;
}
.tip_btn {
  border: none;
  padding: 5px;
  background-color: #fed640;
  border-radius: 20px;
  color: white;
  float: right;
}
.tip_btn:focus {
  outline: none;
}
.palette_wrapper {
  box-sizing: border-box;
  position: relative;
  margin: 0 auto;
  width: 300px;
  height: 150px;
  overflow: hidden;
}
.palette_wrapper .eraser {
  position: absolute;
  left: 0px;
  top: 0px;
  /* width: 20px;
  height: 20px;
  background-color: black; */
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
.palette_wrapper .text {
  box-sizing: border-box;
  position: absolute;
  left: 0px;
  top: 0px;
  border: 1px solid black;
  z-index: 2;
  overflow: hidden;
}
.palette_wrapper canvas {
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 1;
}
.palette .showBar {
  position: fixed;
  left: 0px;
  bottom: 0px;
  width: 100%;
  z-index: 99;
  transform: translate3d(0, 110%, 0);
  background-color: rgba(0, 0, 0, 0.4);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  transition: all 0.5s;
}
.palette .showBar .showBar_close {
  position: absolute;
  right: 0px;
  top: -15px;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 4px solid #fed640;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fed640;
  font-size: 20px;
  line-height: 22px;
  cursor: pointer;
}
.palette .showBar .showBar_title {
  font-size: 18px;
  font-weight: 600;
  padding: 10px 0px;
}
.palette .showBar .showBar_wrapper {
  max-height: 400px;
  overflow: auto;
}
.palette .showBar .showBar_wrapper button {
  border: none;
  padding: 5px 15px;
  background-color: #fed640;
  border-radius: 20px;
  color: white;
  float: left;
  margin-right: 5px;
}
.palette .showBar .showBar_wrapper button:focus {
  outline: none;
}

.palette .showBar .showBar_wrapper span {
  float: right;
  line-height: 28px;
}
.palette .showBar .showBar_wrapper .showBar_item {
  padding: 5px 0px;
  margin: 0px 15px;
  text-align: left;
  overflow: hidden;
  border-bottom: 1px solid #fed640;
}
/* 历史记录 */
.palette .historyBar {
  margin: auto;
  position: fixed;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 99;
  transform: translate3d(100%, 0, 0);
  transition: all 0.5s;
}
.palette .historyBar .historyBar_close {
  position: absolute;
  right: 0px;
  top: 0px;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 4px solid #fed640;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fed640;
  font-size: 20px;
  line-height: 22px;
  cursor: pointer;
}
.palette .historyBar .historyBar_title {
  margin: 15px;
  padding: 10px 5px;
  font-size: 20px;
  font-weight: 600;
  text-align: left;
  color: #fed640;
  border-bottom: 2px solid #fed640;
}
.palette .historyBar .history_item {
  padding: 0px 15px;
  color: #fed640;
  text-align: left;
}
</style>
