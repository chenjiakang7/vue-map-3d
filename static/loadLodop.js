var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
var oscript = document.createElement("script");
oscript.src = "http://localhost:8000/CLodopfuncs.js?priority=1";
head.insertBefore(oscript, head.firstChild);

//引用双端口(8000和18000）避免其中某个被占用：
oscript = document.createElement("script");
oscript.src = "http://localhost:18000/CLodopfuncs.js?priority=0";
head.insertBefore(oscript, head.firstChild);
