function daysAgo(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export const visitorSeries = Array.from({ length: 7 }, (_, i) => {
  const day = 6 - i;
  return {
    date: daysAgo(day),
    visitors: [142, 168, 151, 190, 176, 204, 188][i],
    expected: [160, 175, 165, 200, 185, 210, 195][i],
  };
});

export const attendanceSeries = Array.from({ length: 7 }, (_, i) => {
  const day = 6 - i;
  return {
    date: daysAgo(day),
    hours: [7.2, 7.8, 7.5, 8.1, 7.9, 6.4, 7.6][i],
    punches: [1180, 1240, 1210, 1295, 1260, 980, 1225][i],
  };
});

export const kpiSparkVisitors = [132, 148, 141, 162, 155, 178, 188];
export const kpiSparkShowRate = [86, 88, 87, 90, 89, 92, 91];
export const kpiSparkPresence = [64, 71, 68, 74, 72, 70, 76];
