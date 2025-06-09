import { defineConfig } from '@pandacss/dev';

export const ANIMATED_LOGO_CENTER_ANIMATION_NAME = 'animatedLogoCenterAnimation';
export const PUFF_SPINNER_ANIMATION_1_NAME = 'puffSpinnerAnimation1';
export const PUFF_SPINNER_ANIMATION_2_NAME = 'puffSpinnerAnimation2';

export default defineConfig({
  // CSS reset is handled by Tailwind CSS
  preflight: false,
  presets: [],
  include: ['./app/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  theme: {
    extend: {
      keyframes: {
        [ANIMATED_LOGO_CENTER_ANIMATION_NAME]: {
          '0%': {
            opacity: 0.25,
            transform: 'rotate(0deg) scale(0.9)',
            animationTimingFunction: 'ease-in',
          },
          '40%': {
            opacity: 1,
            transform: 'rotate(360deg) scale(1)',
            animationTimingFunction: 'ease-out',
          },
          '100%': {
            opacity: 0.25,
            transform: 'rotate(720deg) scale(0.9)',
          },
        },
        [PUFF_SPINNER_ANIMATION_1_NAME]: {
          '0%': {
            transform: 'scale(0)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        [PUFF_SPINNER_ANIMATION_2_NAME]: {
          '0%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
      },
    },
  },
  outdir: 'styled-system',
  importMap: {
    css: '@/panda/css',
  },
  layers: {
    base: 'panda_base',
    recipes: 'panda_recipes',
    reset: 'panda_reset',
    tokens: 'panda_tokens',
    utilities: 'panda_utilities',
  },
  watch: false,
});
