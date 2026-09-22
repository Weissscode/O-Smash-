// Load the same Vite settings without bundling vite.config.js. This also works
// in restricted Windows workspaces where esbuild cannot traverse parent folders.
const { preview, build } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const config = {
  configFile: false,
  root,
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.join(root, 'index.html'),
        gestion: path.join(root, 'gestion.html'),
      },
    },
  },
};

async function main() {
  if (process.argv[2] === 'build') {
    await build(config);
    return;
  }
  const port = Number(process.argv[2]);
  await build(config);
  const server = await preview({
    ...config,
    preview: { host: '127.0.0.1', port, strictPort: true },
  });
  server.printUrls();
}

main().catch(error => { console.error(error); process.exitCode = 1; });
