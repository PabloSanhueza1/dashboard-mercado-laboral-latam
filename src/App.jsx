import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  HiFilter as Filter, 
  HiDownload as Download, 
  HiRefresh as RefreshCw, 
  HiTrendingUp as TrendingUp, 
  HiUsers as Users, 
  HiOfficeBuilding as Building2, 
  HiLocationMarker as MapPin,
  HiChevronDown as ChevronDown,
  HiSearch as Search
} from 'react-icons/hi';

const Dashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [dateRange, setDateRange] = useState('6months');

  // Datos de ejemplo
  const countries = [
    { code: 'all', name: 'Todos los países', regions: ['all'] },
    { code: 'mx', name: 'México', regions: ['all', 'norte', 'centro', 'sur'] },
    { code: 'ar', name: 'Argentina', regions: ['all', 'buenos-aires', 'cordoba', 'santa-fe'] },
    { code: 'br', name: 'Brasil', regions: ['all', 'sao-paulo', 'rio-janeiro', 'minas-gerais'] },
    { code: 'co', name: 'Colombia', regions: ['all', 'bogota', 'antioquia', 'valle'] },
    { code: 'cl', name: 'Chile', regions: ['all', 'metropolitana', 'valparaiso', 'bio-bio'] },
    { code: 'pe', name: 'Perú', regions: ['all', 'lima', 'arequipa', 'trujillo'] },
  ];

  const regionNames = {
    'all': 'Todas las regiones',
    'norte': 'Norte', 'centro': 'Centro', 'sur': 'Sur',
    'buenos-aires': 'Buenos Aires', 'cordoba': 'Córdoba', 'santa-fe': 'Santa Fe',
    'sao-paulo': 'São Paulo', 'rio-janeiro': 'Rio de Janeiro', 'minas-gerais': 'Minas Gerais',
    'bogota': 'Bogotá', 'antioquia': 'Antioquia', 'valle': 'Valle del Cauca',
    'metropolitana': 'Metropolitana', 'valparaiso': 'Valparaíso', 'bio-bio': 'Bío Bío',
    'lima': 'Lima', 'arequipa': 'Arequipa', 'trujillo': 'Trujillo'
  };

  // Datos para gráficos
  const jobsByCountry = [
    { name: 'México', empleos: 45000, candidatos: 120000, salario: 2800 },
    { name: 'Brasil', empleos: 38000, candidatos: 95000, salario: 2200 },
    { name: 'Argentina', empleos: 28000, candidatos: 80000, salario: 2400 },
    { name: 'Colombia', empleos: 25000, candidatos: 70000, salario: 2100 },
    { name: 'Chile', empleos: 20000, candidatos: 55000, salario: 2900 },
    { name: 'Perú', empleos: 18000, candidatos: 50000, salario: 1900 },
  ];

  const jobsByIndustry = [
    { name: 'Tecnología', value: 35, color: '#3B82F6' },
    { name: 'Finanzas', value: 20, color: '#10B981' },
    { name: 'Salud', value: 15, color: '#F59E0B' },
    { name: 'Educación', value: 12, color: '#EF4444' },
    { name: 'Manufactura', value: 10, color: '#8B5CF6' },
    { name: 'Otros', value: 8, color: '#6B7280' },
  ];

  const trendsData = [
    { mes: 'Ene', empleos: 20000, candidatos: 55000, contrataciones: 3200 },
    { mes: 'Feb', empleos: 22000, candidatos: 58000, contrataciones: 3500 },
    { mes: 'Mar', empleos: 25000, candidatos: 62000, contrataciones: 3800 },
    { mes: 'Abr', empleos: 28000, candidatos: 65000, contrataciones: 4100 },
    { mes: 'May', empleos: 30000, candidatos: 68000, contrataciones: 4300 },
    { mes: 'Jun', empleos: 32000, candidatos: 70000, contrataciones: 4500 },
  ];

  const salaryRanges = [
    { rango: '$500-1000', cantidad: 15 },
    { rango: '$1000-1500', cantidad: 25 },
    { rango: '$1500-2000', cantidad: 30 },
    { rango: '$2000-3000', cantidad: 20 },
    { rango: '$3000+', cantidad: 10 },
  ];

  const availableRegions = useMemo(() => {
    const country = countries.find(c => c.code === selectedCountry);
    return country ? country.regions : ['all'];
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
    setSelectedRegion('all');
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const stats = [
    { title: 'Total Empleos', value: '174,000', change: '+12.3%', icon: Building2 },
    { title: 'Candidatos Activos', value: '438,000', change: '+8.7%', icon: Users },
    { title: 'Contrataciones', value: '23,400', change: '+15.2%', icon: TrendingUp },
    { title: 'Salario Promedio', value: '$2,387', change: '+5.4%', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Mercado Laboral</h1>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <div className="relative">
              <select 
                value={selectedCountry}
                onChange={handleCountryChange}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={selectedRegion}
                onChange={handleRegionChange}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              >
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {regionNames[region]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={dateRange}
                onChange={handleDateRangeChange}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
              >
                <option value="1month">1 mes</option>
                <option value="3months">3 meses</option>
                <option value="6months">6 meses</option>
                <option value="1year">1 año</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Empleos por País */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Empleos por País</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobsByCountry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="empleos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Empleos por Industria */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Industria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobsByIndustry}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {jobsByIndustry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends and Salary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Tendencias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendencias Mensuales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="empleos" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="candidatos" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="contrataciones" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Rangos Salariales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución Salarial</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rango" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full Width Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativa Completa por País</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={jobsByCountry}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="empleos" fill="#3B82F6" name="Empleos" />
              <Bar dataKey="candidatos" fill="#10B981" name="Candidatos" />
              <Bar dataKey="salario" fill="#F59E0B" name="Salario Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
