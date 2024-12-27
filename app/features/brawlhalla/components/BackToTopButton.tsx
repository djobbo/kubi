import { t } from "@lingui/core/macro"
import { ChevronUp } from "lucide-react"

import { Tooltip } from "@/components/base/Tooltip"
import { useWindowScroll } from "@/hooks/useWindowScroll"
import { cn } from "@/ui/lib/utils"

export const BackToTopButton = () => {
  const { y: scrollY } = useWindowScroll()

  return (
    <div
      className={cn("fixed right-0 bottom-0 z-30", {
        "opacity-0 pointer-events-none": scrollY <= 0,
      })}
    >
      <Tooltip content={t`Back to top`}>
        <button
          type="button"
          className="relative w-12 h-12 mx-4 mb-4 rounded-full bg-accent flex items-center justify-center shadow-md"
          style={{
            transition: "0.15s opacity ease",
          }}
          onClick={() => {
            window.scrollTo({
              top: 0,
            })
          }}
        >
          <ChevronUp size={20} />
        </button>
      </Tooltip>
    </div>
  )
}
