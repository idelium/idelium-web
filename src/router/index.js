import { createRouter, createWebHistory } from 'vue-router'
import container from '@/components/container.vue'
import pages from '@/components/pages.vue'
import profile from '@/view/profile.vue'
import apikey from '@/view/apikey.vue'
import accounts from '@/view/accounts.vue'
import costumers from '@/view/costumers.vue'
import projects from '@/view/projects.vue'
import steps from '@/view/steps.vue'
import environments from '@/view/environments.vue'
import plugins from '@/view/plugins.vue'
import tests from '@/view/tests.vue'
import testcycles from '@/view/testcycles.vue'
import testsperformed from '@/view/testsperformed.vue'
import postman from '@/view/testperformed/showPostmanCollection.vue'
import page404 from '@/view/pages/404.vue'
import testlauncher from '@/view/testlauncher.vue'
import platforms from '@/view/platforms.vue'

const router = createRouter({
  linkActiveClass: 'active',
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'Container',
      component: container,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'testsperformed',
          name: 'testsperformed',
          component: testsperformed,
          meta: { requiresAuth: true }
        },
        {
          path: 'testlauncher',
          name: 'testlauncher',
          component: testlauncher,
          meta: { requiresAuth: true }
        },
        {
          path: 'testcycles',
          name: 'testcycles',
          component: testcycles,
          meta: { requiresAuth: true }
        },
        {
          path: 'tests',
          name: 'tests',
          component: tests,
          meta: { requiresAuth: true }
        },
        {
          path: 'steps',
          name: 'steps',
          component: steps,
          meta: { requiresAuth: true }
        },
        {
          path: 'plugins',
          name: 'plugins',
          component: plugins,
          meta: { requiresAuth: true }
        },
        {
          path: 'environments',
          name: 'environments',
          component: environments,
          meta: { requiresAuth: true }
        },
        {
          path: 'projects',
          name: 'projects',
          component: projects,
          meta: { requiresAuth: true }
        },
        {
          path: 'costumers',
          name: 'costumers',
          component: costumers,
          meta: { requiresAuth: true }
        },
        {
          path: 'account',
          name: 'accounts',
          component: accounts,
          meta: { requiresAuth: true }
        },
        {
          path: 'apikey',
          name: 'apikey',
          component: apikey,
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: profile,
          meta: { requiresAuth: true }
        },
        {
          path: 'platforms',
          name: 'platforms',
          component: platforms,
          meta: { requiresAuth: true }
        },
        {
          path: 'postman',
          name: 'postman',
          component: postman,
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/',
      redirect: '/404',
      name: 'pages',
      component: pages,
      meta: { requiresAuth: false },
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import ('@/view/pages/login.vue')
        },
        {
          path: '404',
          name: 'Page404',
          component: page404
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

router.beforeEach((to, from, next) => {
  //read cookie
  let check = false
  console.log('eccomi')
  console.log(to)
  console.log('storage: ' + localStorage.isFirstProject)
  if (localStorage.token) check = true
  if (to.name !== 'Login' && to.meta.requiresAuth == true && check == false) {
    next({ name: 'Login' })
  } else if (
    to.name !== 'projects' &&
    to.name !== 'Login' &&
    localStorage.isFirstProject == 'true'
  ) {
    next({ name: 'projects' })
  } else {
    console.log('to.name: ' + to.name)
    next()
  }
})

router.beforeResolve((to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    // Start the route progress bar.
    //NProgress.start()
  }
  next()
})



export default router