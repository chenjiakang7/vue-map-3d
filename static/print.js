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

//填充药品名
function fill_empty_drug(times) {

  var data = [];

  for (var i = 0; i < times; i++) {

    data.push({
      name: '',
      frequency: '',
      amount: ''
    });
  }

  return data;
};

//获取iframe中data-object
function createItemAry(num) {
  var itemAry = [];
  var filledNum = num * mol > length ? num * mol - length : 0;
  var nodeIndex = (num - 1) * mol;
  var activeNodes = Array.prototype.slice.call(ulList, nodeIndex, nodeIndex + mol > length ? length : nodeIndex + mol);
  for (var i = 0; i < filledNum; i++) {
    activeNodes.push(emptyItem);
  }
  Array.prototype.forEach.call(activeNodes, (ul) => {

    //ul不为HMTLElement时，则ul为emptyItem对象
    let obj = ul.nodeType ? JSON.parse(ul.getAttribute('data-object')) : ul;
    //填充药物
    obj.drugs = fill_empty_drug(4);
    var names = obj.drugName.split('，');
    Array.prototype.forEach.call(names, function (elem, index) {
      obj.drugs[index].name = elem;
    });
    let amounts = obj.directions.split(',');
    Array.prototype.forEach.call(amounts, (elem, index) => {
      let tmp = elem.replace(/\[|\]/g, '');
      obj.drugs[index].frequency = tmp.split('|')[0] || '';
      obj.drugs[index].amount = tmp.split('|')[1] || '';
    })
    itemAry.push(obj);

  })
  return itemAry;
}

var mol = 4;
var emptyItem = { "nextFollowupTime": "", "other": "", "transferInstitution": "", "diastolicPressure": "", "recordId": "", "mode": "", "pressureStatus": "", "complianceBehavior": "", "followupTime": "", "smoking": "", "medicationCompliance": "", "exerciseFrequency": "", "mentalAdjustment": "", "id": "", "assistantExamination": "", "doctorSign": "", "weight": "", "exerciseMode": "", "drink": "", "adr": "", "exerciseTime": "", "saltIntake": "", "symptom": "", "followUpClassify": "", "heartRate": "", "directions": "", "drugName": "", "transferReason": "", "systolicPressure": "", "bmi": "", "drugs": [{ "name": "", "frequency": "" }, { "name": "", "frequency": "", "amount": "" }, { "name": "", "frequency": "", "amount": "" }, { "name": "", "frequency": "", "amount": "" }] };
//
var ulList = document.getElementsByTagName('iframe')[0].contentWindow.document.documentElement.querySelector('.portlet-body-containter').querySelectorAll('.decision-value');
var length = ulList.length;

LODOP = getLodop();
var tmplt = document.querySelector("link[rel = 'import']").import.children[0];
var user = JSON.parse(localStorage.getItem('user'));
var tmpltInnerHTML = template.compile(tmplt.innerHTML)({ itemAry: createItemAry(1), name: user.displayName})
LODOP.ADD_PRINT_HTM('7%', 0, '100%', '100%', tmpltInnerHTML);
for (var i = 2; i <= Math.ceil(length / mol); i++) {
  LODOP.NewPageA();
  tmpltInnerHTML = template.compile(tmplt.innerHTML)({ itemAry: createItemAry(i), name: user.displayName })
  LODOP.ADD_PRINT_HTM('7%', 0, '100%', '100%', tmpltInnerHTML);
}

LODOP.PREVIEW();
