import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useDataLoader = () => {
  const [employmentData, setEmploymentData] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSexOptions, setAvailableSexOptions] = useState([]);
  const [availableAgeGroups, setAvailableAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single dataset configuration
  const datasets = {
    employment: {
      title: 'Tasa de Empleo',
      unit: '%',
      color: '#3B82F6',
      filename: 'tasa de empleo.csv'
    }
  };

  const loadEmploymentData = async () => {
    try {
      const response = await fetch('/data/tasa de empleo.csv');
      if (!response.ok) {
        throw new Error(`Error al cargar tasa de empleo.csv: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value) => value.trim(),
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('Errores en el parsing de tasa de empleo:', results.errors);
            }
            
            const processedData = results.data
              .filter(row => row.Country && row.Year && row.Value)
              .map(row => ({
                country: row.Country,
                year: parseInt(row.Year),
                sex: row.Sex || 'Total',
                ageGroup: row['Age group'] || '15+',
                value: parseFloat(row.Value)
              }))
              .filter(row => !isNaN(row.year) && !isNaN(row.value));
            
            resolve(processedData);
          },
          error: (error) => reject(error)
        });
      });
    } catch (error) {
      throw new Error(`Error al procesar tasa de empleo.csv: ${error.message}`);
    }
  };

  const extractUniqueValues = (data) => {
    const countries = [...new Set(data.map(row => row.country))].sort();
    const years = [...new Set(data.map(row => row.year))].sort((a, b) => a - b);
    const sexOptions = [...new Set(data.map(row => row.sex))].sort();
    const ageGroups = [...new Set(data.map(row => row.ageGroup))].sort();

    return { countries, years, sexOptions, ageGroups };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando datos de empleo...');
        const employmentData = await loadEmploymentData();
        
        console.log(`Datos de empleo cargados: ${employmentData.length} registros`);
        
        const { countries, years, sexOptions, ageGroups } = extractUniqueValues(employmentData);
        
        setEmploymentData(employmentData);
        setAvailableCountries(countries);
        setAvailableYears(years);
        setAvailableSexOptions(sexOptions);
        setAvailableAgeGroups(ageGroups);
        
        console.log('Datos procesados exitosamente');
        
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    employmentData,
    availableCountries,
    availableYears,
    availableSexOptions,
    availableAgeGroups,
    loading,
    error,
    datasets
  };
};
