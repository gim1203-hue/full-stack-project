import {products} from '../../server/products.js';

export const staticPreview = import.meta.env.VITE_STATIC_PREVIEW === 'true';

export async function api(url, options) {
  if (staticPreview) {
    if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const request = new URL(url, window.location.origin);
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
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Please try again.');
  return body;
}
