I’m sharing Market Lane—a full-stack e-commerce portfolio demo built with React, Node.js, and Express.

The goal was to connect a responsive shopping experience to real backend logic, with a product assistant focused on customer needs.

What’s included:

• An 80-product sample catalog across five categories, with search, filters, sorting, favorites, and product details.
• A shopping bag saved in browser localStorage.
• Node.js REST APIs for products, demo orders, and chat.
• Server-side quantity validation, trusted pricing, shipping calculations, and JSON-file order storage.
• A product-only assistant that finds matching items and asks relevant questions about budget, intended use, and customer problems.

How the project was built:

1. Created the responsive frontend with React, Vite, CSS, and Lucide icons.
2. Built the Express backend and connected the interface to its APIs using fetch and JSON.
3. Added cart state, product filtering, and server-validated demo checkout.
4. Implemented catalog-based assistant responses, with optional server-side OpenAI integration for shopping follow-up questions.
5. Tested API behavior, CORS, price validation, product matching, and conversation scope. All eight automated tests passed.
6. Added GitHub Actions for tests, builds, and GitHub Pages publishing, plus Docker and backend deployment instructions.

The stack: React • JavaScript • Vite • CSS • Node.js • Express • REST APIs • localStorage • JSON-file persistence • GitHub Actions • GitHub Pages

This is a portfolio demo with sample products and no real payments or fulfillment. The published Pages site is a frontend preview; the Node.js backend runs locally and is prepared for separate hosting. The public assistant uses catalog rules, with real-model integration available when configured.

Built with assistance from Codex, with a focus on understanding how the frontend, API, validation, storage, and deployment fit together.

Live demo: https://gim1203-hue.github.io/full-stack-project/
Source code: https://github.com/gim1203-hue/full-stack-project

#React #NodeJS #FullStackDevelopment #JavaScript #WebDevelopment
