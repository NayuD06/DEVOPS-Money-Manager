module.exports = {
  apps: [
    {
      name: 'spendwise-api',
      script: './server/src/index.js',
      cwd: '/var/www/spendwise',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 3000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/spendwise/err.log',
      out_file: '/var/log/spendwise/out.log',
    },
  ],
};
