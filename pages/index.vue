<template>
    <div class="content" v-if="loaded">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Dashboard</h1>
                        </div>
                        <h2 class="header_subtitle">{{ res.studio.name }} Branch</h2>
                    </div>
                    <div class="actions">
                        <div class="action_buttons">
                            <nuxt-link to="/booker" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Check-in Rider</nuxt-link>
                        </div>
                    </div>
                </div>
            </section>
            <section id="content">
                <div class="target_wrapper">
                    <div class="left">
                        <div class="target_header">
                            <h2>Targets</h2>
                            <div class="view">
                                <label for="month">View</label>
                                <select class="default_select" name="month" v-model="form.month">
                                    <option :value="n" v-for="(n, key) in 12" :key="key" :selected="n == $moment().format('M')">{{ $moment(n, 'M').format('MMMM') }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="target_content">
                            <div class="column">
                                <div class="column_header">
                                    <h2>Total Attendance</h2>
                                    <div class="action" @click="toggleAttendance()">View Details</div>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="attendanceOptions" :series="attendanceSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <b class="blue">{{ totalItems(targets.totalAttendance.bookingsCount) }}</b>
                                        <p>Actual no. of Riders for this Month</p>
                                        <b class="blue">{{ totalItems(targets.totalAttendance.target) }}</b>
                                        <p>Target no. of Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="column_header">
                                    <h2>Package Sales</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="packageSalesOptions" :series="packageSalesSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <p>Rate of Package Sales Sold Based on this Month's Target</p>
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="column_header">
                                    <h2>First Time Riders</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="firstTimeRidersOptions" :series="firstTimeRidersSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <b class="green">{{ totalItems(targets.firstTimerRiders.firstTimeRiders) }}</b>
                                        <p>Total First Time Riders this Month</p>
                                        <b class="green">{{ totalItems(targets.firstTimerRiders.firstTimeRidersTarget) }}</b>
                                        <p>Target no. of Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="column_header">
                                    <h2>Returning Riders</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="returningRidersOptions" :series="returningRidersSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <b class="violet">{{ totalItems(targets.returningRiders.returningRiders) }}</b>
                                        <p>Actual no. of Returning Riders for this Month</p>
                                        <b class="violet">{{ totalItems(targets.returningRiders.returningRidersTarget) }}</b>
                                        <p>Target no. of Returning Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right">
                        <div class="table_notepad">
                            <div class="notepad_header">
                                <h2 class="footer_title">Notepad</h2>
                                <div class="form_group">
                                    <label for="note_date">Date</label>
                                    <v-ctk v-model="form.note_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'note_date'" :name="'note_date'" :label="'Select note date'" @input="getNotes($event)"></v-ctk>
                                </div>
                            </div>
                            <div class="notepad_text">
                                <textarea name="notepad" rows="10" v-model="form.notes"></textarea>
                                <div class="action_btn alternate" @click="updateNotes()">Save</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="summary_stats">
                    <div class="left">
                        <div class="stats_header">
                            <h2>Alerts</h2>
                            <div class="button">
                                <select class="default_select" name="period" v-model="form.period">
                                    <option value="today" selected>Today</option>
                                    <option value="Upcoming">Upcoming</option>
                                </select>
                            </div>
                        </div>
                        <div class="stats_content">
                            <div class="stat_column">
                                <div class="column_header">
                                    <h2>VIPs</h2>
                                </div>
                                <div class="column_content" v-if="alerts.vips.length > 0">
                                    <div class="wrapper" v-for="(data, key) in alerts.vips" :key="key">
                                        <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                        <div class="image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="info">
                                            <nuxt-link :to="`/customers/${data.id}/packages`" class="name link">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                            <div class="violator label">Bea Antonio ({{ $moment(data.bookings[0].scheduled_date.date).format('MMM DD, YYYY') }} {{ $moment(data.bookings[0].scheduled_date.schedule.start_time, 'hh:mm A').format('hh:mm A') }})</div>
                                        </div>
                                    </div>
                                </div><div class="no_results" v-else>
                                    No alerts for vips as of now
                                </div>
                            </div>
                            <div class="stat_column">
                                <div class="column_header">
                                    <h2>Milestone</h2>
                                </div>
                                <div class="column_content">
                                    <div class="wrapper" v-for="(n, key) in 4">
                                        <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                        <div class="info">
                                            <div class="name">Sample</div>
                                            <div class="violator violet"><img src="/icons/star-violet.svg" /><span>100th Ride</span></div>
                                            <div class="violator label">Bea Antonio ({{ $moment().format('MMM DD, YYYY hh:mm A') }})</div>
                                        </div>
                                    </div>
                                    <div class="wrapper" v-for="(n, key) in 4">
                                        <div class="image">
                                            <div class="overlay">
                                                SA
                                            </div>
                                        </div>
                                        <div class="info">
                                            <div class="name">Sample</div>
                                            <div class="violator blue"><img src="/icons/star-blue.svg" /><span>Teaching Anniversary</span></div>
                                            <div class="violator label">Bea Antonio ({{ $moment().format('MMM DD, YYYY hh:mm A') }})</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="stat_column">
                                <div class="column_header">
                                    <h2>First Class</h2>
                                </div>
                                <div class="column_content" v-if="alerts.firstClass.length > 0">
                                    <div class="wrapper" v-for="(data, key) in alerts.firstClass" :key="key">
                                        <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                        <div class="image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="info">
                                            <nuxt-link :to="`/customers/${data.id}/packages`" class="name link">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                            <div class="violator label">Bea Antonio ({{ $moment(data.bookings[0].scheduled_date.date).format('MMM DD, YYYY') }} {{ $moment(data.bookings[0].scheduled_date.schedule.start_time, 'hh:mm A').format('hh:mm A') }})</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="no_results" v-else>
                                    No alerts for first class as of now
                                </div>
                            </div>
                            <div class="stat_column">
                                <div class="column_header">
                                    <h2>Last Class</h2>
                                </div>
                                <div class="column_content" v-if="alerts.lastClass.length > 0">
                                    <div class="wrapper" v-for="(data, key) in alerts.lastClass" :key="key">
                                        <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                        <div class="image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="info">
                                            <nuxt-link :to="`/customers/${data.id}/packages`" class="name link">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                            <div class="violator orange"><img src="/icons/star-orange.svg" /><span>Last Class</span></div>
                                            <div class="violator label">Bea Antonio ({{ $moment(data.lastBooking.scheduled_date.date).format('MMM DD, YYYY') }} {{ $moment(data.lastBooking.scheduled_date.schedule.start_time, 'hh:mm A').format('hh:mm A') }})</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="no_results" v-else>
                                    No alerts for last class as of now
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right">
                        <div class="parent_column">
                            <div class="stats_header">
                                <h2>Top Riders</h2>
                                <form id="filter" class="date_form" @submit.prevent="getTopRiders()">
                                    <div class="flex_date">
                                        <div class="form_group">
                                            <label for="start_date">Start Date <span>*</span></label>
                                            <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :max-date="$moment().format('YYYY-MM-DD')" :label="'Select start date'"></v-ctk>
                                        </div>
                                        <div class="form_group margin">
                                            <label for="end_date">End Date <span>*</span></label>
                                            <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :max-date="$moment(form.start_date).format('YYYY-MM-DD')"></v-ctk>
                                        </div>
                                    </div>
                                    <div class="button">
                                        <button type="submit" name="button" class="action_btn alternate margin">Apply</button>
                                    </div>
                                </form>
                            </div>
                            <div class="stats_content alt" v-if="topRiders.length > 0">
                                <div class="wrapper" v-for="(data, key) in topRiders" :key="key">
                                    <div class="count">{{ key + 1 }}</div>
                                    <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                    <div class="image" v-else>
                                        <div class="overlay">
                                            {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                        </div>
                                    </div>
                                    <div class="info">
                                        <nuxt-link :to="`/customers/${data.id}/packages`" class="name link">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                    </div>
                                </div>
                            </div>
                            <div class="no_results" v-else>
                                No top riders as of now
                            </div>
                        </div>
                        <div class="parent_column">
                            <div class="stats_header">
                                <h2>Riders with Pending Payments</h2>
                                <div class="button">
                                    <div class="action_btn alternate">Export List</div>
                                </div>
                            </div>
                            <div class="stats_content alt" v-if="pendingPayments.length > 0">
                                <div class="wrapper alt" v-for="(data, key) in pendingPayments" :key="key">
                                    <div class="info_left">
                                        <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                        <div class="image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="info">
                                            <nuxt-link :to="`/customers/${data.id}/packages`" class="name link">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                            <div class="violator pending">Pending: <b>Php {{ computePayment(data.payments) }}</b></div>
                                            <div class="violator label">Days Outstanding: {{ getDaysOutstanding(data.payments) }}</div>
                                        </div>
                                    </div>
                                    <div class="info_right">
                                        <div class="action_success_btn" @click="togglePending(data.id)">Pay Now</div>
                                    </div>
                                </div>
                            </div>
                            <div class="no_results" v-else>
                                No pending as of now
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
        <transition name="fade">
            <dashboard-attendance v-if="$store.state.dashboardAttendanceStatus" />
        </transition>
        <transition name="fade">
            <pending-transactions v-if="$store.state.pendingTransactionsStatus" />
        </transition>
        <transition name="fade">
            <customer-pending-quick-sale :value="transaction" v-if="$store.state.customerPendingQuickSaleStatus" />
        </transition>
    </div>
</template>

<script>
    import DashboardAttendance from '../components/modals/DashboardAttendance'
    import PendingTransactions from '../components/modals/PendingTransactions'
    import CustomerPendingQuickSale from '../components/modals/CustomerPendingQuickSale'
    import Foot from '../components/Foot'
    export default {
        components: {
            DashboardAttendance,
            PendingTransactions,
            CustomerPendingQuickSale,
            Foot
        },
        data () {
            return {
                loaded: false,
                transaction: [],
                res: [],
                topRiders: [],
                pendingPayments: [],
                alerts: {
                    vips: [],
                    milestones: [],
                    firstClass: [],
                    lastClass: [],
                },
                targets: {
                    totalAttendance: [],
                    packageSales: [],
                    firstTimerRiders: [],
                    returningRiders: []
                },
                form: {
                    studio_id: 0,
                    month: this.$moment().format('M'),
                    period: 'today',
                    notes: '',
                    note_date: this.$moment().format('YYYY-MM-DD'),
                    start_date: this.$moment().startOf('month').format('YYYY-MM-DD'),
                    end_date: this.$moment().endOf('month').format('YYYY-MM-DD')
                },
                attendanceSeries: [],
                packageSalesSeries: [],
                firstTimeRidersSeries: [],
                returningRidersSeries: [],
                attendanceOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(86, 134, 251, 0.5)',
                            opacity: 0.5
                        }
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 15,
                                size: "70%"
                            },
                            track: {
                                background: '#445e91',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#5686fb",
                                    fontSize: "26px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold',
                                    offsetY: 10
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#5686fb']
                    }
                },
                packageSalesOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(251, 201, 24, 0.5)',
                            opacity: 0.5
                        }
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 15,
                                size: "70%"
                            },
                            track: {
                                background: '#6f6a3e',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#fbc918",
                                    fontSize: "26px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold',
                                    offsetY: 10
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#fbc918']
                    }
                },
                firstTimeRidersOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(56, 176, 157, 0.5)',
                            opacity: 0.5
                        }
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 15,
                                size: "70%"
                            },
                            track: {
                                background: '#36706d',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#38b09d",
                                    fontSize: "26px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold',
                                    offsetY: 10
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#38b09d']
                    }
                },
                returningRidersOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(174, 131, 255, 0.5)',
                            opacity: 0.5
                        }
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 15,
                                size: "70%"
                            },
                            track: {
                                background: '#685d93',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#c264fd",
                                    fontSize: "26px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold',
                                    offsetY: 10
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#c264fd']
                    }
                }
            }
        },
        methods: {
            togglePending (user_id) {
                const me = this
                me.$store.state.pendingCustomerID = user_id
                me.$store.state.pendingTransactionsStatus = true
                document.body.classList.add('no_scroll')
            },
            getDaysOutstanding (items) {
                const me = this
                let result = me.$moment(items[0].created_at).toNow()
                result = result.split('in ')[1]
                return result
            },
            computePayment (items) {
                const me = this
                let result = ''
                items.forEach((item, index) => {
                    result += parseFloat(item.total)
                })
                return me.totalCount(result)
            },
            toggleAttendance () {
                const me = this
                me.$store.state.dashboardAttendanceStatus = true
                document.body.classList.add('no_scroll')
            },
            updateNotes (event) {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('body', me.form.notes)
                formData.append('date', me.form.note_date)
                me.$axios.post('api/daily-notepads', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.form.notes = res.data.body
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            getNotes (date) {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get(`api/daily-notepads?date=${date}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.form.notes = res.data.body
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            getTopRiders () {
                const me = this
                me.loader(true)
                let formData = new FormData
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/portal-dashboard/top-riders', formData).then(res => {
                    me.topRiders = res.data.topRiders
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            initial () {
                const me = this
                me.$axios.get('api/portal-dashboard').then(res => {
                    if (res.data) {
                        let formData = new FormData
                        formData.append('start_date', me.form.start_date)
                        formData.append('end_date', me.form.end_date)
                        me.$axios.post('api/portal-dashboard/top-riders', formData).then(res => {
                            me.topRiders = res.data.topRiders
                        })

                        me.$axios.get(`api/portal-dashboard/alerts?period=${me.form.period}`).then(res => {
                            if (res.data) {
                                me.alerts.vips = res.data.vips
                                me.alerts.firstClass = res.data.firstClass
                                me.alerts.lastClass = res.data.lastClass
                            }
                        })

                        let targetFormData = new FormData
                        targetFormData.append('month', me.form.month)
                        targetFormData.append('studio_id', me.form.studio_id)
                        me.$axios.post('api/portal-dashboard/targets', targetFormData).then(res => {
                            me.targets.totalAttendance = res.data.totalAttendance
                            me.targets.packageSales = res.data.packageSales
                            me.targets.firstTimerRiders = res.data.ridersBehaviour
                            me.targets.returningRiders = res.data.ridersBehaviour

                            me.attendanceSeries.push(res.data.totalAttendance.percent)
                            me.packageSalesSeries.push(res.data.packageSales.percent)
                            me.firstTimeRidersSeries.push(res.data.ridersBehaviour.firstTimeRidersPercent)
                            me.returningRidersSeries.push(res.data.ridersBehaviour.returningRidersPercent)
                        })

                        me.pendingPayments = res.data.usersWithPendingPayments
                    }
                }).catch(err => {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.getNotes(me.form.note_date)
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            me.loader(true)
            let token = me.$cookies.get('70hokcotc3hhhn5')
            me.$axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                setTimeout( () => {
                    me.loaded = true
                    me.res = res.data.user
                    me.form.studio_id = res.data.user.current_studio_id
                    me.initial()
                }, 500)
            }).catch(err => {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }).then(() => {
                setTimeout( () => {
                    document.querySelector('.target_wrapper .right .table_notepad textarea').style.height = `${document.querySelector('.target_wrapper .left').offsetHeight - 80 - 46}px`
                    document.querySelector('.target_wrapper .right .table_notepad textarea').style.maxHeight = `${document.querySelector('.target_wrapper .left').offsetHeight - 80 - 46}px`
                }, 500)
            })
        }
    }
</script>
