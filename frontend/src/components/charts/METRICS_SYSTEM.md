# Sistema de Métricas Dinámicas - TimelineComparison

## 📊 Descripción General

El componente `TimelineComparison` utiliza un sistema de métricas completamente dinámico que permite:
- Agregar nuevas métricas sin modificar el código principal
- Activar/desactivar métricas dinámicamente
- Configurar presets predefinidos
- Cálculos automáticos de tendencias

## 🚀 Cómo Agregar Nuevas Métricas

### 1. Definir la Métrica

Agrega un nuevo objeto al array `metricsConfig`:

```javascript
{
  id: 'miNuevaMetrica',
  title: 'Título de la Métrica',
  icon: HiOutlineIcono,
  color: 'blue', // blue, green, purple, orange, indigo
  formatter: (value) => `${value.toFixed(2)}%`,
  calculate: (latest, first) => ({
    value: // cálculo con datos actuales
    firstValue: // cálculo con datos iniciales (para tendencia)
  })
}
```

### 2. Agregar a Presets (Opcional)

Incluye la nueva métrica en los presets relevantes:

```javascript
const metricsPresets = {
  miPreset: ['miNuevaMetrica', 'otraMetrica'],
  // ... otros presets
};
```

## 📈 Métricas Disponibles

### Métricas Principales
- **totalPEA**: Población Económicamente Activa Total
- **avgSalary**: Salario Promedio
- **peaGap**: Brecha PEA (Masculino - Femenino)
- **salaryGap**: Brecha Salarial (Masculino - Femenino)

### Métricas por Género
- **malePEA**: PEA Masculina
- **femalePEA**: PEA Femenina
- **maleSalary**: Salario Masculino
- **femaleSalary**: Salario Femenino

### Métricas de Ratio
- **participationRatio**: Ratio PEA Masculina/Femenina
- **salaryRatio**: Ratio Salario Masculino/Femenino

### Métricas de Información
- **yearRange**: Rango de Años
- **dataPoints**: Puntos de Datos

## 🎨 Presets Disponibles

- **principales**: Métricas más importantes
- **completas**: Métricas principales + información
- **genero**: Desglose por género
- **brechas**: Brechas y ratios
- **ratios**: Solo ratios
- **todas**: Todas las métricas disponibles

## 🔧 Configuración Avanzada

### Colores Disponibles
- `blue`: Azul
- `green`: Verde
- `purple`: Púrpura
- `orange`: Naranja
- `indigo`: Índigo

### Iconos Comunes
- `HiOutlineUsers`: Usuarios/Población
- `HiOutlineCurrencyDollar`: Dinero/Salarios
- `HiOutlineChartBar`: Gráficos/Análisis
- `HiOutlineScale`: Balanza/Comparación
- `HiOutlineCalendar`: Calendario/Tiempo
- `HiOutlineTrendingUp`: Tendencias

## 💡 Ejemplo de Implementación

```javascript
// Agregar métrica de crecimiento anual
{
  id: 'growthRate',
  title: 'Crecimiento Anual',
  icon: HiOutlineTrendingUp,
  color: 'green',
  formatter: (value) => `${value.toFixed(1)}%`,
  calculate: (latest, first) => {
    const years = processedData.length - 1;
    const totalGrowth = ((latest.totalPEA - first.totalPEA) / first.totalPEA) * 100;
    return {
      value: totalGrowth / years,
      firstValue: 0
    };
  }
}
```

## 📱 Responsividad

El sistema ajusta automáticamente el número de columnas según:
- Número de métricas seleccionadas
- Tamaño de pantalla
- Breakpoints de Tailwind CSS

## 🔄 Actualización en Tiempo Real

- Los cálculos se actualizan automáticamente cuando cambian los filtros
- Las tendencias se calculan dinámicamente
- El sistema es completamente reactivo

## 🎯 Casos de Uso

1. **Análisis Rápido**: Usar preset "principales"
2. **Análisis de Género**: Usar preset "genero"
3. **Análisis de Desigualdad**: Usar preset "brechas"
4. **Dashboard Completo**: Usar preset "todas"
5. **Análisis Personalizado**: Seleccionar métricas individualmente

## 🚀 Ventajas del Sistema

- **Escalable**: Agregar nuevas métricas es simple
- **Flexible**: Configuración completamente dinámica
- **Performante**: Cálculos optimizados con useMemo
- **Intuitivo**: Interfaz fácil de usar
- **Mantenible**: Código bien estructurado y documentado
