export function getDailyKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getWeeklyKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1);
  const week = Math.ceil(d.getDate() / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getMonthlyKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}
