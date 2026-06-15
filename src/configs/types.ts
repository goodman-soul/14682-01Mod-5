/**
 * 客户配置类型定义
 */
export interface ClientConfig {
  id: string;
  name: string;
  // 功能开关
  features: {
    enableAnalytics: boolean;
    enableSocialSharing: boolean;
    enableAdvancedSearch: boolean;
    [key: string]: boolean;
  };
  // 模块依赖（决定哪些模块会被打包或在运行时可用）
  modules: string[];
  // 样式配置
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    borderRadius: string;
  };
  // 接口配置
  api: {
    baseURL: string;
    timeout: number;
    endpoints: {
      login: string;
      userProfile: string;
      dashboard: string;
      [key: string]: string;
    };
  };
  // 国际化文案配置
  locale: {
    lang: string;
    messages: {
      'app.title': string;
      'common.loading': string;
      'common.error': string;
      'auth.login': string;
      'auth.logout': string;
      [key: string]: string;
    };
  };
  // 客户密钥（敏感信息，报告中需脱敏）
  secretKey?: string;
  // 自定义配置
  customData?: Record<string, any>;
}

export type ClientId = 'client-a' | 'client-b' | 'default';
