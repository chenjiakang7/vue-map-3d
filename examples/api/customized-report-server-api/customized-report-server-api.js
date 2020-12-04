import axios from 'axios';
import { CUSTOMIZED_REPORT_SERVER_API } from '@/config';
let lastUrl = '';
try {

  lastUrl = process && process.env.NODE_ENV === 'development' ? '?loginUserId=0c6ca275f8cf475a928ee5ca5d7b0793' : '';//?loginUserId=0c6ca275f8cf475a928ee5ca5d7b0793   7867692123094fefa4944ee17a4c3016  ff8080815e6b809f015e73a287e60008

} catch (e) {

  console.log(e);

}

/**
 * 统计分析统一报表存储过程接口
 * @param {Object} params
 */
export const unifiedInterface = async (params) => {

  return axios.post(`${CUSTOMIZED_REPORT_SERVER_API}/v2/pt/unifiedInterface${lastUrl}`, params);

}

/**
 * 表格导出后台异步执行接口
 * @param {Object} params
 */
export const addReportTask = async (params) => {

  if (params.tableName.indexOf('病历有效无效统计') !== -1) {

    for (let key in params.resultSet) {

      if (key === 'sp_aux_006_table01_01') {

        delete params.resultSet[key];
        params.resultSet['sp_aux_006_table01_03'] = ['sp_aux_006_table01_03', 'table', 'startDate', 'endDate', 'orgCode', 'orgCodeDefault', 'provinceCode', 'cityCode', 'districtCode', 'doctorCode', 'medicalClassify', 'medicalSubclassify', 'isGetBarSon', 'page', 'size', 'total', 'pageOut', 'name', 'titleJson', 'cursor'];

      }

    }

  }
  return axios.post(`${CUSTOMIZED_REPORT_SERVER_API}/v2/pt/addReportTask${lastUrl}`, params);

}

/**
 * 获取后台异步导出状态接口
 * @param {Object} params
 */
export const getReportPage = async (params) => {

  return axios.post(`${CUSTOMIZED_REPORT_SERVER_API}/v2/pt/getReportPage${lastUrl}`, params);

}
