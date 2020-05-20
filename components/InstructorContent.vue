<template>
    <div class="instructor_tab_content">
        <transition name="fade">
            <div v-if="type == 'class-schedules'">
                <div class="calendar_wrapper">
                    <div class="calendar_actions">
                        <div class="action_flex alt">
                            <a href="javascript:void(0)" class="action_calendar_btn" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 0, 0)">This Month</a>
                            <a href="javascript:void(0)" class="action_calendar_btn margin" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 1, 0)">This Week</a>
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
            <div v-if="'class-statistics'">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
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
                classesHistoryStatus: 1,
                loaded: false,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                monthName: '',
                yearName: '',
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                studios: []
            }
        },
        methods: {
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
                do {
                    startNum++
                } while (startNum < endNum + firstDayExcess)
            },
            /**
             * Populate the Scheduler
             */
            populateScheduler (date) {
                const me = this
                let result = ''
                // let scheduleCurrent = me.$moment(data.date).format('D')
                // let currentDate = me.$moment(`${me.currentYear}-${me.currentMonth}-${date} ${data.schedule.start_time}`)
                let scheduleDate = me.$moment()
                // let unixTimestamp = me.$moment(`${me.currentYear}-${me.currentMonth}-${scheduleCurrent}`, 'YYYY-MM-D').valueOf()
                result += `
                    <a href="javascript:void(0)" class="class_wrapper completed">
                        <div class="class_text margin"><span>10:00 AM</span></div>
                        <div class="class_text">Ride Rev (50 mins.)</div>
                    </a>`
                result += `
                    <a href="javascript:void(0)" class="class_wrapper" style="background-color: #6EC5A4">
                        <div class="class_text margin"><span>10:00 AM</span></div>
                        <div class="class_text">Ride Rev (50 mins.)</div>
                    </a>`
                result += `
                    <a href="javascript:void(0)" class="class_wrapper" style="background-color: #FD649C">
                        <div class="class_text margin"><span>10:00 AM</span></div>
                        <div class="class_text">Ride Rev (50 mins.)</div>
                    </a>`
                result += `
                    <a href="javascript:void(0)" class="class_wrapper" style="background-color: #5686FB">
                        <div class="class_text margin"><span>10:00 AM</span></div>
                        <div class="class_text">Ride Rev (50 mins.)</div>
                    </a>`
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
                    if (element.nextElementSibling.classList.contains('active')) {
                        element.nextElementSibling.classList.remove('active')
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
