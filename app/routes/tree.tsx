import { createFileRoute } from "@tanstack/react-router"

import { SkillTree } from "@/features/skill-tree/components/SkillTree"
import type { SkillTreePublicState } from "@/features/skill-tree/components/SkillTreeProvider"

export const Route = createFileRoute("/tree")({
  loader: () => {
    const tree: Partial<SkillTreePublicState> = {
      roots: [
        {
          id: "basic-forms",
          title: "Basic Forms",
          type: "main",
          children: [
            {
              id: "basic-forms-volumes",
              title: "Volumes",
              type: "secondary",
            },
          ],
        },
      ],
      reversed: false,
    }

    return { tree }
  },
  component: Tree,
})

function Tree() {
  const { tree } = Route.useLoaderData()

  return <SkillTree initState={tree} />
}
