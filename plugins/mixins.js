import Vue from 'vue'

Vue.mixin({
    methods: {
        dateDiff (value) {
            const me = this
            let result = 0
            if (value.user_package_count.activation_date != 'NA') {
                result = me.$moment(value.user_package_count.expiry_date_if_activated).diff(me.$moment(value.user_package_count.activation_date), 'days')
            } else {
                result = me.$moment(value.user_package_count.activation_date).diff(me.$moment(value.user_package_count.created_at), 'days')
            }

            return parseInt(result)
        },
        properFormat (value) {
            let newValue = value.split('The ')[1].split(' field')[0].split('.')
            if (newValue.length > 1) {
                newValue = newValue[1].split('[]')
                if (newValue.length > 1) {
                    let nextValue = newValue[0].split('_')
                    if (nextValue.length > 1) {
                        newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                    } else {
                        newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                    }
                } else {
                    let nextValue = newValue[0].split('_')
                    if (nextValue.length > 1) {
                        newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                    } else {
                        newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                    }
                }
            } else {
                newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    let nextValue = newValue[0].split('_')
                    if (nextValue.length > 1) {
                        newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                    } else {
                        newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = ''
                        let lastValue = ''
                        if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                            firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                        for (let i = 1; i < newValue.length; i++) {
                            if (newValue[i] != 'id') {
                                lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                            }
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
            }
            let message = value.split('The ')[1].split(' field')
            if (message.length > 1) {
                message = message[1]
                return `The ${newValue} field${message}`
            } else {
                if (message[0].split('file').length > 1) {
                    message = message[0].split('file')[1]
                    return `The ${newValue} field${message}`
                } else {
                    return `The ${newValue}`
                }
            }
        },
        parseInputToDate (target) {
            const me = this
            let lastValue = ''
            let value = target.split('-').join('')
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,4}', 'g')).join('-')
                let valueArrayChecker = value.split('-')
                if (valueArrayChecker[1]) {
                    if (valueArrayChecker[1].length > 0) {
                        value = value.split('-')
                        lastValue = `${value[0]}-`
                        lastValue += value[1].match(new RegExp('.{1,2}', 'g')).join('-')
                    }
                } else {
                    lastValue = value
                }
            }
            return lastValue
        },
        checkPagePermission (page) {
            const me = this
            return new Promise((resolve, reject) => {
                let permission = true
                let token = this.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('page_name', page.name)
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
                    })
                } else {
                    this.logout()
                }
            })
        },
        getNavItems (page) {
            const me = this
            return new Promise((resolve, reject) => {
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
            if (value) {
                if (value != 0) {
                    return parseFloat(value).toFixed().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                } else {
                    return 0
                }
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
                this.$cookies.remove('version')
                this.$cookies.remove('70hokcotc3hhhn5')
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
                setTimeout(() => {
                    if (!this.$store.state.isAuth) {
                        window.location.assign('/login')
                    }
                }, 500)
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
                            let version = this.$cookies.get('secret')
                            if (version == null || version == undefined) {
                                this.$store.state.patchNotesStatus = true
                            } else {
                                if (version != res.data.version) {
                                    this.$store.state.patchNotesStatus = true
                                } else {
                                    this.$cookies.set('secret', res.data.version)
                                }
                            }
                            this.$store.state.isAuth = true
                            this.$store.state.token = token
                            this.$store.state.user = res.data.user
                            this.$cookies.set('CSID', res.data.user.current_studio_id)
                        } else {
                            this.logout()
                        }
                    }).catch(err => {
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
