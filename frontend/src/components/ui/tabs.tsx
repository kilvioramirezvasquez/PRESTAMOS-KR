import React from 'react'

interface TabsContextValue {
  orientation: 'horizontal' | 'vertical'
  value?: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  orientation: 'horizontal'
})

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
    orientation?: 'horizontal' | 'vertical'
  }
>(({ className = '', value, onValueChange, orientation = 'horizontal', ...props }, ref) => (
  <TabsContext.Provider value={{ orientation, value, onValueChange }}>
    <div
      ref={ref}
      className={`w-full ${orientation === 'vertical' ? 'flex gap-4' : ''} ${className}`}
      {...props}
    />
  </TabsContext.Provider>
))
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
  const { orientation } = React.useContext(TabsContext)
  
  return (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600 ${
        orientation === 'vertical' ? 'h-auto flex-col gap-1 p-2' : ''
      } ${className}`}
      {...props}
    />
  )
})
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className = '', value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, orientation } = React.useContext(TabsContext)
  const isSelected = value === selectedValue

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? 'bg-white text-gray-900 shadow-sm'
          : 'hover:bg-gray-200 hover:text-gray-900'
      } ${orientation === 'vertical' ? 'w-full justify-start' : ''} ${className}`}
      onClick={() => onValueChange?.(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className = '', value, ...props }, ref) => {
  const { value: selectedValue } = React.useContext(TabsContext)
  
  if (value !== selectedValue) {
    return null
  }

  return (
    <div
      ref={ref}
      className={`mt-2 focus:outline-none ${className}`}
      {...props}
    />
  )
})
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }