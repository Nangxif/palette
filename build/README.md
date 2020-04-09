# palette

一个多功能画板

目前画板拥有的功能：

1.画任意曲线；

2.两点或两点以上连成直线或折线；

3.三点或三点以上形成封闭空心图形和实心图形；

4.画圆形，可以编辑大小和位置；

5.画矩形，可以编辑大小和位置；

6.橡皮擦

7.清除画板

8.历史记录等相关系列功能；

9.生成图片

10.编辑文字功能（开发中）

## 一、使用方法

```javascript
import palette from "@nangxif/palette";
import "@nangxif/palette/dist/css/common.css"

components: {
  palette
}


<palette
  :showbarOption="showbarOption"
  :paletteStyle="paletteStyle"
  :eraserOption="eraserOption"
  @paletteImage="paletteImage"
></palette>
```

## 二、参数解析

| 参数           | 用途               |
| -------------- | ------------------ |
| :showbarOption | 编辑工具栏         |
| :paletteStyle  | 编辑画板初始样式   |
| :eraserOption  | 编辑橡皮擦初始样式 |
| @paletteImage  | 接收生成的图片     |

（一）:showbarOption

| 键                        | 类型    | 默认值                                              | 用途                                                         |
| ------------------------- | ------- | --------------------------------------------------- | ------------------------------------------------------------ |
| clearBtn                  | boolean | true                                                | 是否显示清除按钮                                             |
| saveBtn                   | object  | {<br />  isShow:true;<br />  imageType:'png'<br />} | isShow控制是否显示保存图片按钮，imageType控制最后生成的图片的类型，支持png以及jpg |
| lineBtn                   | boolean | true                                                | 是否显示画直线按钮                                           |
| hollowIrregularPolygonBtn | boolean | true                                                | 是否显示画空心封闭图形按钮                                   |
| solidIrregularPolygonBtn  | boolean | true                                                | 是否显示画实心封闭图形按钮                                   |
| paintCircleBtn            | boolean | true                                                | 是否显示画圆按钮                                             |
| paintRectangleBtn         | boolean | true                                                | 是否显示画矩形按钮                                           |
| eraserBtn                 | boolean | true                                                | 是否显示橡皮擦开关按钮                                       |

（二）:paletteStyle

| 键               | 类型   | 默认值                          | 用途             |
| ---------------- | ------ | ------------------------------- | ---------------- |
| title            | string | Nangxi's drawing board          | 画板标题         |
| width            | number | document.body.clientWidth - 20  | 画板总宽度       |
| height           | number | document.body.clientHeight - 75 | 画板总高度       |
| backgroundColor  | color  | white                           | 画板背景颜色     |
| borderStyle      |        | solid                           | 画板边框样式     |
| borderColor      | color  | \#fed640                        | 画板边框颜色     |
| borderWidth      | number | 5                               | 画板边框宽度     |
| defaultColor     | color  | black                           | 全局默认颜色     |
| defaultLineWidth | number | 2                               | 全局默认线条宽度 |

（三）:eraserOption

| 键              | 类型    | 默认值 | 用途             |
| --------------- | ------- | ------ | ---------------- |
| size            | number  | 20     | 橡皮擦大小       |
| backgroundColor | color   | black  | 橡皮擦颜色       |
| isRect          | boolean | false  | 橡皮擦是否为矩形 |

## 三、效果预览

<img src="https://github.com/Nangxif/palette/blob/master/doc/QQ截图20200409181351.jpg" alt="QQ截图20200409181351" style="zoom:50%;" />

<img src="https://github.com/Nangxif/palette/blob/master/doc/QQ截图20200409181416.jpg" alt="QQ截图20200409181416" style="zoom:50%;" />

<img src="https://github.com/Nangxif/palette/blob/master/doc/QQ截图20200409181432.jpg" alt="QQ截图20200409181432" style="zoom:50%;" />