module.exports = {
  apps: [
    {
      name: 'PORTAL(PROD) RIDE REVOLUTION',
      exec_mode: 'cluster',
      instances: '2', 
      max_memory_restart: '200M',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start'
    }
  ]
}
