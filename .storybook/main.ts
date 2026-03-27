import type { StorybookConfig } from '@storybook/react-vite';
import { loadEnv, mergeConfig } from 'vite';

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  viteFinal(baseConfig, options) {
    const mode = options.configType === 'PRODUCTION' ? 'production' : 'development';
    const env = loadEnv(mode, process.cwd(), '');
    const proxyTarget = env.STORYBOOK_MAPY_PROXY_TARGET;
    const proxyPathPrefix = env.STORYBOOK_MAPY_PROXY_PATH_PREFIX || '/rest/v1/map';

    if (!proxyTarget) {
      return baseConfig;
    }

    return mergeConfig(baseConfig, {
      server: {
        proxy: {
          [proxyPathPrefix]: {
            changeOrigin: true,
            secure: false,
            target: proxyTarget,
          },
        },
      },
    });
  },
};

export default config;
