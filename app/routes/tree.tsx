import { t } from "@lingui/macro"
import { createFileRoute } from "@tanstack/react-router"

import { SkillTree } from "@/features/skill-tree/components/SkillTree"
import type { SkillTreePublicState } from "@/features/skill-tree/components/SkillTreeProvider"

export const Route = createFileRoute("/tree")({
  loader: () => {
    const tree: Partial<SkillTreePublicState> = {
      roots: [
        {
          id: "basic-forms-cluster",
          type: "cluster",
          children: [
            {
              id: "basic-forms",
              title: t`Basic Forms`,
              type: "primary",
              next: [
                {
                  id: "lines",
                  title: t`Lines`,
                  type: "secondary",
                  next: [
                    {
                      id: "shapes",
                      title: t`Shapes`,
                      type: "secondary",
                      next: [
                        {
                          id: "volumes",
                          title: t`Volumes`,
                          type: "secondary",
                          next: "exit-cluster",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          next: [
            {
              type: "cluster",
              id: "construction-perpective-cluster",
              children: [
                {
                  type: "primary",
                  id: "construction",
                  title: t`Construction`,
                  description: t`Deconstruct any object into basic forms`,
                  next: "exit-cluster",
                },
                {
                  type: "primary",
                  id: "perspective",
                  title: t`Perspective`,
                  next: [
                    {
                      type: "secondary",
                      id: "horizon-line",
                      title: t`Horizon Line`,
                      next: [
                        {
                          type: "secondary",
                          id: "1-2-3-point-perspective",
                          title: t`1, 2, 3 Point Perspective`,
                          next: "exit-cluster",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      reversed: true,
    }

    return { tree }
  },
  component: Tree,
})

function Tree() {
  const { tree } = Route.useLoaderData()

  return <SkillTree initState={tree} />
}
