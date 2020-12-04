import moment from 'moment';

let state = {
  queryForm: {
    business: 'all',
    city: '',
    district: '',
    endDate: moment().add(-1, 'day').format('YYYY-MM-DD'),
    orgId: '',
    orgType: '',
    province: '',
    startDate: moment().add(-1, 'week').format('YYYY-MM-DD')
  }
};

const mutations = {

  updateForm(state, payload) {

    state.queryForm = payload;

  },
  resetForm(state) {

    state.queryForm = {
      business: 'all',
      city: '',
      district: '',
      endDate: moment().add(-1, 'day').format('YYYY-MM-DD'),
      orgId: '',
      orgType: '',
      province: '',
      startDate: moment().add(-1, 'week').format('YYYY-MM-DD')
    };

  }

};

const getters = {

  queryForm(state) {

    return state.queryForm;

  }

};

export default {

  state,
  mutations,
  getters

}
