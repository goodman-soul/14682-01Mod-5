import React, { useEffect, useRef, useState } from 'react';
import { ValidationReport, formatReportForDev, formatReportForProd } from '@/configs/validator';
import { ClientConfig } from '@/configs/types';

const isDev = import.meta.env.DEV;

const CATEGORY_LABELS: Record<string, string> = {
  theme: '主题色',
  api: '接口地址',
  feature: '功能开关',
  route: '路由',
  locale: '文案包',
};

const CATEGORY_COLORS: Record<string, string> = {
  theme: '#8b5cf6',
  api: '#f59e0b',
  feature: '#3b82f6',
  route: '#10b981',
  locale: '#ef4444',
};

const DevReportPanel: React.FC<{ report: ValidationReport; config: ClientConfig }> = ({ report, config }) => {
  const [collapsed, setCollapsed] = useState(false);
  const textRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const text = formatReportForDev(report, config);
    console.warn(`[ConfigValidator] 租户配置校验报告\n${text}`);
  }, [report, config]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        lineHeight: 1.6,
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        borderTop: `3px solid ${report.passed ? '#10b981' : '#ef4444'}`,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
        maxHeight: collapsed ? 40 : '50vh',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          cursor: 'pointer',
          borderBottom: '1px solid #333',
          userSelect: 'none',
        }}
      >
        <span>
          {report.passed ? '✅' : '❌'} 配置校验 — {report.clientId}
          {!report.passed && (
            <span style={{ color: '#ef4444', marginLeft: 8 }}>
              {report.issues.filter((i) => i.severity === 'error').length} 错误,{' '}
              {report.issues.filter((i) => i.severity === 'warning').length} 警告
            </span>
          )}
        </span>
        <span style={{ opacity: 0.5 }}>{collapsed ? '▲ 展开' : '▼ 收起'}</span>
      </div>

      {!collapsed && (
        <div style={{ overflowY: 'auto', maxHeight: 'calc(50vh - 40px)', padding: '8px 16px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.entries(report.summary).map(([cat, stat]) =>
              stat.total > 0 ? (
                <span
                  key={cat}
                  style={{
                    background: CATEGORY_COLORS[cat] || '#666',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                >
                  {CATEGORY_LABELS[cat] || cat}: {stat.errors}❌ {stat.warnings}⚠️
                </span>
              ) : null,
            )}
          </div>

          {report.issues.map((issue, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 8px',
                marginBottom: 4,
                borderLeft: `3px solid ${issue.severity === 'error' ? '#ef4444' : '#f59e0b'}`,
                backgroundColor: issue.severity === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{issue.severity === 'error' ? '❌' : '⚠️'}</span>
                <span style={{ color: CATEGORY_COLORS[issue.category] || '#999' }}>
                  [{CATEGORY_LABELS[issue.category] || issue.category}]
                </span>
                <span style={{ color: '#9cdcfe' }}>{issue.key}</span>
              </div>
              <div style={{ marginLeft: 22, color: '#ccc' }}>{issue.message}</div>
              {issue.detail && (
                <div style={{ marginLeft: 22, color: '#888', fontSize: 11 }}>→ {issue.detail}</div>
              )}
            </div>
          ))}

          {report.issues.length === 0 && (
            <div style={{ color: '#10b981', textAlign: 'center', padding: 16 }}>
              🎉 未发现任何配置问题
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProdPlaceholder: React.FC<{ report: ValidationReport }> = ({ report }) => {
  const msg = formatReportForProd(report);
  if (!msg) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '10px 20px',
        backgroundColor: '#fef2f2',
        borderBottom: '2px solid #fca5a5',
        color: '#991b1b',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      ⚠️ {msg}
    </div>
  );
};

export const ConfigReport: React.FC<{ report: ValidationReport | null; config: ClientConfig | null }> = ({ report, config }) => {
  if (!report || !config) return null;
  return isDev ? <DevReportPanel report={report} config={config} /> : <ProdPlaceholder report={report} />;
};
