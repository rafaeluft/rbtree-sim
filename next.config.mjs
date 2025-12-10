const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/rbtree-sim/' : '',
  basePath: isProd ? '/rbtree-sim' : '',
  output: 'export',
  distDir: 'dist',
};

export default nextConfig;
