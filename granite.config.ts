import { defineConfig } from '@apps-in-toss/web-framework/config'

export default defineConfig({
  // 앱인토스 콘솔 앱 이름
  appName: 'butter-tteok',
  brand: {
    displayName: '버터떡 맵',
    primaryColor: '#FFD233',
    // 콘솔 앱 정보에서 업로드한 아이콘 이미지를 우클릭 → 링크 복사 후 넣어주세요
    icon: 'https://static.toss.im/appsintoss/25373/f7c82fb6-1841-4d3e-b557-19d2f22ee8f1.png',
  },
  web: {
    host: '172.30.1.26',
    port: 5175,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
})
