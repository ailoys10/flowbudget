// Simple SPA Router
const router = {
  routes: {},
  currentPage: null,

  register: (name, renderFn) => {
    router.routes[name] = renderFn;
  },

  navigate: (page, params = {}) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const publicPages = ['login', 'register'];

    if (!isAuthenticated && !publicPages.includes(page)) {
      page = 'login';
    }

    if (isAuthenticated && publicPages.includes(page)) {
      page = 'dashboard';
    }

    router.currentPage = page;
    router.params = params;

    const renderFn = router.routes[page];
    if (renderFn) {
      const app = document.getElementById('app');
      app.innerHTML = '';
      renderFn(app, params);
      window.scrollTo(0, 0);
    }
  },

  init: () => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    router.navigate(isAuthenticated ? 'dashboard' : 'login');
  },
};

window.router = router;
