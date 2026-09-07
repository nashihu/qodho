/**
 * Helper utility to compute multi-period Qodho requirements with overlap merging.
 */
export function computePeriodsRequirement(periods = []) {
  if (!periods || !Array.isArray(periods) || periods.length === 0) {
    return {
      minStartDate: '',
      maxEndDate: '',
      totalDays: 0,
      totalPrayers: { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 },
      overallTotalPrayers: 0,
      getDayPrayerRequirements: () => ({ subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false, requiredCount: 0 }),
      dateMap: new Map()
    };
  }

  const dateMap = new Map();
  let minStartMs = Infinity;
  let maxEndMs = -Infinity;
  let minStartStr = '';
  let maxEndStr = '';

  periods.forEach((period) => {
    if (!period || !period.startDate || !period.endDate) return;
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const startMs = start.getTime();
    const endMs = end.getTime();

    if (isNaN(startMs) || isNaN(endMs) || endMs < startMs) return;

    if (startMs < minStartMs) {
      minStartMs = startMs;
      minStartStr = period.startDate;
    }
    if (endMs > maxEndMs) {
      maxEndMs = endMs;
      maxEndStr = period.endDate;
    }

    const numDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    const sel = period.selectedPrayers || { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true };

    for (let i = 0; i < numDays; i++) {
      const d = new Date(startMs + i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let current = dateMap.get(dateStr) || { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false };
      current.subuh = current.subuh || !!sel.subuh;
      current.dzuhur = current.dzuhur || !!sel.dzuhur;
      current.ashar = current.ashar || !!sel.ashar;
      current.maghrib = current.maghrib || !!sel.maghrib;
      current.isya = current.isya || !!sel.isya;

      dateMap.set(dateStr, current);
    }
  });

  const totalPrayers = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };

  dateMap.forEach((req) => {
    if (req.subuh) totalPrayers.subuh++;
    if (req.dzuhur) totalPrayers.dzuhur++;
    if (req.ashar) totalPrayers.ashar++;
    if (req.maghrib) totalPrayers.maghrib++;
    if (req.isya) totalPrayers.isya++;
  });

  const overallTotalPrayers = totalPrayers.subuh + totalPrayers.dzuhur + totalPrayers.ashar + totalPrayers.maghrib + totalPrayers.isya;

  const getDayPrayerRequirements = (dateStr) => {
    const req = dateMap.get(dateStr) || { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false };
    const requiredCount = (req.subuh ? 1 : 0) + (req.dzuhur ? 1 : 0) + (req.ashar ? 1 : 0) + (req.maghrib ? 1 : 0) + (req.isya ? 1 : 0);
    return { ...req, requiredCount };
  };

  return {
    minStartDate: minStartStr,
    maxEndDate: maxEndStr,
    totalDays: dateMap.size,
    totalPrayers,
    overallTotalPrayers,
    getDayPrayerRequirements,
    dateMap
  };
}
