# Market Lane — Full Stack Project

[Frontend preview](https://gim1203-hue.github.io/full-stack-project/) · [Source repository](https://github.com/gim1203-hue/full-stack-project)

![Build and deploy](https://github.com/gim1203-hue/full-stack-project/actions/workflows/pages.yml/badge.svg)

An original Amazon-inspired shopping demo: product catalog, search, categories, sorting, favorites, product details, persistent shopping bag, quantity controls, and a working demo checkout.

## Run the full-stack app

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build` then `npm start`. Run API integration tests with `npm test`.

## How React and Node work together

1. Node.js runs Express, which serves the React app and `/api` on the same port.
2. React renders the storefront in your browser. Its state controls filters, product dialogs, favorites, and the bag. Bag contents persist in browser localStorage; favorites last for the current page session.
3. React calls `GET /api/products?q=headphones&category=Electronics&sort=price-asc` using `fetch()`. Express filters the server-side catalog and returns JSON. React turns that data into product cards.
4. Clicking **Place demo order** sends `POST /api/orders` with product IDs and quantities. The backend validates them, reads its own prices, calculates shipping and totals, and writes an order to `data/orders.json`.
5. The backend returns the order JSON. React shows the receipt and clears the bag after successful checkout.

Example checkout request:

```js
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: [{ id: 'headphones', quantity: 1 }] })
});
const order = await response.json();
```

The browser sends IDs and quantities. Server-owned prices prevent a browser from choosing its own checkout total.

## Files

- `client/src/main.jsx`: React storefront and API calls.
- `client/src/style.css`: responsive styling.
- `server/index.js`: Node server and Vite development integration.
- `server/app.js`: Express routes, validation, price calculation, and order persistence.
- `server/products.js`: sample catalog.
- `server/api.test.js`: API integration tests using temporary files.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Server health |
| GET | `/api/products` | Catalog; optional `q`, `category`, `sort` |
| GET | `/api/products/:id` | One product |
| POST | `/api/orders` | Validate and save a demo order |

Shipping is $4.99 below $50 and free at $50 or more. No tax is calculated. Orders are serialized and persisted to a JSON file for one server process. Sample stock limits each order; placing demo orders does not reduce the catalog stock.

## Demo scope

No real payments, accounts, delivery, email subscription service, or inventory reservation. Catalog names, brands, prices, ratings, and reviews are sample data. Unsplash photography is illustrative; Google Fonts and photos require an internet connection. The server binds to loopback for local use.

For a public commerce service, add a database, authentication, payment provider, real product data, inventory transactions, and fulfillment. Sites hosting uses Cloudflare Workers rather than a Node server, so this project is delivered locally to preserve the requested Node.js runtime.

## GitHub Pages portfolio preview

The included GitHub Actions workflow tests the backend, builds React with `VITE_STATIC_PREVIEW=true` and the repository base path, then deploys `dist` to Pages. In repository Settings → Pages, choose **GitHub Actions** as the source.

GitHub Pages hosts static files and cannot run the Node.js server. The Pages version uses the same bundled sample catalog for search, sorting, product details, and cart interactions. It shows a preview banner and disables checkout. This is a frontend showcase of the full-stack source, not a live backend deployment.

## Deploy the full React + Node application

Use a Node.js or container host with Node 24, `npm ci && npm run build`, and `npm start`. Set `HOST=0.0.0.0` and use the host-provided `PORT`. Mount persistent storage at the project `data/` directory to keep demo orders across redeployments. Run a single server instance with this JSON storage implementation.

A Dockerfile is included (not locally tested unless Docker is available):

```sh
docker build -t market-lane .
docker run --rm -p 3000:3000 -v market-lane-data:/app/data market-lane
```

## Share on LinkedIn

Use the repository link and frontend preview link above in your Featured section. A ready-to-edit draft is in [LINKEDIN_POST.md](LINKEDIN_POST.md). The draft accurately describes the static preview and demo checkout limits; it has not been posted.
