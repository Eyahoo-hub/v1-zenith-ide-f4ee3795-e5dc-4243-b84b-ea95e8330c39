# Zenith IDE

A minimalist, in-browser IDE for vibe-driven development, powered by AI on Cloudflare's edge.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Eyahoo-hub/generated-app-20250929-064118)

Zenith IDE is a visually stunning, minimalist in-browser Integrated Development Environment designed for a seamless and focused coding experience. It runs entirely on Cloudflare's edge network, leveraging serverless workers for its backend AI capabilities. The application features a classic, flexible four-pane layout: a file explorer for workspace management, a powerful code editor, an integrated AI chat for pair programming, and a functional terminal. The core philosophy is 'vibe coding'—creating a calm, uncluttered, and aesthetically pleasing environment that enhances productivity and creativity. Users can open local folders directly in the browser, and the AI assistant has full context of the open files, enabling intelligent code generation, explanation, and debugging.

## Key Features

-   **Four-Pane Resizable Layout**: A classic IDE setup with a File Explorer, Code Editor, AI Chat, and Terminal.
-   **Local Workspace Access**: Open and edit local project folders directly in the browser using the File System Access API.
-   **Context-Aware AI Chat**: The integrated AI assistant has full context of your active file for intelligent pair programming.
-   **Integrated Terminal**: A functional terminal for running commands and viewing logs.
-   **Minimalist UI/UX**: A clean, "vibe-driven" design that minimizes distractions and enhances focus.
-   **Edge-Powered**: Built entirely on Cloudflare's stack, including Workers for backend logic and Durable Objects for state.

## Technology Stack

-   **Frontend**:
    -   [React](https://react.dev/)
    -   [Vite](https://vitejs.dev/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
    -   [Zustand](https://zustand-demo.pmnd.rs/) for state management
    -   [Framer Motion](https://www.framer.com/motion/) for animations
    -   [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
    -   [Xterm.js](https://xtermjs.org/) for the integrated terminal
-   **Backend**:
    -   [Cloudflare Workers](https://workers.cloudflare.com/)
    -   [Hono](https://hono.dev/)
    -   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) (via Cloudflare Agents SDK)
-   **AI**:
    -   [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/zenith_ide.git
    cd zenith_ide
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

### Configuration

1.  **Log in to Wrangler:**
    This will allow you to interact with your Cloudflare account from the command line.
    ```sh
    bunx wrangler login
    ```

2.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. This file is ignored by Git.
    ```sh
    cp wrangler.jsonc.example .dev.vars
    ```
    Now, edit `.dev.vars` and add your Cloudflare AI Gateway credentials:
    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

### Running Locally

Start the development server, which includes the Vite frontend and the Wrangler dev server for the backend worker.

```sh
bun dev
```

The application will be available at `http://localhost:3000`.

## Usage

1.  Open the application in a browser that supports the File System Access API (e.g., Chrome, Edge).
2.  Click the **"Open Folder"** button in the File Explorer panel.
3.  Select a local project directory and grant access.
4.  The file tree will populate in the explorer. Click on any file to open it in the editor.
5.  Use the AI Chat panel to ask questions about your code. The AI will have the context of the currently active file.
6.  Use the Terminal panel for commands.

## Deployment

This project is designed for easy deployment to Cloudflare's global network.

1.  **Build the project:**
    This command bundles the frontend application and the worker code.
    ```sh
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    This command deploys your application using Wrangler.
    ```sh
    bun run deploy
    ```
    Wrangler will guide you through the deployment process. After deployment, you will receive a URL for your live application.

3.  **Configure Production Secrets:**
    For the deployed application to function correctly, you must add your AI Gateway credentials as secrets in the Cloudflare dashboard.
    ```sh
    bunx wrangler secret put CF_AI_API_KEY
    bunx wrangler secret put CF_AI_BASE_URL
    ```

Alternatively, deploy with a single click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Eyahoo-hub/generated-app-20250929-064118)

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.