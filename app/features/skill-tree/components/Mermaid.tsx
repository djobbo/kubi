import type { RenderResult } from "mermaid"
import { draw } from "mermaid"
import mermaid from "mermaid"
import type { ReactElement } from "react"
import { useEffect, useRef, useState } from "react"

interface MermaidProps {
  id: string
  diagram: string
  onError?: (error: unknown) => void
}

export const Mermaid = ({
  id,
  diagram,
  onError,
}: MermaidProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderedDiagram, setRenderedDiagram] = useState<RenderResult>()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      logLevel: 5,
    })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (!renderedDiagram?.svg) return

    container.innerHTML = renderedDiagram.svg
    renderedDiagram.bindFunctions?.(container)
  }, [renderedDiagram])

  useEffect(() => {
    if (diagram.length <= 0) return
    ;(async () => {
      try {
        const a = draw()
        const rendered = await mermaid.render(`${id}-svg`, diagram)
        setRenderedDiagram(rendered)
      } catch (e) {
        onError?.(e)
      }
    })()
  }, [diagram])

  return <div ref={containerRef} id={id} />
}
