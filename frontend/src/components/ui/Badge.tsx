import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'normal' | 'warning' | 'critical' | 'info'
  children: React.ReactNode
}

export function Badge({ variant = 'info', children, className, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    normal:   'bg-green-100 text-green-800',
    warning:  'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    info:     'bg-blue-100 text-blue-800',
  }
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.info} ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  )
}
