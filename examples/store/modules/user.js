// import Cookies from 'js-cookie';

import axios from '@/plugins/axios.js';
import * as types from '@/store/types.js';
import * as apiTypes from '@/config/apiTypes.js';
import {login, logout} from '@/api/login.js'
import {getToken, setToken, removeToken} from '@/utils/auth.js'

const user = {
  state: {
    todos: [
      {id: 1, text: '...', done: true},
      {id: 2, text: '...', done: false},
      {id: 3, text: '...', done: false}
    ],
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },
  actions: {
    // 登录
    [types.ACTION_LOGIN]({commit}, payload) {
      let {username, password} = payload;
      return login(username, password).then((response) => {
        const data = response.data
        setToken(data.token)
        commit('SET_TOKEN', data.token)
      }).catch(error => {
        throw new Error(error)
      })
    },

    // 获取用户信息
    [types.ACTION_GETINFO]({commit, state}) {
      return axios.get(apiTypes.GETINFO, {
        params: {
          token: state.token
        }
      }).then(response => {
        let {data} = response
        if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
          commit('SET_ROLES', data.roles)
        } else {
          // reject('getInfo: roles must be a non-null array !')
        }
        commit('SET_NAME', data.name)
        commit('SET_AVATAR', data.avatar)
        return data;
      });
    },

    // 修改密码
    [types.ACTION_PASSWORD]({commit}, payload) {

      return axios.put(apiTypes.PASSWORD, payload).then(() => {
        commit('setToken', '');
      });

    },

    // 登出
    [types.ACTION_LOGOUT]({commit}, payload) {
      return axios.post(apiTypes.LOGOUT, payload).then(() => {
        commit('setToken', '');
      });
    },

    // 登出
    LogOut({commit, state}) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({commit}) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  },

  // todo 可删除测试代码
  getters: {
    doneTodo: state => {
      return state.todos.filter(todo => todo.done)
    },
    doneTodoCount: (state, getters) => {
      return getters.doneTodo.length
    }
  }
};

export default user;
