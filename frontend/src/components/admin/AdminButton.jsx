export default function AdminButton({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-secondary text-white hover:opacity-90',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    accent: 'bg-accent text-primary font-semibold hover:opacity-90',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }
  return (
    <button
      className={`rounded-lg font-medium transition-all disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
