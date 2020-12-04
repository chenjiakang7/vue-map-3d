import join from 'url-join';
import qs from 'query-string';

const combineUrl = join;

/**
 * 将JSON序列化为QueryString
 * @param {String} json 需要序列化为QueryString的json
 */
const toQueryString = (json, format) => {

  const query = qs.stringify(json, { arrayFormat: format || 'none' });
  return query;

};

export { combineUrl, toQueryString };
