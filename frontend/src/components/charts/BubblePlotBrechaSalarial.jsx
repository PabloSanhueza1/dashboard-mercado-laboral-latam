import React, { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { HiOutlineGlobe, HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineCollection, HiOutlineCalendar } from 'react-icons/hi';

import { StatCard } from '../estadisticas/ResumenEstadisticas';

const BubblePlotBrechaSalarial = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState(2024);

    // Color palette for countries
    const countryColors = {
        'Argentina': '#e74c3c',
        'Bolivia (Plurinational State of)': '#3498db',
        'Brazil': '#2ecc71',
        'Chile': '#f39c12',
        'Colombia': '#9b59b6',
        'Ecuador': '#1abc9c',
        'Paraguay': '#e67e22',
        'Peru': '#34495e',
        'Uruguay': '#95a5a6',
        'Venezuela (Bolivarian Republic of)': '#c0392b'
    };

    // Mapeo de países relevantes (igual que el coroplético)
    const countryMapping = {
        'Argentina': true,
        'Bolivia (Plurinational State of)': true,
        'Brazil': true,
        'Chile': true,
        'Colombia': true,
        'Ecuador': true,
        'Paraguay': true,
        'Peru': true,
        'Uruguay': true,
        'Venezuela (Bolivarian Republic of)': true
    };

    // Función robusta para parsear CSV (maneja comillas y comas internas)
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result.map(v => v.replace(/^"|"$/g, '').trim());
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/dataset/salarios_promedio_mensuales_por_sexo_sudamerica.csv');
                const csvText = await response.text();

                const lines = csvText.split('\n').filter(line => line.trim());
                const headers = parseCSVLine(lines[0]);

                const parsedData = lines.slice(1).map(line => {
                    const values = parseCSVLine(line);
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });
                    return row;
                });

                // Filtra solo países relevantes, USD, sexos válidos y valores numéricos
                const usdData = parsedData.filter(row =>
                    countryMapping[row['ref_area.label']] &&
                    row['classif1.label'] === 'Currency: U.S. dollars' &&
                    (row['sex.label'] === 'Male' || row['sex.label'] === 'Female') &&
                    row['obs_value'] &&
                    !isNaN(parseFloat(row['obs_value']))
                );

                // Agrupa por país y año, y asegura que ambos sexos existan
                const grouped = {};
                usdData.forEach(row => {
                    const country = row['ref_area.label'];
                    const year = parseInt(row['time']);
                    const gender = row['sex.label'];
                    const salary = parseFloat(row['obs_value']);

                    if (!grouped[country]) grouped[country] = {};
                    if (!grouped[country][year]) grouped[country][year] = {};
                    grouped[country][year][gender] = salary;
                });

                // Solo incluye años donde ambos sexos existen
                const bubbleData = [];
                Object.keys(grouped).forEach(country => {
                    Object.keys(grouped[country]).forEach(year => {
                        const yearData = grouped[country][year];
                        if (yearData['Male'] !== undefined && yearData['Female'] !== undefined) {
                            bubbleData.push({
                                country,
                                year: parseInt(year),
                                maleSalary: yearData['Male'],
                                femaleSalary: yearData['Female'],
                                gapPercentage: ((yearData['Male'] - yearData['Female']) / yearData['Male'] * 100).toFixed(1),
                                color: countryColors[country] || '#95a5a6'
                            });
                        }
                    });
                });

                setData(bubbleData);
                setLoading(false);
            } catch (err) {
                setError('Error cargando datos de brecha salarial');
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Get available years and current year data
    const availableYears = useMemo(() => {
        const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
        return years;
    }, [data]);

    const currentYearData = useMemo(() => {
        return data.filter(item => item.year === selectedYear);
    }, [data, selectedYear]);

    // Calculate chart domain
    const chartDomain = useMemo(() => {
        if (currentYearData.length === 0) return { min: 0, max: 1000 };

        const allSalaries = currentYearData.flatMap(item => [item.maleSalary, item.femaleSalary]);
        const min = Math.min(...allSalaries);
        const max = Math.max(...allSalaries);
        const padding = (max - min) * 0.1;

        return {
            min: Math.max(0, min - padding),
            max: max + padding
        };
    }, [currentYearData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{data.country}</p>
                    <p style={{ margin: '4px 0' }}>Año: {data.year}</p>
                    <p style={{ margin: '4px 0' }}>Salario Masculino: ${data.maleSalary.toLocaleString()} USD</p>
                    <p style={{ margin: '4px 0' }}>Salario Femenino: ${data.femaleSalary.toLocaleString()} USD</p>
                    <p style={{ margin: '4px 0', color: data.gapPercentage > 0 ? '#e74c3c' : '#27ae60' }}>
                        Brecha: {data.gapPercentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Estadísticas para el año seleccionado
    const stats = useMemo(() => {
        if (currentYearData.length === 0) return null;
        const brechas = currentYearData.map(item => parseFloat(item.gapPercentage));
        return {
            paises: currentYearData.length,
            max: Math.max(...brechas).toFixed(1),
            min: Math.min(...brechas).toFixed(1),
            promedio: (brechas.reduce((sum, v) => sum + v, 0) / brechas.length).toFixed(1),
            year: selectedYear
        };
    }, [currentYearData, selectedYear]);

    if (loading) {
        return (
            <div className="chart-container">
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando datos de brecha salarial...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="chart-container">
                <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-2">⚠️</div>
                        <p className="text-red-700">Error al cargar los datos de brecha salarial</p>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chart-container bg-white p-6 rounded-lg shadow-sm">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Brecha Salarial de Género por País - {selectedYear}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Salarios promedio mensuales en USD. La línea diagonal representa equidad salarial perfecta.
                </p>
                {/* Slider tipo barra */}
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs text-gray-500">Año:</span>
                    <input
                        type="range"
                        min={Math.min(...availableYears)}
                        max={Math.max(...availableYears)}
                        step={1}
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="w-48 md:w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600
                          focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        style={{
                            // Hide default thumb for all browsers
                            WebkitAppearance: 'none',
                            appearance: 'none',
                        }}
                        list="years-list"
                    />
                    <datalist id="years-list">
                        {availableYears.map(year => (
                            <option key={year} value={year} label={year.toString()} />
                        ))}
                    </datalist>
                    <span className="text-sm font-semibold text-blue-700 ml-2">{selectedYear}</span>
                </div>
                {/* Custom slider styles */}
                <style>
                    {`
                  input[type="range"].accent-blue-600::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 9999px;
                    background: #2563eb;
                    border: 3px solid #fff;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.15);
                    transition: background 0.2s;
                  }
                  input[type="range"].accent-blue-600:focus::-webkit-slider-thumb {
                    outline: 2px solid #2563eb;
                  }
                  input[type="range"].accent-blue-600::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 9999px;
                    background: #2563eb;
                    border: 3px solid #fff;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.15);
                    transition: background 0.2s;
                  }
                  input[type="range"].accent-blue-600::-ms-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 9999px;
                    background: #2563eb;
                    border: 3px solid #fff;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.15);
                    transition: background 0.2s;
                  }
                  input[type="range"].accent-blue-600::-webkit-slider-thumb:hover {
                    background: #1d4ed8;
                  }
                  input[type="range"].accent-blue-600::-webkit-slider-runnable-track {
                    height: 8px;
                    border-radius: 4px;
                    background: #e5e7eb;
                  }
                  input[type="range"].accent-blue-600::-ms-fill-lower {
                    background: #e5e7eb;
                  }
                  input[type="range"].accent-blue-600::-ms-fill-upper {
                    background: #e5e7eb;
                  }
                  input[type="range"].accent-blue-600:focus::-webkit-slider-thumb {
                    box-shadow: 0 0 0 4px #93c5fd;
                  }
                  input[type="range"].accent-blue-600:focus::-ms-thumb {
                    box-shadow: 0 0 0 4px #93c5fd;
                  }
                  input[type="range"].accent-blue-600:focus {
                    outline: none;
                  }
                  `}
                </style>
                {/* Estadísticas en tarjetas estilo StatCard */}
                {stats && (
                    <div className="stats-grid grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <StatCard
                            title="Países estudiados"
                            value={stats.paises}
                            icon={HiOutlineGlobe}
                            color="blue"
                        />
                        <StatCard
                            title="Brecha más alta"
                            value={`${stats.max}%`}
                            icon={HiOutlineTrendingUp}
                            color="purple"
                        />
                        <StatCard
                            title="Brecha más baja"
                            value={`${stats.min}%`}
                            icon={HiOutlineCollection}
                            color="orange"
                        />
                        <StatCard
                            title="Brecha promedio"
                            value={`${stats.promedio}%`}
                            icon={HiOutlineChartBar}
                            color="green"
                        />
                        <StatCard
                            title="Año"
                            value={stats.year}
                            icon={HiOutlineCalendar}
                            color="indigo"
                        />
                    </div>
                )}
            </div>

            {/* Bubble Chart */}
            <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer>
                    <ScatterChart
                        margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            type="number"
                            dataKey="maleSalary"
                            domain={[chartDomain.min, chartDomain.max]}
                            name="Salario Masculino"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            label={{ value: 'Salario Masculino (USD)', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="femaleSalary"
                            domain={[chartDomain.min, chartDomain.max]}
                            name="Salario Femenino"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            label={{ value: 'Salario Femenino (USD)', angle: -90, position: 'insideLeft' }}
                        />

                        {/* Diagonal line for perfect equity */}
                        <ReferenceLine
                            segment={[
                                { x: chartDomain.min, y: chartDomain.min },
                                { x: chartDomain.max, y: chartDomain.max }
                            ]}
                            stroke="#27ae60"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Scatter data={currentYearData}>
                            {currentYearData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    r={8}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                    {Object.keys(countryColors).map(country => {
                        const hasData = currentYearData.some(item => item.country === country);
                        return hasData ? (
                            <div key={country} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: countryColors[country] }}
                                ></div>
                                <span className="text-sm text-gray-700">{country}</span>
                            </div>
                        ) : null;
                    })}
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
                    <span className="text-sm text-gray-600">Equidad salarial perfecta</span>
                </div>
            </div>
        </div>
    );
};

export default BubblePlotBrechaSalarial;
