import React from 'react';
import { 
  HiOutlineSparkles, HiOutlineUserGroup, HiOutlineAcademicCap, 
  HiOutlineClock, HiOutlineCollection 
} from 'react-icons/hi';

const FiltrosAvanzados = ({
  selectedSex,
  setSelectedSex,
  selectedAgeGroup,
  setSelectedAgeGroup,
  selectedYearRange,
  setSelectedYearRange,
  activeCharts,
  setActiveCharts,
  availableSexOptions,
  availableAgeGroups,
  availableYears,
  activeDataset
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-6">
        <HiOutlineSparkles className="mr-2" />
        Filtros Avanzados
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Filtro de Sexo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <HiOutlineUserGroup className="mr-2" />
            Sexo
          </label>
          <select
            value={selectedSex}
            onChange={(e) => setSelectedSex(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableSexOptions.map(sex => (
              <option key={sex} value={sex}>{sex}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Grupo de Edad */}
        {activeDataset !== 'salary' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <HiOutlineAcademicCap className="mr-2" />
              Grupo de Edad
            </label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableAgeGroups.map(age => (
                <option key={age} value={age}>
                  {age.replace('Age (Youth, adults): ', '')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro de Rango de Años */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <HiOutlineClock className="mr-2" />
            Rango de Años
          </label>
          <div className="flex gap-2">
            <select
              value={selectedYearRange[0]}
              onChange={(e) => setSelectedYearRange([parseInt(e.target.value), selectedYearRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="self-center text-gray-500">-</span>
            <select
              value={selectedYearRange[1]}
              onChange={(e) => setSelectedYearRange([selectedYearRange[0], parseInt(e.target.value)])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Gráficos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <HiOutlineCollection className="mr-2" />
            Gráficos a Mostrar
          </label>
          <div className="space-y-2">
            {Object.entries({
              timeSeries: 'Series Temporales',
              comparison: 'Comparación',
              distribution: 'Distribución',
              scatter: 'Correlación',
              radar: 'Radar'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={activeCharts[key]}
                  onChange={(e) => setActiveCharts(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosAvanzados;
