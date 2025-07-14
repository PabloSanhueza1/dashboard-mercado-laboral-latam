import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useDataLoader = () => {
  const [employmentData, setEmploymentData] = useState([]);
  const [unemploymentData, setUnemploymentData] = useState([]);
  const [informalEmploymentData, setInformalEmploymentData] = useState([]);
  const [laborForceData, setLaborForceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSexOptions, setAvailableSexOptions] = useState(['Total']);
  const [availableAgeGroups, setAvailableAgeGroups] = useState(['15+']);

  const datasets = {
    employment: {
      file: 'tasa_empleo_por_sexo_edad_sudamerica.csv',
      title: 'Tasa de Empleo',
      color: '#3B82F6',
      unit: '%'
    },
    unemployment: {
      file: 'tasa_desempleo_por_sexo_edad_sudamerica.csv',
      title: 'Tasa de Desempleo',
      color: '#EF4444',
      unit: '%'
    },
    informal: {
      file: 'tasa_empleo_informal_por_sexo_sudamerica.csv',
      title: 'Empleo Informal',
      color: '#F59E0B',
      unit: '%'
    },
    laborForce: {
      file: 'poblacion_economicamente_activa_por_sexo_edad_sudamerica.csv',
      title: 'Población Económicamente Activa',
      color: '#10B981',
      unit: '%'
    },
    salary: {
      file: 'salarios_promedio_mensuales_por_sexo_sudamerica.csv',
      title: 'Salarios Promedio Mensuales',
      color: '#8B5CF6',
      unit: 'USD'
    }
  };

  const processCSVData = (data, dataType) => {
    if (!data || !Array.isArray(data)) {
      console.warn(`No data provided for ${dataType}`);
      return { 
        processedData: [], 
        countries: [],
        sexOptions: ['Total'],
        ageGroups: ['15+'],
        years: []
      };
    }

    const countrySet = new Set();
    const sexSet = new Set();
    const ageGroupSet = new Set();
    const yearSet = new Set();
    
    const southAmericaList = [
      'Argentina', 'Bolivia (Plurinational State of)', 'Brazil', 'Chile', 'Colombia',
      'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname',
      'Uruguay', 'Venezuela (Bolivarian Republic of)'
    ];

    const processedData = data
      .filter(row => row && typeof row === 'object')
      .map(row => ({
        country: row['ref_area.label'] || '',
        year: parseInt(row.time, 10),
        value: parseFloat(row.obs_value),
        sex: row['sex.label'] || 'Total',
        ageGroup: row['classif1.label'] || '',
        currency: row['classif1.label'] || 'N/A',
        indicator: row['indicator.label'] || ''
      }))
      .filter(row => {
        if (!row.country || isNaN(row.year) || isNaN(row.value)) {
          return false;
        }

        const isSouthAmerican = southAmericaList.includes(row.country);
        if (isSouthAmerican) {
          countrySet.add(row.country);
          if (row.sex) sexSet.add(row.sex);
          yearSet.add(row.year);
          
          if (dataType !== 'salary' && row.ageGroup && row.ageGroup.includes('Age')) {
            ageGroupSet.add(row.ageGroup);
          }
        }
        
        if (dataType === 'salary') {
          return isSouthAmerican && row.currency && row.currency.includes('U.S. dollars');
        }
        
        return isSouthAmerican;
      });

    return { 
      processedData: processedData || [], 
      countries: Array.from(countrySet),
      sexOptions: Array.from(sexSet).length > 0 ? Array.from(sexSet) : ['Total'],
      ageGroups: Array.from(ageGroupSet).length > 0 ? Array.from(ageGroupSet) : ['15+'],
      years: Array.from(yearSet).sort((a, b) => a - b)
    };
  };

  const loadDataset = async (datasetKey) => {
    try {
      const response = await fetch(`/dataset/${datasets[datasetKey].file}`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${datasets[datasetKey].title}`);
      }
      const csvText = await response.text();

      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const processed = processCSVData(result.data, datasetKey);
            resolve({ 
              data: processed.processedData || [], 
              countries: processed.countries || [],
              sexOptions: processed.sexOptions || ['Total'],
              ageGroups: processed.ageGroups || ['15+'],
              years: processed.years || []
            });
          },
          error: (err) => {
            console.error(`Error processing ${datasetKey}:`, err);
            resolve({ 
              data: [], 
              countries: [],
              sexOptions: ['Total'],
              ageGroups: ['15+'],
              years: []
            });
          }
        });
      });
    } catch (err) {
      console.error(`Error loading ${datasetKey}:`, err);
      return { 
        data: [], 
        countries: [],
        sexOptions: ['Total'],
        ageGroups: ['15+'],
        years: []
      };
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [employment, unemployment, informal, laborForce, salary] = await Promise.all([
          loadDataset('employment'),
          loadDataset('unemployment'),
          loadDataset('informal'),
          loadDataset('laborForce'),
          loadDataset('salary')
        ]);

        setEmploymentData(employment.data);
        setUnemploymentData(unemployment.data);
        setInformalEmploymentData(informal.data);
        setLaborForceData(laborForce.data);
        setSalaryData(salary.data);

        const allCountries = new Set([
          ...(employment.countries || []),
          ...(unemployment.countries || []),
          ...(informal.countries || []),
          ...(laborForce.countries || []),
          ...(salary.countries || [])
        ]);
        
        const allSexOptions = new Set([
          ...(employment.sexOptions || ['Total']),
          ...(unemployment.sexOptions || ['Total']),
          ...(informal.sexOptions || ['Total']),
          ...(laborForce.sexOptions || ['Total']),
          ...(salary.sexOptions || ['Total'])
        ]);
        
        const allAgeGroups = new Set([
          ...(employment.ageGroups || ['15+']),
          ...(unemployment.ageGroups || ['15+']),
          ...(informal.ageGroups || ['15+']),
          ...(laborForce.ageGroups || ['15+'])
        ]);
        
        const allYears = new Set([
          ...(employment.years || []),
          ...(unemployment.years || []),
          ...(informal.years || []),
          ...(laborForce.years || []),
          ...(salary.years || [])
        ]);
        
        setAvailableCountries(Array.from(allCountries).sort());
        setAvailableSexOptions(Array.from(allSexOptions).filter(Boolean));
        setAvailableAgeGroups(Array.from(allAgeGroups).filter(Boolean));
        setAvailableYears(Array.from(allYears).filter(Boolean).sort((a, b) => a - b));
        
      } catch (err) {
        setError(`Error cargando datos: ${err.message}`);
      }
      setLoading(false);
    };

    loadAllData();
  }, []);

  return {
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData,
    salaryData,
    availableCountries,
    availableYears,
    availableSexOptions,
    availableAgeGroups,
    loading,
    error,
    datasets
  };
};
