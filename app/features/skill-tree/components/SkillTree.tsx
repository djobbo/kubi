import { useEffect, useRef } from "react"
import { v4 as uuidV4 } from "uuid"

import type { Connector } from "@/features/skill-tree/components/Connectors"
import { Connectors } from "@/features/skill-tree/components/Connectors"
import { useSkillTreeStore } from "@/features/skill-tree/store"

export interface SkillNode {
  id: string
  title: string
  type: "main" | "secondary"
  children?: SkillNode[]
}

interface SkillNodeProps {
  node: SkillNode
  parentConnectorRef?: React.RefObject<HTMLDivElement>
}

const SkillNodeComponent = ({ node, parentConnectorRef }: SkillNodeProps) => {
  const isMain = node.type === "main"
  const topConnectorRef = useRef<HTMLDivElement>(null)
  const bottomConnectorRef = useRef<HTMLDivElement>(null)
  const reversedTree = useSkillTreeStore((state) => state.reversed)

  useEffect(() => {
    const { addConnector, removeConnector } = useSkillTreeStore.getState()

    if (!parentConnectorRef?.current || !topConnectorRef.current) return

    const connectorId = uuidV4()
    const connector: Connector = {
      id: connectorId,
      startNode: topConnectorRef.current,
      endNode: parentConnectorRef?.current,
    }

    addConnector(connector)

    return () => {
      removeConnector(connectorId)
    }
  }, [parentConnectorRef?.current])

  return (
    <div
      className={`flex ${reversedTree ? "flex-col-reverse" : "flex-col"} gap-4 items-center ${isMain ? "text-yellow-500" : "text-blue-500"}`}
    >
      <div
        className={`relative p-4 border rounded ${isMain ? "border-yellow-500" : "border-blue-500"}`}
      >
        <div
          ref={topConnectorRef}
          className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 transform -translate-x-1/2 -translate-y-1/2"
        />
        <div
          ref={bottomConnectorRef}
          className="absolute bottom-0 left-1/2 w-2 h-2 bg-red-500 transform -translate-x-1/2 translate-y-1/2"
        />
        {node.title}
      </div>
      {node.children &&
        (node.children.length === 1 ? (
          <SkillNodeComponent
            node={node.children[0]}
            parentConnectorRef={bottomConnectorRef}
          />
        ) : (
          <div className="flex space-x-4 mt-4">
            {node.children.map((child) => (
              <SkillNodeComponent
                key={child.id}
                node={child}
                parentConnectorRef={bottomConnectorRef}
              />
            ))}
          </div>
        ))}
    </div>
  )
}

interface SkillTreeProps {
  rootNodes: SkillNode[]
}

export const SkillTree = ({ rootNodes }: SkillTreeProps) => {
  return (
    <div className="flex flex-col items-center z-0">
      <div className="z-10">
        {rootNodes.map((rootNode) => (
          <SkillNodeComponent key={rootNode.id} node={rootNode} />
        ))}
      </div>
      <Connectors />
    </div>
  )
}
