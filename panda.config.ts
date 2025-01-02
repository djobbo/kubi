import { defineConfig } from "@pandacss/dev"

import { animatedLogoCenterAnimation } from "@/components/base/AnimatedLogo"
import { puffSpinnerAnimations } from "@/components/base/Spinner"

export const ANIMATED_LOGO_CENTER_ANIMATION_NAME = "animatedLogoCenterAnimation"
export const PUFF_SPINNER_ANIMATION_1_NAME = "puffSpinnerAnimation1"
export const PUFF_SPINNER_ANIMATION_2_NAME = "puffSpinnerAnimation2"

export default defineConfig({
  // CSS reset is handled by Tailwind CSS
  preflight: false,
  presets: [],
  include: ["./app/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  theme: {
    extend: {
      keyframes: {
        ...animatedLogoCenterAnimation,
        ...puffSpinnerAnimations,
      },
    },
  },
  outdir: "styled-system",
  importMap: {
    css: "@/panda/css",
  },
  layers: {
    base: "panda_base",
    recipes: "panda_recipes",
    reset: "panda_reset",
    tokens: "panda_tokens",
    utilities: "panda_utilities",
  },
  watch: false,
})
