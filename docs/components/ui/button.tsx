import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "./utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "default" | "small" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Base styles for all buttons
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    
    // Variant styles
    const variantStyles = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      outline: "btn-secondary", // outline is same as secondary
      ghost: "bg-transparent border-none text-rdio-primary hover:bg-gray-100 font-semibold uppercase text-sm tracking-wide"
    }
    
    // Size styles
    const sizeStyles = {
      default: "", // Primary/secondary classes handle default size
      small: "btn-small btn-small-primary", // Will be overridden by variant for secondary
      icon: "w-10 h-10 p-0 rounded-full"
    }
    
    // Override small size for secondary variants
    let finalClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    )
    
    // Special handling for small secondary buttons
    if (size === "small" && (variant === "secondary" || variant === "outline")) {
      finalClassName = cn(
        baseStyles,
        "btn-small btn-small-secondary",
        className
      )
    }
    
    return (
      <Comp
        className={finalClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }