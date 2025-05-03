This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Build Local Offline Version

```bash
npm run sync:firebase 
# erstellt data/firestore.json + zieht alle Bilder nach public/images/...
# then
npm run build:static
# du bekommst einen reinen out/-Ordner mit rein statischer HTML/CSS/JS-Site, die du per ZIP verschicken und offline betrachten kannst.
```

