import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.verysmalldreams.paths',
  appName: 'Paths',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'native',
    },
  },
};

export default config;
