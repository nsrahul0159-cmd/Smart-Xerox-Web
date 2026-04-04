export const getOptimizerSuggestions = (totalPages, settings) => {
  const suggestions = [];

  // If pages > 20 and not using double side
  if (totalPages > 20 && settings.sides === 'Single Side') {
    suggestions.push({
      type: 'double_side',
      message: 'Consider printing double-sided to save 50% on paper.',
      potentialSavings: true
    });
  }

  // If pages > 50 and using layout '1'
  if (totalPages > 50 && settings.layout === '1') {
    suggestions.push({
      type: 'layout_change',
      message: 'Consider 2 pages per sheet (1/2 layout) to drastically reduce cost.',
      potentialSavings: true
    });
  }

  // If color is selected but maybe mostly text? 
  // (We don't have deep PDF analysis for colors yet, but we can suggest)
  if (settings.color === 'Color' && totalPages > 10) {
    suggestions.push({
      type: 'color_change',
      message: 'If the document is mostly text, Black & White is 10x cheaper.',
      potentialSavings: true
    });
  }

  return suggestions;
};
