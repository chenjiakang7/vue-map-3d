//====判断是否需要 安装/更新 Clodop：====
function getLodop(oOBJECT, oEMBED) {
  var strCLodopInstall = "<br><font color='#FF00FF'>CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='./static/CLodop_Setup_for_Win32NT_3.041Extend.zip' target='_self'>执行安装</a>,安装后请刷新页面。</font>";
  var strCLodopUpdate = "<br><font color='#FF00FF'>CLodop云打印服务需升级!点击这里<a href='./static/CLodop_Setup_for_Win32NT_3.041Extend.zip' target='_self'>执行升级</a>,升级后请刷新页面。</font>";
  var strCLodopInstall64 = "<br><font color='#FF00FF'>CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='./static/CLodop_Setup_for_Win64NT_3.037Extend.zip' target='_self'>执行安装</a>,安装后请刷新页面。</font>";
  var strCLodopUpdate64 = "<br><font color='#FF00FF'>CLodop云打印服务需升级!点击这里<a href='./static/CLodop_Setup_for_Win64NT_3.037Extend.zip' target='_self'>执行升级</a>,升级后请刷新页面。</font>";
  var LODOP;
  var popStr;

  try {

    try { LODOP = getCLodop(); } catch (err) {
      alert(`${err}，请安装/重启 C-Lodop，刷新后重试`);
    };
    if (!LODOP && document.readyState !== "complete") { alert("C-Lodop没准备好，请稍后再试！"); return; };
    if (LODOP) {

      if (CLODOP.CVERSION < "3.0.2.9") {
        popStr = navigator.userAgent.indexOf('x64') >= 0 ? strCLodopUpdate64 : strCLodopUpdate;
        document.body.innerHTML = popStr + document.body.innerHTML;
      };
      if (oEMBED && oEMBED.parentNode) oEMBED.parentNode.removeChild(oEMBED);
      if (oOBJECT && oOBJECT.parentNode) oOBJECT.parentNode.removeChild(oOBJECT);

      if (LODOP.VERSION < "6.2.2.1") {
        popStr = navigator.userAgent.indexOf('x64') >= 0 ? strCLodopInstall64 : strCLodopInstall;
        document.body.innerHTML = popStr + document.body.innerHTML;
        return LODOP;
      };
      //===如下空白位置适合调用统一功能(如注册语句、语言选择等):===
      LODOP.SET_LICENSES("", "13528A153BAEE3A0254B9507DCDE2839", "", "");
      //===========================================================
      return LODOP;

    } else {

      popStr = navigator.userAgent.indexOf('x64') >= 0 ? strCLodopInstall64 : strCLodopInstall;
      document.body.innerHTML = popStr + document.body.innerHTML;

    }


  } catch (err) { alert("getLodop出错:" + err); };
};

var strStyleCSS = '<link href="./static/iframe.css" type="text/css" rel="stylesheet">';
var strFormHtml = '<head>' + strStyleCSS + '</head><body>' + document.getElementById('preReport').innerHTML + "</body>";
LODOP = getLodop();
LODOP.PRINT_INIT('打印任务名');
LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', strFormHtml);
LODOP.PREVIEW();
