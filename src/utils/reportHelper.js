/**
 * Calcula as datas de início e os rótulos para os períodos do relatório.
 */
function getReportPeriod(period) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let startDate = new Date(now);
  let periodLabel = '';

  switch (period) {
    case 'ontem':
      startDate.setDate(startDate.getDate() - 1);
      periodLabel = 'Ontem';
      break;
    case 'semana':
      startDate.setDate(startDate.getDate() - 7);
      periodLabel = 'Últimos 7 dias';
      break;
    case 'hoje':
    default:
      periodLabel = 'Hoje';
      break;
  }
  return { startDate, periodLabel };
}

module.exports = { getReportPeriod };
