import VueMap3d from './vue-map-3d/index.vue';
// 为组件提供 install 安装方法，供按需引入
VueMap3d.install = function (Vue) {

  Vue.component(VueMap3d.name, VueMap3d);

};
export default VueMap3d;
