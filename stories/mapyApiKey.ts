const storybookEnv = import.meta.env as ImportMetaEnv & {
  readonly VITE_MAPY_API_KEY?: string;
};

export const storybookMapyApiKey: string = storybookEnv.VITE_MAPY_API_KEY ?? '';
