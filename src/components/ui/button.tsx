import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#1A1A1A] text-white hover:bg-[#2D2D2D] shimmer-btn shadow-sm",
        primary:
          "bg-accent text-white hover:bg-blue-700 shimmer-btn shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-[rgba(0,0,0,0.12)] bg-white text-[#1A1A1A] hover:bg-[#F5F5F0] hover:border-[rgba(0,0,0,0.2)]",
        secondary:
          "bg-[#F5F5F0] text-[#1A1A1A] hover:bg-[#EDEDE8]",
        ghost: 
          "text-[#1A1A1A] hover:bg-[#F5F5F0]",
        link: 
          "text-accent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        xl: "h-14 px-10 text-base font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Convert regular button props to framer-motion props if we want whileTap
type MotionButtonProps = HTMLMotionProps<"button"> & ButtonProps;

const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // If asChild is true, we just render the slot without motion, to keep it simple for Radix components
    if (asChild) {
        return (
            <Slot
              className={cn(buttonVariants({ variant, size, className }))}
              ref={ref}
              {...(props as any)}
            />
          )
    }

    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
