module.exports = {
  apps: [
    {
      name: 'knight-worker',
      script: 'start.js',
      cwd: __dirname,
      node_args: '--experimental-vm-modules',
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
    },
  ],
};
