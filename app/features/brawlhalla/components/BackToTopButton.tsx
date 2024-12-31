import { t } from "@lingui/core/macro"
import { ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"

import { Tooltip } from "@/components/base/Tooltip"
import { cn } from "@/ui/lib/utils"

const SCROLL_TOP_THRESHOLD = 300

export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const abortController = new AbortController()
    window.addEventListener(
      "scroll",
      () => {
        setIsVisible(window.scrollY > SCROLL_TOP_THRESHOLD)
      },
      { signal: abortController.signal },
    )

    return () => {
      abortController.abort()
    }
  }, [])

  return (
    <div
      className={cn("fixed right-0 bottom-0 z-30", {
        "opacity-0 pointer-events-none": !isVisible,
      })}
    >
      <Tooltip content={t`Back to top`}>
        <button
          type="button"
          className="relative w-12 h-12 mx-4 mb-4 rounded-full bg-accentOld flex items-center justify-center shadow-md"
          style={{
            transition: "0.15s opacity ease",
          }}
          onClick={scrollToTop}
        >
          <ChevronUp size={20} />
        </button>
      </Tooltip>
    </div>
  )
}
