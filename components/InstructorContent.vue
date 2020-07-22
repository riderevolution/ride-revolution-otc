<template>
    <div class="instructor_tab_content" v-if="loaded">
        <transition name="fade">
            <div v-if="type == 'class-schedules'">
                <div class="calendar_wrapper">
                    <div class="calendar_actions">
                        <div class="action_flex alt">
                            <div class="action_calendar_btn" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 0, 0)">This Month</div>
                            <div class="action_calendar_btn margin" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 1, 0)">This Week</div>
                            <div class="schedule_info">
                                <img id="legend_toggler" @click="toggleLegends($event)" src="/icons/info-icon.svg" />
                                <div class="overlay">
                                    <div class="type"><span class="color alt"></span><span class="type_title">Completed Class</span></div>
                                    <div class="studios">
                                        <label>Studios</label>
                                        <div class="type" v-for="(data, key) in studios" :key="key"><span class="color" :style="`background-color: ${data.color_code}`"></span><span class="type_title">{{ data.name }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <form id="filter_alt" class="cld">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id" @change="generateCalendar(currentYear, currentMonth, 0, 0)">
                                    <option value="" disabled>Choose a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="calendar_header">
                        <div class="calendar_prev" @click="generatePrevCalendar()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"> <g transform="translate(-248 -187)"> <g class="arrow_1" transform="translate(248 187)"> <circle class="arrow_3" cx="14" cy="14" r="14" /> <circle class="arrow_4" cx="14" cy="14" r="13.5" /> </g> <path class="arrow_2" d="M184.939,200.506l-3.981,3.981,3.981,3.981" transform="translate(445.438 405.969) rotate(180)" /> </g> </svg>
                        </div>
                        <h2 class="calendar_title">{{ monthName }} {{ yearName }}</h2>
                        <div class="calendar_next" @click="generateNextCalendar()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"> <g transform="translate(-248 -187)"> <g class="arrow_1" transform="translate(248 187)"> <circle class="arrow_3" cx="14" cy="14" r="14" /> <circle class="arrow_4" cx="14" cy="14" r="13.5" /> </g> <path class="arrow_2" d="M184.939,200.506l-3.981,3.981,3.981,3.981" transform="translate(445.438 405.969) rotate(180)" /> </g> </svg>
                        </div>
                    </div>
                    <div class="cms_table_calendar_wrapper">
                        <table class="cms_table_calendar">
                            <thead>
                                <tr>
                                    <th v-for="(dayLabel, key) in dayLabels" :key="key">{{ dayLabel }}</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="type == 'class-history'">
                <div class="actions">
                    <div class="total">Total: {{ res.classHistory.length }}</div>
                    <div class="cms_table_toggler">
                        <div :class="`status ${(classesHistoryStatus == 'all') ? 'active' : ''}`" @click="toggleClassesHistory('all')">All</div>
                        <div :class="`status ${(classesHistoryStatus == 'completed') ? 'active' : ''}`" @click="toggleClassesHistory('completed')">Completed</div>
                        <div :class="`status ${(classesHistoryStatus == 'cancelled') ? 'active' : ''}`" @click="toggleClassesHistory('cancelled')">Cancelled</div>
                    </div>
                </div>
                <table class="cms_table alt">
                    <thead>
                        <tr>
                            <th>Date &amp; Time</th>
                            <th>Class</th>
                            <th>Studio</th>
                            <th>No. of Riders</th>
                            <th>Status</th>
                            <th>Sub Instructor</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.classHistory.length > 0">
                        <tr v-for="(data, key) in res.classHistory" :key="key">
                            <td>{{ formatClassDate(`${data.date} ${data.schedule.start_time}`, true) }}</td>
                            <td>{{ data.schedule.class_type.name }}</td>
                            <td>{{ data.schedule.studio.name }}</td>
                            <td>{{ data.ridersCount }}</td>
                            <td>{{ data.status.charAt(0).toUpperCase() }}{{ data.status.slice(1) }}</td>
                            <td>{{ data.subInstructor.first_name }} {{ data.subInstructor.last_name }}</td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td colspan="6">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="type == 'class-statistics'">
                <div class="stat_monthly">
                    <div class="stat graph">
                        <div class="top">
                            <div class="title">Average Class Occupancy Rate (Monthly)</div>
                        </div>
                        <div class="bottom">
                            <no-ssr>
                                <apexchart :options="chartOptions" height="350px" :series="series"></apexchart>
                            </no-ssr>
                        </div>
                    </div>
                    <div class="stat this_month">
                        <div class="top">
                            <div class="title">This Month</div>
                        </div>
                        <div class="bottom">
                            <ul>
                                <li v-for="(data, key) in value.stats.currentMonthBookings" :key="key">
                                    <div class="item"><span>{{ data.studio.name }}</span> <b>{{ data.count }}</b></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="overall_stat">
                    <div class="stat taught">
                        <div class="top">
                            <div class="title">No. of Classes Taught</div>
                            <div class="title alt">Total: {{ value.stats.breakDown.total }}</div>
                        </div>
                        <div class="bottom">
                            <div class="box">
                                <div class="count">{{ value.stats.breakDown.taughtThisWeek }}</div>
                                <div class="label">This Week</div>
                            </div>
                            <div class="box">
                                <div class="count">{{ value.stats.breakDown.taughtThisMonth }}</div>
                                <div class="label">This Month</div>
                            </div>
                            <div class="box">
                                <div class="count">{{ value.stats.breakDown.taughtThisYear }}</div>
                                <div class="label">This Year</div>
                            </div>
                            <div class="violator">Cancelled Classes: <b>{{ value.stats.breakDown.cancelledCount }}</b></div>
                        </div>
                    </div>
                    <div class="stat top_rides">
                        <div class="top">
                            <div class="title">Top Riders</div>
                        </div>
                        <div class="bottom">
                            <div class="left">
                                <ul>
                                    <li v-for="(data, key) in ridersLeft" :key="key">
                                        <div class="count">{{ key + 1 }}</div>
                                        <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                        <div class="image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }} {{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="name">{{ data.first_name }} {{ data.last_name }}</div>
                                    </li>
                                </ul>
                            </div>
                            <div class="right">
                                <ul>
                                    <li v-for="(data, key) in ridersRight" :key="key">
                                        <div class="count">{{ key + 6 }}</div>
                                        <img :src="data.customer_details.images[0].path" v-if="data.customer_details.images[0].path != null" />
                                        <div class="image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }} {{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="name">{{ data.first_name }} {{ data.last_name }}</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="type == 'calendar-of-availability'">
                <calendar-of-availability :instructor="value" :admin="admin" />
            </div>
        </transition>
        <transition name="fade">
            <div v-if="type == 'details'">
                <div id="default_form">
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Customer Overview</h2>
                            <div class="form_check toggler">
                                <input type="hidden" id="enabled" name="enabled" class="action_check" :value="(value.enabled) ? 1 : 0">
                                <div :class="`toggle alt ${(value.enabled) ? 'active' : ''}`" @click="toggledPrompt(value)"></div>
                                <label for="enabled">{{ (value.enabled) ? 'Activated' : 'Deactivated' }}</label>
                            </div>
                        </div>
                        <div class="form_overview">
                            <div class="wrapper">
                                <label>Name</label>
                                <p>{{ value.first_name }} {{ value.last_name }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Email</label>
                                <p>{{ value.email }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Phone Number</label>
                                <p>{{ value.instructor_details.io_contact_number }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Birthdate</label>
                                <p>{{ formatClassDate(value.instructor_details.io_birthdate, false) }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Gender</label>
                                <p class="alt">{{ value.instructor_details.io_sex }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Shoe Size</label>
                                <p>{{ value.instructor_details.io_shoe_size }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Occupation</label>
                                <p>{{ value.instructor_details.profession }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Personal Address</h2>
                        </div>
                        <div class="form_overview">
                            <div class="wrapper">
                                <label>Address</label>
                                <p>{{ value.instructor_details.pa_address }} {{ value.instructor_details.pa_address_2 }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Country</label>
                                <p>{{ value.instructor_details.personal_country }}</p>
                            </div>
                            <div class="wrapper">
                                <label>State</label>
                                <p>{{ value.instructor_details.personal_state }}</p>
                            </div>
                            <div class="wrapper">
                                <label>City</label>
                                <p>{{ value.instructor_details.pa_city }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Zip Code</label>
                                <p>{{ value.instructor_details.pa_zip_code }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Billing Address</h2>
                        </div>
                        <div class="form_overview">
                            <div class="wrapper">
                                <label>Address</label>
                                <p>{{ value.instructor_details.ba_address }} {{ value.instructor_details.ba_address_2 }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Country</label>
                                <p>{{ value.instructor_details.billing_country }}</p>
                            </div>
                            <div class="wrapper">
                                <label>State</label>
                                <p>{{ value.instructor_details.billing_state }}</p>
                            </div>
                            <div class="wrapper">
                                <label>City</label>
                                <p>{{ value.instructor_details.ba_city }}</p>
                            </div>
                            <div class="wrapper">
                                <label>Zip Code</label>
                                <p>{{ value.instructor_details.ba_zip_code }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check"></div>
                            <div class="button_group">
                                <nuxt-link :to="`/instructors/${$route.params.param}/update`" class="action_btn alternate" v-if="!isDashboard">Edit</nuxt-link>
                                <nuxt-link :to="`/instructor/${value.id}/update`" class="action_btn alternate" v-else>Edit</nuxt-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="fade">
            <customer-prompt :status="promptMessage" ref="enabled" v-if="$store.state.customerPromptStatus" />
        </transition>
    </div>
</template>

<script>
    import CalendarOfAvailability from '../components/CalendarOfAvailability'
    import CustomerPrompt from '../components/modals/CustomerPrompt'
    export default {
        components: {
            CalendarOfAvailability,
            CustomerPrompt
        },
        props: {
            type: {
                type: String,
                default: 'class-schedule'
            },
            value: {
                default: null
            },
            isDashboard: {
                type: Boolean,
                default: false
            },
            admin: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                promptMessage: '',
                classesHistoryStatus: 'all',
                loaded: false,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                monthName: '',
                yearName: '',
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                schedules: [],
                studios: [],
                res: [],
                form: {
                    studio_id: 0
                },
                series: [
                    {
                        name: 'Ride Count',
                        data: [10, 5, 44, 300, 57, 56, 25, 58, 20, 63, 80, 200]
                    }
                ],
                chartOptions: {
                    responsive: [
                        {
                            breakpoint: 767,
                            options: {
                                plotOptions: {
                                    bar: {
                                        columnWidth: '100%'
                                    }
                                },
                                dataLabels: {
                                    formatter: function (val) {
                                        return `${val}`
                                    },
                                    offsetY: -10,
                                    style: {
                                        colors: ["#383D40"],
                                        fontSize: '8px',
                                        fontFamily: 'SFProDisplay-Regular'
                                    }
                                },
                                xaxis: {
                                    labels: {
                                        style: {
                                            colors: ['#383D40'],
                                            fontSize: '8px',
                                            fontFamily: 'SFProDisplay-Regular'
                                        }
                                    },
                                },
                                yaxis: {
                                    labels: {
                                        style: {
                                            colors: ['#383D40'],
                                            fontSize: '8px',
                                            fontFamily: 'SFProDisplay-Regular'
                                        }
                                    },
                                    title: {
                                        text: 'Rides',
                                        offsetX: 0,
                                        style: {
                                            colors: ['#383D40'],
                                            fontSize: '8px',
                                            cssClass: 'apexchart_uppercase'
                                        }
                                    }
                                },
                            },
                        }
                    ],
                    chart: {
                        type: 'bar',
                        height: 300,
                        toolbar: {
                            show: true
                        },
                        zoom: {
                            enabled: true
                        }
                    },
                    colors: ['#5686FB'],
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                position: 'top'
                            },
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        formatter: function (val) {
                            return `${val}`
                        },
                        offsetY: -15,
                        style: {
                            fontFamily: 'SFProDisplay-Bold',
                            fontSize: '14px',
                            colors: ["#383D40"]
                        }
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent']
                    },
                    grid: {
                        show: true
                    },
                    xaxis: {
                        labels: {
                            show: true,
                            style: {
                                colors: ['#383D40'],
                                fontSize: '14px',
                                fontFamily: 'SFProDisplay-Regular'
                            }
                        },
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    },
                    yaxis: {
                        labels: {
                            show: true,
                            style: {
                                colors: ['#383D40'],
                                fontSize: '14px',
                                fontFamily: 'SFProDisplay-Regular'
                            }
                        },
                        title: {
                            text: 'No. of Riders',
                            offsetX: 0,
                            style: {
                                color: '#8A93A8',
                                fontSize: '12px',
                                fontFamily: 'SFProDisplay-Bold',
                                cssClass: 'apexchart_uppercase'
                            }
                        }
                    },
                    fill: {
                        type: "gradient",
                        gradient: {
                            type: 'vertical',
                            shadeIntensity: 1,
                            opacityFrom: 0.7,
                            opacityTo: 0.9,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: "#5686FB",
                                    opacity: 1
                                }
                            ]
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function (val) {
                                return val
                            }
                        }
                    }
                }
            }
        },
        computed: {
            ridersLeft () {
                const me = this
                let riders = []
                let ctr = 0
                me.value.stats.topRiders.forEach((data, index) => {
                    if (ctr < 5) {
                        riders.push(data)
                        ctr++
                    }
                })
                if (ctr < 5) {
                    for (let i = 0; i < 5 - ctr; i++) {
                        riders.push(
                            {
                                first_name: '-',
                                last_name: '-',
                                customer_details: {
                                    images: [
                                        {
                                            path: null
                                        }
                                    ]
                                }
                            }
                        )
                    }
                }
                return riders
            },
            ridersRight () {
                const me = this
                let riders = []
                let ctr = 0
                let tempCtr = 0
                me.value.stats.topRiders.forEach((data, index) => {
                    if (ctr >= 5) {
                        riders.push(data)
                        tempCtr++
                    }
                    ctr++
                })
                if (tempCtr < 5) {
                    for (let i = 0; i < 5 - tempCtr; i++) {
                        riders.push(
                            {
                                first_name: '-',
                                last_name: '-',
                                customer_details: {
                                    images: [
                                        {
                                            path: null
                                        }
                                    ]
                                }
                            }
                        )
                    }
                }
                return riders
            },
        },
        methods: {
            toggledPrompt (data) {
                const me = this
                if (data.enabled) {
                    me.promptMessage = 'Deactivate'
                } else {
                    me.promptMessage = 'Activate'
                }
                data.enabled ^= 1
                me.$store.state.customerPromptStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'users'
                    me.$refs.enabled.confirm.id = data.id
                    me.$refs.enabled.confirm.enabled = data.enabled
                    me.$refs.enabled.confirm.status = (data.enabled) ? 'activated' : 'deactivated'
                    me.$refs.enabled.confirm.type = 'user'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleClassesHistory (status) {
                const me = this
                me.loader(true)
                me.classesHistoryStatus = status
                me.$axios.get(`api/instructors/${me.value.id}/${me.$route.params.slug}?status=${status}`).then(res => {
                    setTimeout( () => {
                        me.res = res.data.instructor
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            formatClassDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('M/D/YY (ddd) h:mm A')
                    } else {
                        return this.$moment(value).format('MMMM DD, YYYY')
                    }
                }
            },
            toggleLegends (event) {
                const me = this
                let element = event.target
                if (element.nextElementSibling.classList.contains('active')) {
                    element.nextElementSibling.classList.remove('active')
                } else {
                    element.nextElementSibling.classList.add('active')
                }
            },
            generatePrevCalendar () {
                const me = this
                me.currentMonth = me.currentMonth - 1
                if (me.currentMonth == 0) {
                    me.currentMonth = 12
                    me.currentYear = me.currentYear - 1
                }
                me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
            },
            generateNextCalendar () {
                const me = this
                me.currentMonth = me.currentMonth + 1
                if (me.currentMonth == 13) {
                    me.currentMonth = 1
                    me.currentYear = me.currentYear + 1
                }
                me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
            },
            clearTableRows () {
                document.querySelectorAll('.cms_table_calendar tbody tr').forEach(function(e){e.remove()})
            },
            async generateCalendar (year, month, highlight) {
                const me = this
                me.clearTableRows()
                me.currentDate = me.$moment().date()
                me.monthName = me.$moment(`${year}-${month}`, 'YYYY-MM').format('MMMM')
                me.yearName = me.$moment(`${year}-${month}`, 'YYYY-MM').format('YYYY')
                let startDate = 1
                let nextDate = 1
                let prevDate = me.$moment(`${year}-${(month - 1 == 0) ? 12 : month - 1}`, 'YYYY-MM').daysInMonth()
                let endDate = me.$moment(`${year}-${month}`, 'YYYY-MM').daysInMonth()
                let calendarTable = document.querySelector('.cms_table_calendar tbody')
                let current = me.$moment(`${year}-${month}-${startDate}`, 'YYYY-MM-D').format('d')
                let excess = 0

                await me.$axios.get(`api/schedules?year=${me.currentYear}&month=${me.currentMonth}&instructor_id=${me.value.id}&studio_id=${me.form.studio_id}`).then(res => {
                    me.schedules = res.data.schedules
                })
                /**
                 * Generate Rows **/
                for (let i = 0; i < 6; i++) {
                    let tableRow = document.createElement('tr')
                    /**
                    * Generate Columns **/
                    for (let j = 0; j < 7; j++) {
                        if (startDate <= endDate) {
                            if (me.$moment(`${year}-${month}-${startDate}`, 'YYYY-MM-D').format('d') == j) {
                                let unixTimestamp = me.$moment(`${year}-${month}-${startDate}`, 'YYYY-MM-D').valueOf()
                                let dayDate = me.$moment(`${year}-${month}-${startDate}`, 'YYYY-MM-DD').format('YYYY-MM-DD')
                                if (highlight && me.currentDate == startDate) {
                                    tableRow.classList.add('highlighted')
                                    setTimeout( () => {
                                        document.querySelector('.highlighted').scrollIntoView({block: 'center', behavior: 'smooth'})
                                    }, 250)
                                }
                                tableRow.innerHTML += `
                                    <td id="col_${i}" class='day_wrapper fade_in'>
                                        <div class='header_wrapper'>
                                            <div class='header_day ${(me.currentDate == startDate) ? 'active' : '' }'>${startDate}</div>
                                        </div>
                                        <div class="classes" id="class_${startDate}">
                                            ${me.populateScheduler(startDate)}
                                        </div>
                                    </td>`
                                startDate++
                            } else {
                                let prevDate = me.$moment(`${year}-${(month - 1 == 0) ? 12 : month - 1}`, 'YYYY-MM').daysInMonth()
                                current--
                                if (current <= 0) {
                                    prevDate = me.$moment(`${year}-${(month - 1 == 0) ? 12 : month - 1}`, 'YYYY-MM').daysInMonth()
                                } else {
                                    prevDate = prevDate - current
                                }
                                excess++
                                /**
                                 * Generate Previous Dates **/
                                tableRow.innerHTML += `
                                    <td class='day_wrapper fade_in disabled_day'>
                                        <div class='header_wrapper'>
                                            <div class='header_day'>${prevDate}</div>
                                        </div>
                                    </td>`
                            }
                        } else {
                            /**
                             * Generate Next Dates **/
                            if (me.$moment(`${year}-${month}-${1}`, 'YYYY-MM-D').format('d') == 0) {
                                if (i == 4) {
                                    tableRow.innerHTML += `
                                        <td id="col_${i}" class='day_wrapper fade_in disabled_day'>
                                            <div class='header_wrapper'>
                                                <div class='header_day'>${nextDate}</div>
                                            </div>
                                        </td>`
                                    nextDate++
                                }
                            } else {
                                tableRow.innerHTML += `
                                    <td id="col_${i}" class='day_wrapper fade_in disabled_day'>
                                        <div class='header_wrapper'>
                                            <div class='header_day'>${nextDate}</div>
                                        </div>
                                    </td>`
                                nextDate++
                            }
                        }
                    }
                    calendarTable.appendChild(tableRow)
                }
                setTimeout( () => {
                    me.loader(false)
                    me.clickDates(0, endDate, excess)
                }, 300)
            },
            clickDates (startNum, endNum, firstDayExcess) {
                const me = this
                let month = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('M')
                let year = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('YYYY')
                do {
                    startNum++
                    let classNode = (document.getElementById(`class_${startNum}`) != null) ? document.getElementById(`class_${startNum}`) : null

                    if (classNode != null) {
                        if (classNode.querySelectorAll('.class_wrapper').length > 0) {
                            classNode.querySelectorAll('.class_wrapper').forEach((element, index) => {
                                element.addEventListener('click', function(e) {
                                    let values = this.getAttribute('s1He3DL').split('_')[1].split('+')
                                    me.loader(true)
                                    me.$parent.layout.studio = values[1]
                                    me.$parent.layout.schedule = values[0]
                                    me.$store.state.classScheduleLayoutStatus = true
                                })
                            })
                        }
                    }
                } while (startNum < endNum + firstDayExcess)
            },
            /**
             * Populate the Scheduler
             */
            populateScheduler (date) {
                const me = this
                let result = ''
                me.schedules.forEach((data, index) => {
                    let scheduleCurrent = me.$moment(data.date).format('D')
                    let currentDate = me.$moment(`${me.currentYear}-${me.currentMonth}-${date} ${data.schedule.start_time}`)
                    let scheduleDate = me.$moment()
                    if (date == scheduleCurrent) {
                        result += `
                            <div s1He3DL="SwhGt2GF_${data.id}+${data.schedule.studio_id}" class="class_wrapper ${(currentDate.diff(scheduleDate) < 0) ? 'completed' : ''}" ${(currentDate.diff(scheduleDate) < 0) ? '' : `style="background-color: ${data.schedule.studio.color_code}"`}>
                                <div class="class_text margin">${data.schedule.start_time}</div>
                                <div class="class_text">${data.schedule.class_type.name} (${data.schedule.class_length_formatted})</div>
                            </div>`
                    }
                })
                return result
            },
            getFirstDayofWeek (startDate, excess) {
                const me = this
                let firstDayofWeek = parseInt(me.$moment(`${me.currentYear}-${me.currentMonth}-${startDate}`, 'YYYY-MM-D').startOf('week').format('D')) + parseInt(excess)
                if (firstDayofWeek == 31 || firstDayofWeek == 32) {
                    firstDayofWeek = 1
                } else {
                    firstDayofWeek = firstDayofWeek - excess
                }
                return me.$moment(`${me.currentYear}-${me.currentMonth}-${firstDayofWeek}`, 'YYYY-MM-DD').format('YYYY-MM-DD')
            },
            getLastDayofWeek (startDate) {
                const me = this
                let lastDayofWeek = me.$moment(`${me.currentYear}-${me.currentMonth}-${startDate}`, 'YYYY-MM-D').endOf('week').format('D')
                if (startDate == 30 || startDate == 31) {
                    lastDayofWeek = me.$moment(`${me.currentYear}-${me.currentMonth}-${startDate}`, 'YYYY-MM-D').daysInMonth()
                }
                return me.$moment(`${me.currentYear}-${me.currentMonth}-${lastDayofWeek}`, 'YYYY-MM-DD').format('YYYY-MM-DD')
            },
            fetchData () {
                const me = this
                if (me.$route.params.slug == 'class-schedules') {
                    me.$axios.get('api/studios?enabled=1').then(res => {
                        if (res.data) {
                            me.studios = res.data.studios
                            me.form.studio_id = me.studios[0].id
                        }
                        me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
                    })
                }
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target
                let element = document.getElementById(`legend_toggler`)
                if (element !== target) {
                    if (element != null) {
                        if (element.nextElementSibling != null) {
                            if (element.nextElementSibling.classList.contains('active')) {
                                element.nextElementSibling.classList.remove('active')
                            }
                        }
                    }
                }
            }
        },
        mounted () {
            const me = this
            me.loaded = true
            if (me.type == 'class-history') {
                me.res = me.value
            }
            if (me.type == 'class-schedules') {
                me.fetchData()
            }
            if (me.type == 'class-statistics') {
                me.series[0].data = me.value.stats.monthlyAverage
                let currentMonth = me.$moment().month() + 1
                let labels = []
                labels.unshift(me.$moment(currentMonth, 'M').format('MMM'))
                for (let i = 0; i < 11; i++) {
                    currentMonth = currentMonth - 1
                    if (currentMonth == 0) {
                        currentMonth = 12
                    }
                    labels.unshift(me.$moment(currentMonth, 'M').format('MMM'))
                }
                me.chartOptions.xaxis.categories = labels
            }
            setTimeout( () => {
                me.loader(false)
            }, 500)
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
