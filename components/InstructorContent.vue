<template>
    <div class="instructor_tab_content">
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
                        <form id="filter_alt" class="cld" @submit.prevent>
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
                    <div class="total">Total: 4</div>
                    <div class="cms_table_toggler">
                        <div :class="`status ${(classesHistoryStatus == 1) ? 'active' : ''}`" @click="toggleClassesHistory(1)">All</div>
                        <div :class="`status ${(classesHistoryStatus == 2) ? 'active' : ''}`" @click="toggleClassesHistory(2)">Completed</div>
                        <div :class="`status ${(classesHistoryStatus == 3) ? 'active' : ''}`" @click="toggleClassesHistory(3)">Missed</div>
                        <div :class="`status ${(classesHistoryStatus == 4) ? 'active' : ''}`" @click="toggleClassesHistory(4)">Cancelled</div>
                    </div>
                </div>
                <table class="cms_table">
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
                    <tbody>
                        <tr v-for="(n, key) in 3" :key="key">
                            <td>{{ formatClassDate('January 01, 2020 12:00', true) }}</td>
                            <td>Ride Rev</td>
                            <td>Greenbelt 5</td>
                            <td>28</td>
                            <td>Completed</td>
                            <td>-</td>
                        </tr>

                    </tbody>
                    <!-- <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody> -->
                </table>
                <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
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
                                <li>
                                    <div class="item"><span>Greenbelt 5</span> <b>25%</b></div>
                                </li>
                                <li>
                                    <div class="item"><span>Shangri-la Plaza</span> <b>25%</b></div>
                                </li>
                                <li>
                                    <div class="item"><span>Kerry Sports BGC</span> <b>25%</b></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="overall_stat">
                    <div class="stat taught">
                        <div class="top">
                            <div class="title">No. of Classes Taught</div>
                            <div class="title alt">Total: 204</div>
                        </div>
                        <div class="bottom">
                            <div class="box">
                                <div class="count">5</div>
                                <div class="label">This Week</div>
                            </div>
                            <div class="box">
                                <div class="count">20</div>
                                <div class="label">This Month</div>
                            </div>
                            <div class="box">
                                <div class="count">100</div>
                                <div class="label">This Year</div>
                            </div>
                            <div class="violator">Missed Classes: <b>3</b></div>
                        </div>
                    </div>
                    <div class="stat top_rides">
                        <div class="top">
                            <div class="title">Top Rides</div>
                        </div>
                        <div class="bottom">
                            <div class="left">
                                <ul>
                                    <li v-for="(n, key) in 5" :key="key">
                                        <div class="count">{{ n }}</div>
                                        <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" />
                                        <!-- <div class="image">
                                            <div class="overlay">
                                                AB
                                            </div>
                                        </div> -->
                                        <div class="name">Sample Sample</div>
                                    </li>
                                </ul>
                            </div>
                            <div class="right">
                                <ul>
                                    <li v-for="(n, key) in 5" :key="key">
                                        <div class="count">{{ n + 5 }}</div>
                                        <!-- <img src="https://ride-revolution.s3-ap-southeast-1.amazonaws.com/uploads/BEAANTONIO_riderevolution_headshot_1589192424_thumbnail.png" /> -->
                                        <div class="image">
                                            <div class="overlay">
                                                AB
                                            </div>
                                        </div>
                                        <div class="name">Sample Sample</div>
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
                <calendar-of-availability :instructor="value" />
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
                                <p>{{ value.instructor_details.pa_address }}</p>
                            </div>
                            <div class="wrapper">
                                <label>City</label>
                                <p>{{ value.instructor_details.pa_city }}</p>
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
                                <p>{{ value.instructor_details.ba_address }}</p>
                            </div>
                            <div class="wrapper">
                                <label>City</label>
                                <p>{{ value.instructor_details.ba_city }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check"></div>
                            <div class="button_group">
                                <nuxt-link :to="`/instructors/${$route.params.param}/update`" class="action_btn alternate">Edit</nuxt-link>
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
            }
        },
        data () {
            return {
                promptMessage: '',
                classesHistoryStatus: 1,
                loaded: false,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                monthName: '',
                yearName: '',
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                schedules: [],
                studios: [],
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
                        height: 300
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
                return me.classesHistoryStatus = status
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

                me.loader(true)

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
                    // me.clickDates(0, endDate, excess)
                }, 300)
            },
            // clickDates (startNum, endNum, firstDayExcess) {
            //     const me = this
            //     do {
            //         startNum++
            //     } while (startNum < endNum + firstDayExcess)
            // },
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
                            <div class="class_wrapper ${(currentDate.diff(scheduleDate) < 0) ? 'completed' : ''}" ${(currentDate.diff(scheduleDate) < 0) ? '' : `style="background-color: ${data.schedule.studio.color_code}"`}>
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
                    })
                }
                me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
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
            if (me.type == 'class-schedules') {
                me.fetchData()
            }
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
