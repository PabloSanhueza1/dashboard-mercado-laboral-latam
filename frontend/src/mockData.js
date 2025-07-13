// Datos de prueba para desarrollo
export const mockEmploymentData = [
  {
    country: "Argentina",
    employmentRate: 65.2,
    year: 2024,
    isBackup: false,
    historicalData: [
      { year: 2024, employmentRate: 65.2, country: "Argentina" },
      { year: 2023, employmentRate: 64.8, country: "Argentina" },
      { year: 2022, employmentRate: 63.5, country: "Argentina" },
      { year: 2021, employmentRate: 61.2, country: "Argentina" },
      { year: 2020, employmentRate: 58.9, country: "Argentina" },
    ]
  },
  {
    country: "Brazil",
    employmentRate: 68.4,
    year: 2024,
    isBackup: false,
    historicalData: [
      { year: 2024, employmentRate: 68.4, country: "Brazil" },
      { year: 2023, employmentRate: 67.9, country: "Brazil" },
      { year: 2022, employmentRate: 66.8, country: "Brazil" },
      { year: 2021, employmentRate: 64.2, country: "Brazil" },
      { year: 2020, employmentRate: 61.8, country: "Brazil" },
    ]
  },
  {
    country: "Chile",
    employmentRate: 72.1,
    year: 2024,
    isBackup: false,
    historicalData: [
      { year: 2024, employmentRate: 72.1, country: "Chile" },
      { year: 2023, employmentRate: 71.5, country: "Chile" },
      { year: 2022, employmentRate: 70.8, country: "Chile" },
      { year: 2021, employmentRate: 68.9, country: "Chile" },
      { year: 2020, employmentRate: 66.2, country: "Chile" },
    ]
  },
  {
    country: "Colombia",
    employmentRate: 63.8,
    year: 2024,
    isBackup: false,
    historicalData: [
      { year: 2024, employmentRate: 63.8, country: "Colombia" },
      { year: 2023, employmentRate: 62.9, country: "Colombia" },
      { year: 2022, employmentRate: 61.4, country: "Colombia" },
      { year: 2021, employmentRate: 59.8, country: "Colombia" },
      { year: 2020, employmentRate: 57.2, country: "Colombia" },
    ]
  },
  {
    country: "Peru",
    employmentRate: 69.3,
    year: 2024,
    isBackup: false,
    historicalData: [
      { year: 2024, employmentRate: 69.3, country: "Peru" },
      { year: 2023, employmentRate: 68.7, country: "Peru" },
      { year: 2022, employmentRate: 67.2, country: "Peru" },
      { year: 2021, employmentRate: 65.1, country: "Peru" },
      { year: 2020, employmentRate: 62.4, country: "Peru" },
    ]
  },
  {
    country: "Ecuador",
    employmentRate: 66.5,
    year: 2024,
    isBackup: false,
    historicalData: [
      { year: 2024, employmentRate: 66.5, country: "Ecuador" },
      { year: 2023, employmentRate: 65.8, country: "Ecuador" },
      { year: 2022, employmentRate: 64.9, country: "Ecuador" },
      { year: 2021, employmentRate: 63.1, country: "Ecuador" },
      { year: 2020, employmentRate: 60.8, country: "Ecuador" },
    ]
  }
];

export const generateMockData = (selectedCountries) => {
  return mockEmploymentData.filter(item => 
    selectedCountries.length === 0 || 
    selectedCountries.some(selected => 
      item.country.toLowerCase().includes(selected.toLowerCase())
    )
  );
};
