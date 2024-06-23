import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      // '/endp': {
      //   target: 'https://aiida.materialscloud.org',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/endp/, '/endp'),
      // },
    },
  },
});
