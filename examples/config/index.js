const TITLE = '大数据分析平台';

const COMMON_API_PATH = '/common-api';
const STC_ALS_API_PATH = '/stc-api';

const USER_COMMON_API_PATH = `${COMMON_API_PATH}/user`;
const LOGOUT_API_PATH = `${COMMON_API_PATH}/logout`;
const USER_PASSWORD_API_PATH = `${USER_COMMON_API_PATH}/password`;


// 搜索: 单位下拉接口
const UNIT_NAME_LIST = `${COMMON_API_PATH}/org/select`;

// 获取当前用户行政区划、组织机构信息
const LEVEL_INFO = `${COMMON_API_PATH}/common/division_org`;

//初始化用户缓存
const INIT_USER_CACHE = `${STC_ALS_API_PATH}/follow/organization/init`;

const CUSTOMIZED_REPORT_SERVER_API = '/customized-report-server-api';

export {
  CUSTOMIZED_REPORT_SERVER_API,
  TITLE,
  COMMON_API_PATH,
  STC_ALS_API_PATH,
  USER_COMMON_API_PATH,
  USER_PASSWORD_API_PATH,
  LOGOUT_API_PATH,
  UNIT_NAME_LIST,
  LEVEL_INFO,
  INIT_USER_CACHE
};
