import Cookies from 'js-cookie'

let {sidebar} = require('@/config/config.env.js')
let {isRender, isCollapse} = sidebar
const app = {
  state: {
    sidebar: {
      isRender,
      isCollapse,
      opened: !+Cookies.get('sidebarStatus'),
      hideLeftMenu: false,
      withoutAnimation: false
    },
    device: 'desktop'
  },
  mutations: {
    HIDE_SIDEBAR: (state, needHide) => {
      state.sidebar.hideLeftMenu = needHide
    },

    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },

    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },

    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    }
  },
  actions: {
    HideSideBar: ({commit}, needHide) => {
      commit('HIDE_SIDEBAR', needHide)
    },
    ToggleSideBar: ({commit}) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar() {
      // commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice() {
      // commit('TOGGLE_DEVICE', device)
    }
  }
}

export default app
