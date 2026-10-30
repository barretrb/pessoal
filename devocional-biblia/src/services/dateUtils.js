// Utilitários de data e cálculo dinâmico de dia atual e pendências

export function getTodayDay(daysList) {
  if (!daysList || daysList.length === 0) return null;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const found = daysList.find(d => d.date === todayStr);
  if (found) return found;

  // Fallback: cálculo de dia do ano
  const start = new Date(year, 0, 1);
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  const clamped = Math.min(Math.max(1, diffDays), 365);
  return daysList.find(d => d.id === clamped) || daysList[clamped - 1] || daysList[0];
}

export function getPendingDays(daysList, currentDayId, chapterProgress = {}) {
  if (!daysList) return [];
  return daysList.filter(d => {
    // Se o dia já está marcado como concluído, não é pendente
    if (d.completed) return false;
    // Se não é dia anterior a hoje, não é pendência acumulada
    if (d.id >= currentDayId) return false;
    // Se todos os capítulos do dia já foram concluídos individualmente, NÃO é pendência
    if (d.readings && d.readings.length > 0 && d.readings.every(r => !!chapterProgress[r]?.completed)) {
      return false;
    }
    return true;
  });
}

const MONTHS_BR = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

export function formatDateBR(dateStr, full = false) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];

  if (full) {
    return `${day} de ${MONTHS_BR[monthIdx] || ''}`;
  }
  return `${parts[2]}/${parts[1]}`;
}
