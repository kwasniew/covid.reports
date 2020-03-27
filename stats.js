import prop from "./web_modules/lodash.property.js";
import mapValues from "./web_modules/lodash.mapvalues.js";

const lastNDays = (dataPoints, days) => dataPoints.slice(-(days + 1));

export const calculateGrowth = (dataPoints, days) => {
  const lastDays = lastNDays(dataPoints, days);
  const past = lastDays[0] || 1;
  const present = lastDays[lastDays.length - 1];
  if (past > present) return 0;
  return Math.round((100 * (present - past)) / past);
};

export const calculateCasesInLastDays = (dataPoints, days) => {
  const lastDays = lastNDays(dataPoints, days);
  const past = lastDays[0];
  const present = lastDays[lastDays.length - 1];
  return Math.max(present - past, 0);
};

const calculateCustomStats = ({ stats, reportType, days }) => {
  const extractReportType = prop(reportType);
  return {
    growth: calculateGrowth(stats.map(extractReportType), days),
    lastCases: calculateCasesInLastDays(stats.map(extractReportType), days),
    totalCases: extractReportType(stats[stats.length - 1])
  };
};

export const addCustomStatsToReport = ({ report, reportType, days }) => {
  return mapValues(report, stats =>
    Object.assign(stats, calculateCustomStats({ stats, reportType, days }))
  );
};
