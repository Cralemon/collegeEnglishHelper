import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Tauri 静态导出
  reactCompiler: true,
};

export default nextConfig;
