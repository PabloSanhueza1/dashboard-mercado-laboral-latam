import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useDataLoader = () => {
  const [employmentData, setEmploymentData] = useState([]);
  const [unemploymentData, setUnemploymentData] = useState([]);
  const [informalEmploymentData, setInformalEmploymentData] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSexOptions, setAvailableSexOptions] = useState([]);
  const [availableAgeGroups, setAvailableAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated datasets configuration
  const datasets = {
    informalEmployment: {
      title: 'Tasa de Empleo Informal',
      unit: '%',
      color: '#F59E0B',
      filename: 'tasa_empleo_informal_por_sexo_sudamerica.csv'
    }
  };

  const loadInformalEmploymentData = async () => {
    try {
      const response = await fetch('/dataset/tasa_empleo_informal_por_sexo_sudamerica.csv');
      if (!response.ok) {
        throw new Error(`Error al cargar tasa_empleo_informal_por_sexo_sudamerica.csv: ${response.status}`);
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
              console.warn('Errores en el parsing de empleo informal:', results.errors);
            }
            
            const processedData = results.data
              .filter(row => row['ref_area.label'] && row.time && row.obs_value)
              .map(row => ({
                country: row['ref_area.label'],
                year: parseInt(row.time),
                sex: row['sex.label'] || 'Total',
                value: parseFloat(row.obs_value)
              }))
              .filter(row => !isNaN(row.year) && !isNaN(row.value));
            
            resolve(processedData);
          },
          error: (error) => reject(error)
        });
      });
    } catch (error) {
      throw new Error(`Error al procesar tasa_empleo_informal_por_sexo_sudamerica.csv: ${error.message}`);
    }
  };

  const extractUniqueValues = (employmentData, unemploymentData, informalData) => {
    const allData = [...employmentData, ...unemploymentData, ...informalData];
    const countries = [...new Set(allData.map(row => row.country))].sort();
    const years = [...new Set(allData.map(row => row.year))].sort((a, b) => a - b);
    const sexOptions = [...new Set(allData.map(row => row.sex))].sort();
    const ageGroups = [...new Set(allData.map(row => row.ageGroup).filter(Boolean))].sort();

    return { countries, years, sexOptions, ageGroups };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando datos...');
        const [informalData] = await Promise.all([
          loadInformalEmploymentData()
        ]);
        
        console.log(`Datos cargados: informal=${informalData.length}`);
        
        const { countries, years, sexOptions, ageGroups } = extractUniqueValues(employmentData, unemploymentData, informalData);
        
        setEmploymentData(employmentData);
        setUnemploymentData(unemploymentData);
        setInformalEmploymentData(informalData);
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
    unemploymentData,
    informalEmploymentData,
    availableCountries,
    availableYears,
    availableSexOptions,
    availableAgeGroups,
    loading,
    error,
    datasets
  };
};
