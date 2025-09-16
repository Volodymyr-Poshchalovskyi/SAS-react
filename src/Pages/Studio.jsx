// src/pages/Studio.js

import React, { useState } from 'react';
import TableTop from './TableTop';
import PostHouse from './PostHouse';

const studioData = {
  options: {
    'TABLE TOP STUDIO': 'TABLE TOP DIVISION',
    'POST HOUSE': 'POST HOUSE',
  },
};

const componentMap = {
  'TABLE TOP STUDIO': <TableTop />,
  'POST HOUSE': <PostHouse />,
};

export default function Studio() {
  const [activeOption, setActiveOption] = useState(
    Object.keys(studioData.options)[0]
  );

  const getTabClass = (option) => {
    const baseClasses = `bg-transparent border-b-2 py-4 px-12 text-xs font-semibold uppercase 
                         tracking-wider cursor-pointer transition-all duration-300`;
    if (activeOption === option) {
      return `${baseClasses} text-black border-black`;
    }
    return `${baseClasses} text-gray-400 border-transparent hover:text-black`;
  };

  return (
    <div className="bg-white text-black min-h-screen pt-36">
      <div className="text-center border-b border-gray-200">
        {Object.keys(studioData.options).map((option) => (
          <button
            key={option}
            onClick={() => setActiveOption(option)}
            className={getTabClass(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <main>{componentMap[activeOption]}</main>
    </div>
  );
}
