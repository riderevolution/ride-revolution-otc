import Vue from 'vue'

Vue.mixin({
    methods: {
        checkPagePermission (page) {
            const me = this
            return new Promise((resolve, reject) => {
                let permission = true
                let token = this.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('page_name', page.name)

                me.loader(true)
                let nav = []
                if (token != null || token != undefined) {
                    me.$axios.post('api/extras/page-permission', formData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        page.access = res.data.access
                    }).catch(err => {
                        console.log(err);
                    }).then(() => {
                        resolve('ok')
                        me.loader(false)
                    })
                } else {
                    this.logout()
                }
            })
        },
        getNavItems (page) {
            const me = this
            return new Promise((resolve, reject) => {
                me.loader(true)
                let token = this.$cookies.get('70hokcotc3hhhn5')
                let nav = []
                if (token != null || token != undefined) {
                    me.$axios.get('api/extras/get-nav', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        page.navItems = res.data.items
                    }).catch(err => {
                        console.log(err);
                    }).then(() => {
                        me.loader(false)
                    })
                } else {
                    this.logout()
                }
            })
        },
        randomCode () {
            return Math.random().toString(36).substring(5).toUpperCase()
        },
        randomString () {
            return Math.random().toString(36).substring(2)
        },
        totalItems (value) {
            if (value != 0) {
                return parseFloat(value).toFixed().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            } else {
                return 0
            }
        },
        totalCount (value) {
            let count = 0
            if (value) {
                count = parseFloat(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            return count
        },
        notify (action, isTimeout = true) {
            this.$store.state.notificationMessage = action
            setTimeout( () => {
                this.$store.state.isNotify = true
            }, 500)
            if (isTimeout) {
                setTimeout( () => {
                    this.$store.state.isNotify = false
                }, 2000)
            }
        },
        toJSON (data) {
            if (data) {
                return JSON.parse(JSON.stringify(Object.fromEntries(data)))
            }
        },
        parser (data) {
            if (data) {
                return JSON.parse(data)
            }
        },
        replacer (data) {
            if (data) {
                return data.replace(/\-/g, ' ')
            }
        },
        convertToSlug (data) {
            let slug = ''
            if (data.match(/[!@#$%^&*(){}:;"’'<>?,./|“”]|\`|\~|\=|\-|\+|\_|\[|\]|\\/g)) {
                slug = data.toLowerCase().replace(/[!@#$%^&*(){}:;"'’<>?,./|“”]|\`|\~|\=|\-|\+|\_|\[|\]|\\/g, '').replace(/\s/g, '-')
            } else {
                slug = data.toLowerCase().replace(/\s/g, '-')
            }
            return slug
        },
        loader (data) {
            this.$store.state.isLoading = data
            if (data) {
                document.body.classList.add('no_click')
            } else {
                document.body.classList.remove('no_click')
            }
        },
        logout () {
            let token = this.$cookies.get('70hokcotc3hhhn5')
            this.loader(true)
            this.$axios.post('api/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                this.$cookies.remove('token')
                this.$cookies.remove('CSID')
                if (this.$store.state.isAuth) {
                    setTimeout(() => {
                        this.$store.state.isAuth = false
                        this.loader(false)
                    }, 500)
                }
            }).catch(err => {
                console.log(err)
            }).then(() => {
                window.location.assign('/login')
            })
        },
        validateToken () {
            return new Promise((resolve, reject) => {
                let token = this.$cookies.get('70hokcotc3hhhn5')
                if (token != null || token != undefined) {
                    this.$axios.get('api/user', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data != 0) {
                            this.$store.state.isAuth = true
                            this.$store.state.token = token
                            this.$store.state.user = res.data.user
                            this.$cookies.set('CSID', res.data.user.current_studio_id)
                        } else {
                            this.logout()
                        }
                    }).catch(err => {
                        console.log(err)
                        this.logout()
                    }).then(() =>{
                        resolve('ok')
                    })
                } else {
                    this.logout()
                }
            })
        },
        async fetchData (apiRoute) {
            const me = this
            await me.validateToken()
            let api = await me.$axios.get(apiRoute)
            return api
        }
    }
})
