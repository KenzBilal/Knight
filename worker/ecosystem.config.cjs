module.exports = {
  apps: [
    {
      name: 'knight-worker',
      script: 'index.js',
      cwd: __dirname,
      node_args: '--experimental-vm-modules',
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
