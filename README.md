# 🚨 Emergency Response System App

A modern, responsive web application designed to streamline and coordinate emergency response efforts in real-time. Built using the latest web technologies to ensure speed, accessibility, and reliability when it matters most.

---

## 📦 Project Overview

This application provides a platform for emergency response teams to:

- Track and respond to incidents in real-time
- Manage personnel and resources efficiently
- Communicate across teams and locations
- Analyze response metrics for continuous improvement

---

## 🛠 Tech Stack

This project uses the following technologies:

- **Vite** – Blazing-fast development environment
- **React** – Component-based UI
- **TypeScript** – Type safety and improved DX
- **Tailwind CSS** – Utility-first styling
- **shadcn/ui** – Accessible, customizable UI components
- **Radix UI** – Unstyled building blocks for headless UI
- **Supabase** – Backend-as-a-service for auth and database
- **React Hook Form** – Efficient form handling
- **TanStack Query** – Server state management
- **Recharts** – Data visualization
- **Zod** – Schema validation

---

## 🧑‍💻 Getting Started

To run this project locally, make sure you have **Node.js** and **npm** installed. It’s recommended to use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for managing Node versions.

### 🔧 Setup Instructions

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate into the project directory
cd emergency-response-app

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or whichever port Vite assigns).

---

## 🛸 Deployment

To deploy the app, run:

```bash
npm run build
```

This generates a `dist/` folder with the production-ready files. You can then deploy to any static hosting provider such as:

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [GitHub Pages](https://pages.github.com/)

---

## 🌐 Custom Domain

If you're using a hosting provider that supports custom domains, follow their specific instructions to:

1. Point your domain’s DNS records to the hosting service.
2. Verify the domain.
3. Enable HTTPS (usually automatic).

---

## 🧩 Folder Structure

```
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-based views
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and API clients
│   └── styles/        # Tailwind and global styles
├── index.html
├── package.json
└── vite.config.ts
```

---

## 👥 Contributing

Pull requests are welcome! Please:

- Fork the repo
- Create a new branch: `git checkout -b feature/your-feature-name`
- Commit your changes: `git commit -m "Add your message"`
- Push and open a PR