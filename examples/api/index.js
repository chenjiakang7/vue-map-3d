/**
 * 将api文件夹下的所有js文件里面的请求集合到modules导出
 */
const files = require.context('.', true, /\.js$/);
let modules = {};

files.keys().forEach((key) => {

  if (key === './main.js') return

  const t = files(key);
  Object.keys(t).forEach(x => {

    modules[x] = t[x];

  });

});

export default modules;
