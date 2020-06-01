<template>
    <div class="availability">
        <form id="default_form" class="cld" @submit.prevent>
            <div class="form_group">
                <label for="studio_id">Studio</label>
                <select class="default_select alternate" name="studio_id">
                    <option value="" disabled>Choose a Studio</option>
                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                </select>
            </div>
        </form>
        <div class="calendar_wrapper">
            <div class="calendar_actions">
                <div class="action_flex">
                    <div class="action_calendar_btn red" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 0, 0)">Clear Plot</div>
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
            <div class="cms_table_calendar_wrapper alt">
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
            <div class="legends_wrapper">
                <div class="legend_title green"><span>&#x25CF;</span> Available</div>
                <div class="legend_title margin yellow"><span>&#x25CF;</span> Partially Available</div>
                <div class="legend_title margin red"><span>&#x25CF;</span> Unavailable</div>
                <div class="legend_title margin violet"><span>&#x25CF;</span> You have a scheduled class</div>
            </div>
        </div>
        <div class="schedule">
            <div class="top">
                <div class="title">Available Schedule</div>
            </div>
            <div class="bottom">
                <ul>
                    <li>
                        <div class="item">
                            <div class="date green">
                                <span>&#x25CF;</span>
                                {{ $moment().format('MMM DD, YYYY') }}
                            </div>
                            <div class="label">
                                Available All Day
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="item">
                            <div class="date yellow">
                                <span>&#x25CF;</span>
                                {{ $moment().format('MMM DD, YYYY') }}
                            </div>
                            <div class="label">
                                12:00pm - 2:00pm
                            </div>
                            <div class="label">
                                4:00pm - 6:00pm
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="item">
                            <div class="date green">
                                <span>&#x25CF;</span>
                                {{ $moment().format('MMM DD, YYYY') }}
                            </div>
                            <div class="label">
                                Available All Day
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="item">
                            <div class="date green">
                                <span>&#x25CF;</span>
                                {{ $moment().format('MMM DD, YYYY') }}
                            </div>
                            <div class="label">
                                Available All Day
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                monthName: '',
                yearName: '',
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                studios: [],
                firstDate: '',
                lastDate: ''
            }
        },
        methods: {
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
                                        <div class='header_wrapper alt'>
                                            <div id="day_${startDate}" class="header_day_wrapper">
                                                <div class='header_day'>${startDate}</div>
                                            </div>
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
                let tempStart = startNum
                let tempEnd = endNum
                let tempExcess = firstDayExcess
                let month = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('M')
                let year = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('YYYY')
                do {
                    startNum++
                    let elementDay = (document.getElementById(`day_${startNum}`) != null) ? document.getElementById(`day_${startNum}`) : null
                    /**
                     * Day **/
                    if (elementDay != null) {
                        /**
                        * Toggle Day Overlay **/
                        elementDay.addEventListener('click', function(e) {
                            let target = this
                            if (target.classList.contains('single')) {
                                target.classList.remove('single')
                                /**
                                 * check target end date if has end class and parent */
                                if (target.parentNode.classList.contains('end')) {
                                    target.parentNode.classList.remove('end', 'parent')

                                    let newEndDate = document.getElementById(`day_${parseInt(target.id.split('_')[1]) - 1}`)
                                    newEndDate.parentNode.classList.remove('middle')
                                    newEndDate.parentNode.classList.add('end', 'parent')
                                }
                                /**
                                 * check target start date if has start class and parent */
                                if (target.parentNode.classList.contains('start')) {
                                    target.parentNode.classList.remove('start', 'parent')

                                    let newStartDate = document.getElementById(`day_${parseInt(target.id.split('_')[1]) + 1}`)
                                    newStartDate.parentNode.classList.remove('middle')
                                    newStartDate.parentNode.classList.add('start', 'parent')
                                }
                                /**
                                 * check target middle date if has middle class */
                                if (target.parentNode.classList.contains('middle')) {
                                    /**
                                     * Adjust the range when clicked in the middle */
                                    if (me.firstDate < parseInt(target.innerText)) {

                                        target.parentNode.classList.remove('middle')
                                        target.classList.add('single')
                                        target.parentNode.classList.add('start', 'parent')

                                        for (let i = parseInt(target.innerText) - 1; i >= me.firstDate; i--) {
                                            document.getElementById(`day_${i}`).classList.remove('single')
                                            document.getElementById(`day_${i}`).parentNode.classList.remove('middle')
                                            document.getElementById(`day_${i}`).parentNode.classList.remove('start')
                                            document.getElementById(`day_${i}`).parentNode.classList.remove('parent')
                                        }
                                    }
                                    // if (me.lastDate > parseInt(target.innerText)) {
                                    //
                                    //     target.parentNode.classList.remove('middle')
                                    //     target.classList.add('single')
                                    //     target.parentNode.classList.add('end', 'parent')
                                    //
                                    //     for (let i = parseInt(target.innerText) - 1; i >= me.firstDate; i--) {
                                    //         document.getElementById(`day_${i}`).classList.remove('single')
                                    //         document.getElementById(`day_${i}`).parentNode.classList.remove('middle')
                                    //         document.getElementById(`day_${i}`).parentNode.classList.remove('end')
                                    //         document.getElementById(`day_${i}`).parentNode.classList.remove('parent')
                                    //     }
                                    // }
                                    target.parentNode.classList.remove('middle')
                                }
                            } else {
                                target.classList.add('single')
                            }
                            me.checkClickDates(tempStart, tempEnd, tempExcess)
                        })
                    }
                } while (startNum < endNum + firstDayExcess)
            },
            /**
             * check each date if available, partial or not
             * @param  {[integer]} startNum       first date of calendar
             * @param  {[integer]} endNum         end date of calendar
             * @param  {[integer]} firstDayExcess excess dates (past or future)
             */
            checkClickDates (startNum, endNum, firstDayExcess) {
                const me = this
                let month = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('M')
                let year = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('YYYY')
                let ctr = 0
                let dates = []
                do {
                    startNum++
                    let elementDay = (document.getElementById(`day_${startNum}`) != null) ? document.getElementById(`day_${startNum}`) : null
                    /**
                     * Day **/
                    if (elementDay != null) {
                        if (elementDay.classList.contains('single')) {
                            ctr++
                            dates.push(elementDay)
                        }
                    }
                } while (startNum < endNum + firstDayExcess)

                let first = ''
                let last = ''

                /**
                 * check if the clicked dates is more than 1 */
                if (ctr > 1) {
                    /**
                     * add class for the start and end */
                    first = dates[0].id.split('_')[1]
                    me.firstDate = dates[0].id.split('_')[1]
                    last = dates[dates.length - 1].id.split('_')[1]
                    me.lastDate = dates[dates.length - 1].id.split('_')[1]
                    dates[0].parentNode.classList.add('start', 'parent')
                    dates[dates.length - 1].parentNode.classList.add('end', 'parent')
                } else {
                    /**
                     * removed the start and end class */
                    if (dates[0] != undefined) {
                        dates[0].parentNode.classList.remove('start', 'parent')
                    }
                    if (dates[dates.length - 1] != undefined) {
                        dates[dates.length - 1].parentNode.classList.remove('end', 'parent')
                    }
                }

                /**
                 * check if the clicked dates is between 1 and 2 */
                if (ctr > 1 && ctr <= 2) {
                    for (let i = last - 1; i != first; i--) {
                        document.getElementById(`day_${i}`).classList.add('single')
                        document.getElementById(`day_${i}`).parentNode.classList.add('middle')
                    }
                } else {
                    /**
                     * check if the clicked dates is more than 2 */
                    if (ctr > 2) {
                        /**
                         * iterates each dates, if the dates has no parent class. add middle if in between */
                        dates.forEach((data, index) => {
                            if (!data.parentNode.classList.contains('parent')) {
                                data.parentNode.classList.add('middle')
                            }
                        })
                    }
                }
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
                // result += `
                //     <a href="javascript:void(0)" class="class_wrapper completed">
                //         <div class="class_text margin"><span>10:00 AM</span></div>
                //         <div class="class_text">Ride Rev (50 mins.)</div>
                //     </a>`
                // result += `
                //     <a href="javascript:void(0)" class="class_wrapper" style="background-color: #6EC5A4">
                //         <div class="class_text margin"><span>10:00 AM</span></div>
                //         <div class="class_text">Ride Rev (50 mins.)</div>
                //     </a>`
                // result += `
                //     <a href="javascript:void(0)" class="class_wrapper" style="background-color: #FD649C">
                //         <div class="class_text margin"><span>10:00 AM</span></div>
                //         <div class="class_text">Ride Rev (50 mins.)</div>
                //     </a>`
                // result += `
                //     <a href="javascript:void(0)" class="class_wrapper" style="background-color: #5686FB">
                //         <div class="class_text margin"><span>10:00 AM</span></div>
                //         <div class="class_text">Ride Rev (50 mins.)</div>
                //     </a>`
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
                me.$axios.get('api/studios?enabled=1').then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                    }
                })
                me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
            }
        },
        mounted () {
            const me = this
            me.fetchData()
        }
    }
</script>
