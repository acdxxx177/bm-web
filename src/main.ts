import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import './style.css';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

// 路由配置保持不变
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('./components/Home.vue') },
    { path: '/quiz/:count', name: 'Quiz', component: () => import('./components/Quiz.vue') },
    { path: '/statistics', name: 'Statistics', component: () => import('./components/Statistics.vue') }
  ]
});

app.use(pinia).use(router).mount('#app');
