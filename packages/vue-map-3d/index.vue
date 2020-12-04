<template>
  <div>
    <div v-if="showComponent">
      <div
        ref="ifly-3d-map"
        :style="`width:${width}px;height:${height}px;background:${optionsConfig.background};`"
        :class="`ifly-3d-map ${hoverCls}`">
      </div>
    </div>
  </div>
</template>

<script>
//地图下载网址：http://datav.aliyun.com/tools/atlas/#&lat=31.87755764334002&lng=104.23828125&zoom=3
import * as THREE from 'three';
//import transformSVGPath from './transformSVGPath.js'
const originalData = JSON.stringify({
  showComponent: true,
  threeBaseAnimation: null,
  hoverCls: '',
  renderer: null,
  scene: null,
  camera: null,
  activeMesh: null,
  intersectObjects: [],
  eventGroup: [],
  mapGroup: null,
  areaAxis2d: {},
  eventFunction: {
    outClick: null,
    mapClick: null,
    mapMousemove: null
  },
  plateImgs: [],
  animationTimes: 0,
  animationObject: {
    posAnimation: [],
    BottomPlates: [],
    linesGroup: null
  }
});
export default {
  name: 'VueMap3d',
  props: {
    scale: {
      type: Number,
      default: () => 1
    },
    width: {
      type: Number,
      default: () => 900
    },
    height: {
      type: Number,
      default: () => 1200
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data(){

    return {
      ...JSON.parse(originalData),
      initTimer: null,
      firstInit: true
    };

  },
  computed: {
    /*
     * 生成地图相关基础配置
     * */
    mapSeries(){

      const itemData = {};
      let lineData = [];
      this.options.series.map((s) => {

        if (s.type === 'item-data') {

          s.data.map((v) => {

            if (v.code) {

              itemData[v.code] = v;

            } else if (itemData.name) {

              itemData[v.name] = v;

            }

          });

        }
        if (s.type === 'line-data') lineData = s.data;

      });
      return {
        itemData: itemData,
        lineData: lineData
      };

    },
    /*
     * 生成地图相关基础配置
     * */
    mapBaseConfig(){

      let x = 0;
      let y = 0;
      let num = 0;
      let xMin;
      let xMax;
      let yMin;
      let yMax;
      this.optionsConfig.baseConfig.mapOutline.features[0].geometry.coordinates.map((v) => {

        v.map((vSon) => {

          vSon.map((m) => {

            num++;
            x += Number(m[0]);
            y += Number(m[1]);
            if (typeof (xMin) === 'number') {

              if (m[0] < xMin) xMin = m[0];
              if (m[0] > xMax) xMax = m[0];
              if (m[1] < yMin) yMin = m[1];
              if (m[1] > yMax) yMax = m[1];

            } else {

              xMin = m[0];
              xMax = m[0];
              yMin = m[1];
              yMax = m[1];

            }

          });

        });

      });
      const minPoints = this.lonlat2mercator([xMin, yMin]);
      const maxPoints = this.lonlat2mercator([xMax, yMax]);
      const centerPoints = this.lonlat2mercator([Number((x / num).toFixed(7)), Number((y / num).toFixed(7))]);
      const rangeX = maxPoints[0] - minPoints[0];
      const rangeY = maxPoints[1] - minPoints[1];
      const level = 0.9 * this.optionsConfig.baseConfig.scale * (this.width / rangeX < this.height / rangeY ? this.width / rangeX : this.height / rangeY);
      return {
        center: {
          x: centerPoints[0],
          y: centerPoints[1]
        },
        level: level,
        DrawOffsetX: this.width,
        DrawOffsetY: this.height//绘图Y轴偏移量，解决three框架问题，将整体图拉向y轴一个偏移量绘制好然后将group拉回来，不这么操作Y轴负方向的png图片渲染会有黑底
      }

    },
    /*
     * 生成最终绘图的options
     * */
    optionsConfig(){

      return this.mergeObject({
        background: 'none',//绘图区背景色
        baseConfig: {//地图基础配置
          map: {},//地图数据，子级区域轮廓数据(*必要参数)
          mapOutline: {},//地图外轮廓数据(*必要参数)
          rotation: [0, 0, 0],//地图部分旋转参数
          position: [0, 0, this.height / 15],//地图部分位置参数
          scale: 1,//地图部分缩放参数
          thickness: 35,//地图厚度
          rotateAnimation: {//地图旋转动画参数
            on: true,//开启地图自转功能
            speed: 1//自转速度
          },
          labelAnimation: true,//地图标识图标闪烁动画控制
          mapStyle: {//地图样式（注：地图分4层，最上层为子区域层，在options.itemStyle中配置，该处配置外轮廓主图3层样式）
            top: {//顶部薄片层
              color: '#056CE3',
              opacity: 0.3
            },
            center: {//中间厚度层
              color: '#004493',
              opacity: 0.5
            },
            bottom: {//底部薄片层
              color: '#0062DB',
              opacity: 1
            }
          },
          plate: {//底部旋转圆盘控制
            show: true,
            position: [0, 0, -this.height / 2],
            rotation: [0.8 * Math.PI, 0, 0]
          }
        },
        linesConfig: {//飞线配置参数
          show: false,
          type: 'dash',//飞线类型，可选dash（虚线）和solid（实线）
          color: '#F4E925',//飞线颜色
          symbolColor: '#F4E925',//飞线动画实体颜色
          symbolSize: 1,//飞线动画实体尺寸缩放控制
          height: 300,//飞线最高点高度
          /*symbolDefine(THREE){//自定义沿飞线运动的symbol实体，新手可查阅three.js相关手册

            return new THREE.Mesh(new THREE.SphereGeometry(10, 50, 50), new THREE.MeshBasicMaterial({
              color: '#F4E925'
            }));

          }*/
        },
        eventDebounceConfig: {//事件节流函数控制参数
          on: false,//是否开启事件节流函数
          duration: 50//节流时间
        },
        itemStyle: {//地图最上层子区域层样式配置
          normal: {//非激活状态
            color: '#00ccff',
            opacity: 0.2,
            borderColor: '#00DFFF'//轮廓线颜色
          },
          active: {//激活状态
            color: '#91D5FF',
            opacity: 0.3,
            borderColor: '#00DFFF'
          }
        },
        labelStyle: {//地图区域标识样式
          color: '#ffffff',
          fontSize: 14,
          icon: require('./imgs/label-icon.png'),//标识文本下方图标
          iconWidth: 14,//图标尺寸宽
          iconHeight: 14//图标尺寸高
        },
        eventHooks: [{//地图事件监听
          type: 'click',//绑定事件类型
          active: true,//事件是否触发激活状态
          select: true,//事件是否触发区域选中
          /*handle(data){//事件触发回调句柄（data.data: 事件外传数据；data.e：事件详情参数，用于外部根据地图事件添加需要定位的dom元素相关功能）

           console.log(data);

           },
           cancelHandle(){//事件反向取消句柄，用于控制操作地图外让地图取消选中和某些外部handle触发功能

           console.log(999)

           }*/
        }, {
          type: 'mousemove',
          active: true
        }],
        /*series: [{//地图拓展功能
          type: 'item-data',//地图子区域数据绑定，样式自定义控制
          data: [{
            name: '合肥市',//区域名称
            code: '340100',//区域编码（优先使用code匹配item对应项，其次使用name，两者都无法匹配中则不处理）
            itemStyle: {},//覆盖options.itemStyle统一配置
            labelStyle: {},//覆盖options.labelStyle统一配置
            data: {//需要绑定的事件外传数据
              a: 1,
              b: 2
            }
          }]
        }, {
          type: 'line-data',//飞线数据，支持中文地名（请保持中文地名准确）和经纬度两种方式
          data: [['合肥市', '六安市'], [[117.283042, 31.86119], [116.2, 33.3]], ['合肥市', '宣城市']]//支持中文名和准确坐标两种方式
        }]*/
      }, this.options);

    }
  },
  watch: {
    /*
     * 监听基础配置修改，整体组件重载
     * */
    options(){

      this.reLoadComponent();

    }
  },
  mounted(){

    setTimeout(() => {

      if (this.firstInit) this.initMap();

    })

  },
  beforeDestroy(){

    this.removeMapEvent();
    cancelAnimationFrame(this.threeBaseAnimation);

  },
  methods: {
    /*
     * 地图初始化
     * */
    initMap(){

      this.firstInit = false;
      this.$emit('init-map');
      this.scene = new THREE.Scene();//创建3D场景
      this.camera = this.createCamera();//创建相机
      this.renderer = this.setRenderer();//初始化绘图区
      this.$refs['ifly-3d-map'].appendChild(this.renderer.domElement);
      this.setScene();

      setTimeout(() => {

        this.bindEvent();

      });
      this.animationTimes = 0;
      this.animation();
      this.createBottomPlate();//添加底盘

    },
    /*
     * 创建3d场景
     * */
    setScene(){

      //this.scene.add(new THREE.AxisHelper(500));//添加坐标轴
      /*
       * MeshBasicMaterial材质的颜色不受任何光纤影响
       * */
      //this.createDirectionalLight();//添加平行光
      //this.scene.add(new THREE.AmbientLight('#000000'));//添加环境光
      this.createMap();//添加地图

    },
    /*
     * 创建相机
     * */
    createCamera(){

      //const camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);//透视相机

      const camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0.1, 10000);//正交相机
      camera.position.set(0, -300, 500);//坐标轴x,y,z(红色, 绿色, 蓝色)
      //camera.position.set(0, -300, 100);//坐标轴x,y,z(红色, 绿色, 蓝色)
      camera.lookAt(0, 0, 0);
      //this.scene.add(new THREE.CameraHelper(camera));//相机辅助
      return camera;

    },
    /*
     * 设置绘图区
     * */
    setRenderer () {

      const renderer = new THREE.WebGLRenderer({//绘制对象(绘图区)
        //precision: 'lowp',//highp/mediump/lowp
        antialias: true,//抗锯齿
        alpha: true//设置透明第一步
      });
      renderer.setSize(this.width, this.height);//设置画布尺寸

      //renderer.setClearColor('#ffffff');//清屏色

      //renderer.setClearAlpha(0.1);//清屏透明度

      renderer.setPixelRatio(window.devicePixelRatio);//设置设备像素比

      //场景应用阴影
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;//柔化边缘的软阴影映射
      return renderer;

    },
    /*
     * 创建平行光
     * */
    createDirectionalLight(){//MeshBasicMaterial 材质不受光线影响

      const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
      directionalLight.position.set(0, 1, 5);
      directionalLight.castShadow = false;
      directionalLight.target = this.scene;

      const directionalLight1 = new THREE.DirectionalLight('#ffffff', 1);
      directionalLight1.position.set(1, -1, 0);
      directionalLight1.castShadow = false;
      directionalLight1.target = this.scene;


      this.scene.add(directionalLight);
      this.scene.add(directionalLight1);

    },
    /*
     * 创建地图
     * */
    createMap(){

      if (!this.optionsConfig.baseConfig.map.features)return;
      const mapL = this.optionsConfig.baseConfig.map.features.length;
      const mapGroup = new THREE.Group();
      const eventGroup = new THREE.Group();
      const outGroup = new THREE.Group();

      eventGroup.rotation.set(0, 0, 0);
      eventGroup.position.set(this.mapBaseConfig.DrawOffsetX, this.mapBaseConfig.DrawOffsetY, 0);

      outGroup.rotation.set(0, 0, 0);
      outGroup.position.set(this.mapBaseConfig.DrawOffsetX, this.mapBaseConfig.DrawOffsetY, 0);

      mapGroup.rotation.set(this.optionsConfig.baseConfig.rotation[0], this.optionsConfig.baseConfig.rotation[1], this.optionsConfig.baseConfig.rotation[2]);
      mapGroup.position.set(this.optionsConfig.baseConfig.position[0], this.optionsConfig.baseConfig.position[1], this.optionsConfig.baseConfig.position[2]);
      mapGroup.add(eventGroup);
      mapGroup.add(outGroup);
      this.mapGroup = mapGroup;

      for (let i = 0; i < mapL; i++) {

        this.addInnerMesh(this.optionsConfig.baseConfig.map.features[i], eventGroup);
        //this.reDraw();

      }

      setTimeout(() => {

        this.optionsConfig.baseConfig.mapOutline.features.map((feature) => {

          feature.geometry.coordinates.map((m) => {

            m.map((mSon) => {

              if (mSon.length > 3) this.addOutLineMap(mSon, outGroup);

            });

          });

        });

      });
      this.scene.add(mapGroup);
      setTimeout(() => {

        this.createLinesGroup();//创建飞线组

      })

    },
    /*
    * 创建实体轮廓线
    * */
    createMeshOutline(geometry, color){

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({
        color: color
      }));
      edges.matrixAutoUpdate = true; //可以改变位置
      return edges

    },
    /*
     * 添加外轮廓地图
     * */
    addOutLineMap(json, outGroup){

      const outShape = this.jsonToShape(json);

      const shapeSlice = this.boundingShape(outShape, 0.1);
      const outMesh1 = new THREE.Mesh(shapeSlice, new THREE.MeshBasicMaterial({
        color: this.optionsConfig.baseConfig.mapStyle.bottom.color,
        opacity: this.optionsConfig.baseConfig.mapStyle.bottom.opacity,
        transparent: this.optionsConfig.baseConfig.mapStyle.bottom.opacity !== 1
      }));
      outMesh1.receiveShadow = true;//地图承接阴影
      const edges1 = this.createMeshOutline(shapeSlice, this.optionsConfig.itemStyle.normal.borderColor);
      edges1.position.set(-0.1, -0.1, -0.1);
      outGroup.add(edges1);
      outGroup.add(outMesh1);

      const outMesh2 = new THREE.Mesh(this.boundingShape(outShape, this.optionsConfig.baseConfig.thickness - 0.2), new THREE.MeshBasicMaterial({
        color: this.optionsConfig.baseConfig.mapStyle.center.color,
        opacity: this.optionsConfig.baseConfig.mapStyle.center.opacity,
        transparent: this.optionsConfig.baseConfig.mapStyle.center.opacity !== 1
      }));
      outMesh2.position.set(0, 0, 0.1);
      outMesh2.receiveShadow = true;//地图承接阴影
      outGroup.add(outMesh2);

      const outMesh3 = new THREE.Mesh(shapeSlice, new THREE.MeshBasicMaterial({
        color: this.optionsConfig.baseConfig.mapStyle.top.color,
        opacity: this.optionsConfig.baseConfig.mapStyle.top.opacity,
        transparent: this.optionsConfig.baseConfig.mapStyle.top.opacity !== 1
      }));
      outMesh3.receiveShadow = true;//地图承接阴影
      outMesh3.position.set(0, 0, this.optionsConfig.baseConfig.thickness - 0.1);
      const edges3 = this.createMeshOutline(shapeSlice, this.optionsConfig.itemStyle.normal.borderColor);
      edges3.position.set(0, 0, this.optionsConfig.baseConfig.thickness - 0.1);
      outGroup.add(edges3);
      outGroup.add(outMesh3);

      //this.reDraw();

    },
    /*
     * 添加内部片区实体
     * */
    addInnerMesh(sonMapDatas, eventGroup){

      const itemData = this.mapSeries.itemData[sonMapDatas.properties.adcode] || this.mapSeries.itemData[sonMapDatas.properties.name] || {};
      const itemStyle = {
        normal: {
          ...this.optionsConfig.itemStyle.normal,
          ...itemData ? itemData.itemStyle ? itemData.itemStyle.normal ? itemData.itemStyle.normal : {} : {} : {}
        },
        active: {
          ...this.optionsConfig.itemStyle.active,
          ...itemData ? itemData.itemStyle ? itemData.itemStyle.active ? itemData.itemStyle.active : {} : {} : {}
        }
      };
      const materialObj = new THREE.MeshBasicMaterial({
        color: itemStyle.normal.color,
        opacity: itemStyle.normal.opacity,
        transparent: itemStyle.normal.opacity !== 1
      });
      const group = new THREE.Group();
      sonMapDatas.geometry.coordinates.map((v) => {

        if (!v[0] || v[0].length < 3)return;
        const shape = this.jsonToShape(v[0]);
        const shapeSlice = this.boundingShape(shape, 0.1);
        const meshTop = new THREE.Mesh(shapeSlice, materialObj);
        meshTop.name = 'mesh';
        meshTop.receiveShadow = true;//地图承接阴影
        meshTop.position.set(0, 0, this.optionsConfig.baseConfig.thickness);
        this.intersectObjects.push(meshTop);

        const edges = this.createMeshOutline(shapeSlice, itemStyle.normal.borderColor);
        edges.name = 'outline';
        edges.position.set(0, 0, this.optionsConfig.baseConfig.thickness);

        group.add(edges);
        group.add(meshTop);

      });
      this.areaAxis2d[sonMapDatas.properties.name] = sonMapDatas.properties.centroid;
      this.addPositonLabel(group, sonMapDatas.properties, {
        ...this.optionsConfig.labelStyle,
        ...itemData ? itemData.labelStyle ? itemData.labelStyle : {} : {}
      });

      group.bindDatas = {
        ...sonMapDatas,
        ...itemData,
        itemStyle: itemStyle
      };
      eventGroup.add(group);
      this.eventGroup.push(group);

    },
    /*
     * 添加片区坐标标识
     * */
    addPositonLabel(group, properties, labelStyle){

      if (!properties.centroid)return;

      const posGroup = new THREE.Group();
      const labelIcon = this.createLabelIcon(labelStyle);

      this.animationObject.posAnimation.push(posGroup);
      posGroup.add(labelIcon);
      posGroup.add(this.createFont(properties.name, labelStyle));

      const centerPoint = this.lonlat2mercator(properties.centroid);
      posGroup.rotation.set(0, 0, -this.optionsConfig.baseConfig.rotation[2]);
      const x = (centerPoint[0] - this.mapBaseConfig.center.x) * this.mapBaseConfig.level - this.mapBaseConfig.DrawOffsetX;
      const y = (centerPoint[1] - this.mapBaseConfig.center.y) * this.mapBaseConfig.level - this.mapBaseConfig.DrawOffsetY;
      posGroup.position.set(x, y, this.optionsConfig.baseConfig.thickness + 1);//负数轮廓绘制shape的相对z值相反

      group.add(posGroup);

    },
    /*
     * 创建标识坐标icon
     * */
    createLabelIcon(labelStyle){

      const geometry = new THREE.PlaneGeometry(labelStyle.iconWidth, labelStyle.iconHeight);
      const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(labelStyle.icon),
        transparent: true,
        depthTest: true,//false后被挡住的纹理png不会变黑背景
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(geometry, material);

    },
    /*
     * 创建canvas文字
     * */
    createFont(text, labelStyle) {

      const size = labelStyle.fontSize;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const fontW = size * text.length;
      const ctxScale = 2;
      canvas.width = ctxScale * fontW;
      canvas.height = ctxScale * size + 10;
      ctx.fillStyle = labelStyle.color;
      ctx.textBaseline = 'top';
      ctx.font = `normal normal normal ${ctxScale * size}px Microsoft YaHei`;
      ctx.fillText(text, 0, 10);

      const geometry = new THREE.PlaneGeometry(canvas.width / ctxScale, canvas.height / ctxScale);
      const textLabel = new THREE.Texture(canvas);//加载canvas贴图

      textLabel.needsUpdate = true;//加载canvas贴图后处理为纹理(贴图);

      const material = new THREE.MeshBasicMaterial({
        map: textLabel,
        transparent: true,
        depthTest: true//false后被挡住的纹理png不会变黑背景
      });
      const sign = new THREE.Mesh(geometry, material);
      sign.position.set(0, (canvas.height - 8) / ctxScale, 0);
      return sign;

    },
    /*
     * 创建底部旋转动画底盘
     * */
    createBottomPlate(){

      if (!this.optionsConfig.baseConfig.plate.show)return;
      setTimeout(() => {

        if (!this.plateImgs.length) {

          this.plateImgs = (function () {//不同帧的图片快照数组

            const imgArr = [];
            for (let i = 0; i < 5; i++) {

              imgArr.push(new THREE.TextureLoader().load(require(`./imgs/plate/plate${i}.png`)));//引入纹理图片

            }
            return imgArr;

          })();

          const plateScale = this.width / 850;
          this.plateImgs.map((plateImg, i) => {

            let width = 284 * plateScale;
            let height = 284 * plateScale;

            switch (i) {

              case 0:
                width = 284 * plateScale;
                height = 284 * plateScale;
                break;
              case 1:
                width = 470 * plateScale;
                height = 470 * plateScale;
                break;
              case 2:
                width = 545 * plateScale;
                height = 545 * plateScale;
                break;
              case 3:
                width = 580 * plateScale;
                height = 580 * plateScale;
                break;
              case 4:
                width = 560 * plateScale;
                height = 560 * plateScale;
                break;

            }
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
              map: plateImg,
              transparent: true,
              side: THREE.DoubleSide
            });

            const plate = new THREE.Mesh(geometry, material);
            plate.position.set(this.optionsConfig.baseConfig.plate.position[0], this.optionsConfig.baseConfig.plate.position[1], this.optionsConfig.baseConfig.plate.position[2] - 30 * i);
            plate.rotation.set(this.optionsConfig.baseConfig.plate.rotation[0], this.optionsConfig.baseConfig.plate.rotation[1], this.optionsConfig.baseConfig.plate.rotation[2]);
            this.animationObject.BottomPlates.push({
              plate: plate,
              w: width,
              h: height
            });
            this.scene.add(plate);

          });

        }

      }, 300);

    },
    /*
     * 添加3d飞线组
     * */
    createLinesGroup(){

      if (!this.mapGroup || !this.optionsConfig.linesConfig.show || !this.mapSeries.lineData.length)return;
      if (!this.animationObject.linesGroup) {//不存在才新建，节省性能

        this.animationObject.linesGroup = new THREE.Group();
        this.animationObject.linesGroup.position.set(0, 0, this.optionsConfig.baseConfig.thickness);
        this.mapGroup.add(this.animationObject.linesGroup);

      }

      this.mapSeries.lineData.map((v, i) => {

        if (typeof (v[0]) === 'string') v[0] = this.areaAxis2d[v[0]] ? [...this.areaAxis2d[v[0]]] : null;
        if (typeof (v[1]) === 'string') v[1] = this.areaAxis2d[v[1]] ? [...this.areaAxis2d[v[1]]] : null;
        if (v[0] && v[1]) {

          this.createALine(this.lonlat2mercator(v[0]), this.lonlat2mercator(v[1]), i);

        }

      });
      const oldL = this.animationObject.linesGroup.children.length;
      const newL = this.mapSeries.lineData.length;
      if (oldL > newL) {//createALine内部不创建多余线条，若需要线条数大于已有，createALine创建完成后，消除多余线条

        for (let i = newL - 1; i < oldL; i++) {

          this.animationObject.linesGroup.remove(this.animationObject.linesGroup.children[i]);

        }

      }

    },
    /*
     * 添加一个飞线
     * */
    createALine(point1, point2, i){

      point1[0] = (point1[0] - this.mapBaseConfig.center.x) * this.mapBaseConfig.level;
      point1[1] = (point1[1] - this.mapBaseConfig.center.y) * this.mapBaseConfig.level;
      point2[0] = (point2[0] - this.mapBaseConfig.center.x) * this.mapBaseConfig.level;
      point2[1] = (point2[1] - this.mapBaseConfig.center.y) * this.mapBaseConfig.level;

      const cneterX = (point2[0] + point1[0]) / 2;
      const cneterY = (point2[1] + point1[1]) / 2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(point1[0], point1[1], 0),
        new THREE.Vector3(cneterX, cneterY, (cneterX === point1[0] && cneterY === point1[1]) ? 0 : this.optionsConfig.linesConfig.height),
        new THREE.Vector3(point2[0], point2[1], 0),
      ]);

      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      if (this.animationObject.linesGroup.children[i]) {//如果有现成line,避免重新创建影响性能

        this.animationObject.linesGroup.children[i].geometry = geometry;

      } else {

        let material;
        switch (this.optionsConfig.linesConfig.type) {

          case 'solid':
            material = new THREE.LineDashedMaterial({//实线
              color: this.optionsConfig.linesConfig.color
            });
            break;
          case 'dash':
            material = new THREE.LineDashedMaterial({//虚线
              color: this.optionsConfig.linesConfig.color,
              dashSize: 0.5,
              gapSize: 0.5,
              scale: 0.1
            });
            break;

        }

        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();//虚线必须调用该方法才有效

        const animateMesh = this.optionsConfig.linesConfig.symbolDefine ? this.optionsConfig.linesConfig.symbolDefine(THREE) : new THREE.Mesh(new THREE.SphereGeometry(Math.round(10 * this.optionsConfig.linesConfig.symbolSize), Math.round(50 * this.optionsConfig.linesConfig.symbolSize), Math.round(50 * this.optionsConfig.linesConfig.symbolSize)), new THREE.MeshBasicMaterial({ color: this.optionsConfig.linesConfig.symbolColor }));

        const point = geometry.attributes.position.array[geometry.attributes.position.array.length - 1];
        animateMesh.position.set(point[0], point[1], point[2]);
        line.add(animateMesh);
        this.animationObject.linesGroup.add(line);

      }

    },
    /*
     * 重载组件
     * */
    reLoadComponent(){

      if (this.firstInit)return;
      if (this.initTimer) {

        clearTimeout(this.initTimer);
        this.initTimer = setTimeout(() => {

          this.reComponentData(() => {

            this.initMap();

          });
          this.initTimer = null;

        }, 500);

      } else {

        this.reComponentData(() => {

          this.initMap();

        });

      }

    },
    /*
     * 重置组件数据
     * */
    reComponentData(callback){

      const data = JSON.parse(originalData);
      cancelAnimationFrame(this.threeBaseAnimation);
      this.$refs['ifly-3d-map'].innerHTML = '';
      this.showComponent = false;
      this.$nextTick(() => {

        for (let key in data) {

          this[key] = data[key];

        }
        this.showComponent = true;
        setTimeout(callback)

      })

    },
    /*
    * 设置区块状态
    * */
    setItemGroupStatus(group, status, callbackMesh, forceUpdate){

      if (!forceUpdate && this.activeMesh === group) status = true;
      if (status) {

        group.children.map((item) => {

          if (item.name === 'outline') {

            item.material.color.set(item.parent.bindDatas.itemStyle.active.borderColor);
            item.position.z = this.optionsConfig.baseConfig.thickness + 0.1;

          } else if (item.name === 'mesh') {

            if (callbackMesh) callbackMesh(item);
            item.material.color.set(item.parent.bindDatas.itemStyle.active.color);
            item.material.opacity = item.parent.bindDatas.itemStyle.active.opacity;

          }

        });

      } else {

        group.children.map((item) => {

          if (item.name === 'outline') {

            item.material.color.set(item.parent.bindDatas.itemStyle.normal.borderColor);
            item.position.z = this.optionsConfig.baseConfig.thickness;

          } else if (item.name === 'mesh') {

            if (callbackMesh) callbackMesh(item);
            item.material.color.set(item.parent.bindDatas.itemStyle.normal.color);
            item.material.opacity = item.parent.bindDatas.itemStyle.normal.opacity;

          }

        });

      }

    },
    /*
     * 执行重绘动画
     * */
    animation(){

      this.renderAnimation();
      this.animationTimes++;
      this.reDraw();
      this.threeBaseAnimation = requestAnimationFrame(this.animation.bind(this));

    },
    /*
     * 创建坐标点闪烁动画
     * */
    createPosAnimation(i){

      this.animationObject.posAnimation.map((v) => {

        v.children[0].material.opacity = 0.9 * Math.abs(Math.cos(i / 25)) + 0.1;

      });

    },
    /*
     * 动画执行状态帧逻辑渲染函数
     * */
    renderAnimation(){

      const i = this.animationTimes;
      if (this.optionsConfig.baseConfig.labelAnimation) this.createPosAnimation(i);//执行闪烁动画

      if (this.optionsConfig.baseConfig.plate.show) this.animationObject.BottomPlates.map((obj, index) => {//地盘旋转动画

        if (i <= 30) obj.plate.geometry = new THREE.PlaneGeometry(obj.w * i / 25, obj.h * i / 25);
        if (index < 2) {

          obj.plate.rotation.z = i / 300;

        } else {

          obj.plate.rotation.z = -i / 300;

        }

      });

      if (this.animationObject.linesGroup) {

        this.animationObject.linesGroup.children.map((line) => {//飞线动画

          const points = line.geometry.attributes.position.array;
          const animateObj = line.children[0];
          const pointsL = points.length / 3;
          const speed = 0.5;
          const index = Math.round((pointsL - 1) - ((i * speed) % (pointsL - 1)));
          animateObj.position.set(points[3 * index], points[3 * index + 1], points[3 * index + 2]);

        });

      }

      if (this.optionsConfig.baseConfig.rotateAnimation.on && this.mapGroup) {//执行整体旋转动画

        const deg = i / 500 * this.optionsConfig.baseConfig.rotateAnimation.speed;
        this.mapGroup.rotation.z = deg;
        this.animationObject.posAnimation.map((v) => {

          v.rotation.z = -deg;

        });

      }

    },
    /*
     * 地图重绘
     * */
    reDraw(){

      if (this.renderer && this.scene && this.camera) {

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);//添加相机和场景

      }

    },
    /*
     * 事件绑定
     * */
    bindEvent(){

      this.removeMapEvent();
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      this.eventFunction = {
        outEvent: (e) => {

          const ev = window.event || e;
          this.optionsConfig.eventHooks.map((v) => {

            if (ev.type === v.type) {

              if (v.cancelHandle) v.cancelHandle();
              if (v.select) this.activeMesh = null;
              if (v.active) {

                this.eventGroup.map((v) => {

                  this.setItemGroupStatus(v, false);

                });

              }

            }

          });

        },
        mapMousemove: event => {

          event.stopPropagation();//防止冒泡
          this.createEvent(raycaster, mouse, event, 'mousemove');

        }
      };
      this.addMapEvent(raycaster, mouse);

    },
    /*
     * 统一生成处理事件模拟方法
     * */
    createEvent(raycaster, mouse, event, type, callback){

      this.debounceEvent(type, () => {

        event.preventDefault();
        //将鼠标点击位置的屏幕坐标转换成threejs中的标准坐标
        mouse.x = ((event.offsetX / this.width) * 2 - 1);
        mouse.y = (-(event.offsetY / this.height) * 2 + 1);

        const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        raycaster.setFromCamera(vector, this.camera);
        const triggerMesh = raycaster.intersectObjects(this.intersectObjects)[0];
        if (triggerMesh) {

          if (callback) callback(type, triggerMesh.object.parent);
          this.hoverCls = 'mouse-hover';

        } else {

          this.hoverCls = '';
          this.optionsConfig.eventDebounceConfig.type = '';
          if (type !== 'mousemove' || this.eventFunction['mousemove']) this.eventFunction.outEvent(event);

        }

      });

    },
    /*
     * 事件节流处理逻辑
     * */
    debounceEvent(type, callback){

      if (!this.optionsConfig.eventDebounceConfig.on) {

        callback();
        return;

      }
      if (this.optionsConfig.eventDebounceConfig.type === type) {

        clearTimeout(this.optionsConfig.eventDebounceConfig.timer);
        this.optionsConfig.eventDebounceConfig.timer = setTimeout(() => {

          callback();

        }, this.optionsConfig.eventDebounceConfig.duration);

      } else {

        this.optionsConfig.eventDebounceConfig.type = type;
        callback();

      }

    },
    /*
     * 添加事件监听
     * */
    addMapEvent(raycaster, mouse){

      this.$refs['ifly-3d-map'].addEventListener('mousemove', this.eventFunction.mapMousemove, false);//默认添加mousemove事件控制鼠标悬浮手势
      this.optionsConfig.eventHooks.map((v) => {

        this.eventFunction[v.type] = event => {

          event.stopPropagation();//防止冒泡
          this.createEvent(raycaster, mouse, event, v.type, (type, mesh) => {

            if (v.select) this.activeMesh = mesh;
            if (v.active) {

              this.eventGroup.map((v) => {//重置eventGroup状态

                this.setItemGroupStatus(v, false);

              });
              this.setItemGroupStatus(mesh, true);//激活当前选中状态

            }
            if (v.handle) v.handle({
              e: event,
              data: {
                code: mesh.bindDatas.properties.adcode,
                name: mesh.bindDatas.properties.name,
                data: mesh.bindDatas.data
              }
            });

          });

        };
        this.$refs['ifly-3d-map'].addEventListener(v.type, this.eventFunction[v.type], false);
        if (v.active) window.addEventListener(v.type, this.eventFunction.outEvent);

      });

    },
    /*
     * 移除事件监听
     * */
    removeMapEvent(){

      if (this.eventFunction.mapMousemove) this.$refs['ifly-3d-map'].removeEventListener('mousemove', this.eventFunction.mapMousemove);
      this.optionsConfig.eventHooks.map((v) => {

        if (this.eventFunction[v.type]) this.$refs['ifly-3d-map'].removeEventListener(v.type, this.eventFunction[v.type]);
        if (v.active && this.eventFunction.outEvent) window.removeEventListener(v.type, this.eventFunction.outEvent);

      });

    },
    /*
     * 将轮廓拉伸成实体
     * */
    boundingShape (shape, thickness) {

      const extrudeSettings = {
        depth: thickness ? thickness : this.optionsConfig.baseConfig.thickness,
        bevelEnabled: false//是否有倒角
      };
      let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      //this.reMapUv(geometry);

      return geometry;

    },
    /*
     * 循环绘制轮廓
     * */
    jsonToShape(json){

      const shape = new THREE.Shape();

      for (let i = 0; i < json.length; i++) {

        let point = this.lonlat2mercator(json[i]);
        if (i === 0) {

          shape.moveTo((point[0] - this.mapBaseConfig.center.x) * this.mapBaseConfig.level - this.mapBaseConfig.DrawOffsetX, (point[1] - this.mapBaseConfig.center.y) * this.mapBaseConfig.level - this.mapBaseConfig.DrawOffsetY);

        } else {

          shape.lineTo((point[0] - this.mapBaseConfig.center.x) * this.mapBaseConfig.level - this.mapBaseConfig.DrawOffsetX, (point[1] - this.mapBaseConfig.center.y) * this.mapBaseConfig.level - this.mapBaseConfig.DrawOffsetY);

        }

      }
      return shape;

    },
    lonlat2mercator(lonlat){//经纬度转墨卡托

      let x = lonlat[0] * 20037508.34 / 180;
      let y = Math.log(Math.tan((90 + lonlat[1]) * Math.PI / 360)) / (Math.PI / 180);
      y = y * 20037508.34 / 180;
      return [x / 100000, y / 100000];

    },
    mercator2lonlat(mercator){//墨卡托转经纬度

      let x = mercator[0] / 20037508.34 * 180;
      let y = mercator[1] / 20037508.34 * 180;
      y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
      return [x * 100000, y * 100000];

    },
    /*createSvgPath (points) {//通过svg路径拉伸实体

     const extrudeSettings = {
     depth: this.optionsConfig.baseConfig.thickness,
     bevelEnabled: false,//是否有倒角
     bevelSegments: 0,
     steps: 2,
     bevelSize: 1,
     bevelThickness: 1
     };
     let squareShape = transformSVGPath(THREE, points);
     let geometry;
     geometry = new THREE.ExtrudeGeometry(squareShape, extrudeSettings);

     geometry.computeBoundingBox();//界面拉伸成几何体
     //this.reMapUv(geometry);

     return geometry;

     },*/
    /*
     * 设置当前对应的地图各片区状态
     * */
    /*
     * 对象深度合并
     * */
    mergeObject(a, b){

      function mergeFn(aObj, bObj) {

        for (let key in bObj) {

          if (bObj[key] !== undefined && bObj[key] !== 'series') {

            if (bObj[key] === undefined || typeof (aObj[key]) !== 'object' || key === 'data' || key === 'map' || key === 'mapOutline' || key === 'eventHooks') {

              aObj[key] = bObj[key];

            } else {

              mergeFn(aObj[key], bObj[key]);

            }

          }

        }

      }

      mergeFn(a, b);
      return a;

    }
  }
}
</script>

<style lang="scss">
  .ifly-3d-map {
    &.mouse-hover {
      cursor: pointer;
    }
  }
</style>
