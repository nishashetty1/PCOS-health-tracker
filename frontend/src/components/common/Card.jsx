import React from 'react';

const Card = ({ children, title, className = '', ...rest }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      {...rest}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;