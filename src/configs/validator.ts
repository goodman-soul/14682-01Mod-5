import { ClientConfig } from './types';

export type Severity = 'error' | 'warning';

export interface ValidationIssue {
  category: 'theme' | 'api' | 'feature' | 'route' | 'locale';
  severity: Severity;
  key: string;
  message: string;
  detail?: string;
}

export interface ValidationReport {
  clientId: string;
  timestamp: number;
  passed: boolean;
  issues: ValidationIssue[];
  summary: Record<ValidationIssue['category'], { total: number; errors: number; warnings: number }>;
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const URL_RE = /^https?:\/\/.+/;
const KNOWN_MODULES = ['dashboard', 'reports', 'social-feed'];
const REQUIRED_LOCALE_KEYS = [
  'app.title',
  'common.loading',
  'common.error',
  'auth.login',
  'auth.logout',
];

const REQUIRED_FEATURE_KEYS: (keyof ClientConfig['features'])[] = [
  'enableAnalytics',
  'enableSocialSharing',
  'enableAdvancedSearch',
];

const REQUIRED_API_ENDPOINTS: (keyof ClientConfig['api']['endpoints'])[] = [
  'login',
  'userProfile',
  'dashboard',
];

function maskSecret(value: string): string {
  if (value.length <= 8) return '****';
  return value.slice(0, 4) + '****' + value.slice(-4);
}

function maskConfigForReport(config: ClientConfig): Record<string, unknown> {
  const clone: Record<string, unknown> = JSON.parse(JSON.stringify(config));
  if (clone.secretKey && typeof clone.secretKey === 'string') {
    clone.secretKey = maskSecret(clone.secretKey as string);
  }
  if (clone.customData && typeof clone.customData === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(clone.customData as Record<string, unknown>)) {
      if (typeof v === 'string' && (k.toLowerCase().includes('key') || k.toLowerCase().includes('secret') || k.toLowerCase().includes('token'))) {
        masked[k] = maskSecret(v);
      } else {
        masked[k] = v;
      }
    }
    clone.customData = masked;
  }
  return clone;
}

function validateTheme(config: ClientConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { theme } = config;

  if (!theme.primaryColor || !HEX_COLOR_RE.test(theme.primaryColor)) {
    issues.push({
      category: 'theme',
      severity: 'error',
      key: 'theme.primaryColor',
      message: `主题色 primaryColor 无效: "${theme.primaryColor}"`,
      detail: '期望 3 位或 6 位 HEX 色值，如 #3b82f6',
    });
  }
  if (!theme.secondaryColor || !HEX_COLOR_RE.test(theme.secondaryColor)) {
    issues.push({
      category: 'theme',
      severity: 'error',
      key: 'theme.secondaryColor',
      message: `辅助色 secondaryColor 无效: "${theme.secondaryColor}"`,
      detail: '期望 3 位或 6 位 HEX 色值，如 #1e40af',
    });
  }
  if (!theme.logoUrl || theme.logoUrl.trim() === '') {
    issues.push({
      category: 'theme',
      severity: 'warning',
      key: 'theme.logoUrl',
      message: 'logoUrl 为空，页面将无法展示品牌 Logo',
    });
  }
  if (!theme.borderRadius || theme.borderRadius.trim() === '') {
    issues.push({
      category: 'theme',
      severity: 'warning',
      key: 'theme.borderRadius',
      message: 'borderRadius 为空，圆角样式将回退到浏览器默认',
    });
  }

  return issues;
}

function validateApi(config: ClientConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!config.api) {
    issues.push({
      category: 'api',
      severity: 'error',
      key: 'api',
      message: '缺少 api 配置节',
      detail: '应用将无法发起任何后端请求',
    });
    return issues;
  }

  if (!config.api.baseURL || !URL_RE.test(config.api.baseURL)) {
    issues.push({
      category: 'api',
      severity: 'error',
      key: 'api.baseURL',
      message: `api.baseURL 无效: "${config.api.baseURL}"`,
      detail: '期望以 http:// 或 https:// 开头的完整 URL',
    });
  }

  if (typeof config.api.timeout !== 'number' || config.api.timeout <= 0) {
    issues.push({
      category: 'api',
      severity: 'warning',
      key: 'api.timeout',
      message: `api.timeout 无效: ${config.api.timeout}`,
      detail: '期望正整数（毫秒），如 5000',
    });
  }

  if (!config.api.endpoints) {
    issues.push({
      category: 'api',
      severity: 'error',
      key: 'api.endpoints',
      message: '缺少 api.endpoints 配置',
    });
  } else {
    for (const ep of REQUIRED_API_ENDPOINTS) {
      if (!config.api.endpoints[ep] || config.api.endpoints[ep].trim() === '') {
        issues.push({
          category: 'api',
          severity: 'error',
          key: `api.endpoints.${ep}`,
          message: `缺少必需的接口端点: ${ep}`,
        });
      }
    }
  }

  return issues;
}

function validateFeatures(config: ClientConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!config.features) {
    issues.push({
      category: 'feature',
      severity: 'error',
      key: 'features',
      message: '缺少 features 配置节',
      detail: '所有功能开关将无法判断',
    });
    return issues;
  }

  for (const key of REQUIRED_FEATURE_KEYS) {
    if (config.features[key] === undefined) {
      issues.push({
        category: 'feature',
        severity: 'warning',
        key: `features.${key}`,
        message: `功能开关 ${key} 未定义，将视为 false`,
      });
    }
  }

  return issues;
}

function validateRoutes(config: ClientConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!config.modules || !Array.isArray(config.modules) || config.modules.length === 0) {
    issues.push({
      category: 'route',
      severity: 'error',
      key: 'modules',
      message: 'modules 为空或缺失，应用将没有可用路由',
    });
    return issues;
  }

  for (const mod of config.modules) {
    if (!KNOWN_MODULES.includes(mod)) {
      issues.push({
        category: 'route',
        severity: 'error',
        key: `modules.${mod}`,
        message: `模块 "${mod}" 不存在对应路由组件`,
        detail: `已知模块: ${KNOWN_MODULES.join(', ')}`,
      });
    }
  }

  if (config.features?.enableSocialSharing && !config.modules.includes('social-feed')) {
    issues.push({
      category: 'route',
      severity: 'warning',
      key: 'modules.social-feed',
      message: '功能开关 enableSocialSharing 已启用，但未加载 social-feed 模块',
    });
  }

  return issues;
}

function validateLocale(config: ClientConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!config.locale) {
    issues.push({
      category: 'locale',
      severity: 'error',
      key: 'locale',
      message: '缺少 locale 配置节',
      detail: '界面文案将无法正常显示',
    });
    return issues;
  }

  if (!config.locale.lang || config.locale.lang.trim() === '') {
    issues.push({
      category: 'locale',
      severity: 'warning',
      key: 'locale.lang',
      message: 'locale.lang 为空，将使用浏览器默认语言',
    });
  }

  if (!config.locale.messages || Object.keys(config.locale.messages).length === 0) {
    issues.push({
      category: 'locale',
      severity: 'error',
      key: 'locale.messages',
      message: 'locale.messages 为空，界面文案将缺失',
    });
  } else {
    for (const key of REQUIRED_LOCALE_KEYS) {
      if (!config.locale.messages[key] || config.locale.messages[key].trim() === '') {
        issues.push({
          category: 'locale',
          severity: config.locale.messages[key] === undefined ? 'error' : 'warning',
          key: `locale.messages.${key}`,
          message: `文案 key "${key}" 缺失或为空`,
        });
      }
    }
  }

  return issues;
}

export function validateConfig(config: ClientConfig): ValidationReport {
  const allIssues: ValidationIssue[] = [
    ...validateTheme(config),
    ...validateApi(config),
    ...validateFeatures(config),
    ...validateRoutes(config),
    ...validateLocale(config),
  ];

  const categories: ValidationIssue['category'][] = ['theme', 'api', 'feature', 'route', 'locale'];
  const summary: ValidationReport['summary'] = {} as ValidationReport['summary'];
  for (const cat of categories) {
    const catIssues = allIssues.filter((i) => i.category === cat);
    summary[cat] = {
      total: catIssues.length,
      errors: catIssues.filter((i) => i.severity === 'error').length,
      warnings: catIssues.filter((i) => i.severity === 'warning').length,
    };
  }

  return {
    clientId: config.id,
    timestamp: Date.now(),
    passed: allIssues.filter((i) => i.severity === 'error').length === 0,
    issues: allIssues,
    summary,
  };
}

export function formatReportForDev(report: ValidationReport, config: ClientConfig): string {
  const lines: string[] = [];
  const divider = '─'.repeat(60);

  lines.push(`╔${'═'.repeat(60)}╗`);
  lines.push(`║  租户配置校验报告 — ${report.clientId.padEnd(38)}║`);
  lines.push(`╚${'═'.repeat(60)}╝`);
  lines.push('');
  lines.push(`时间: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push(`结果: ${report.passed ? '✅ 通过' : '❌ 未通过'}`);
  lines.push('');

  const masked = maskConfigForReport(config);
  lines.push(`脱敏配置快照:`);
  lines.push(JSON.stringify(masked, null, 2));
  lines.push('');

  if (report.issues.length === 0) {
    lines.push('🎉 未发现任何配置问题。');
  } else {
    lines.push(`${divider}`);
    lines.push(`共 ${report.issues.length} 项问题:`);
    lines.push(`${divider}`);
    for (const issue of report.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      lines.push(`${icon} [${issue.category}] ${issue.key}`);
      lines.push(`   ${issue.message}`);
      if (issue.detail) {
        lines.push(`   → ${issue.detail}`);
      }
      lines.push('');
    }

    lines.push(`${divider}`);
    lines.push(`分类汇总:`);
    lines.push(`${divider}`);
    for (const [cat, stat] of Object.entries(report.summary)) {
      if (stat.total === 0) continue;
      lines.push(`  ${cat}: ${stat.total} 项 (❌ ${stat.errors} / ⚠️ ${stat.warnings})`);
    }
  }

  return lines.join('\n');
}

export function formatReportForProd(report: ValidationReport): string {
  if (report.passed) return '';
  const errorCount = report.issues.filter((i) => i.severity === 'error').length;
  const warningCount = report.issues.filter((i) => i.severity === 'warning').length;
  const parts: string[] = [];
  if (errorCount > 0) parts.push(`${errorCount} 项配置异常`);
  if (warningCount > 0) parts.push(`${warningCount} 项需要注意`);
  return `应用配置存在${parts.join('，')}，部分功能可能不可用，请联系管理员。`;
}
