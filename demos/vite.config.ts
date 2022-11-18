import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
      }
    ]
  }
})
