import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"
import { v4 as uuidV4 } from "uuid"

import type { Connector } from "@/features/skill-tree/components/Connectors"
import { Connectors } from "@/features/skill-tree/components/Connectors"
import {
  SkillTreeStoreProvider,
  useSkillTreeStore,
} from "@/features/skill-tree/components/SkillTreeProvider"

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
  const addConnector = useSkillTreeStore((state) => state.addConnector)
  const removeConnector = useSkillTreeStore((state) => state.removeConnector)

  useEffect(() => {
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
          ref={reversedTree ? bottomConnectorRef : topConnectorRef}
          className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 transform -translate-x-1/2 -translate-y-1/2"
        />
        <div
          ref={reversedTree ? topConnectorRef : bottomConnectorRef}
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

const SkillTreeDisplay = () => {
  const roots = useSkillTreeStore((state) => state.roots)

  return (
    <div className="flex flex-col items-center z-0">
      <div className="z-10">
        {roots.map((root) => (
          <SkillNodeComponent key={root.id} node={root} />
        ))}
      </div>
      <Connectors />
    </div>
  )
}

type SkillTreeProps = Omit<
  ComponentProps<typeof SkillTreeStoreProvider>,
  "children"
>

export const SkillTree = (props: SkillTreeProps) => {
  return (
    <SkillTreeStoreProvider {...props}>
      <SkillTreeDisplay />
    </SkillTreeStoreProvider>
  )
}
