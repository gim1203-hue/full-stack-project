import {products} from '../../server/products.js';
import {demoReply} from '../../server/demo-ai.js';

const backend = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
if (backend && !/^https?:\/\/[^/]+$/.test(backend)) throw new Error('VITE_API_URL must be a server origin, such as https://api.example.com, without /api.');
export const staticPreview = import.meta.env.VITE_STATIC_PREVIEW === 'true' && !backend;

export async function api(url, options) {
  if (staticPreview) {
    if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const request = new URL(url, window.location.origin);
    if (request.pathname === '/api/chat/config') return {mode:'demo',authRequired:false};
    if (request.pathname === '/api/chat') return demoReply(JSON.parse(options.body).messages);
    if (request.pathname === '/api/products') {
      const category = request.searchParams.get('category') || 'All';
      const query = (request.searchParams.get('q') || '').toLowerCase();
      const sort = request.searchParams.get('sort');
      const result = products.filter(p => (category === 'All' || category === p.category) && (p.name + ' ' + p.category + ' ' + p.description).toLowerCase().includes(query));
      if (sort === 'price-asc') result.sort((a,b) => a.price - b.price);
      if (sort === 'price-desc') result.sort((a,b) => b.price - a.price);
      if (sort === 'rating') result.sort((a,b) => b.rating - a.rating);
      return result;
    }
    throw new Error('Checkout needs the Node.js backend. Run the full-stack project using the repository setup instructions.');
  }
  let response;
  try { response = await fetch(backend + url, options); }
  catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the Node.js backend. Check its URL, server status, and ALLOWED_ORIGINS setting.');
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('The backend returned a web page instead of API JSON. Check VITE_API_URL and the server deployment.');
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Please try again.');
  return body;
}
