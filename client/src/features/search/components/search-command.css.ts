import { style } from "@vanilla-extract/css"

export const backdrop = style({
  position: "fixed",
  minHeight: "100dvh",
  inset: 0,
  backgroundColor: "black",
  opacity: 0.2,
  transition: "opacity 150ms cubic-bezier(0.45, 1.005, 0, 1.005)",

  "@supports": {
    "(-webkit-touch-callout: none)": {
      position: "absolute",
    },
  },
})
