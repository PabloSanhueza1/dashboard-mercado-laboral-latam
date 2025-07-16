import React, { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

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
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Brecha Salarial de Género por País - {selectedYear}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Salarios promedio mensuales en USD. La línea diagonal representa equidad salarial perfecta.
                </p>

                {/* Year Slider */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Año: {selectedYear}
                    </label>
                    <input
                        type="range"
                        min={Math.min(...availableYears)}
                        max={Math.max(...availableYears)}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedYear - Math.min(...availableYears)) /
                                (Math.max(...availableYears) - Math.min(...availableYears))) * 100
                                }%, #e5e7eb ${((selectedYear - Math.min(...availableYears)) /
                                    (Math.max(...availableYears) - Math.min(...availableYears))) * 100
                                }%, #e5e7eb 100%)`
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{Math.min(...availableYears)}</span>
                        <span>{Math.max(...availableYears)}</span>
                    </div>
                </div>
            </div>

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

            {/* Statistics */}
            {currentYearData.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Países con datos</h4>
                        <p className="text-2xl font-bold text-blue-600">{currentYearData.length}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800">Brecha promedio</h4>
                        <p className="text-2xl font-bold text-red-600">
                            {(currentYearData.reduce((sum, item) => sum + parseFloat(item.gapPercentage), 0) / currentYearData.length).toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800">Menor brecha</h4>
                        <p className="text-2xl font-bold text-green-600">
                            {Math.min(...currentYearData.map(item => parseFloat(item.gapPercentage))).toFixed(1)}%
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BubblePlotBrechaSalarial;
