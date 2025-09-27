import { createRouter, createWebHistory } from 'vue-router';
import FrontPage from '../components/layout/FrontPage.vue';

const routes = [
  {
    path: '/',
    name: 'FrontPage',
    component: FrontPage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/layout/Dashboard.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
