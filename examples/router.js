import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
const router = new Router({
  mode: 'hash',
  routes: [{//父级路由
    path: '/',
    component: async (resolve) => {

      resolve(await import('./views/main.vue'));

    },
    children: [{
      path: '/quality/analysis',
      component: async (resolve) => {

        resolve(await import('./views/children-views/quality/quality-analysis.vue'));

      }
    }, {
      path: '/quality/casedetail',
      component: async (resolve) => {

        resolve(await import('./views/children-views/quality/quality-casedetail.vue'));

      }
    }, {
      path: '/quality/nonstandard',
      component: async (resolve) => {

        resolve(await import('./views/children-views/quality/quality-nonstandard.vue'));

      }
    }, {
      path: '/quality/effective',
      component: async (resolve) => {

        resolve(await import('./views/children-views/quality/quality-effective.vue'));

      }
    }, {
      path: '/quality/running-data',
      component: async (resolve) => {

        resolve(await import('./views/children-views/quality/quality-running-data.vue'));

      }
    }, {
      path: '/status/download',
      component: async (resolve) => {

        resolve(await import('./views/children-views/download-progress.vue'));

      }
    }]
  }]
});

router.beforeEach((to, from, next) => {

  document.title = '大数据分析平台';
  next();

});
export default router;
