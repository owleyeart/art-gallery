export default function FormField({ label, error, children, hint }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-y min-h-[80px] ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function ColorInput({ label, value, onChange, name }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        name={name}
        value={value || '#000000'}
        onChange={onChange}
        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
      />
      <div className="flex-1">
        <Input
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
