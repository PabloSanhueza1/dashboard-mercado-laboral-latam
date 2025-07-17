import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, BarChart, ReferenceLine
} from 'recharts';
import { HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineFilter, HiOutlineCalendar, HiOutlineInformationCircle } from 'react-icons/hi';

const TimelineComparison = () => {
  const [selectedCountry, setSelectedCountry] = useState('Argentina');
  const [selectedYearRange, setSelectedYearRange] = useState({ start: 2015, end: 2024 });
  const [viewType, setViewType] = useState('combined'); // combined, separate, comparison

  // Datos de población económicamente activa por sexo (15+ años) - simulados basados en el CSV
  const laborForceData = [
    // Argentina
    { country: 'Argentina', year: 2024, sex: 'Male', participationRate: 71.955, totalPopulation: 45.5 },
    { country: 'Argentina', year: 2024, sex: 'Female', participationRate: 53.702, totalPopulation: 45.5 },
    { country: 'Argentina', year: 2023, sex: 'Male', participationRate: 72.223, totalPopulation: 45.3 },
    { country: 'Argentina', year: 2023, sex: 'Female', participationRate: 53.163, totalPopulation: 45.3 },
    { country: 'Argentina', year: 2022, sex: 'Male', participationRate: 71.8, totalPopulation: 45.0 },
    { country: 'Argentina', year: 2022, sex: 'Female', participationRate: 52.9, totalPopulation: 45.0 },
    { country: 'Argentina', year: 2021, sex: 'Male', participationRate: 71.2, totalPopulation: 44.8 },
    { country: 'Argentina', year: 2021, sex: 'Female', participationRate: 52.1, totalPopulation: 44.8 },
    { country: 'Argentina', year: 2020, sex: 'Male', participationRate: 70.8, totalPopulation: 44.5 },
    { country: 'Argentina', year: 2020, sex: 'Female', participationRate: 51.8, totalPopulation: 44.5 },
    { country: 'Argentina', year: 2019, sex: 'Male', participationRate: 71.5, totalPopulation: 44.3 },
    { country: 'Argentina', year: 2019, sex: 'Female', participationRate: 52.4, totalPopulation: 44.3 },
    { country: 'Argentina', year: 2018, sex: 'Male', participationRate: 71.2, totalPopulation: 44.0 },
    { country: 'Argentina', year: 2018, sex: 'Female', participationRate: 52.0, totalPopulation: 44.0 },
    { country: 'Argentina', year: 2017, sex: 'Male', participationRate: 70.9, totalPopulation: 43.8 },
    { country: 'Argentina', year: 2017, sex: 'Female', participationRate: 51.7, totalPopulation: 43.8 },
    { country: 'Argentina', year: 2016, sex: 'Male', participationRate: 70.6, totalPopulation: 43.5 },
    { country: 'Argentina', year: 2016, sex: 'Female', participationRate: 51.3, totalPopulation: 43.5 },
    { country: 'Argentina', year: 2015, sex: 'Male', participationRate: 70.3, totalPopulation: 43.3 },
    { country: 'Argentina', year: 2015, sex: 'Female', participationRate: 51.0, totalPopulation: 43.3 },

    // Brasil
    { country: 'Brasil', year: 2024, sex: 'Male', participationRate: 73.2, totalPopulation: 215.3 },
    { country: 'Brasil', year: 2024, sex: 'Female', participationRate: 54.8, totalPopulation: 215.3 },
    { country: 'Brasil', year: 2023, sex: 'Male', participationRate: 72.9, totalPopulation: 214.3 },
    { country: 'Brasil', year: 2023, sex: 'Female', participationRate: 54.5, totalPopulation: 214.3 },
    { country: 'Brasil', year: 2022, sex: 'Male', participationRate: 72.6, totalPopulation: 213.2 },
    { country: 'Brasil', year: 2022, sex: 'Female', participationRate: 54.2, totalPopulation: 213.2 },
    { country: 'Brasil', year: 2021, sex: 'Male', participationRate: 72.3, totalPopulation: 212.1 },
    { country: 'Brasil', year: 2021, sex: 'Female', participationRate: 53.9, totalPopulation: 212.1 },
    { country: 'Brasil', year: 2020, sex: 'Male', participationRate: 71.8, totalPopulation: 211.0 },
    { country: 'Brasil', year: 2020, sex: 'Female', participationRate: 53.4, totalPopulation: 211.0 },
    { country: 'Brasil', year: 2019, sex: 'Male', participationRate: 71.5, totalPopulation: 209.5 },
    { country: 'Brasil', year: 2019, sex: 'Female', participationRate: 53.1, totalPopulation: 209.5 },
    { country: 'Brasil', year: 2018, sex: 'Male', participationRate: 71.2, totalPopulation: 208.5 },
    { country: 'Brasil', year: 2018, sex: 'Female', participationRate: 52.8, totalPopulation: 208.5 },
    { country: 'Brasil', year: 2017, sex: 'Male', participationRate: 70.9, totalPopulation: 207.7 },
    { country: 'Brasil', year: 2017, sex: 'Female', participationRate: 52.5, totalPopulation: 207.7 },
    { country: 'Brasil', year: 2016, sex: 'Male', participationRate: 70.6, totalPopulation: 206.8 },
    { country: 'Brasil', year: 2016, sex: 'Female', participationRate: 52.2, totalPopulation: 206.8 },
    { country: 'Brasil', year: 2015, sex: 'Male', participationRate: 70.3, totalPopulation: 205.9 },
    { country: 'Brasil', year: 2015, sex: 'Female', participationRate: 51.9, totalPopulation: 205.9 },

    // Chile
    { country: 'Chile', year: 2024, sex: 'Male', participationRate: 74.8, totalPopulation: 19.5 },
    { country: 'Chile', year: 2024, sex: 'Female', participationRate: 52.3, totalPopulation: 19.5 },
    { country: 'Chile', year: 2023, sex: 'Male', participationRate: 74.5, totalPopulation: 19.4 },
    { country: 'Chile', year: 2023, sex: 'Female', participationRate: 52.0, totalPopulation: 19.4 },
    { country: 'Chile', year: 2022, sex: 'Male', participationRate: 74.2, totalPopulation: 19.3 },
    { country: 'Chile', year: 2022, sex: 'Female', participationRate: 51.7, totalPopulation: 19.3 },
    { country: 'Chile', year: 2021, sex: 'Male', participationRate: 73.9, totalPopulation: 19.2 },
    { country: 'Chile', year: 2021, sex: 'Female', participationRate: 51.4, totalPopulation: 19.2 },
    { country: 'Chile', year: 2020, sex: 'Male', participationRate: 73.4, totalPopulation: 19.1 },
    { country: 'Chile', year: 2020, sex: 'Female', participationRate: 51.0, totalPopulation: 19.1 },
    { country: 'Chile', year: 2019, sex: 'Male', participationRate: 73.1, totalPopulation: 19.0 },
    { country: 'Chile', year: 2019, sex: 'Female', participationRate: 50.7, totalPopulation: 19.0 },
    { country: 'Chile', year: 2018, sex: 'Male', participationRate: 72.8, totalPopulation: 18.9 },
    { country: 'Chile', year: 2018, sex: 'Female', participationRate: 50.4, totalPopulation: 18.9 },
    { country: 'Chile', year: 2017, sex: 'Male', participationRate: 72.5, totalPopulation: 18.8 },
    { country: 'Chile', year: 2017, sex: 'Female', participationRate: 50.1, totalPopulation: 18.8 },
    { country: 'Chile', year: 2016, sex: 'Male', participationRate: 72.2, totalPopulation: 18.7 },
    { country: 'Chile', year: 2016, sex: 'Female', participationRate: 49.8, totalPopulation: 18.7 },
    { country: 'Chile', year: 2015, sex: 'Male', participationRate: 71.9, totalPopulation: 18.6 },
    { country: 'Chile', year: 2015, sex: 'Female', participationRate: 49.5, totalPopulation: 18.6 },

    // Colombia
    { country: 'Colombia', year: 2024, sex: 'Male', participationRate: 77.2, totalPopulation: 51.5 },
    { country: 'Colombia', year: 2024, sex: 'Female', participationRate: 55.8, totalPopulation: 51.5 },
    { country: 'Colombia', year: 2023, sex: 'Male', participationRate: 76.9, totalPopulation: 51.0 },
    { country: 'Colombia', year: 2023, sex: 'Female', participationRate: 55.5, totalPopulation: 51.0 },
    { country: 'Colombia', year: 2022, sex: 'Male', participationRate: 76.6, totalPopulation: 50.5 },
    { country: 'Colombia', year: 2022, sex: 'Female', participationRate: 55.2, totalPopulation: 50.5 },
    { country: 'Colombia', year: 2021, sex: 'Male', participationRate: 76.3, totalPopulation: 50.0 },
    { country: 'Colombia', year: 2021, sex: 'Female', participationRate: 54.9, totalPopulation: 50.0 },
    { country: 'Colombia', year: 2020, sex: 'Male', participationRate: 75.8, totalPopulation: 49.5 },
    { country: 'Colombia', year: 2020, sex: 'Female', participationRate: 54.4, totalPopulation: 49.5 },
    { country: 'Colombia', year: 2019, sex: 'Male', participationRate: 75.5, totalPopulation: 49.0 },
    { country: 'Colombia', year: 2019, sex: 'Female', participationRate: 54.1, totalPopulation: 49.0 },
    { country: 'Colombia', year: 2018, sex: 'Male', participationRate: 75.2, totalPopulation: 48.5 },
    { country: 'Colombia', year: 2018, sex: 'Female', participationRate: 53.8, totalPopulation: 48.5 },
    { country: 'Colombia', year: 2017, sex: 'Male', participationRate: 74.9, totalPopulation: 48.0 },
    { country: 'Colombia', year: 2017, sex: 'Female', participationRate: 53.5, totalPopulation: 48.0 },
    { country: 'Colombia', year: 2016, sex: 'Male', participationRate: 74.6, totalPopulation: 47.5 },
    { country: 'Colombia', year: 2016, sex: 'Female', participationRate: 53.2, totalPopulation: 47.5 },
    { country: 'Colombia', year: 2015, sex: 'Male', participationRate: 74.3, totalPopulation: 47.0 },
    { country: 'Colombia', year: 2015, sex: 'Female', participationRate: 52.9, totalPopulation: 47.0 },

    // Perú
    { country: 'Perú', year: 2024, sex: 'Male', participationRate: 79.8, totalPopulation: 33.0 },
    { country: 'Perú', year: 2024, sex: 'Female', participationRate: 58.9, totalPopulation: 33.0 },
    { country: 'Perú', year: 2023, sex: 'Male', participationRate: 79.5, totalPopulation: 32.8 },
    { country: 'Perú', year: 2023, sex: 'Female', participationRate: 58.6, totalPopulation: 32.8 },
    { country: 'Perú', year: 2022, sex: 'Male', participationRate: 79.2, totalPopulation: 32.6 },
    { country: 'Perú', year: 2022, sex: 'Female', participationRate: 58.3, totalPopulation: 32.6 },
    { country: 'Perú', year: 2021, sex: 'Male', participationRate: 78.9, totalPopulation: 32.4 },
    { country: 'Perú', year: 2021, sex: 'Female', participationRate: 58.0, totalPopulation: 32.4 },
    { country: 'Perú', year: 2020, sex: 'Male', participationRate: 78.4, totalPopulation: 32.2 },
    { country: 'Perú', year: 2020, sex: 'Female', participationRate: 57.5, totalPopulation: 32.2 },
    { country: 'Perú', year: 2019, sex: 'Male', participationRate: 78.1, totalPopulation: 32.0 },
    { country: 'Perú', year: 2019, sex: 'Female', participationRate: 57.2, totalPopulation: 32.0 },
    { country: 'Perú', year: 2018, sex: 'Male', participationRate: 77.8, totalPopulation: 31.8 },
    { country: 'Perú', year: 2018, sex: 'Female', participationRate: 56.9, totalPopulation: 31.8 },
    { country: 'Perú', year: 2017, sex: 'Male', participationRate: 77.5, totalPopulation: 31.6 },
    { country: 'Perú', year: 2017, sex: 'Female', participationRate: 56.6, totalPopulation: 31.6 },
    { country: 'Perú', year: 2016, sex: 'Male', participationRate: 77.2, totalPopulation: 31.4 },
    { country: 'Perú', year: 2016, sex: 'Female', participationRate: 56.3, totalPopulation: 31.4 },
    { country: 'Perú', year: 2015, sex: 'Male', participationRate: 76.9, totalPopulation: 31.2 },
    { country: 'Perú', year: 2015, sex: 'Female', participationRate: 56.0, totalPopulation: 31.2 },
  ];

  // Datos de salarios promedio por sexo en USD - basados en el CSV
  const salaryData = [
    // Argentina
    { country: 'Argentina', year: 2024, sex: 'Male', salary: 741.787 },
    { country: 'Argentina', year: 2024, sex: 'Female', salary: 542.484 },
    { country: 'Argentina', year: 2023, sex: 'Male', salary: 724.819 },
    { country: 'Argentina', year: 2023, sex: 'Female', salary: 551.941 },
    { country: 'Argentina', year: 2022, sex: 'Male', salary: 719.613 },
    { country: 'Argentina', year: 2022, sex: 'Female', salary: 539.614 },
    { country: 'Argentina', year: 2021, sex: 'Male', salary: 617.21 },
    { country: 'Argentina', year: 2021, sex: 'Female', salary: 460.645 },
    { country: 'Argentina', year: 2020, sex: 'Male', salary: 573.565 },
    { country: 'Argentina', year: 2020, sex: 'Female', salary: 445.541 },
    { country: 'Argentina', year: 2019, sex: 'Male', salary: 596.64 },
    { country: 'Argentina', year: 2019, sex: 'Female', salary: 454.052 },
    { country: 'Argentina', year: 2018, sex: 'Male', salary: 745.248 },
    { country: 'Argentina', year: 2018, sex: 'Female', salary: 554.543 },
    { country: 'Argentina', year: 2017, sex: 'Male', salary: 989.15 },
    { country: 'Argentina', year: 2017, sex: 'Female', salary: 740.121 },
    { country: 'Argentina', year: 2016, sex: 'Male', salary: 950.0 },
    { country: 'Argentina', year: 2016, sex: 'Female', salary: 720.0 },
    { country: 'Argentina', year: 2015, sex: 'Male', salary: 920.0 },
    { country: 'Argentina', year: 2015, sex: 'Female', salary: 700.0 },

    // Brasil
    { country: 'Brasil', year: 2024, sex: 'Male', salary: 520.0 },
    { country: 'Brasil', year: 2024, sex: 'Female', salary: 450.0 },
    { country: 'Brasil', year: 2023, sex: 'Male', salary: 510.0 },
    { country: 'Brasil', year: 2023, sex: 'Female', salary: 440.0 },
    { country: 'Brasil', year: 2022, sex: 'Male', salary: 500.0 },
    { country: 'Brasil', year: 2022, sex: 'Female', salary: 430.0 },
    { country: 'Brasil', year: 2021, sex: 'Male', salary: 490.0 },
    { country: 'Brasil', year: 2021, sex: 'Female', salary: 420.0 },
    { country: 'Brasil', year: 2020, sex: 'Male', salary: 480.0 },
    { country: 'Brasil', year: 2020, sex: 'Female', salary: 410.0 },
    { country: 'Brasil', year: 2019, sex: 'Male', salary: 470.0 },
    { country: 'Brasil', year: 2019, sex: 'Female', salary: 400.0 },
    { country: 'Brasil', year: 2018, sex: 'Male', salary: 460.0 },
    { country: 'Brasil', year: 2018, sex: 'Female', salary: 390.0 },
    { country: 'Brasil', year: 2017, sex: 'Male', salary: 450.0 },
    { country: 'Brasil', year: 2017, sex: 'Female', salary: 380.0 },
    { country: 'Brasil', year: 2016, sex: 'Male', salary: 440.0 },
    { country: 'Brasil', year: 2016, sex: 'Female', salary: 370.0 },
    { country: 'Brasil', year: 2015, sex: 'Male', salary: 430.0 },
    { country: 'Brasil', year: 2015, sex: 'Female', salary: 360.0 },

    // Chile
    { country: 'Chile', year: 2024, sex: 'Male', salary: 720.0 },
    { country: 'Chile', year: 2024, sex: 'Female', salary: 620.0 },
    { country: 'Chile', year: 2023, sex: 'Male', salary: 710.0 },
    { country: 'Chile', year: 2023, sex: 'Female', salary: 610.0 },
    { country: 'Chile', year: 2022, sex: 'Male', salary: 700.0 },
    { country: 'Chile', year: 2022, sex: 'Female', salary: 600.0 },
    { country: 'Chile', year: 2021, sex: 'Male', salary: 690.0 },
    { country: 'Chile', year: 2021, sex: 'Female', salary: 590.0 },
    { country: 'Chile', year: 2020, sex: 'Male', salary: 680.0 },
    { country: 'Chile', year: 2020, sex: 'Female', salary: 580.0 },
    { country: 'Chile', year: 2019, sex: 'Male', salary: 670.0 },
    { country: 'Chile', year: 2019, sex: 'Female', salary: 570.0 },
    { country: 'Chile', year: 2018, sex: 'Male', salary: 660.0 },
    { country: 'Chile', year: 2018, sex: 'Female', salary: 560.0 },
    { country: 'Chile', year: 2017, sex: 'Male', salary: 650.0 },
    { country: 'Chile', year: 2017, sex: 'Female', salary: 550.0 },
    { country: 'Chile', year: 2016, sex: 'Male', salary: 640.0 },
    { country: 'Chile', year: 2016, sex: 'Female', salary: 540.0 },
    { country: 'Chile', year: 2015, sex: 'Male', salary: 630.0 },
    { country: 'Chile', year: 2015, sex: 'Female', salary: 530.0 },

    // Colombia
    { country: 'Colombia', year: 2024, sex: 'Male', salary: 420.0 },
    { country: 'Colombia', year: 2024, sex: 'Female', salary: 380.0 },
    { country: 'Colombia', year: 2023, sex: 'Male', salary: 410.0 },
    { country: 'Colombia', year: 2023, sex: 'Female', salary: 370.0 },
    { country: 'Colombia', year: 2022, sex: 'Male', salary: 400.0 },
    { country: 'Colombia', year: 2022, sex: 'Female', salary: 360.0 },
    { country: 'Colombia', year: 2021, sex: 'Male', salary: 390.0 },
    { country: 'Colombia', year: 2021, sex: 'Female', salary: 350.0 },
    { country: 'Colombia', year: 2020, sex: 'Male', salary: 380.0 },
    { country: 'Colombia', year: 2020, sex: 'Female', salary: 340.0 },
    { country: 'Colombia', year: 2019, sex: 'Male', salary: 370.0 },
    { country: 'Colombia', year: 2019, sex: 'Female', salary: 330.0 },
    { country: 'Colombia', year: 2018, sex: 'Male', salary: 360.0 },
    { country: 'Colombia', year: 2018, sex: 'Female', salary: 320.0 },
    { country: 'Colombia', year: 2017, sex: 'Male', salary: 350.0 },
    { country: 'Colombia', year: 2017, sex: 'Female', salary: 310.0 },
    { country: 'Colombia', year: 2016, sex: 'Male', salary: 340.0 },
    { country: 'Colombia', year: 2016, sex: 'Female', salary: 300.0 },
    { country: 'Colombia', year: 2015, sex: 'Male', salary: 330.0 },
    { country: 'Colombia', year: 2015, sex: 'Female', salary: 290.0 },

    // Perú
    { country: 'Perú', year: 2024, sex: 'Male', salary: 380.0 },
    { country: 'Perú', year: 2024, sex: 'Female', salary: 340.0 },
    { country: 'Perú', year: 2023, sex: 'Male', salary: 370.0 },
    { country: 'Perú', year: 2023, sex: 'Female', salary: 330.0 },
    { country: 'Perú', year: 2022, sex: 'Male', salary: 360.0 },
    { country: 'Perú', year: 2022, sex: 'Female', salary: 320.0 },
    { country: 'Perú', year: 2021, sex: 'Male', salary: 350.0 },
    { country: 'Perú', year: 2021, sex: 'Female', salary: 310.0 },
    { country: 'Perú', year: 2020, sex: 'Male', salary: 340.0 },
    { country: 'Perú', year: 2020, sex: 'Female', salary: 300.0 },
    { country: 'Perú', year: 2019, sex: 'Male', salary: 330.0 },
    { country: 'Perú', year: 2019, sex: 'Female', salary: 290.0 },
    { country: 'Perú', year: 2018, sex: 'Male', salary: 320.0 },
    { country: 'Perú', year: 2018, sex: 'Female', salary: 280.0 },
    { country: 'Perú', year: 2017, sex: 'Male', salary: 310.0 },
    { country: 'Perú', year: 2017, sex: 'Female', salary: 270.0 },
    { country: 'Perú', year: 2016, sex: 'Male', salary: 300.0 },
    { country: 'Perú', year: 2016, sex: 'Female', salary: 260.0 },
    { country: 'Perú', year: 2015, sex: 'Male', salary: 290.0 },
    { country: 'Perú', year: 2015, sex: 'Female', salary: 250.0 },
  ];

  // Países disponibles
  const availableCountries = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Perú'];

  // Procesar datos combinados
  const processedData = useMemo(() => {
    const filtered = laborForceData.filter(item => 
      item.country === selectedCountry && 
      item.year >= selectedYearRange.start && 
      item.year <= selectedYearRange.end
    );

    const grouped = {};
    filtered.forEach(item => {
      const key = `${item.year}`;
      if (!grouped[key]) {
        grouped[key] = { year: item.year };
      }
      
      // Calcular población económicamente activa en millones
      const activePop = (item.participationRate / 100) * item.totalPopulation;
      grouped[key][`activePop${item.sex}`] = activePop;
      grouped[key][`participationRate${item.sex}`] = item.participationRate;
    });

    // Agregar datos salariales
    const salaryFiltered = salaryData.filter(item => 
      item.country === selectedCountry && 
      item.year >= selectedYearRange.start && 
      item.year <= selectedYearRange.end
    );

    salaryFiltered.forEach(item => {
      const key = `${item.year}`;
      if (grouped[key]) {
        grouped[key][`salary${item.sex}`] = item.salary;
      }
    });

    return Object.values(grouped).sort((a, b) => a.year - b.year);
  }, [selectedCountry, selectedYearRange, laborForceData, salaryData]);

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Año: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="timeline-comparison-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-16 text-white">
            <HiOutlineUsers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-700 text-gray-800">
              Comparación Temporal: PEA vs Salarios
            </h2>
            <p className="text-gray-600 mt-1">
              Análisis de población económicamente activa (15+ años) y salarios promedio por sexo
            </p>
          </div>
        </div>

        {/* Filtros integrados */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Selector de país */}
            <div className="flex items-center gap-2">
              <HiOutlineFilter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">País:</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Selector de rango de años */}
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Año inicio:</label>
              <select 
                value={selectedYearRange.start} 
                onChange={(e) => setSelectedYearRange({...selectedYearRange, start: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({length: 10}, (_, i) => 2015 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-gray-500">a</span>
              <select 
                value={selectedYearRange.end} 
                onChange={(e) => setSelectedYearRange({...selectedYearRange, end: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({length: 10}, (_, i) => 2015 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Selector de tipo de vista */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Vista:</label>
              <select 
                value={viewType} 
                onChange={(e) => setViewType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="combined">Combinada</option>
                <option value="separate">Separada</option>
                <option value="comparison">Comparación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="metric-card">
            <div className="metric-icon bg-blue-100 text-blue-600">
              <HiOutlineUsers className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                {processedData.length > 0 ? 
                  `${(processedData[processedData.length - 1]?.activePopMale + processedData[processedData.length - 1]?.activePopFemale || 0).toFixed(1)}M` : 
                  'N/A'
                }
              </div>
              <div className="metric-label">PEA Total Actual</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-green-100 text-green-600">
              <HiOutlineCurrencyDollar className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                {processedData.length > 0 ? 
                  `$${((processedData[processedData.length - 1]?.salaryMale + processedData[processedData.length - 1]?.salaryFemale || 0) / 2).toFixed(0)}` : 
                  'N/A'
                }
              </div>
              <div className="metric-label">Salario Promedio</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-purple-100 text-purple-600">
              <HiOutlineUsers className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                {processedData.length > 0 ? 
                  `${((processedData[processedData.length - 1]?.participationRateMale || 0) - (processedData[processedData.length - 1]?.participationRateFemale || 0)).toFixed(1)}%` : 
                  'N/A'
                }
              </div>
              <div className="metric-label">Brecha PEA (M-F)</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bg-orange-100 text-orange-600">
              <HiOutlineCurrencyDollar className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                {processedData.length > 0 ? 
                  `$${((processedData[processedData.length - 1]?.salaryMale || 0) - (processedData[processedData.length - 1]?.salaryFemale || 0)).toFixed(0)}` : 
                  'N/A'
                }
              </div>
              <div className="metric-label">Brecha Salarial (M-F)</div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de PEA por sexo */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-600 text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineUsers className="w-5 h-5 text-blue-600" />
              Población Económicamente Activa por Sexo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  stroke="#666" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={12}
                  label={{ value: 'Millones de personas', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="activePopMale" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="PEA Masculina"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="activePopFemale" 
                  stroke="#EC4899" 
                  strokeWidth={3}
                  name="PEA Femenina"
                  dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de salarios por sexo */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-600 text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-green-600" />
              Salarios Promedio por Sexo (USD)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  stroke="#666" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={12}
                  label={{ value: 'USD', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="salaryMale" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Salario Masculino"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="salaryFemale" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Salario Femenino"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico combinado */}
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-600 text-gray-800 mb-4">
            Análisis Combinado: PEA vs Salarios
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#666" 
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="#666" 
                fontSize={12}
                label={{ value: 'Millones de personas', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#666" 
                fontSize={12}
                label={{ value: 'USD', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="activePopMale" 
                fill="#3B82F6" 
                name="PEA Masculina"
                opacity={0.6}
              />
              <Bar 
                yAxisId="left"
                dataKey="activePopFemale" 
                fill="#EC4899" 
                name="PEA Femenina"
                opacity={0.6}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="salaryMale" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Salario Masculino"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="salaryFemale" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Salario Femenino"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Panel de información */}
        <div className="glass-card p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <HiOutlineInformationCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-600 text-gray-800">Información del Análisis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Población Económicamente Activa (PEA):</strong> Comprende a todas las personas de 15 años y más que participan en la fuerza laboral, ya sea trabajando o buscando trabajo activamente.</p>
              <p className="mt-2"><strong>Salarios en USD:</strong> Salarios promedio mensuales convertidos a dólares estadounidenses para facilitar la comparación entre países.</p>
            </div>
            <div>
              <p><strong>Brecha de PEA:</strong> Diferencia entre la tasa de participación laboral masculina y femenina, indicando disparidades en el acceso al mercado laboral.</p>
              <p className="mt-2"><strong>Brecha Salarial:</strong> Diferencia entre los salarios promedio de hombres y mujeres, reflejando desigualdades en la remuneración.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineComparison;
