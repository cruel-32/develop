import { createRouter, createWebHistory } from "vue-router";
import Layout from "./components/Layout.vue";
import Home from "./pages/Home.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Layout,
      children: [
        { path: "", component: Home },
        {
          path: "version/v3.4/define-model",
          component: () => import("./pages/version/v34/DefineModelPage.vue"),
        },
        {
          path: "version/v3.4/v-bind-shorthand",
          component: () => import("./pages/version/v34/VBindShorthandPage.vue"),
        },
        {
          path: "version/v3.5/reactive-props-destructure",
          component: () => import("./pages/version/v35/ReactivePropsDestructurePage.vue"),
        },
        {
          path: "version/v3.5/use-template-ref",
          component: () => import("./pages/version/v35/UseTemplateRefPage.vue"),
        },
        {
          path: "version/v3.5/use-id",
          component: () => import("./pages/version/v35/UseIdPage.vue"),
        },
        {
          path: "version/v3.5/on-watcher-cleanup",
          component: () => import("./pages/version/v35/OnWatcherCleanupPage.vue"),
        },
        {
          path: "crud-demo",
          component: () => import("./pages/crud/CrudDemoPage.vue"),
        },
      ],
    },
  ],
});

export default router;
