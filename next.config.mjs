// next.config.mjs
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**', // Allows images from any https domain
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: '**', // Allows images from any http domain
          port: '',
          pathname: '/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  
  