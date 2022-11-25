import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'react',
        replacement: path.resolve(__dirname, '../packages/react')
      },
      {
        find: 'react-dom',
        replacement: path.resolve(__dirname, '../packages/react-dom')
      },
      {
        find: 'scheduler',
        replacement: path.resolve(__dirname, '../packages/scheduler')
      },
      {
        find: 'react-dom-bindings',
        replacement: path.resolve(__dirname, '../packages/react-dom-bindings')
      },
      {
        find: 'shared',
        replacement: path.resolve(__dirname, '../packages/shared')
      },
    ]
  }
})
