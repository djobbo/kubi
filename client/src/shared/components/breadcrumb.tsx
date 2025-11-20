import { Atom, useAtomValue } from '@effect-atom/atom-react'
import { createPortal } from 'react-dom'

export const breadCrumbContainerAtom = Atom.make<HTMLElement | null>(null)

export const Breadcrumb = ({ children }: { children: React.ReactNode }) => {
  const breadCrumbContainer = useAtomValue(breadCrumbContainerAtom)
  if (!breadCrumbContainer) return null

  return createPortal(children, breadCrumbContainer)
}
