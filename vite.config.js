import { defineConfig } from 'vite'
import { transformContent } from './scripts/content.js'

export default defineConfig({
  base: '/sparkfolio/',
  plugins: [{ name: 'sparkfolio-content', transformIndexHtml: { order: 'pre', handler: transformContent } }],
})
