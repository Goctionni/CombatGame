import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

window.showCombatScreen = (target, background, party, enemies, callback) => {
  const targetEl = document.createElement('div');
  document.querySelector(target).appendChild(targetEl);

  new Vue({
    render: h => h(App, {
      props: {
        background,
        party,
        enemies,
        callback,
      }
    }),
  }).$mount(targetEl)
};
