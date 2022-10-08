// const withTM = require('next-transpile-modules')(['ui']);

// module.exports = withTM({
//   reactStrictMode: true,
//   basePath: '/rua-three',
//   experimental: {
//     esmExternals: 'loose',
//   },
// });

const production = process.env.NODE_ENV === 'production';

module.exports = {
  reactStrictMode: true,
  basePath: production ? '/rua-three' : '',
  experimental: {
    esmExternals: 'loose',
  },
};
