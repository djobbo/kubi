import { cx } from '@dair/common/src/helpers/ui.ts'
import { grain } from './grain.css.ts'

export const Grain = () => {
  return (
    <div
      className={cx(grain, 'fixed inset-0 w-full h-full pointer-events-none')}
    />
  )
}
