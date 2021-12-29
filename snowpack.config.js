/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist', static: false, resolve: true },
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-sass',

    [
      '@snowpack/plugin-webpack',
      {
        extendConfig: (config) => {
          config.resolve.alias = { './dist/cpexcel.js': '' };
          return config;
        },
        manifest: true,
        sourceMap: true,
      },
    ],

    [
      '@snowpack/plugin-typescript',
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: true,
    minify: true,
    target: 'es2018',
  },
  packageOptions: {},
  devOptions: {
    /* ... */
  },
  buildOptions: {
    baseUrl: './',
    sourcemap: true,
  },
  alias: {
    './dist/cpexccel.js': '',
  },
};
