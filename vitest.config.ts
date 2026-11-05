import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const stub = (name: string) => fileURLToPath(new URL(`./tests/stubs/${name}.ts`, import.meta.url));

export default defineConfig({
  test: { include: ['tests/**/*.test.{ts,tsx}'], globals: false },
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { 'react-native': stub('react-native'), '@expo/vector-icons': stub('vector-icons') } },
  define: { __DEV__: false },
});
