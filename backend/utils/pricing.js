export const calculatePrice = (totalPages, settings) => {
  let basePrice = settings.color === 'Color' ? 10 : 1;
  let sheetsNeeded = totalPages;

  // Layout adjustment (pages per sheet)
  if (settings.layout === '1/2') {
    sheetsNeeded = Math.ceil(totalPages / 2);
  } else if (settings.layout === '1/4') {
    sheetsNeeded = Math.ceil(totalPages / 4);
  }

  // Double side adjustment
  if (settings.sides === 'Double Side') {
    sheetsNeeded = Math.ceil(sheetsNeeded / 2);
  }

  const totalCost = sheetsNeeded * basePrice * settings.copies;
  return totalCost;
};
