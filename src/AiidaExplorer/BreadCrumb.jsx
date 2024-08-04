import React from 'react';

const Breadcrumbs = ({ breadcrumbs, handleBreadcrumbClick }) => {
  return (
    <div className="absolute top-4 left-4 flex space-x-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-4 h-4 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className={`relative text-white px-4 py-2 rounded-lg font-semibold ${
              index % 2 === 0 ? 'bg-purple-300' : 'bg-blue-500'
            }`}
            style={{
              clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 10% 50%)',
            }}
          >
            {breadcrumb.label || 'Node'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
