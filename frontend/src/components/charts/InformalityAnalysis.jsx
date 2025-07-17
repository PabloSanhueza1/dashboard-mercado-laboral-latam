import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { HiOutlineInformationCircle, HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineGlobe, HiOutlineCollection, HiOutlineCalendar } from 'react-icons/hi';
import { StatCard } from '../estadisticas/ResumenEstadisticas';
// Mapeo de nombres para mostrar igual que el coroplético
const countryDisplayNames = {
  'Argentina': 'Argentina',
  'Bolivia (Plurinational State of)': 'Bolivia',
  'Brazil': 'Brasil',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Ecuador': 'Ecuador',
  'Guyana': 'Guyana',
  'Paraguay': 'Paraguay',
  'Peru': 'Perú',
  'Suriname': 'Suriname',
  'Uruguay': 'Uruguay',
  'Venezuela (Bolivarian Republic of)': 'Venezuela'
};

const csvPath = '/dataset/tasa_empleo_informal_por_sexo_sudamerica.csv';

const InformalityAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [csvData, setCsvData] = useState([]);

  // Cargar CSV al montar
  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (result) => {
        setCsvData(result.data);
      }
    });
  }, []);

  // Obtener años disponibles
  const availableYears = useMemo(() => {
    if (!csvData || csvData.length === 0) return [];
    const years = [...new Set(csvData.map(row => row.time))].sort((a, b) => b - a);
    return years;
  }, [csvData]);

  // Procesar datos para gráficos
  const processedData = useMemo(() => {
    if (!csvData || csvData.length === 0) return [];
    // Filtrar por año y países conocidos
    const yearData = csvData.filter(d =>
      d.time === selectedYear &&
      Object.keys(countryDisplayNames).includes(d['ref_area.label'])
    );
    // Agrupar por país
    const grouped = {};
    yearData.forEach(item => {
      const country = countryDisplayNames[item['ref_area.label']];
      if (!grouped[country]) grouped[country] = { country };
      grouped[country][item['sex.label']] = parseFloat(item.obs_value);
    });
    return Object.values(grouped);
  }, [csvData, selectedYear]);

  // Datos para comparación de brechas de género
  const genderGapData = useMemo(() => {
    return processedData.map(item => ({
      country: item.country,
      Male: item.Male || 0,
      Female: item.Female || 0,
      gap: (item.Female || 0) - (item.Male || 0)
    }));
  }, [processedData]);

  // Métricas clave adaptadas al estilo del mapa coroplético
  const stats = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    const totalValues = processedData.map(d => d.Total || 0);
    const promedio = totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length;
    const maximo = Math.max(...totalValues);
    const minimo = Math.min(...totalValues);
    return {
      paises: processedData.length,
      promedio: promedio.toFixed(1),
      maximo: maximo.toFixed(1),
      minimo: minimo.toFixed(1),
      año: selectedYear
    };
  }, [processedData, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header y controles */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Análisis de Informalidad Laboral por Sexo
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            {/* Slider de año con diseño DotPlot */}
            {availableYears.length > 0 && (
              <div className="flex flex-col items-center w-full">
                <label className="text-xs text-gray-500 mb-2">
                  Año: <span className="font-semibold text-blue-700">{selectedYear}</span>
                </label>                <div className="flex items-center w-96 max-w-full">
                  <span className="text-xs text-gray-400 mr-2">{availableYears[0]}</span>
                  <input
                    type="range"
                    min={0}
                    max={availableYears.length - 1}
                    value={availableYears.indexOf(selectedYear)}
                    onChange={e => setSelectedYear(availableYears[parseInt(e.target.value)])}
                    className="w-full h-3 accent-blue-600"
                    style={{
                      appearance: "none",
                      background: "linear-gradient(90deg,#e0e7ff 0%,#2563eb 100%)",
                      borderRadius: "999px",
                      outline: "none",
                      boxShadow: "0 1px 4px rgba(37,99,235,0.10)",
                    }}
                  />
                    <span className="text-xs text-gray-400 ml-2">{availableYears[availableYears.length - 1]}</span>
                </div>
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: #2563eb;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.15);
                    border: 2px solid #fff;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  input[type="range"]:focus::-webkit-slider-thumb {
                    background: #1e40af;
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: #2563eb;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.15);
                    border: 2px solid #fff;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  input[type="range"]:focus::-moz-range-thumb {
                    background: #1e40af;
                  }
                  input[type="range"]::-ms-thumb {
                    width: 18px;
                    height: 18px;
                    background: #2563eb;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.15);
                    border: 2px solid #fff;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  input[type="range"]:focus::-ms-thumb {
                    background: #1e40af;
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas clave estilo mapacoropletico */}
      {stats && (
        <div className="stats-grid grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Países Analizados"
            value={stats.paises}
            icon={HiOutlineGlobe}
            color="blue"
          />
          <StatCard
            title="Promedio Regional"
            value={`${stats.promedio}%`}
            icon={HiOutlineTrendingUp}
            color="green"
          />
          <StatCard
            title="Máximo"
            value={`${stats.maximo}%`}
            icon={HiOutlineChartBar}
            color="purple"
          />
          <StatCard
            title="Mínimo"
            value={`${stats.minimo}%`}
            icon={HiOutlineCollection}
            color="orange"
          />
          <StatCard
            title="Año"
            value={stats.año}
            icon={HiOutlineCalendar}
            color="indigo"
          />
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparación por sexo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informalidad por Sexo ({selectedYear})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value?.toFixed(1)}%`, 'Tasa de Informalidad']} />
              <Legend />
              <Bar dataKey="Male" fill="#3B82F6" name="Hombres" />
              <Bar dataKey="Female" fill="#EF4444" name="Mujeres" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Brecha de género */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Brecha de Género en Informalidad
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderGapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value?.toFixed(1)}%`, 'Diferencia']} />
              <Bar
                dataKey="gap"
                fill="#F59E0B"
                name="Diferencia (F-M)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InformalityAnalysis;
