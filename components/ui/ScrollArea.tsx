import * as React from "react"

export const ScrollArea = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={`overflow-auto ${className || ""}`}>
        {children}
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"
