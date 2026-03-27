import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/calories-calc/', // 這裡必須填寫你的 GitHub Repository 名稱
})