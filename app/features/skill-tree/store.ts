import { create } from "zustand"

import type { Connector } from "@/features/skill-tree/components/Connectors"

interface SkillTreeState {
  connectors: Connector[]
  addConnector: (connector: Connector) => void
  removeConnector: (connectorId: string) => void
  reversed: boolean
}

export const useSkillTreeStore = create<SkillTreeState>()((set) => ({
  connectors: [],
  addConnector: (connector) => {
    set((state) => ({ connectors: [...state.connectors, connector] }))
  },
  removeConnector: (connectorId) => {
    set((state) => ({
      connectors: state.connectors.filter((c) => c.id !== connectorId),
    }))
  },
  reversed: false,
}))
