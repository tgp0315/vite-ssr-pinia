// 服务器端渲染的是应⽤程序的"快照"，如果应⽤依赖于⼀些异步数据， 那么在开始渲染之前，需要先预取和解析好这些数据
import { createStore as _createStore } from 'vuex'

export default function createStore() {
  return _createStore({
    state() {
      return {
        count: 0
      }
    },
    mutations: {
      increment(state) {
        state.count++
      },
      init(state, count) {
        state.count = count
      }
    },
    actions: {
      getCount({ commit }) {
        return new Promise(resolve => {
          setTimeout(() => {
            console.log('run here');
            commit('init', Math.random() * 100)
            resolve()
          }, 1000)
        })
      }
    }
  })
}
