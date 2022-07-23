const DIGIT_0 = 48;
const DIGIT_9 = 57;
const COMMA = 44;
const SPACE = 32;
const PERIOD = 46;
const MINUS = 45;
let idx = 1;
let len = 0;
export default function transformSVGPath(THREE, pathStr) {
  const paths = [];
  let path = new THREE.Shape();
  len = pathStr.length;
  let activeCmd;
  let x = 0;
  let y = 0;
  let nx = 0;
  let ny = 0;
  let firstX = null;
  let firstY = null;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  let rx = 0;
  let ry = 0;
  let xar = 0;
  let laf = 0;
  let sf = 0;
  let cx;
  let cy;
  let norm;
  let deltaAng;
  let startAng;
  let uVector;
  let vVector;
  let canRepeat;
  let enteredSub = false;
  let zSeen = false;
  activeCmd = pathStr[0];
  while (idx <= len) {
    canRepeat = true;
    switch (activeCmd) {
      case 'M':
        enteredSub = false;
        x = eatNum(pathStr);
        y = eatNum(pathStr);
        path.moveTo(x, y);
        activeCmd = 'L';
        break;
      case 'm':
        x += eatNum(pathStr);
        y += eatNum(pathStr);
        path.moveTo(x, y);
        activeCmd = 'l';
        break;
      case 'Z':
      case 'z':
        canRepeat = false;
        if (x !== firstX || y !== firstY)
          path.lineTo(firstX, firstY);
        paths.push(path);
        firstX = null;
        firstY = null;
        enteredSub = true;
        path = new THREE.Shape();
        zSeen = true;
        break;
      case 'L':
      case 'H':
      case 'V':
        nx = (activeCmd === 'V') ? x : eatNum(pathStr);
        ny = (activeCmd === 'H') ? y : eatNum(pathStr);
        path.lineTo(nx, ny);
        x = nx;
        y = ny;
        break;
      case 'l':
      case 'h':
      case 'v':
        nx = (activeCmd === 'v') ? x : (x + eatNum(pathStr));
        ny = (activeCmd === 'h') ? y : (y + eatNum(pathStr));
        path.lineTo(nx, ny);
        x = nx;
        y = ny;
        break;
      case 'C':
        x1 = eatNum(pathStr);
        y1 = eatNum(pathStr);
        x2 = eatNum(pathStr);
        y2 = eatNum(pathStr);
        nx = eatNum(pathStr);
        ny = eatNum(pathStr);
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'S':
        x1 = 2 * x - x2;
        y1 = 2 * y - y2;
        x2 = eatNum(pathStr);
        y2 = eatNum(pathStr);
        nx = eatNum(pathStr);
        ny = eatNum(pathStr);
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'c':
        x1 = x + eatNum(pathStr);
        y1 = y + eatNum(pathStr);
        x2 = x + eatNum(pathStr);
        y2 = y + eatNum(pathStr);
        nx = x + eatNum(pathStr);
        ny = y + eatNum(pathStr);
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
        x = nx;
        y = ny;
        break;
      case 's':
        x1 = 2 * x - x2;
        y1 = 2 * y - y2;
        x2 = x + eatNum(pathStr);
        y2 = y + eatNum(pathStr);
        nx = x + eatNum(pathStr);
        ny = y + eatNum(pathStr);
        path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'Q':
        x1 = eatNum(pathStr);
        y1 = eatNum(pathStr);
        nx = eatNum(pathStr);
        ny = eatNum(pathStr);
        path.quadraticCurveTo(x1, y1, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'T':
        x1 = 2 * x - x1;
        y1 = 2 * y - y1;
        nx = eatNum(pathStr);
        ny = eatNum(pathStr);
        path.quadraticCurveTo(x1, y1, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'q':
        x1 = x + eatNum(pathStr);
        y1 = y + eatNum(pathStr);
        nx = x + eatNum(pathStr);
        ny = y + eatNum(pathStr);
        path.quadraticCurveTo(x1, y1, nx, ny);
        x = nx;
        y = ny;
        break;
      case 't':
        x1 = 2 * x - x1;
        y1 = 2 * y - y1;
        nx = x + eatNum(pathStr);
        ny = y + eatNum(pathStr);
        path.quadraticCurveTo(x1, y1, nx, ny);
        x = nx;
        y = ny;
        break;
      case 'A':
        rx = eatNum(pathStr);
        ry = eatNum(pathStr);
        xar = eatNum(pathStr) * Math.PI / 180;
        laf = eatNum(pathStr);
        sf = eatNum(pathStr);
        nx = eatNum(pathStr);
        ny = eatNum(pathStr);
        x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
        y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
        norm = Math.sqrt(
          (rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) /
          (rx * rx * y1 * y1 + ry * ry * x1 * x1));
        if (laf === sf)
          norm = -norm;
        x2 = norm * rx * y1 / ry;
        y2 = norm * -ry * x1 / rx;
        cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
        cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
        uVector = new THREE.Vector2(1, 0);
        vVector = new THREE.Vector2((x1 - x2) / rx, (y1 - y2) / ry);
        startAng = Math.acos(uVector.dot(vVector) / uVector.length() / vVector.length());
        if (uVector.x * vVector.y - uVector.y * vVector.x < 0)
          startAng = -startAng;
        uVector.x = (-x1 - x2) / rx;
        uVector.y = (-y1 - y2) / ry;
        deltaAng = Math.acos(vVector.dot(uVector) / vVector.length() / uVector.length());
        if (vVector.x * uVector.y - vVector.y * uVector.x < 0)
          deltaAng = -deltaAng;
        if (!sf && deltaAng > 0)
          deltaAng -= Math.PI * 2;
        if (sf && deltaAng < 0)
          deltaAng += Math.PI * 2;
        path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
        x = nx;
        y = ny;
        break;
      case ' ':
        break;
      default:
        throw new Error('weird path command: ' + activeCmd);
    }
    if (firstX === null && !enteredSub) {
      firstX = x;
      firstY = y;
    }
    if (canRepeat && nextIsNum(pathStr))
      continue;
    activeCmd = pathStr[idx++];
  }
  if (zSeen) {
    return paths;
  } else {
    paths.push(path);
    return paths;
  }
}
function eatNum(pathStr) {
  let sidx;
  let c;
  let isFloat = false;
  let s;
  while (idx < len) {
    c = pathStr.charCodeAt(idx);
    if (c !== COMMA && c !== SPACE)
      break;
    idx++;
  }
  if (c === MINUS)
    sidx = idx++;
  else
    sidx = idx;
  while (idx < len) {
    c = pathStr.charCodeAt(idx);
    if (DIGIT_0 <= c && c <= DIGIT_9) {
      idx++;
      continue;
    } else if (c === PERIOD) {
      idx++;
      isFloat = true;
      continue;
    }
    s = pathStr.substring(sidx, idx);
    return isFloat ? parseFloat(s) : parseInt(s);
  }
  s = pathStr.substring(sidx);
  return isFloat ? parseFloat(s) : parseInt(s);
}
function nextIsNum(pathStr) {
  let c;
  while (idx < len) {
    c = pathStr.charCodeAt(idx);
    if (c !== COMMA && c !== SPACE)
      break;
    idx++;
  }
  c = pathStr.charCodeAt(idx);
  return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
}
