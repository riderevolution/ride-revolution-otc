import pkg from './package'

export default {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.description,
    meta: [
      { charset: 'utf-8' },
      // { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {
      color: '#ffa069',
      throttle: 0,
      height: '2px'
  },

  /*
  ** Global CSS
  */
  css: [
      '~/assets/stylus/app.styl'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/vue-scrollto', ssr: false },
    { src: '~/plugins/vue-apexcharts', ssr: false },
    { src: '~/plugins/v-calendar', ssr: false },
    { src: '~/plugins/vue-ctk-date-time-picker', ssr: false },
    { src: '~/plugins/vue-line-clamp', ssr: false },
    { src: '~/plugins/vue-moment' },
    { src: '~/plugins/vue-click-outside' },
    { src: '~/plugins/vue-cookie' },
    { src: '~/plugins/vee-validate' },
    { src: '~/plugins/vue-panzoom' },
    { src: '~/plugins/mixins'}
  ],
  buildModules: [
    '@nuxtjs/dotenv'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: process.env.API_URL,
    credentials: false
  },
  env: {
    baseUrl: process.env.BASE_URL
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  },
  serverMiddleware: [
    (req, res, next) => {
      if (/\/{2,}/.test(req.url)) {
        const url = req.url.replace(/\/{2,}/g, '/')
        res.writeHead(301, { 'Location': url })
        return res.end()
      }
      next()
    }
  ]
}
