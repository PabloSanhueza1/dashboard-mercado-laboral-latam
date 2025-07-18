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
    const availableYears = useMemo(() => [...new Set(data.map(d => d.year))].sort((a, b) => a - b), [data]);
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

    // Tooltip personalizado para mostrar ambos sexos
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // label es el grupo de edad
            const ageGroup = label || (payload[0] && payload[0].payload && payload[0].payload.ageGroup);
            // Busca ambos sexos en el grupo de edad actual
            const male = filteredData.find(d => d.ageGroup === ageGroup && d.sex === "Male");
            const female = filteredData.find(d => d.ageGroup === ageGroup && d.sex === "Female");
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    padding: '10px',
                    borderRadius: '5px',
                    minWidth: 180
                }}>
                    <div style={{ marginBottom: 4 }}>
                        <b>{countryDisplayNames[selectedCountry] || selectedCountry}</b> | <span>{selectedYear}</span>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <span style={{ color: '#555' }}>Grupo de edad:</span> <b>{ageGroup}</b>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: sexColors.Male,
                                marginRight: 4,
                                border: "1.5px solid #e5e7eb"
                            }}></span>
                            <span style={{ color: sexColors.Male, fontWeight: 600 }}>{sexDisplayNames["Male"]}:</span>
                            <span style={{ marginLeft: 4 }}>
                                {male ? `${male.rate.toFixed(3)}%` : <span style={{ color: "#bbb" }}>Sin datos</span>}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: sexColors.Female,
                                marginRight: 4,
                                border: "1.5px solid #e5e7eb"
                            }}></span>
                            <span style={{ color: sexColors.Female, fontWeight: 600 }}>{sexDisplayNames["Female"]}:</span>
                            <span style={{ marginLeft: 4 }}>
                                {female ? `${female.rate.toFixed(3)}%` : <span style={{ color: "#bbb" }}>Sin datos</span>}
                            </span>
                        </div>
                    </div>
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
                <h2 className="text-lg font-semibold text-gray-900">
                    Tasa de participación laboral por grupo de edad y sexo ({countryDisplayNames[selectedCountry] || selectedCountry}, {selectedYear})
                </h2>
                {/* Selectores de país y año */}
                <div className="flex gap-4 mb-4 flex-wrap">
                    <div>
                        <label className="text-xs text-gray-500 mr-2">País:</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {availableCountries.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`px-4 py-1 rounded border text-sm flex items-center gap-1 transition-colors
                                        ${selectedCountry === c
                                            ? "bg-[#fde68a] border-[#ea580c] text-[#b45309]"
                                            : "bg-[#fff] border-[#fde68a] text-[#ea580c] hover:bg-[#fff7ed] hover:border-[#ea580c]"}`}
                                    style={{
                                        backgroundColor: selectedCountry === c ? '#fde68a' : '#fff', // naranja claro si seleccionado, blanco si no
                                        color: selectedCountry === c ? '#b45309' : '#ea580c',        // texto naranja oscuro si seleccionado, naranja si no
                                        border: selectedCountry === c ? '2px solid #ea580c' : '1px solid #fde68a', // borde naranja si seleccionado, naranja claro si no
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        fontWeight: 'normal',
                                        fontSize: '16px',
                                        boxShadow: 'none',
                                        cursor: 'pointer',
                                        minWidth: 90,
                                        outline: 'none',
                                        margin: '8px 8px 8px 0',
                                    }}
                                    onClick={() => setSelectedCountry(c)}
                                >
                                    <span className="truncate">{countryDisplayNames[c] || c}</span>
                                    {selectedCountry === c && (
                                        <svg width="14" height="14" fill="none" viewBox="0 0 20 20" style={{ marginLeft: 2 }}>
                                            <circle cx="10" cy="10" r="7" fill="#fbbf24" opacity="0.7" />
                                            <path d="M7.5 10.5l2 2 3-3" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Dot Chart */}
            <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                {/* Leyenda dentro del gráfico solo si hay datos */}
                {filteredData.length > 0 && (
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
                )}
                {filteredData.length === 0 ? (
                    <div
                        className="absolute inset-0"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            minHeight: 300,
                            zIndex: 20
                        }}
                    >
                        <span
                            className="font-bold"
                            style={{
                                fontSize: "2.2rem",
                                color: "#ea5833",
                                textShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                textAlign: "center"
                            }}
                        >
                            No hay datos de {countryDisplayNames[selectedCountry] || selectedCountry} en {selectedYear}
                        </span>
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
            {/* Slider de año */}
            <div className="flex flex-col items-center w-full mt-6">
                <label className="text-xs text-gray-500 mb-2">
                    Año: <span className="font-semibold text-blue-700">{selectedYear}</span>
                </label>
                <div className="flex items-center w-96 max-w-full">
                    <span className="text-xs text-gray-400 mr-2">{availableYears[0]}</span>
                    <input
                        type="range"
                        min={0}
                        max={availableYears.length - 1}
                        value={availableYears.indexOf(selectedYear)}
                        onChange={e => setSelectedYear(availableYears[parseInt(e.target.value)])}
                        className="w-full h-3 accent-orange-500"
                        style={{
                            appearance: "none",
                            background: "linear-gradient(90deg,#fde68a 0%,#ea580c 100%)",
                            borderRadius: "999px",
                            outline: "none",
                            boxShadow: "0 1px 4px rgba(234,88,12,0.10)",
                        }}
                    />
                    <span className="text-xs text-gray-400 ml-2">{availableYears[availableYears.length - 1]}</span>
                </div>
                <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        background: #ea580c;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(234,88,12,0.15);
                        border: 2px solid #fff;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    input[type="range"]:focus::-webkit-slider-thumb {
                        background: #b45309;
                    }
                    input[type="range"]::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        background: #ea580c;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(234,88,12,0.15);
                        border: 2px solid #fff;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    input[type="range"]:focus::-moz-range-thumb {
                        background: #b45309;
                    }
                    input[type="range"]::-ms-thumb {
                        width: 18px;
                        height: 18px;
                        background: #ea580c;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(234,88,12,0.15);
                        border: 2px solid #fff;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    input[type="range"]:focus::-ms-thumb {
                        background: #b45309;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DotPlotParticipacionLaboral;
