import { ClientConfig } from './types';
import { config as rawConfig } from '@client-config';

declare const __CLIENT_ID__: string;

function loadSecretsFromEnv(baseConfig: ClientConfig): ClientConfig {
  const env = import.meta.env;
  const prefix = `VITE_${__CLIENT_ID__.toUpperCase().replace(/-/g, '_')}_`;

  const merged: ClientConfig = { ...baseConfig };

  const secretKeyEnv = env[`${prefix}SECRET_KEY`] || env.VITE_SECRET_KEY;
  if (secretKeyEnv) {
    merged.secretKey = secretKeyEnv;
  }

  const customSensitiveKeys = ['API_TOKEN', 'INTEGRATION_KEY', 'APP_SECRET', 'CLIENT_TOKEN'];
  const customData: Record<string, any> = { ...(merged.customData || {}) };

  for (const key of customSensitiveKeys) {
    const envKey = `${prefix}${key}`;
    const camelKey = key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (env[envKey]) {
      customData[camelKey] = env[envKey];
    }
  }

  if (Object.keys(customData).length > 0) {
    merged.customData = customData;
  }

  return merged;
}

export const currentConfig: ClientConfig = loadSecretsFromEnv(rawConfig);

export const isFeatureEnabled = (featureKey: keyof ClientConfig['features']): boolean => {
  return !!currentConfig.features[featureKey];
};

export const hasModule = (moduleName: string): boolean => {
  return currentConfig.modules.includes(moduleName);
};
