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
                <div class="target_wrapper" v-if="!res.front_desk">
                    <div class="left">
                        <div class="target_header">
                            <h2>Targets</h2>
                            <div class="view">
                                <label for="month">View</label>
                                <select class="default_select" name="month">
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
                                        <b class="blue">2,000</b>
                                        <p>Actual no. of Riders for this Month</p>
                                        <b class="blue">3,000</b>
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
                                        <b class="green">50</b>
                                        <p>Total First Time Riders this Month</p>
                                        <b class="green">200</b>
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
                                        <b class="violet">850</b>
                                        <p>Actual no. of Returning Riders for this Month</p>
                                        <b class="violet">1,500</b>
                                        <p>Target no. of Returning Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right">
                        <div class="table_notepad">
                            <h2 class="footer_title">Notepad</h2>
                            <div class="notepad_text">
                                <textarea name="notepad" v-model="res.notepad" @focusout="updateNotes($event)" rows="10"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="summary_stats">
                    <div class="left" v-if="!res.front_desk">
                        <div class="stats_header">
                            <h2>Alerts</h2>
                            <div class="button">
                                <select class="default_select" name="type">
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
                                <div class="column_content">
                                    <div class="wrapper" v-for="(n, key) in 4">
                                        <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                        <div class="info">
                                            <div class="name">Sample</div>
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
                                        </div>
                                    </div>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="stat_column">
                                <div class="column_header">
                                    <h2>First Class</h2>
                                </div>
                                <div class="column_content">
                                    <div class="wrapper" v-for="(n, key) in 4">
                                        <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                        <div class="info">
                                            <div class="name">Sample</div>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="stat_column">
                                <div class="column_header">
                                    <h2>Last Class</h2>
                                </div>
                                <div class="column_content">
                                    <div class="wrapper" v-for="(n, key) in 4">
                                        <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                        <div class="info">
                                            <div class="name">Sample</div>
                                            <div class="violator orange"><img src="/icons/star-orange.svg" /><span>Last Class</span></div>
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
                                            <div class="violator orange"><img src="/icons/star-orange.svg" /><span>Last Class</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="left alt" v-if="res.front_desk">
                        <div class="left_fd">
                            <div class="stats_header">
                                <h2>Alerts</h2>
                                <div class="button">
                                    <select class="default_select" name="type">
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
                                    <div class="column_content">
                                        <div class="wrapper" v-for="(n, key) in 4">
                                            <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                            <div class="info">
                                                <div class="name">Sample</div>
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
                                            </div>
                                        </div>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="stat_column">
                                    <div class="column_header">
                                        <h2>First Class</h2>
                                    </div>
                                    <div class="column_content">
                                        <div class="wrapper" v-for="(n, key) in 4">
                                            <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                            <div class="info">
                                                <div class="name">Sample</div>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="stat_column">
                                    <div class="column_header">
                                        <h2>Last Class</h2>
                                    </div>
                                    <div class="column_content">
                                        <div class="wrapper" v-for="(n, key) in 4">
                                            <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                            <div class="info">
                                                <div class="name">Sample</div>
                                                <div class="violator orange"><img src="/icons/star-orange.svg" /><span>Last Class</span></div>
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
                                                <div class="violator orange"><img src="/icons/star-orange.svg" /><span>Last Class</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="right_fd">
                            <div class="table_notepad">
                                <h2 class="footer_title">Notepad</h2>
                                <div class="notepad_text">
                                    <textarea name="notepad" v-model="res.notepad" @focusout="updateNotes($event)" rows="10"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right">
                        <div class="parent_column">
                            <div class="stats_header">
                                <h2>Top Riders</h2>
                                <form id="filter" class="date_form">
                                    <div class="flex">
                                        <div class="form_group">
                                            <label for="start_date">Start Date</label>
                                            <input type="date" name="start_date" v-model="form.start_date" class="default_text date" />
                                        </div>
                                        <div class="form_group margin">
                                            <label for="end_date">End Date</label>
                                            <input type="date" name="end_date" v-model="form.end_date"  class="default_text date" />
                                        </div>
                                    </div>
                                    <div class="button">
                                        <button type="submit" name="button" class="action_btn alternate margin">Apply</button>
                                    </div>
                                </form>
                            </div>
                            <div class="stats_content alt">
                                <div class="wrapper" v-for="(n, key) in 4">
                                    <div class="count">{{ n }}</div>
                                    <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                    <div class="info">
                                        <div class="name">Sample</div>
                                    </div>
                                </div>
                                <div class="wrapper" v-for="(n, key) in 4">
                                    <div class="count">{{ n + 4 }}</div>
                                    <div class="image">
                                        <div class="overlay">
                                            SA
                                        </div>
                                    </div>
                                    <div class="info">
                                        <div class="name">Sample</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="parent_column">
                            <div class="stats_header">
                                <h2>Riders with Pending Payments</h2>
                                <div class="button">
                                    <div class="action_btn">Export List</div>
                                </div>
                            </div>
                            <div class="stats_content alt">
                                <div class="wrapper alt" v-for="(n, key) in 4">
                                    <div class="info_left">
                                        <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                        <div class="info">
                                            <div class="name">Sample</div>
                                            <div class="violator pending">Pending: <b>Php 120.00</b></div>
                                            <div class="violator label">Days Outstanding: 20 Days</div>
                                        </div>
                                    </div>
                                    <div class="info_right">
                                        <div class="action_success_btn">Pay Now</div>
                                    </div>
                                </div>
                                <div class="wrapper alt" v-for="(n, key) in 4">
                                    <div class="info_left">
                                        <div class="image">
                                            <div class="overlay">
                                                SA
                                            </div>
                                        </div>
                                        <div class="info">
                                            <div class="name">Sample</div>
                                            <div class="violator pending">Pending: <b>Php 120.00</b></div>
                                            <div class="violator label">Days Outstanding: 20 Days</div>
                                        </div>
                                    </div>
                                    <div class="info_right">
                                        <div class="action_success_btn">Pay Now</div>
                                    </div>
                                </div>
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
    </div>
</template>

<script>
    import DashboardAttendance from '../components/modals/DashboardAttendance'
    import Foot from '../components/Foot'
    export default {
        components: {
            DashboardAttendance,
            Foot
        },
        data () {
            return {
                loaded: false,
                res: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                attendanceSeries: [85],
                packageSalesSeries: [85],
                firstTimeRidersSeries: [85],
                returningRidersSeries: [85],
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
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
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
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
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
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
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
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
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
            toggleAttendance () {
                const me = this
                me.$store.state.dashboardAttendanceStatus = true
                document.body.classList.add('no_scroll')
            },
            updateNotes (event) {
                const me = this
                let id = me.$store.state.user.id
                let formData = new FormData()
                formData.append('_method', 'PATCH')
                formData.append('user_id', id)
                formData.append('note', event.target.value)
                me.$axios.post('api/extras/update-user-notepad', formData).then(res => {
                    if (res.data) {
                        console.log(res.data.message)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
            }
        },
        mounted () {
            const me = this
            me.loader(true)
            let token = me.$cookies.get('token')
            me.$axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                setTimeout( () => {
                    me.loaded = true
                    me.res = res.data.user
                }, 500)
            }).catch(err => {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }).then(() => {
                setTimeout( () => {
                    if (!me.res.front_desk) {
                        document.querySelector('.target_wrapper .right .table_notepad textarea').style.height = `${document.querySelector('.target_wrapper .left').offsetHeight - 60}px`
                        document.querySelector('.target_wrapper .right .table_notepad textarea').style.maxHeight = `${document.querySelector('.target_wrapper .left').offsetHeight - 60}px`
                    } else {
                        document.querySelector('.summary_stats .right_fd .table_notepad textarea').style.height = `${document.querySelector('.summary_stats .left_fd').offsetHeight}px`
                        document.querySelector('.summary_stats .right_fd .table_notepad textarea').style.maxHeight = `${document.querySelector('.summary_stats .left_fd').offsetHeight}px`
                    }
                    me.loader(false)
                }, 500)
            })
        }
    }
</script>
