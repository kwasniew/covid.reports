const lastNDays = (dataPoints, days) => dataPoints.slice(-days);

export const calculateGrowth = (dataPoints, days) => {
  const lastDays = lastNDays(dataPoints, days);
  const past = lastDays[0] || 1;
  const present = lastDays[lastDays.length - 1];
  return Math.round((100 * (present - past)) / past);
};

export const calculateCasesInLastDays = (dataPoints, days) => {
  const lastDays = lastNDays(dataPoints, days);
  const past = lastDays[0];
  const present = lastDays[lastDays.length - 1];
  return present - past;
};
