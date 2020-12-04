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
        popStr = navigator.userAgent.indexOf('x64') >= 0 ? strCLodopUpdate64:strCLodopUpdate;
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

    }else{

      popStr = navigator.userAgent.indexOf('x64') >= 0 ? strCLodopInstall64 : strCLodopInstall;
      document.body.innerHTML = popStr + document.body.innerHTML;

    }


  } catch (err) { alert("getLodop出错:" + err); };
};

//最多每页展示的随访内容数
var mol = 4;

//删除不需要展示的节点
function removeNodes(num, node) {

  var len = node.length;
  var popLastNum = num *mol>len? 0: len - num*mol;
  var popFirstNum = (num - 1) * mol;
  for (let i = popFirstNum-1; i >= 0;i--){

    node[(num - 1) * mol].parentNode.removeChild(node[i]);

  }
  for (let j = 0; j < popLastNum; j++) {

    node[(num - 1) * mol].parentNode.removeChild(node[len-j-1]);

  }

}

//构造打印需要的innerHTML,打印第i页
function createInnerHtml(i) {

  //当打印尾页不足mol列时的补足节点
  const emptyNode = '<ul class="decision-value">\
    <li class="report-theader" >\
      <span>随访内容</span>\
            </li >\
    <li>\
      <span>\
      </span>\
    </li>\
    <li class="odd">\
    </li>\
    <div class="symptom special first inner-value">\
      <li class="none-style">\
        <span>1 无症状</span>\
        <input type="checkbox" value="1" disabled="disabled">\
                </li>\
        <li class="none-style">\
          <span>2 头痛头晕</span>\
          <input type="checkbox" value="2" disabled="disabled">\
                </li>\
          <li class="none-style">\
            <span>3 恶心呕吐</span>\
            <input type="checkbox" value="3" disabled="disabled">\
                </li>\
            <li class="none-style">\
              <span>4 眼花耳鸣</span>\
              <input type="checkbox" value="4" disabled="disabled">\
                </li>\
              <li class="none-style">\
                <span>5 呼吸困难</span>\
                <input type="checkbox" value="5" disabled="disabled">\
                </li>\
                <li class="none-style">\
                  <span>6 心悸胸闷</span>\
                  <input type="checkbox" value="6" disabled="disabled">\
                </li>\
                  <li class="none-style">\
                    <span>7 鼻衄出血不止</span>\
                    <input type="checkbox" value="7" disabled="disabled">\
                </li>\
                    <li class="none-style">\
                      <span>8 四肢发麻</span>\
                      <input type="checkbox" value="8" disabled="disabled">\
                </li>\
                      <li class="none-style">\
                        <span>9 下肢水肿</span>\
                        <input type="checkbox" value="9" disabled="disabled">\
                </li>\
                        <li class="none-style">\
                          <span>10 未识别</span>\
                          <input type="checkbox" value="10" disabled="disabled">\
                </li>\
            </div>\
                        <li class="odd">\
                          <div class="pressure-tab one">\
                            <label>高压：</label>\
                          </div>\
                          <div class="pressure-tab">\
                            <label>低压：</label>\
                          </div>\
                        </li>\
                        <li>\
                        </li>\
                        <li class="odd">\
                        </li>\
                        <li>\
                        </li>\
                        <li class="odd">\
                        </li>\
                        <li>\
                        </li>\
                        <li class="odd">\
                        </li>\
                        <li>次/周 分钟/次</li>\
                        <li class="odd">\
                        </li>\
                        <li>\
                        </li>\
                        <li class="odd">\
                        </li>\
                        <li>\
                          <span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span>\
                        </li>\
                        <li class="odd">\
                        </li>\
                        <li>\
                          <span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span>\
                        </li>\
                        <div class="classification special first odd">\
                        </div>\
                        <li><span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span></li>\
                        <li class="odd">每日次| 每次</li>\
                        <li><span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span></li>\
                        <li class="odd">每日次| 每次</li>\
                        <li><span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span></li>\
                        <li class="odd">每日次| 每次</li>\
                        <li><span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span></li>\
                        <li class="odd">每日次| 每次</li>\
                        <li>\
                          <span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span>\
                        </li>\
                        <li class="odd">\
                          <span class="ellipsis" style="display: block; padding: 0 2px;" title=""></span>\
                        </li>\
                        <li>\
                        </li>\
                        <li class="odd">\
                        </li>\
        </ul>';
  var doc = document.getElementsByTagName('iframe')[0].contentWindow.document.documentElement.querySelector('.portlet-body-containter').cloneNode(true);
  var allData = doc.querySelectorAll('.decision-value');
  removeNodes(i, allData);
  let curNodes = doc.querySelectorAll('.decision-value');
  //当前末尾页不足mol列时，补全。
  if (curNodes.length < mol) {

    const addNum = mol - curNodes.length;
    for (let i = 0; i != addNum; i++) {

      curNodes[curNodes.length - 1].parentNode.insertAdjacentHTML('beforeend', emptyNode);

    }

  }
  const suifangWidth = 130;
  doc.querySelector('.descison-container').style.width = `${suifangWidth*4}px`;
  doc.querySelector('.report-theader').style.width = '73px';
  doc.querySelector('.term-class .report-theader').style.width = '144px';

  Array.prototype.forEach.call(doc.querySelectorAll('.decision-value'), (el) => {

    el.style.width = `${suifangWidth}px`;

  })
  Array.prototype.forEach.call(doc.querySelectorAll('.decision-value>li'), (el) => {

    el.style.padding = '0';
    el.style.width = `${suifangWidth - 1}px`;

  })
  Array.prototype.forEach.call(doc.querySelectorAll('li span'), (el) => {

    el.style.padding = '0';

  })
  Array.prototype.forEach.call(doc.querySelectorAll('li>span>span'), (el) => {

    el.style.display = 'none';

  })
  doc.querySelector('.classification.special.first').style.paddingTop = '0';
  Array.prototype.forEach.call(doc.querySelectorAll('.page-tool'), (el) => {

    el.style.display = 'none';

  })
  Array.prototype.forEach.call(doc.querySelectorAll('input'), (el) => {

    if (el.checked === true) {

      el.setAttribute('checked', 'checked')

    }

  })
  return doc.innerHTML;

}

var strStyleCSS = '<link href="./static/custom.css" type="text/css" rel="stylesheet">';
var inner = createInnerHtml(1);
var strFormHtml = '<head>' + strStyleCSS + '</head><body>' + inner + '</body>';
LODOP = getLodop();
LODOP.ADD_PRINT_HTM(0, 25, '100%', '100%', strFormHtml);
var len = Math.ceil(document.getElementsByTagName('iframe')[0].contentWindow.document.documentElement.querySelectorAll('.decision-value').length/mol);
for (var i = 2; i <= len; i++) {

  LODOP.NewPageA();
  inner = createInnerHtml(i);
  strFormHtml = '<head>' + strStyleCSS + '</head><body>' + inner + '</body>';
  LODOP.ADD_PRINT_HTM(0, 25, '100%', '100%', strFormHtml);

}

LODOP.PREVIEW();
