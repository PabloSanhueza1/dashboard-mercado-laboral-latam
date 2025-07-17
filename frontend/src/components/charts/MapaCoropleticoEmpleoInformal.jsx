import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';
// Importar StatCard reutilizable
import { StatCard } from '../estadisticas/ResumenEstadisticas';
import { HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineGlobe, HiOutlineCollection, HiOutlineCalendar } from 'react-icons/hi';

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
    const years = [...new Set(data.map(row => row.year))].sort((a, b) => a - b);
    return years;
  }, [data]);

  // Actualizar año seleccionado cuando cambien los datos
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Procesar datos para todos los años disponibles
  const allMapData = useMemo(() => {
    if (!data || data.length === 0 || availableYears.length === 0) return [];

    return availableYears.map(year => {
      const yearData = data.filter(row => row.year === year);

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
            `Nivel: ${emoji} ${categoria}<br>`
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
        year,
        locations,
        z: values,
        text: hoverText,
        customdata: customData
      };
    });
  }, [data, availableYears]);

  // Datos del año actual seleccionado
  const currentYearData = useMemo(() => {
    return allMapData.find(item => item.year === selectedYear) ||
      { locations: [], z: [], text: [], customdata: [] };
  }, [allMapData, selectedYear]);

  // Calcular estadísticas para el contexto
  const stats = useMemo(() => {
    if (currentYearData.z.length === 0) return null;

    const values = currentYearData.z;
    const promedio = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maximo = Math.max(...values);
    const minimo = Math.min(...values);

    return {
      promedio: promedio.toFixed(1),
      maximo: maximo.toFixed(1),
      minimo: minimo.toFixed(1),
      paises: values.length
    };
  }, [currentYearData]);

  // Configuración mejorada del gráfico con slider
  const plotData = [{
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: currentYearData.locations,
    z: currentYearData.z,
    text: currentYearData.text,
    customdata: currentYearData.customdata,
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
      text: `<b>Tasa de Empleo Informal por País - Sudamérica (${selectedYear})</b><br><span style="font-size: 10px; color: #666;">Porcentaje de trabajadores en empleos informales</span>`,
      font: { size: 14, family: 'Inter, Arial, sans-serif', color: '#1e293b' },
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
    margin: { t: 60, b: 80, l: 40, r: 80 },
    height: 500,
    font: { family: 'Inter, Arial, sans-serif', size: 10 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    sliders: [{
      active: availableYears.indexOf(selectedYear),
      currentvalue: {
        visible: true,
        prefix: "Año: ",
        xanchor: "center",
        font: { size: 12, color: "#1e293b" }
      },
      steps: availableYears.map((year, index) => ({
        args: [
          {
            locations: [allMapData[index]?.locations || []],
            z: [allMapData[index]?.z || []],
            text: [allMapData[index]?.text || []],
            customdata: [allMapData[index]?.customdata || []]
          },
          {
            'title.text': `<b>Tasa de Empleo Informal por País - Sudamérica (${year})</b><br><span style="font-size: 10px; color: #666;">Porcentaje de trabajadores en empleos informales</span>`
          }
        ],
        label: year.toString(),
        method: "restyle",
        value: year
      })),
      pad: { t: 50 },
      len: 0.8,
      x: 0.1,
      xanchor: "left",
      y: 0,
      yanchor: "top",
      font: { size: 10 },
      ticklen: 0,
      borderwidth: 1,
      bordercolor: "#ccc",
      bgcolor: "#f8f9fa"
    }]
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
            <h3 className="text-lg font-semibold text-gray-900">
              🗺️ Mapa de Empleo Informal en Sudamérica
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualización de las tasas de empleo informal por país
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas contextuales con StatCard */}
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
            value={selectedYear}
            icon={HiOutlineCalendar}
            color="indigo"
          />
        </div>
      )}

      {/* Mapa con slider */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
          onUpdate={(figure, graphDiv) => {
            // Detectar cambios en el slider y actualizar el estado
            if (figure.layout && figure.layout.sliders && figure.layout.sliders[0]) {
              const activeStep = figure.layout.sliders[0].active;
              if (activeStep !== undefined && availableYears[activeStep]) {
                const newYear = availableYears[activeStep];
                if (newYear !== selectedYear) {
                  setSelectedYear(newYear);
                }
              }
            }
          }}
          onSliderChange={(data) => {
            if (data && data.slider && data.slider.value) {
              setSelectedYear(parseInt(data.slider.value));
            }
          }}
          onPlotlyRestyle={(data, graphDiv) => {
            // Manejar cambios cuando se usa el slider
            if (graphDiv && graphDiv.layout && graphDiv.layout.sliders && graphDiv.layout.sliders[0]) {
              const activeStep = graphDiv.layout.sliders[0].active;
              if (activeStep !== undefined && availableYears[activeStep]) {
                const newYear = availableYears[activeStep];
                if (newYear !== selectedYear) {
                  setSelectedYear(newYear);
                }
              }
            }
          }}
        />
      </div>

      {/* Información adicional mejorada */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="text-xs text-blue-800 space-y-2">
          {/* Guía de interpretación */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-3 text-sm"> Guía de Interpretación</h4>
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
        </div>
      </div>
    </div>
  );
};

export default MapaCoropleticoEmpleoInformal;
