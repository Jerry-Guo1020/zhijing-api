module.exports = {
  apps: [
    {
      name: 'zhijing-api',
      script: 'dist/main.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        APP_NAME: process.env.APP_NAME || 'zhijing-api',
        APP_PREFIX: process.env.APP_PREFIX || 'api',
      },
      time: true,
      max_memory_restart: '512M',
    },
  ],
};
