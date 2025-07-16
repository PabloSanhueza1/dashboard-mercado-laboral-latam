import React, { useState, useEffect, useMemo } from "react";
import {
    ResponsiveContainer,
    ScatterChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Scatter,
    Cell
} from "recharts";
import Papa from 'papaparse';

// Colores para sexo
const sexColors = {
    Male: "#2563eb",
    Female: "#e11d48"
};

const csvUrl = "/dataset/poblacion_economicamente_activa_por_sexo_edad_sudamerica.csv";

// Parsea el CSV usando los nombres correctos de columnas
function parseCSV(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  // Filtra y transforma igual que antes
  return result.data
    .filter(row => row["classif1.label"]?.startsWith("Age (10-year bands):"))
    .map(row => ({
      country: row["ref_area.label"],
      sex: row["sex.label"],
      ageGroup: row["classif1.label"].match(/(\d{2}-\d{2}|\d{2}\+)/)?.[0],
      year: Number(row["time"]),
      rate: Number(row["obs_value"]),
    }))
    .filter(d => ["Male", "Female"].includes(d.sex) && d.ageGroup);
}

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
    'French Guiana': 'Guayana Francesa',
    'Guyana': 'Guyana',
    'Paraguay': 'Paraguay',
    'Peru': 'Perú',
    'Suriname': 'Suriname',
    'Uruguay': 'Uruguay',
    'Venezuela (Bolivarian Republic of)': 'Venezuela'
};

// Mapeo de sexo a español
const sexDisplayNames = {
    'Male': 'Hombre',
    'Female': 'Mujer'
};

const DotPlotParticipacionLaboral = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState("Argentina");
    const [selectedYear, setSelectedYear] = useState(2024);

    useEffect(() => {
        fetch(csvUrl)
            .then(res => res.text())
            .then(text => {
                const parsed = parseCSV(text);
                setData(parsed);
                setLoading(false);
                console.log("DotPlot: data loaded", parsed.length, "rows");
            })
            .catch(err => {
                setError("No se pudo cargar el archivo CSV");
                setLoading(false);
            });
    }, []);

    // Filtra por país y año
    const filteredData = useMemo(() => {
        const filtered = data.filter(
            d => d.country === selectedCountry && d.year === selectedYear
        );
        console.log("filteredData:", filtered);
        return filtered;
    }, [data, selectedCountry, selectedYear]);

    // Obtiene años y países disponibles
    const availableYears = useMemo(() => [...new Set(data.map(d => d.year))].sort((a, b) => b - a), [data]);
    const availableCountries = useMemo(() => [...new Set(data.map(d => d.country))], [data]);
    console.log("availableCountries:", availableCountries);
    // Eje X: grupos de edad ordenados (de todos los años para el país seleccionado)
    const ageGroups = useMemo(() => {
        const groups = [...new Set(data.filter(d => d.country === selectedCountry).map(d => d.ageGroup))];
        return groups.sort((a, b) => {
            const getStart = s => Number(s.split("-")[0].replace("+", ""));
            return getStart(a) - getStart(b);
        });
    }, [data, selectedCountry]);
    console.log("ageGroups:", ageGroups);

    // Bubble size: proporcional a la tasa (opcional)
    const getDotSize = rate => Math.max(16, Math.min(50, rate)); // Aumenta el tamaño mínimo a 16 y el máximo a 50

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div
                    className="bg-white p-3 rounded shadow text-xs border border-gray-200"
                    style={{ backgroundColor: "#fff" }}
                >
                    <div><b>País:</b> {countryDisplayNames[d.country] || d.country}</div>
                    <div><b>Año:</b> {d.year}</div>
                    <div><b>Grupo de edad:</b> {d.ageGroup}</div>
                    <div><b>Sexo:</b> {sexDisplayNames[d.sex] || d.sex}</div>
                    <div><b>Tasa de participación:</b> {d.rate}%</div>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="chart-container">Cargando datos...</div>;
    }
    if (error) {
        return <div className="chart-container text-red-600">{error}</div>;
    }

    return (
        <div className="chart-container bg-white p-6 rounded-lg shadow-sm">
            {/* Título */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Tasa de Participación Laboral por Grupo de Edad y Sexo ({countryDisplayNames[selectedCountry] || selectedCountry}, {selectedYear})
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Cada punto representa la tasa de participación laboral (%) para un grupo de edad y sexo.
                </p>
                {/* Selectores de país y año */}
                <div className="flex gap-4 mb-4 flex-wrap">
                    <div>
                        <label className="text-xs text-gray-500 mr-2">País:</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {availableCountries.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`px-3 py-1 rounded text-sm border transition
                                        ${selectedCountry === c
                                            ? "bg-blue-600 text-white border-blue-700 font-semibold"
                                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"}`}
                                    onClick={() => setSelectedCountry(c)}
                                >
                                    {countryDisplayNames[c] || c}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* El slider se mueve debajo del gráfico */}
                </div>
            </div>
            {/* Dot Chart */}
            <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                {/* Leyenda dentro del gráfico */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 24,
                        zIndex: 10,
                        background: "rgba(255,255,255,0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        padding: "8px 16px",
                        display: "flex",
                        gap: "18px",
                        alignItems: "center",
                        border: "1px solid #e5e7eb"
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            style={{
                                background: sexColors.Male,
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                border: "2px solid #e5e7eb"
                            }}
                        ></div>
                        <span className="text-xs text-gray-700">{sexDisplayNames['Male']}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            style={{
                                background: sexColors.Female,
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                border: "2px solid #e5e7eb"
                            }}
                        ></div>
                        <span className="text-xs text-gray-700">{sexDisplayNames['Female']}</span>
                    </div>
                </div>
                {filteredData.length === 0 ? (
                    <div className="flex items-center justify-center h-full w-full absolute top-0 left-0 z-20">
                        <span className="text-gray-500 text-lg font-semibold">No hay datos</span>
                    </div>
                ) : (
                    <ResponsiveContainer>
                        <ScatterChart
                            margin={{ top: 20, right: 30, bottom: 40, left: 70 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                type="category"
                                dataKey="ageGroup"
                                name="Grupo de edad"
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Grupo de edad', position: 'insideBottom', offset: -10 }}
                                interval={0}
                                allowDuplicatedCategory={false}
                                ticks={ageGroups}
                            />
                            <YAxis
                                type="number"
                                dataKey="rate"
                                name="Tasa de participación"
                                domain={[0, 100]}
                                tickFormatter={v => `${v}%`}
                                label={{
                                    value: 'Tasa de participación (%)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: 0,
                                    dy: 100,
                                }}
                            />

                            <Tooltip content={<CustomTooltip />} />
                            <Scatter data={filteredData}>
                                {filteredData.map((entry, idx) => (
                                    <Cell
                                        key={idx}
                                        fill={sexColors[entry.sex] || "#888"}
                                        r={getDotSize(entry.rate)}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                )}
            </div>
            {/* Slider de año centrado y más largo */}
            <div className="flex flex-col items-center w-full mt-6">
                <label className="text-xs text-gray-500 mb-2">
                    Año: <span className="font-semibold text-blue-700">{selectedYear}</span>
                </label>
                <div className="flex items-center w-96 max-w-full">
                    <span className="text-xs text-gray-400 mr-2">{availableYears[availableYears.length - 1]}</span>
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
                    <span className="text-xs text-gray-400 ml-2">{availableYears[0]}</span>
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
        </div>
    );
};

export default DotPlotParticipacionLaboral;
