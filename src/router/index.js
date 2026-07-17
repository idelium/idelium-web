import { createRouter, createWebHistory } from "vue-router";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";
import steps from "@/view/steps.vue";
const container = () => import("@/components/container.vue");
const pages = () => import("@/components/pages.vue");
const profile = () => import("@/view/profile.vue");
const apikey = () => import("@/view/apikey.vue");
const accounts = () => import("@/view/accounts.vue");
const costumers = () => import("@/view/costumers.vue");
const projects = () => import("@/view/projects.vue");
const environments = () => import("@/view/environments.vue");
const plugins = () => import("@/view/plugins.vue");
const tests = () => import("@/view/tests.vue");
const testcycles = () => import("@/view/testcycles.vue");
const testsperformed = () => import("@/view/testsperformed.vue");
const postman = () => import("@/view/testperformed/showPostmanCollection.vue");
const page404 = () => import("@/view/pages/404.vue");
const testlauncher = () => import("@/view/testlauncher.vue");
const platforms = () => import("@/view/platforms.vue");

const router = createRouter({
  linkActiveClass: "active",
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      name: "Container",
      component: container,
      meta: { requiresAuth: true },
      redirect: { path: "/projects" },
      children: [
        {
          path: "testsperformed",
          name: "testsperformed",
          component: testsperformed,
          meta: { requiresAuth: true },
        },
        {
          path: "testlauncher",
          name: "testlauncher",
          component: testlauncher,
          meta: { requiresAuth: true },
        },
        {
          path: "testcycles/:tab?",
          name: "testcycles",
          component: testcycles,
          meta: { requiresAuth: true },
        },
        {
          path: "tests/:tab?",
          name: "tests",
          component: tests,
          meta: { requiresAuth: true },
        },
        {
          path: "steps/:tab?",
          name: "steps",
          component: steps,
          meta: { requiresAuth: true },
        },
        {
          path: "plugins/:tab?",
          name: "plugins",
          component: plugins,
          meta: { requiresAuth: true },
        },
        {
          path: "environments/:tab?",
          name: "environments",
          component: environments,
          meta: { requiresAuth: true },
        },
        {
          path: "projects",
          name: "projects",
          component: projects,
          meta: { requiresAuth: true },
        },
        {
          path: "costumers",
          name: "costumers",
          component: costumers,
          meta: { requiresAuth: true },
        },
        {
          path: "account",
          name: "accounts",
          component: accounts,
          meta: { requiresAuth: true },
        },
        {
          path: "apikey",
          name: "apikey",
          component: apikey,
          meta: { requiresAuth: true },
        },
        {
          path: "profile",
          name: "profile",
          component: profile,
          meta: { requiresAuth: true },
        },
        {
          path: "platforms/:tab?",
          name: "platforms",
          component: platforms,
          meta: { requiresAuth: true },
        },
        {
          path: "postman/:id",
          name: "postman",
          component: postman,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: "/",
      redirect: "/404",
      name: "pages",
      component: pages,
      meta: { requiresAuth: false },
      children: [
        {
          path: "login",
          name: "Login",
          component: () => import("@/view/pages/login.vue"),
        },
        {
          path: "404",
          name: "Page404",
          component: page404,
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
  ],
});

router.beforeEach((to) => {
  const session = useSessionStore(pinia);
  if (
    to.name !== "Login" &&
    to.meta.requiresAuth === true &&
    !session.isAuthenticated
  ) {
    return { name: "Login", query: { back: to.name } };
  }
  if (to.name !== "projects" && to.name !== "Login" && session.hasNoProjects) {
    return { name: "projects" };
  }
  return true;
});

router.beforeResolve((to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    // Start the route progress bar.
    //NProgress.start()
  }
  next();
});

export default router;
