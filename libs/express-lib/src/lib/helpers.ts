export function mysqlDate(
  dataPoint: Date,
) {
  return dataPoint.toISOString().slice(0, 19).replace('T', ' ');
}