import { join } from 'path';

export default {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = join(process.cwd(), 'src');
    return config;
  },
};
