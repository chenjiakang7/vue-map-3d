// import debounce from 'lodash/debounce'
function blankFilter(value) {
  if (value === false || value === 0) {
    return value
  }
  return value || '--'
}

function moneyFilter(value) {
  return value + ' 元'
}

function squareMeter(value) {
  return value + ' ㎡'
}

function getAbs(value) {
  if (value === false) {
    return value
  }
  if (value === null) {
    return '---'
  }
  if (!isNaN(value)) {
    return Math.abs(value) + '%'
  } else {
    return value || '---'
  }
}

function numberString(value) {
  return ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十一', '十二', '十三', '十四'][value]
}

function parseDayHour(value) {
  value = parseInt(parseInt(value) / 1000)
  if (value) {
    return parseInt(value / (60 * 60 * 24)) + '天' + parseInt((value % (60 * 60 * 24)) / (60 * 60)) + '小时'
  } else {
    return '--'
  }
}

function parseMinute(value) {
  value = parseInt(parseInt(value) / 1000)
  if (value) {
    if (value < 60 || value === 60) {
      return value + '秒'
    } else if (value > 60 && value < 3600) {
      return parseInt(value / 60) + '分' + parseInt(value % 60) + '秒'
    }
  } else {
    return '--'
  }
}
export default {
  install(Vue) {
    Vue.filter('blank', blankFilter)
    Vue.filter('￥', moneyFilter)
    Vue.filter('sMeter', squareMeter)
    Vue.filter('perAbs', getAbs)
    Vue.filter('nStr', numberString)
    Vue.filter('parseDayHour', parseDayHour)
    Vue.filter('parseMinute', parseMinute)
  }
}
