import { ClientConfig } from '../types';

export const config: ClientConfig = {
  id: 'client-b',
  name: '企业客户 B',
  features: {
    enableAnalytics: false,
    enableSocialSharing: true,
    enableAdvancedSearch: false,
  },
  modules: ['dashboard', 'social-feed'],
  theme: {
    primaryColor: '#10b981',
    secondaryColor: '#065f46',
    logoUrl: '/logos/client-b.png',
    borderRadius: '0.25rem',
  },
  api: {
    baseURL: 'https://api.client-b.example.com',
    timeout: 8000,
    endpoints: {
      login: '/api/v2/auth/signin',
      userProfile: '/api/v2/users/profile',
      dashboard: '/api/v2/dashboard/overview',
      'social-feed': '/api/v2/social/feed',
    },
  },
  locale: {
    lang: 'zh-CN',
    messages: {
      'app.title': '社交协作平台 B',
      'common.loading': '请稍候...',
      'common.error': '发生错误，请稍后再试',
      'auth.login': '登录',
      'auth.logout': '退出登录',
      'dashboard.title': '首页',
      'social-feed.title': '社交动态',
    },
  },
  secretKey: 'sk_test_xyz789uvw456rst123',
  customData: {
    appSecret: 'secret_app_key_b_98765',
    clientToken: 'tok_sensitive_data_54321',
    themeMode: 'light',
    supportEmail: 'help@client-b.com',
  },
};
