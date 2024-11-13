import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import mainApi from "@/router/api/main.js";
import {useAuthStore} from "@/stores/auth.js";

const DEFAULT_TITLE = "pm式リーダーシップ診断";

const routes = [
  {path: '/:pathMatch(.*)*', redirect: '/dashboard'},
  {
    path: '/signin',
    name: 'signin',
    component: () => import('@/pages/SignIn.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/layouts/Main.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      ...mainApi,
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    return {
      top: 0
    }
  },
  routes,
})

router.beforeEach((to) => {
  const userAuth = useAuthStore();

  if (!userAuth.isLoggedIn && to.meta.requiresAuth) {
    return {name: 'signin'};
  }

  document.title = to.meta.title || 'Default Title';
});

router.afterEach((to, from) => {
  document.title = to.meta.title || DEFAULT_TITLE;
});

export default router
