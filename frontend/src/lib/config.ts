export const getApiUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || '/api-backend';
  
  // If the URL is set to an absolute domain (e.g. deployed on Render) and misses /api
  if (url.startsWith('http') && !url.endsWith('/api') && !url.includes('api-backend')) {
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    return `${cleanUrl}/api`;
  }
  
  return url;
};
