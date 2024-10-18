import { t } from "@lingui/macro"
import type { ReactNode } from "react"
import { createContext, useContext, useRef } from "react"
import { useStore } from "zustand"
import { createStore } from "zustand/vanilla"

import type { Connector } from "@/features/skill-tree/components/Connectors"

import type { SkillNode } from "./SkillTree"

export interface SkillTreePublicState {
  roots: SkillNode[]
  reversed: boolean
}

interface SkillTreeInternalState {
  connectors: Connector[]
}

type SkillTreeState = SkillTreePublicState & SkillTreeInternalState

export interface SkillTreeActions {
  addConnector: (connector: Connector) => void
  removeConnector: (connectorId: string) => void
}

export type SkillTreeStore = SkillTreePublicState &
  SkillTreeInternalState &
  SkillTreeActions

const defaultInitState: SkillTreeState = {
  roots: [],
  connectors: [],
  reversed: false,
}

export const createSkillTreeStore = (
  initState?: Partial<SkillTreePublicState>,
) => {
  return createStore<SkillTreeStore>()((set) => ({
    ...defaultInitState,
    ...initState,
    addConnector: (connector) => {
      set((state) => ({ connectors: [...state.connectors, connector] }))
    },
    removeConnector: (connectorId) => {
      set((state) => ({
        connectors: state.connectors.filter((c) => c.id !== connectorId),
      }))
    },
  }))
}

export type SkillTreeStoreApi = ReturnType<typeof createSkillTreeStore>

export const SkillTreeStoreContext = createContext<SkillTreeStoreApi | null>(
  null,
)

export interface SkillTreeStoreProviderProps {
  children: ReactNode
  initState?: Partial<SkillTreePublicState>
}

export const SkillTreeStoreProvider = ({
  children,
  initState,
}: SkillTreeStoreProviderProps) => {
  const storeRef = useRef<SkillTreeStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createSkillTreeStore(initState)
  }

  return (
    <SkillTreeStoreContext.Provider value={storeRef.current}>
      {children}
    </SkillTreeStoreContext.Provider>
  )
}

export const useSkillTreeStore = <T,>(
  selector: (store: SkillTreeStore) => T,
): T => {
  const counterStoreContext = useContext(SkillTreeStoreContext)
  if (!counterStoreContext) {
    throw new Error(
      t`useSkillTreeStore must be used within SkillTreeStoreProvider`,
    )
  }

  return useStore(counterStoreContext, selector)
}
