"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    // Sync hasValue state with actual input content
    React.useEffect(() => {
      const val = props.value !== undefined ? props.value : props.defaultValue;
      setHasValue(val !== undefined && val !== null && val !== "");
    }, [props.value, props.defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value !== "");
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative w-full">
        <input
          type={inputType}
          ref={ref}
          onChange={handleChange}
          className={cn(
            "peer w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-[#1A1A1A] transition-all duration-200",
            "placeholder-transparent",
            "focus:outline-none focus:ring-0",
            error
              ? "border-destructive focus:border-destructive"
              : "border-[rgba(0,0,0,0.12)] focus:border-[#1A1A1A]",
            label ? "pt-5 pb-2" : "py-3",
            isPasswordType ? "pr-10" : "",
            className
          )}
          placeholder={label || props.placeholder || " "}
          {...props}
        />
        {label && (
          <label
            className={cn(
              "pointer-events-none absolute left-4 origin-top-left select-none font-medium transition-all duration-200",
              hasValue
                ? "top-1.5 text-[10px] uppercase tracking-[0.08em] font-semibold text-[#6B6B6B]"
                : "top-3.5 text-[15px] text-[#9CA3AF] peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.08em] peer-focus:font-semibold peer-focus:text-[#6B6B6B] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.08em] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-[#6B6B6B]",
              error ? "text-destructive" : ""
            )}
          >
            {label}
          </label>
        )}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[18px] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
