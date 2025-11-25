import React from 'react';
import { cn } from '../../utils/cn';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <div className={cn("inline-flex h-12 items-center justify-center rounded-lg bg-slate-950 p-1 text-slate-400 w-full mb-6 border border-slate-800", className)}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  currentValue?: string; // Injected by parent
  onValueChange?: (value: string) => void; // Injected by parent
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, currentValue, onValueChange, className }) => {
  const isActive = currentValue === value;
  return (
    <button
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-slate-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full h-full",
        isActive ? "bg-slate-800 text-blue-400 shadow-sm" : "hover:bg-slate-800/50 hover:text-slate-100",
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  currentValue?: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, currentValue, children, className }) => {
  if (value !== currentValue) return null;
  return <div className={cn("mt-2 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 animate-in fade-in-50 zoom-in-95 duration-200", className)}>{children}</div>;
};

// Wrapper to inject props
const TabsWrapper: React.FC<any> = ({ children, value, onValueChange }) => {
   return React.Children.map(children, child => {
     if (React.isValidElement(child)) {
        const element = child as React.ReactElement;
        if (element.type === TabsList) {
             return React.cloneElement(element, {
                 children: React.Children.map((element.props as any).children, trigger => {
                     if (React.isValidElement(trigger)) {
                         return React.cloneElement(trigger, { currentValue: value, onValueChange } as any);
                     }
                     return trigger;
                 })
             } as any);
        }
        if (element.type === TabsContent) {
            return React.cloneElement(element, { currentValue: value } as any);
        }
     }
     return child;
   });
}

// Override Main Tabs with Wrapper logic
export const TabsContainer: React.FC<TabsProps> = (props) => {
    return (
        <div className={props.className}>
            <TabsWrapper {...props} />
        </div>
    )
}