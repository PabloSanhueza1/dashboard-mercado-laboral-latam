import React from 'react';
import { HiOutlineChartBar } from 'react-icons/hi';

const SelectorDataset = ({ 
  datasetsWithIcons, 
  activeDataset, 
  setActiveDataset 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
        <HiOutlineChartBar className="mr-2" />
        Selecciona el Indicador a Visualizar
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(datasetsWithIcons).map(([key, dataset]) => {
          const IconComponent = dataset.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveDataset(key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activeDataset === key
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <IconComponent 
                size={24} 
                className={`mx-auto mb-2 ${
                  activeDataset === key ? 'text-blue-600' : 'text-gray-400'
                }`} 
              />
              <p className={`text-sm font-medium ${
                activeDataset === key ? 'text-blue-900' : 'text-gray-700'
              }`}>
                {dataset.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorDataset;
