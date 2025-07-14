import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`bg-${color}-100 p-3 rounded-full`}>
        <Icon size={24} className={`text-${color}-500`} />
      </div>
    </div>
  </div>
);

export default StatCard;
