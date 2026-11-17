# Market Lane: how the full-stack demo was built

## What the project contains

React is the browser interface. Node.js runs an Express server that serves products, validates demo orders, and handles chat requests. The frontend and backend communicate using HTTP requests and JSON.

The source includes both parts. The public GitHub Pages version is a static frontend preview; it cannot execute the Node server. Checkout becomes available when a hosted backend URL is configured.

## 1. Set up the project

The project uses JavaScript ES modules, React, React DOM, Vite, Express, and Lucide React icons. The supported project folder is:

```text
C:\Users\muham\OneDrive\Desktop\React Project Builder\full stack project
```

Source layout:

```text
client/
  index.html
  src/
    main.jsx          Storefront, filtering, cart, and product dialogs
    Assistant.jsx     Product-focused assistant interface
    api.js            API connection and static-preview adapter
    style.css         Storefront styling and responsive layouts
    assistant.css     Assistant styling
server/
  index.js            Node startup, environment settings, and React serving
  app.js              Express API routes and demo order persistence
  products.js         80 fictional sample products
  catalog.js          Shared search, category filtering, and sorting
  demo-ai.js          Product matching and customer-needs questions
  chat.js             Demo chat and optional AI-provider connection
  cors.js             Allowed browser origins and preflight support
  *.test.js           Automated tests
.github/workflows/    Test, build, and publish workflow
Dockerfile            Container configuration
```

## 2. Build the React storefront

The interface includes a responsive homepage, five category groups, catalog cards, search, sorting, favorites, product details, and a shopping bag. React state controls what the visitor sees and how interactions update the page. The cart persists in localStorage; favorites last for the page session.

The assortment has 80 sample products, with 16 per category. The storefront displays 32 initially, then loads additional visible cards when the visitor selects “Show more products.” Filtered category pages show their 16 matching products. Product searches stay relevant rather than filling empty results with unrelated items.

CSS handles desktop and mobile layouts. Lucide provides interface icons. Photography is illustrative; product names, prices, stock, ratings, and reviews are demonstration data.

## 3. Build the Node.js and Express API

The backend exposes these routes:

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Check that the server is running |
| GET | `/api/products` | Search, filter, and sort the catalog |
| GET | `/api/products/:id` | Return a product |
| POST | `/api/orders` | Validate and save a demo order |
| GET | `/api/chat/config` | Report the assistant mode |
| POST | `/api/chat` | Return matching products and relevant questions |

## 4. Connect React to the backend

React uses fetch to request JSON from the API. Locally, React and Express use one server origin. For a separately hosted backend, the frontend uses VITE_API_URL and the backend allows the frontend origin through ALLOWED_ORIGINS.

The static Pages preview uses the same sample catalog and search logic in the browser. It clearly labels preview mode and disables server-dependent checkout until a backend is connected.

## 5. Validate checkout on the server

The browser submits product IDs and quantities. The backend looks up prices in its own catalog, rejects invalid quantities and duplicate product lines, calculates totals and shipping, and writes the confirmed demo order to a JSON file.

Shipping is $4.99 below $50 and free at $50 or more. No tax, real payment, or fulfillment is connected. Orders persist under data/orders.json by default; DATA_DIR can point to a persistent disk. This implementation uses one server process and does not reduce catalog stock after demo orders.

## 6. Add the product-only assistant

The assistant interprets supported product types, categories, budgets, and customer problems. It returns catalog cards with matching prices and links to product details. It asks follow-up questions about relevant needs such as use, budget, size, or compatibility. When nothing matches, it says so. General-purpose requests are redirected to shopping.

The public demo uses catalog rules. An optional Node-side OpenAI connection can generate shopping follow-up questions. It requires OPENAI_API_KEY and AI_CHAT_TOKEN on the server; keys are never placed in React. Provider requests were tested with a mock response, without paid calls.

## 7. Test the full-stack behavior

Eight automated tests cover catalog search and category counts, order validation, server-owned prices, shipping, persistence, CORS, malformed requests, provider authentication, product matching, follow-up context, and rejection of unrelated chat requests. Browser checks cover the interface and shopping flows.

## 8. Run the project yourself

Use Node.js 24 for the documented setup:

```sh
git clone https://github.com/gim1203-hue/full-stack-project.git
cd full-stack-project
npm ci
npm run dev
```

Open http://localhost:3000.

To test and run the production build:

```sh
npm test
npm run build
npm start
```

## 9. Publish and connect the backend

GitHub Actions installs dependencies, runs the tests, builds React, and publishes the frontend to GitHub Pages. A Dockerfile and environment examples are included for a Node/container host.

For a hosted full-stack demo:

1. Deploy the repository to a Node.js or container host.
2. Use `npm ci && npm run build` as the build command and `npm start` as the start command.
3. Set HOST=0.0.0.0 and use the host-provided PORT.
4. Set ALLOWED_ORIGINS=https://gim1203-hue.github.io.
5. Mount persistent storage and set DATA_DIR if orders should survive redeployments.
6. Verify that the backend `/api/health` and `/api/products` endpoints return JSON.
7. Set the repository Actions variable BACKEND_URL to the HTTPS backend origin, without `/api`.
8. Rerun the Pages workflow to connect the frontend and enable demo checkout.

The backend has not been hosted as part of this project. Docker configuration is supplied but has not been locally verified with Docker. For a production store, user authentication, a database, transactional inventory, real payments, and fulfillment remain separate work.

## 10. Share the project

Suggested image order: product catalog, product details, shopping-assistant results. The accompanying LinkedIn draft describes the implemented stack and current deployment accurately.

- Demo: https://gim1203-hue.github.io/full-stack-project/
- Repository: https://github.com/gim1203-hue/full-stack-project
- Backend guide: https://github.com/gim1203-hue/full-stack-project/blob/main/DEPLOY_BACKEND.md
- Assistant setup: https://github.com/gim1203-hue/full-stack-project/blob/main/AI_SETUP.md
