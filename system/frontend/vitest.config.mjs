import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/app/shared/game-core/__tests__/**/*.spec.ts'],
    environment: 'node',
    globals: true,
  },
});
