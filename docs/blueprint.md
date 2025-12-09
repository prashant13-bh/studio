# **App Name**: GravityAI

## Core Features:

- Nx Monorepo Setup: Configure a scalable monorepo with Nx to manage code sharing and dependencies across Electron, React Native, and Chrome Extension platforms.
- AI Service Abstraction: Implement a Provider Adapter Pattern with a unified LLMProvider interface to abstract specific LLM SDKs and allow switching providers at runtime based on user configuration, dynamically switching when a particular provider's service is unavailable. This will allow implementation of bring-your-own-key (BYOK) functionality
- Fluent Prompt Builder: Implement a Prompt Builder design pattern that manages roles, template injection, and token budgeting. The prompt builder constructs the prompt, and is a tool that assists with injecting conversation details
- Hybrid Sliding Window Algorithm: Implement a Hybrid Sliding Window strategy for context management, which supports prioritization of messages and efficient message compression, allowing the agent to remember who it is and what was said
- Chrome Extension Side Panel Integration: Integrate a chrome.sidePanel to enable AI usage while browsing, implementing a Global State model for chat history and tab-aware context injection.
- Electron Transparent Overlays: Enable transparent overlays on the Electron application with click-through logic to interact with underlying OS windows. The user will hover to prevent click-through.
- Secure API Key Storage: Implement encryption for user API keys with a dual strategy. For electron use the safeStorage API, and for chrome extensions use Web Crypto API (SubtleCrypto). The service securely stores, encrypts, decrypts, and retrieves user API keys using AES256, a widely-trusted standard.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) to evoke a sense of intellect and sophisticated technology.
- Background color: Light Lavender (#E6E6FA), a very desaturated version of indigo to provide a muted backdrop that lets the content pop.
- Accent color: Violet (#8F00FF), which is an analogous color to the primary indigo, and offers a high degree of contrast in brightness and saturation for calls to action or to highlight information.
- Body and headline font: 'Inter', a sans-serif font, provides a modern, machined, objective, neutral look suitable for both headlines or body text.
- Use a set of minimalist line icons for navigation and actions, maintaining a consistent stroke weight and style.
- Design a modular layout that adapts to different screen sizes across desktop, web, and mobile platforms. Utilize flexbox and grid layouts for responsiveness.
- Incorporate subtle animations for UI transitions and feedback, such as fading effects or micro-interactions on button clicks.