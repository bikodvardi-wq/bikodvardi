import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bikodvardi.app',
  appName: 'BiKodVardi',
  webDir: 'public',
  server: {
    url: 'https://bikodvardi.com', // Uygulama açıldığında direkt senin siteni getirecek!
    cleartext: true
  }
};

export default config;