<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance by Month</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Attendance per time slot by month</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class/attendance-by-month?studio_id=${form.studio_id}&month=${form.month}&class_type_id=${form.class_type_id}&instructor_id=${form.instructor_id}`" target="_blank" class="action_btn alternate">Print</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="0" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id" v-model="form.class_type_id">
                                    <option value="0" selected>All Class Type</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="instructor_id">Instructor</label>
                                <select class="default_select alternate" name="instructor_id" v-model="form.instructor_id">
                                    <option value="0" selected>All Instructors</option>
                                    <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="month">Month</label>
                                <select class="default_select alternate" name="month" v-model="form.month">
                                    <option value="" disabled>Choose a month</option>
                                    <option :value="monthsByScheduledDate" v-for="(monthsByScheduledDate, key) in monthsByScheduledDates" :key="key">{{ monthsByScheduledDate }}</option>
                                </select>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Avg Attendance: {{ computeAvg() }}</div>
                    </div>
                    <div class="calendar_wrapper">
                        <div class="calendar_actions">
                            <!-- <div class="action_flex">
                                <div class="action_calendar_btn" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 0, 0)">This Month</div>
                                <div class="action_calendar_btn margin" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 1, 0)">This Week</div>
                            </div> -->
                        </div>
                        <div class="calendar_header">
                            <!-- <div class="calendar_prev" @click="generatePrevCalendar()">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"> <g transform="translate(-248 -187)"> <g class="arrow_1" transform="translate(248 187)"> <circle class="arrow_3" cx="14" cy="14" r="14" /> <circle class="arrow_4" cx="14" cy="14" r="13.5" /> </g> <path class="arrow_2" d="M184.939,200.506l-3.981,3.981,3.981,3.981" transform="translate(445.438 405.969) rotate(180)" /> </g> </svg>
                            </div> -->
                            <h2 class="calendar_title">{{ monthName }} {{ yearName }}</h2>
                            <!-- <div class="calendar_next" @click="generateNextCalendar()">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"> <g transform="translate(-248 -187)"> <g class="arrow_1" transform="translate(248 187)"> <circle class="arrow_3" cx="14" cy="14" r="14" /> <circle class="arrow_4" cx="14" cy="14" r="13.5" /> </g> <path class="arrow_2" d="M184.939,200.506l-3.981,3.981,3.981,3.981" transform="translate(445.438 405.969) rotate(180)" /> </g> </svg>
                            </div> -->
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
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot,
        },
        data () {
            return {
                name: 'Attendance by Month',
                access: true,
                loaded: false,
                monthStatus: false,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                value: 0,
                monthName: '',
                yearName: '',
                studio: [],
                studios: [],
                instructors: [],
                classTypes: [],
                schedules: [],
                monthsByScheduledDates: [],
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                form: {
                    studio_id: 0,
                    class_type_id: 0,
                    instructor_id: 0,
                    month: this.$moment().format('MMMM YYYY')
                }
            }
        },
        methods: {
            computeAvg () {
                const me = this
                let hasSchedules = false
                let result = 0
                if (me.schedules.length > 0) {
                    me.schedules.forEach((schedule, index) => {
                        schedule.bookings.forEach((booking, index) => {
                            if (booking.status != 'cancelled') {
                                result += 1
                            }
                        })
                    })
                    hasSchedules = true
                } else {
                    result = '0.0'
                }

                if (hasSchedules) {
                    result = result / me.schedules.length
                    result = me.totalCount(result)
                }

                return result
            },
            manipulateMonthValue () {
                let date = this.form.month.split(' ')

                this.monthName = this.$moment(`${date[1]}-${date[0]}`, 'YYYY-MMMM').format('MMMM')
                this.yearName = this.$moment(`${date[1]}-${date[0]}`, 'YYYY-MMMM').format('YYYY')

                this.currentMonth = this.$moment(`${date[0]}`, 'MMMM').month() + 1
                this.currentYear = this.$moment(`${date[1]}`, 'YYYY').year()
            },
            async submissionSuccess () {
                const me = this

                await this.manipulateMonthValue()

                me.generateCalendar(me.currentYear, me.currentMonth, 0, 1)
            },
            // async generatePrevCalendar () {
            //     const me = this

            //     me.currentMonth = me.currentMonth - 1
            //     if (me.currentMonth == 0) {
            //         me.currentMonth = 12
            //         me.currentYear = me.currentYear - 1
            //     }

            //     me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
            // },
            // async generateNextCalendar () {
            //     const me = this

            //     me.currentMonth = me.currentMonth + 1
            //     if (me.currentMonth == 13) {
            //         me.currentMonth = 1
            //         me.currentYear = me.currentYear + 1
            //     }
            //     me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
            // },
            clearTableRows () {
                document.querySelectorAll('.cms_table_calendar tbody tr').forEach(function(e){e.remove()})
            },
            async generateCalendar (year, month, highlight, search) {
                const me = this
                me.loader(true)
                me.clearTableRows()
                me.currentDate = me.$moment().date()

                me.values = []

                if (search != 1) {
                    me.monthName = me.$moment(`${year}-${month}`, 'YYYY-MM').format('MMMM')
                    me.yearName = me.$moment(`${year}-${month}`, 'YYYY-MM').format('YYYY')
                }

                let startDate = 1
                let nextDate = 1
                let prevDate = me.$moment(`${year}-${(month - 1 == 0) ? 12 : month - 1}`, 'YYYY-MM').daysInMonth()
                let endDate = me.$moment(`${year}-${month}`, 'YYYY-MM').daysInMonth()
                let calendarTable = document.querySelector('.cms_table_calendar tbody')
                let current = me.$moment(`${year}-${month}-${startDate}`, 'YYYY-MM-D').format('d')
                let excess = 0

                let formData = new FormData()
                formData.append('date', me.form.month)
                formData.append('studio_id', me.form.studio_id)
                formData.append('instructor_id', me.form.instructor_id)
                formData.append('class_type_id', me.form.class_type_id)

                await me.$axios.post(`api/reporting/classes/attendance-by-month`, formData).then(res => {
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
                    me.clickDates(0, endDate, excess)
                    me.loader(false)
                }, 500)
            },
            clickDates (startNum, endNum, firstDayExcess) {
                const me = this
                let month = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('M')
                let year = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('YYYY')
                do {
                    startNum++
                    let classNode = (document.getElementById(`class_${startNum}`) != null) ? document.getElementById(`class_${startNum}`) : null

                    if (classNode != null) {
                        if (classNode.querySelectorAll('.attendance').length > 0) {
                            classNode.querySelectorAll('.attendance').forEach((element, index) => {
                                element.addEventListener('click', function(e) {
                                    e.preventDefault()
                                    window.open(`${this.getAttribute('href')}`, '_blank')
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
                    if (date == me.$moment(data.date).format('DD')) {
                        result += `
                            <a href="/reporting/class-report/attendance-by-month/${data.bookings[0].scheduled_date_id}?studio_id=${me.form.studio_id}" class="attendance">
                                <div class="atd_left">
                                    <p>${me.$moment(data.schedule.start_time, 'hh:mm A').format('h:mm A')}</p>
                                    <p>${(data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name} (${data.schedule.class_length_formatted})</p>
                                    <p style="color: ${data.schedule.studio.color_code}; text-transform: uppercase;"><b>${data.schedule.studio.name}</b></p>
                                </div>
                                <div class="atd_right">
                                    ${me.getBookings(data.bookings)}
                                </div>
                            </a>
                        `
                    }
                })
                return result
            },
            getBookings (bookings) {
                const me = this
                let result = 0
                bookings.forEach((data, key) => {
                    if (data.status != 'cancelled') {
                        result += 1
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
            async fetchData () {
                const me = this
                await me.fetchExtraAPI()
                await me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
            },
            async fetchExtraAPI () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let studio_id = me.$cookies.get('CSID')
                await me.$axios.get('api/studios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                        me.$axios.get(`api/studios/${studio_id}`).then(res => {
                            me.studio = res.data.studio
                        })
                    }
                })
                await me.$axios.get(`api/instructors?enabled=1`).then(res => {
                    me.instructors = res.data.instructors.data
                })
                await me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
                    me.classTypes = res.data.classTypes
                })
                await me.$axios.get(`api/extras/month-by-scheduled-dates`).then(res => {
                    me.monthsByScheduledDates = res.data.monthsByScheduledDates
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loader(true)
                let studio_id = me.$cookies.get('CSID')
                me.form.studio_id = studio_id
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data != 0) {
                        me.loaded = true
                        setTimeout( () => {
                            me.fetchData()
                            me.form.studio_id = res.data.user.current_studio_id
                        }, 500)
                    }
                }).catch(err => {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
        }
    }
</script>
