# Lane AI assistant

Open the store and select **Ask Lane AI**, or visit the Pages URL with `#assistant` at the end.

## Available now: scripted demo

Without an AI key, chat works on GitHub Pages and on the Node server as a product-only catalog guide. It matches product types, categories, customer problems, and budget constraints, then asks relevant shopping questions. Results appear as catalog cards with real sample prices and product-detail links. If nothing matches, it does not show unrelated products. General-purpose requests, including writing and coding, are redirected to shopping. This mode is not a trained model or an autonomous agent.

Conversation history stays in React memory and clears when leaving or refreshing the assistant. Only the latest 19 messages are sent for each new question; each history entry is limited to 4,000 characters. No chat is saved to the orders file.

## Connect a real AI model

On the Node backend, set these environment variables (never in React or GitHub Pages build variables):

```text
OPENAI_API_KEY=your-server-side-key
OPENAI_MODEL=gpt-6-astra
AI_CHAT_TOKEN=your-long-random-private-access-code
```

Restart the backend. For a separately hosted backend, follow `DEPLOY_BACKEND.md` to set `BACKEND_URL` in GitHub and rebuild Pages.

Both the API key and access code must be configured to enable live mode. The interface will show **AI model connected**. Click that status button, enter the owner-provided access code, and send a message. The access code is held only in memory. Do not put the API key in that field or share it with visitors.

The server calls the OpenAI Responses API over HTTPS with `store:false`. It sends the conversation to OpenAI to generate an answer; this setting does not override the provider's other data retention policies. Model availability and usage charges depend on your OpenAI account. No paid model requests were made during development; the provider path was tested with a stubbed response.

The live endpoint requires the access code, limits messages and output size, has a 45-second provider timeout, and permits 20 authenticated requests per IP per 10-minute process-local window. This is a portfolio demo; use proper per-user authentication, persistent quotas, and monitoring before broader public use.

## Capabilities and limits

The connected model only generates up to two questions about the customer’s product needs, intended use, budget, compatibility, size, or preferences. Product matching is performed by the server against the catalog, not invented by the model. General requests do not reach the model. The model's raw answer is never displayed; only validated question strings are used, with catalog-guided fallback questions if the format is invalid.

Lane has no browsing, live account access, command execution, payment, or external-action tools. It cannot check private orders, place purchases, or submit returns. Customer-support questions clarify the problem without claiming an action was taken.

Endpoints:

- `GET /api/chat/config`: demo/live mode and whether an access code is required.
- `POST /api/chat`: `{ "messages": [{ "role": "user", "content": "Hello" }] }`; returns `{ "reply": "...", "mode": "demo" }` (or `live`).
- Live requests require `Authorization: Bearer YOUR_AI_CHAT_TOKEN`.

Official reference: https://developers.openai.com/api/docs/quickstart
