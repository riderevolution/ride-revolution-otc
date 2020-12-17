<template>
    <div class="print_table" v-if="loaded">
        <div class="inline">
            <div class="logo">
                <img src="/logo.png" width="65px" />
                <div class="logo_title">
                    Ride <br/>
                    Revolution
                </div>
            </div>
            <div class="text">
                <h2>Attendance By Month</h2>
                <h3><span>{{ $moment($route.query.month).format('MMMM YYYY') }}</span></h3>
            </div>
        </div>
        <div class="calendar_wrapper">
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
        <div class="signature">
            <div class="label">SIGNATURE OVER PRINTED NAME</div>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'print',
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
                schedules: [],
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

                me.form.month = me.$route.query.month
                me.form.instructor_id = me.$route.query.instructor_id
                me.form.class_type_id = me.$route.query.class_type_id
                me.form.studio_id = me.$route.query.studio_id

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
                    me.loader(false)
                    setTimeout( () => {
                        window.print()
                    }, 1000)
                }, 500)
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
            fetchData () {
                const me = this
                me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
            }
        },
        async mounted () {
            const me = this
            me.loader(true)
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
            }).then(() => {
                window.onafterprint = function(){
                    window.close()
                }
            })
        }
    }
</script>
