import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import ViteFonts from 'unplugin-fonts/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import {quasar, transformAssetUrls} from "@quasar/vite-plugin";
import path from "path";
import {fileURLToPath, URL} from "node:url";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
  server: {
    port: 8083,
    hmr: {
      host: 'localhost'
    },
  },
  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    }),
    quasar({
      sassVariables: "src/assets/sass/quasar-variables.sass",
    }),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  define: {
    'process.env': {},
    __VUE_PROD_DEVTOOLS__: mode !== 'production'
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      stream: 'stream-browserify',
      '$': 'jQuery',
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
}));
