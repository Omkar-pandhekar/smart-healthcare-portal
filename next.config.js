/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "source.unsplash.com",
      "healthcare-bucket-for-hm.s3.eu-north-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
