import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';

/**
 * Componente para visualizar un mapa coroplético de tasa de empleo informal por país en Sudamérica
 */
const MapaCoropleticoEmpleoInformal = ({ data, loading = false, error = null }) => {
  const [selectedYear, setSelectedYear] = useState(2024);

  // Mapeo de nombres de países del CSV a códigos ISO-3
  const countryMapping = {
    'Argentina': 'ARG',
    'Bolivia (Plurinational State of)': 'BOL',
    'Brazil': 'BRA',
    'Chile': 'CHL',
    'Colombia': 'COL',
    'Ecuador': 'ECU',
    'Guyana': 'GUY',
    'Paraguay': 'PRY',
    'Peru': 'PER',
    'Suriname': 'SUR',
    'Uruguay': 'URY',
    'Venezuela (Bolivarian Republic of)': 'VEN'
  };

  // Obtener años disponibles
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = [...new Set(data.map(row => row.year))].sort((a, b) => b - a);
    return years;
  }, [data]);

  // Actualizar año seleccionado cuando cambien los datos
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Procesar datos para el año seleccionado
  const mapData = useMemo(() => {
    if (!data || data.length === 0) return { locations: [], z: [], text: [] };

    const yearData = data.filter(row => row.year === selectedYear);
    
    const locations = [];
    const values = [];
    const hoverText = [];

    yearData.forEach(row => {
      const countryCode = countryMapping[row.country];
      if (countryCode) {
        locations.push(countryCode);
        values.push(row.value);
        hoverText.push(`${row.country}<br>Año: ${row.year}<br>Tasa de empleo informal: ${row.value.toFixed(1)}%`);
      }
    });

    return {
      locations,
      z: values,
      text: hoverText
    };
  }, [data, selectedYear]);

  // Configuración del gráfico
  const plotData = [{
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: mapData.locations,
    z: mapData.z,
    text: mapData.text,
    hovertemplate: '%{text}<extra></extra>',
    colorscale: [
      [0, '#22c55e'],      // Verde (baja informalidad)
      [0.3, '#84cc16'],    // Verde lima
      [0.5, '#eab308'],    // Amarillo
      [0.7, '#f97316'],    // Naranja
      [1, '#ef4444']       // Rojo (alta informalidad)
    ],
    colorbar: {
      title: {
        text: 'Tasa de empleo informal (%)',
        font: { size: 12 }
      },
      ticksuffix: '%',
      thickness: 15,
      len: 0.7
    },
    zmin: 0,
    zmax: 100
  }];

  const layout = {
    title: {
      text: `Tasa de empleo informal por país en Sudamérica (${selectedYear})`,
      font: { size: 16, family: 'Arial, sans-serif' },
      x: 0.5,
      xanchor: 'center'
    },
    geo: {
      scope: 'south america',
      projection: { type: 'natural earth' },
      showframe: false,
      showcoastlines: true,
      coastlinecolor: '#ddd',
      showland: true,
      landcolor: '#f5f5f5',
      showocean: true,
      oceancolor: '#e6f3ff',
      showcountries: true,
      countrycolor: '#999',
      countrywidth: 0.5
    },
    margin: { t: 60, b: 20, l: 20, r: 20 },
    height: 500,
    font: { family: 'Arial, sans-serif' }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa de empleo informal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-700">Error al cargar los datos del mapa</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-2">📊</div>
          <p className="text-gray-600">No hay datos de empleo informal disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Control del año */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Mapa de Empleo Informal en Sudamérica
          </h3>
          <div className="flex items-center gap-2">
            <label htmlFor="year-selector" className="text-sm font-medium text-gray-700">
              Año:
            </label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="p-4">
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
        />
      </div>

      {/* Información adicional */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>Verde: Baja tasa de empleo informal (menor informalidad)</p>
          <p>• <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span>Rojo: Alta tasa de empleo informal (mayor informalidad)</p>
          <p>• Los datos muestran únicamente el total sin distinción de sexo</p>
          <p>• Fuente: ILO-STATISTICS - Procesamiento de microdatos</p>
        </div>
      </div>
    </div>
  );
};

export default MapaCoropleticoEmpleoInformal;
