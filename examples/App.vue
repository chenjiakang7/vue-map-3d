<template>
  <div class="container-fluid">
    <VueMap3d
      :width="420"
      :height="500"
      :options="mapOptions"></VueMap3d>
  </div>
</template>

<script>
import mapData from './mapData.json';
import mapDataOut from './mapDataOut.json';
export default {
  data(){

    return {
      mapOptions: {}
    }

  },
  mounted() {

    this.mapOptions = {
      baseConfig: {
        map: mapData,
        mapOutline: mapDataOut,
        rotateAnimation: {
          on: false
        }
      },
      linesConfig: {
        show: true,
        type: 'dash',//dash solid
        color: '#F4E925',
        symbolColor: '#F4E925',
        symbolSize: 1,
        height: 300,//飞线最高点高度
        symbolDefine(THREE){//自定义沿飞线运动的symbol实体，新手可查阅three.js相关手册

          return new THREE.Mesh(new THREE.SphereGeometry(10, 50, 50), new THREE.MeshBasicMaterial({
            color: '#F4E925'
          }));

        }
      },
      eventHooks: [{
        type: 'click',
        active: true,
        select: true,
        handle(data){

          console.log(data);

        },
        cancelHandle(){

          console.log(999)

        }
      }, {
        type: 'mousemove',
        active: true
      }],
      labelStyle: {
        animation: true
      },
      series: [{
        type: 'item-data',
        data: [{
          name: '合肥市',
          code: '340100',
          itemStyle: {//地图基本配置
            normal: {
              color: 'green',
              opacity: 1,
              borderColor: '#00DFFF'
            }
          },
          data: {
            a: 1,
            b: 2
          }
        }]
      }, {
        type: 'line-data',
        data: [['合肥市', '六安市'], [[117.283042, 31.86119], [116.2, 33.3]], ['合肥市', '宣城市']]//支持中文名和准确坐标两种方式
      }]
    };

  },
  methods: {}
};

</script>

<style lang="scss">
  html{
    background: #01175A;
  }
  .container-fluid {
    margin-top: 100px;
    width: 100%;
    height: 100%;
  }
  .run-div{
    float: left;
    margin-left: 30px;
  }
</style>
