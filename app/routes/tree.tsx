import { createFileRoute } from "@tanstack/react-router"

import type { SkillNode } from "@/features/skill-tree/components/SkillTree"
import { SkillTree } from "@/features/skill-tree/components/SkillTree"

export const Route = createFileRoute("/tree")({
  loader: () => {
    const tree: SkillNode[] = [
      {
        id: "1",
        title: "Construction",
        type: "main",
        children: [
          {
            id: "2",
            title: "Volumes",
            type: "main",
            children: [
              {
                id: "3",
                title: "Shapes",
                type: "main",
                children: [{ id: "4", title: "Lines", type: "main" }],
              },
            ],
          },
          {
            id: "5",
            title: "Perspective",
            type: "secondary",
            children: [
              { id: "6", title: "1, 2 and 3 Points", type: "secondary" },
              { id: "7", title: "Horizon Line", type: "secondary" },
              { id: "8", title: "4+ Points", type: "secondary" },
            ],
          },
        ],
      },
    ]

    return { tree }
  },
  component: Tree,
})

function Tree() {
  const { tree } = Route.useLoaderData()

  return (
    <div>
      <SkillTree rootNodes={tree} />
    </div>
  )
}
