import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base touch-manipulation shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-500 active:bg-teal-900 disabled:bg-slate-300",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 active:bg-slate-300 disabled:bg-slate-100",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400 active:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

