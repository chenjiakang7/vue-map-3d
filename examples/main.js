import 'babel-polyfill';
import 'url-search-params-polyfill';
import Vue from 'vue';
import App from '@/App.vue';
//import router from '@/router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import '@/styles/common.css';


import VueMap3d from 'packages/index';//私有库组件导入测试
Vue.use(VueMap3d);
Vue.use(VueAxios, axios);

// 设定AJAX请求头
Vue.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/*axios.interceptors.request.use((config) = > {// 请求拦截器

 return config;

 })*/
window.$bus = new Vue();
Vue.axios.interceptors.response.use((response) => {

  const r = response;

  return r;

}, (error) => {

  Promise.reject(error);

});

// 获取应用信息
new Vue({ el: '#main', /*router,*/ render: x => x(App) });

