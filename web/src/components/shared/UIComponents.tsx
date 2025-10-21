// Shared UI components and utilities for common patterns

import React from 'react';

// Common form field classes
export const INPUT_CLASSES = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
export const SELECT_CLASSES = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
export const TEXTAREA_CLASSES = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
export const LABEL_CLASSES = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

// Common button classes
export const PRIMARY_BUTTON_CLASSES = "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium";
export const SECONDARY_BUTTON_CLASSES = "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400";
export const DANGER_BUTTON_CLASSES = "text-red-600 hover:text-red-800";

// Common section container
export const FORM_SECTION_CLASSES = "bg-gray-50 p-4 rounded-lg";

// Access Denied Component
interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = "You don't have permission to access this page." }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// Page Title Component
interface PageTitleProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// Form Field Component
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, children, className = "" }: FormFieldProps) {
  return (
    <div className={className}>
      <label className={LABEL_CLASSES}>{label}</label>
      {children}
    </div>
  );
}

// Form Section Component
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className={FORM_SECTION_CLASSES}>
      <h4 className="text-md font-medium text-gray-900 mb-4">{title}</h4>
      {children}
    </div>
  );
}