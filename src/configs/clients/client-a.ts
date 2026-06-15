import { ClientConfig } from '../types';

export const config: ClientConfig = {
  id: 'client-a',
  name: '企业客户 A',
  features: {
    enableAnalytics: true,
    enableSocialSharing: false,
    enableAdvancedSearch: true,
  },
  modules: ['dashboard', 'reports'],
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    logoUrl: '/logos/client-a.png',
    borderRadius: '0.5rem',
  },
  api: {
    baseURL: 'https://api.client-a.example.com',
    timeout: 5000,
    endpoints: {
      login: '/api/v1/auth/login',
      userProfile: '/api/v1/users/me',
      dashboard: '/api/v1/dashboard/stats',
      reports: '/api/v1/reports/list',
    },
  },
  locale: {
    lang: 'zh-CN',
    messages: {
      'app.title': '企业管理平台 A',
      'common.loading': '加载中...',
      'common.error': '操作失败，请重试',
      'auth.login': '登录',
      'auth.logout': '退出登录',
      'dashboard.title': '仪表盘',
      'reports.title': '报表分析',
    },
  },
  secretKey: 'sk_live_abc123def456ghi789',
  customData: {
    apiToken: 'pat_xxxxx_sensitive_token_12345',
    integrationKey: 'int_key_secret_value_67890',
    themeMode: 'dark',
    supportEmail: 'support@client-a.com',
  },
};