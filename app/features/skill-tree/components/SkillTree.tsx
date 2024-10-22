import type { ComponentProps, RefObject } from "react"
import { forwardRef, useEffect, useRef } from "react"
import { v4 as uuidV4 } from "uuid"

import type { Connector } from "@/features/skill-tree/components/Connectors"
import { Connectors } from "@/features/skill-tree/components/Connectors"
import {
  SkillTreeStoreProvider,
  useSkillTreeStore,
} from "@/features/skill-tree/components/SkillTreeProvider"
import { cn } from "@/ui/lib/utils"

interface BaseSkillNode {
  id: string
  next?: SkillNode[] | "exit-cluster"
}

interface PrimarySkillNode extends BaseSkillNode {
  type: "primary"
  title: string
  description?: string
}

interface SecondarySkillNode extends BaseSkillNode {
  type: "secondary"
  title: string
}

interface ClusterSkillNode extends BaseSkillNode {
  type: "cluster"
  children: SkillNode[]
}

export type SkillNode = PrimarySkillNode | SecondarySkillNode | ClusterSkillNode

const skillNodeColorMap = {
  primary: "#E4A530",
  secondary: "#3FA4D7",
} as const satisfies Partial<Record<SkillNode["type"], string>>

const SkillNodeBadge = ({
  node,
  size = 64,
}: {
  node: SkillNode
  size?: number
}) => {
  if (node.type === "cluster") return null

  const color = skillNodeColorMap[node.type]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 58 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M27 2.1547C28.2376 1.44017 29.7624 1.44017 31 2.1547L54.7128 15.8453C55.9504 16.5598 56.7128 17.8803 56.7128 19.3094V46.6906C56.7128 48.1197 55.9504 49.4402 54.7128 50.1547L31 63.8453C29.7624 64.5598 28.2376 64.5598 27 63.8453L3.28719 50.1547C2.04958 49.4402 1.28719 48.1197 1.28719 46.6906V19.3094C1.28719 17.8803 2.04958 16.5598 3.28719 15.8453L27 2.1547Z"
        fill={color}
        fillOpacity="0.08"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  )
}

const ConnectorAnchor = forwardRef<HTMLDivElement, { className?: string }>(
  function ConnectorAnchor({ className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-1/2 w-3 h-3 transform",
          "rounded-sm border-2 border-white",
          className,
        )}
      />
    )
  },
)

interface SkillNodeProps {
  node: SkillNode
  parentExitConnectorRef?: RefObject<HTMLDivElement>
  clusterRootExitConnectorRef?: RefObject<HTMLDivElement>
}

const SkillNodeComponent = ({
  node,
  parentExitConnectorRef: parentExitConnectorRef,
  clusterRootExitConnectorRef,
}: SkillNodeProps) => {
  const entryConnectorRef = useRef<HTMLDivElement>(null)
  const exitConnectorRef = useRef<HTMLDivElement>(null)
  const reversedTree = useSkillTreeStore((state) => state.reversed)
  const addConnector = useSkillTreeStore((state) => state.addConnector)
  const removeConnector = useSkillTreeStore((state) => state.removeConnector)

  useEffect(() => {
    const removeConnectors = [
      [entryConnectorRef.current, parentExitConnectorRef?.current],
      node.next === "exit-cluster"
        ? [exitConnectorRef.current, clusterRootExitConnectorRef?.current]
        : null,
    ].map((connectorNodes) => {
      if (!connectorNodes) return
      const [startNode, endNode] = connectorNodes
      if (!startNode || !endNode) return

      const connectorId = uuidV4()
      const connector: Connector = {
        id: connectorId,
        startNode,
        endNode,
      }

      addConnector(connector)

      return () => {
        removeConnector(connectorId)
      }
    })

    return () => {
      removeConnectors.forEach((remove) => remove?.())
    }
  }, [parentExitConnectorRef?.current])

  return (
    <div
      className={cn(
        `flex justify-start gap-4 items-center`,
        reversedTree ? "flex-col-reverse" : "flex-col",
      )}
    >
      <div className="relative w-full">
        {node.type === "cluster" ? (
          <>
            <ConnectorAnchor
              ref={reversedTree ? exitConnectorRef : entryConnectorRef}
              className={cn(
                "top-0 -translate-x-1/2 -translate-y-1/2",
                reversedTree ? "bg-red-500" : "bg-blue-500",
              )}
            />
            <ConnectorAnchor
              ref={reversedTree ? entryConnectorRef : exitConnectorRef}
              className={cn(
                "bottom-0 -translate-x-1/2 translate-y-1/2",
                reversedTree ? "bg-blue-500" : "bg-red-500",
              )}
            />
            <div className="flex space-x-4 p-4">
              {node.children?.map((child) => (
                <SkillNodeComponent
                  key={child.id}
                  node={child}
                  parentExitConnectorRef={entryConnectorRef}
                  clusterRootExitConnectorRef={exitConnectorRef}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-start rounded border">
            <div className="relative">
              <ConnectorAnchor
                ref={reversedTree ? exitConnectorRef : entryConnectorRef}
                className={cn(
                  "top-0 left-8 transform -translate-x-1/2 -translate-y-1/2",
                  reversedTree ? "bg-red-500" : "bg-blue-500",
                )}
              />
              <ConnectorAnchor
                ref={reversedTree ? entryConnectorRef : exitConnectorRef}
                className={cn(
                  "bottom-0 left-8 transform -translate-x-1/2 translate-y-1/2",
                  reversedTree ? "bg-blue-500" : "bg-red-500",
                )}
              />
              <SkillNodeBadge
                node={node}
                size={node.type === "primary" ? 64 : 32}
              />
            </div>
            <p className="flex flex-col">
              <span
                className={cn({
                  "text-yellow-500 font-semibold text-lg":
                    node.type === "primary",
                  "text-blue-500": node.type === "secondary",
                })}
              >
                {node.title}
              </span>
              {node.type === "primary" && node.description && (
                <span className="text-sm">{node.description}</span>
              )}
            </p>
          </div>
        )}
      </div>
      {Array.isArray(node.next) && (
        <div className="flex space-x-4">
          {node.next.map((child) => (
            <SkillNodeComponent
              key={child.id}
              node={child}
              parentExitConnectorRef={exitConnectorRef}
              clusterRootExitConnectorRef={clusterRootExitConnectorRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const SkillTreeDisplay = () => {
  const roots = useSkillTreeStore((state) => state.roots)

  return (
    <div className="flex z-0">
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
