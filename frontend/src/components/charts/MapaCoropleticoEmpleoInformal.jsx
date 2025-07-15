import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';

/**
 * Componente para visualizar un mapa coroplético de tasa de empleo informal por país en Sudamérica
 */
const MapaCoropleticoEmpleoInformal = ({ data, loading = false, error = null }) => {
  const [selectedYear, setSelectedYear] = useState(2024);

  // Mapeo mejorado de nombres de países del CSV a códigos ISO-3
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

  // Nombres simplificados para mostrar
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

  // Procesar datos para el año seleccionado con mejor información
  const mapData = useMemo(() => {
    if (!data || data.length === 0) return { locations: [], z: [], text: [], customdata: [] };

    const yearData = data.filter(row => row.year === selectedYear);
    
    const locations = [];
    const values = [];
    const hoverText = [];
    const customData = [];

    yearData.forEach(row => {
      const countryCode = countryMapping[row.country];
      const displayName = countryDisplayNames[row.country] || row.country;
      
      if (countryCode) {
        locations.push(countryCode);
        values.push(row.value);
        
        // Categorizar el nivel de informalidad
        let categoria = '';
        let emoji = '';
        if (row.value >= 70) {
          categoria = 'Muy Alta';
          emoji = '🔴';
        } else if (row.value >= 50) {
          categoria = 'Alta';
          emoji = '🟠';
        } else if (row.value >= 30) {
          categoria = 'Moderada';
          emoji = '🟡';
        } else {
          categoria = 'Baja';
          emoji = '🟢';
        }
        
        hoverText.push(
          `<b>${displayName}</b><br>` +
          `Año: ${row.year}<br>` +
          `Tasa de empleo informal: <b>${row.value.toFixed(1)}%</b><br>` +
          `Nivel: ${emoji} ${categoria}<br>` +
          `<i>Haz clic para más detalles</i>`
        );
        
        customData.push({
          country: displayName,
          value: row.value,
          year: row.year,
          categoria: categoria
        });
      }
    });

    return {
      locations,
      z: values,
      text: hoverText,
      customdata: customData
    };
  }, [data, selectedYear]);

  // Calcular estadísticas para el contexto
  const stats = useMemo(() => {
    if (mapData.z.length === 0) return null;
    
    const values = mapData.z;
    const promedio = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maximo = Math.max(...values);
    const minimo = Math.min(...values);
    
    return {
      promedio: promedio.toFixed(1),
      maximo: maximo.toFixed(1),
      minimo: minimo.toFixed(1),
      paises: values.length
    };
  }, [mapData]);

  // Configuración mejorada del gráfico
  const plotData = [{
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: mapData.locations,
    z: mapData.z,
    text: mapData.text,
    customdata: mapData.customdata,
    hovertemplate: '%{text}<extra></extra>',
    colorscale: [
      [0, '#065f46'],      // Verde muy oscuro (0-20%)
      [0.2, '#059669'],    // Verde (20-40%)
      [0.4, '#10b981'],    // Verde claro (40-50%)
      [0.5, '#fbbf24'],    // Amarillo (50-60%)
      [0.6, '#f59e0b'],    // Naranja claro (60-70%)
      [0.8, '#ea580c'],    // Naranja (70-80%)
      [1, '#dc2626']       // Rojo (80-100%)
    ],
    colorbar: {
      title: {
        text: '<b>Tasa de Empleo Informal (%)</b>',
        font: { size: 14, family: 'Inter, Arial, sans-serif' }
      },
      ticksuffix: '%',
      thickness: 20,
      len: 0.8,
      x: 1.02,
      tickfont: { size: 12 },
      tickvals: [0, 20, 40, 60, 80, 100],
      ticktext: ['0%', '20%', '40%', '60%', '80%', '100%']
    },
    zmin: 0,
    zmax: 100,
    showscale: true
  }];

  const layout = {
    title: {
      text: `<b>Tasa de Empleo Informal por País - Sudamérica (${selectedYear})</b><br><span style="font-size: 12px; color: #666;">Porcentaje de trabajadores en empleos informales</span>`,
      font: { size: 18, family: 'Inter, Arial, sans-serif', color: '#1e293b' },
      x: 0.5,
      xanchor: 'center',
      y: 0.95
    },
    geo: {
      scope: 'south america',
      projection: { 
        type: 'mercator',
        scale: 1.2
      },
      showframe: true,
      framecolor: '#e2e8f0',
      framewidth: 2,
      showcoastlines: true,
      coastlinecolor: '#64748b',
      coastlinewidth: 1,
      showland: true,
      landcolor: '#f8fafc',
      showocean: true,
      oceancolor: '#dbeafe',
      showcountries: true,
      countrycolor: '#94a3b8',
      countrywidth: 1.5,
      bgcolor: '#f1f5f9'
    },
    margin: { t: 80, b: 60, l: 60, r: 120 },
    height: 600,
    font: { family: 'Inter, Arial, sans-serif', size: 12 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white'
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    responsive: true,
    toImageButtonOptions: {
      format: 'png',
      filename: `mapa_empleo_informal_sudamerica_${selectedYear}`,
      height: 600,
      width: 1000,
      scale: 2
    }
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
      <div className="chart-container">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-xl mb-2">📊</div>
            <p className="text-gray-600">No hay datos de empleo informal disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Header mejorado */}
      <div className="chart-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="chart-title">
              🗺️ Mapa de Empleo Informal en Sudamérica
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualización interactiva de la tasa de empleo informal por país
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="year-selector" className="text-sm font-medium text-gray-700">
                📅 Año:
              </label>
              <select
                id="year-selector"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-select min-w-[100px]"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas contextuales */}
      {stats && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-3">📈 Estadísticas del {selectedYear}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-blue-600">{stats.promedio}%</div>
              <div className="text-gray-600">Promedio Regional</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-red-600">{stats.maximo}%</div>
              <div className="text-gray-600">Máximo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">{stats.minimo}%</div>
              <div className="text-gray-600">Mínimo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-purple-600">{stats.paises}</div>
              <div className="text-gray-600">Países</div>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda de interpretación */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-3">🎯 Guía de Interpretación</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span><strong>0-30%:</strong> Baja informalidad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span><strong>30-50%:</strong> Moderada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span><strong>50-70%:</strong> Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span><strong>70%+:</strong> Muy alta</span>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '600px' }}
          useResizeHandler={true}
        />
      </div>

      {/* Información adicional mejorada */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="text-sm text-blue-800 space-y-2">
          <div className="font-semibold mb-2">ℹ️ Información del Mapa:</div>
          <div className="grid md:grid-cols-2 gap-2">
            <div>• <strong>Colores más oscuros:</strong> Mayor tasa de empleo informal</div>
            <div>• <strong>Colores más claros:</strong> Menor tasa de empleo informal</div>
            <div>• <strong>Datos:</strong> Solo población total, sin distinción de sexo</div>
            <div>• <strong>Fuente:</strong> ILO-STATISTICS - Procesamiento de microdatos</div>
          </div>
          <div className="mt-3 p-2 bg-white rounded border border-blue-300">
            <strong>💡 Tip:</strong> Pasa el cursor sobre cada país para ver información detallada. 
            El empleo informal incluye trabajadores sin protección social formal.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaCoropleticoEmpleoInformal;
