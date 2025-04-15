import { useId } from "react"
import ReactSelect from "react-select"

import { cn } from "@/ui/lib/utils"
import { colors } from "@/ui/theme"

interface SelectOption<T> {
  value: T
  label: string
}

interface SelectProps<T> {
  onChange?: (value: T) => void
  onInputChange?: (value: string) => void
  options: SelectOption<T>[]
  placeholder?: string
  value: T
  className?: string
  label?: string
}

export const Select = <T extends string>({
  onChange,
  options,
  value,
  className,
  label,
}: SelectProps<T>) => {
  const selectId = useId()
  const handleChange = (value: SelectOption<T> | null) => {
    if (!value) return
    onChange?.(value.value)
  }

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="relative sm:absolute inline-block sm:block text-sm font-medium text-muted-foreground sm:left-0 sm:-top-[1.75rem]"
        >
          {label}
        </label>
      )}
      <ReactSelect<{ value: T; label: string }>
        id={selectId}
        value={options.find((option) => option.value === value)}
        onChange={handleChange}
        options={options}
        className="flex-1"
        styles={{
          singleValue: (styles) => ({
            ...styles,
            color: colors.foreground.toString(),
          }),
          control: (styles) => ({
            ...styles,
            color: colors.foreground.toString(),
            backgroundColor: colors.secondary.toString(),
            borderRadius: "0.5rem",
            // eslint-disable-next-line lingui/no-unlocalized-strings
            border: `thin solid ${colors.border}`,
            cursor: "pointer",
            // eslint-disable-next-line lingui/no-unlocalized-strings
            padding: "0.25rem 0.5rem",
          }),
          menu: (styles) => ({
            ...styles,
            backgroundColor: colors.border.toString(),
          }),
          option: (styles) => ({
            ...styles,
            color: colors.foreground.toString(),
            backgroundColor: colors.border.toString(),
            cursor: "pointer",
            ":hover": {
              backgroundColor: colors.background.toString(),
            },
          }),
        }}
      />
    </div>
  )
}
