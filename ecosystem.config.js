module.exports = {
  apps : [{
    name: 'COVIDAPP BE',
    script: 'server.js',
    args: '',
    instances: 2,
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};