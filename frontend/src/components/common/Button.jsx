import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium', 
  className = '',
  disabled = false,
  loading = false,
  ...rest 
}) => {
  const baseClasses = "inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out";
  
  const variantClasses = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white border-transparent focus:ring-purple-500 disabled:bg-purple-300",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-purple-500 disabled:text-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500 disabled:bg-red-300",
  };
  
  const sizeClasses = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-70' : ''}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;