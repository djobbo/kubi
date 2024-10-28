import { useEffect, useState } from "react"

import { useSkillTreeStore } from "@/features/skill-tree/components/SkillTreeProvider"

export interface Connector {
  id: string
  startNode: HTMLDivElement
  endNode: HTMLDivElement
}

interface ConnectorProps {
  connector: Connector
}

type Point = [x: number, y: number]

const calculateConnectorCoords = (
  startNode?: HTMLElement | null,
  endNode?: HTMLElement | null,
): [start: Point, end: Point] | null => {
  if (!startNode || !endNode) {
    return null
  }

  const startNoderect = startNode.getBoundingClientRect()
  const endNoderect = endNode.getBoundingClientRect()

  return [
    [
      startNoderect.left + startNoderect.width / 2,
      startNoderect.top + startNoderect.height / 2,
    ],
    [
      endNoderect.left + endNoderect.width / 2,
      endNoderect.top + endNoderect.height / 2,
    ],
  ]
}

const calculateConnectorPath = (connector: Connector) => {
  const connectorCoords = calculateConnectorCoords(
    connector.startNode,
    connector.endNode,
  )

  if (!connectorCoords) return null

  const [start, end] = connectorCoords
  const path = `M ${start[0]} ${start[1]} L ${start[0]} ${end[1]} L ${end[0]} ${end[1]}`

  return path
}

const ConnectorDisplay = ({ connector }: ConnectorProps) => {
  const path = calculateConnectorPath(connector)

  if (!path) return null

  return (
    <path
      d={path}
      strokeWidth={2}
      stroke="black"
      style={
        {
          //   animation: `${dashArrayAnimation} 3s linear infinite`,
        }
      }
    />
  )
}

export const Connectors = () => {
  const [pageSize, setPageSize] = useState({
    width: 0,
    height: 0,
  })
  const connectors = useSkillTreeStore((state) => state.connectors)

  useEffect(() => {
    const handleResize = () => {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setPageSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <svg
      className="absolute inset-0 fill-transparent stroke-secondary pointer-events-none overflow-visible"
      viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
    >
      {connectors.map((connector) => (
        <ConnectorDisplay key={connector.id} connector={connector} />
      ))}
    </svg>
  )
}
