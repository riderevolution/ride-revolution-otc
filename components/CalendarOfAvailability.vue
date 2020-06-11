<template>
    <div class="availability">
        <form id="filter_alt" class="cld" @submit.prevent>
            <div class="form_group">
                <label for="studio_id">Studio</label>
                <select class="default_select alternate" name="studio_id" v-model="form.studio_id" @change="generateCalendar(currentYear, currentMonth, 0, 0)">
                    <option value="" disabled>Choose a Studio</option>
                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                </select>
            </div>
        </form>
        <div class="calendar_wrapper">
            <div class="calendar_actions">
                <div class="action_flex">
                    <div :class="`action_calendar_btn green ${(targetDate.length > 0) ? '' : 'disabled'}`" @click="toggleMenuPrompt()">Choose Availability</div>
                    <!-- <div :class="`action_calendar_btn margin red ${(targetDate.length > 0) ? '' : 'disabled'}`" @click="generateCalendar(currentYear, currentMonth, 0, 0)">Reset Calendar</div> -->
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
                    <li v-for="(data, key) in schedules" :key="key">
                        <div class="item">
                            <div :class="`date ${checkClass(data)}`">
                                <span>&#x25CF;</span>
                                {{ $moment(data.date).format('MMM DD, YYYY') }}
                            </div>
                            <div class="label" v-if="data.status == 'available'">
                                Available All Day
                            </div>
                            <div class="label" v-else-if="data.status == 'unavailable'">
                                Unavailable All Day
                            </div>
                            <div class="label" v-else-if="data.status == 'partially-available'" v-for="(time, key) in data.times" :key="key">
                                {{ time.time_from }} - {{ time.time_to }}
                            </div>
                            <div class="label" v-else-if="data.status == 'open'" v-for="(scheduledDate, key) in data.scheduledDates" :key="key">
                                {{ scheduledDate.schedule.start_time }} - {{ scheduledDate.schedule.end_time }}
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <transition name="fade">
            <calendar-availability-menu-prompt v-if="$store.state.bookerMenuPromptStatus" />
        </transition>
        <transition name="fade">
            <calendar-availability-action-prompt v-if="$store.state.calendarAvailabilityActionStatus" :targetDate="targetDate" :availabilityStatus="availabilityStatus" />
        </transition>
        <transition name="fade">
            <calendar-availability-marked v-if="$store.state.calendarAvailabilityMarkedStatus" :schedules="targetSchedules" />
        </transition>
        <transition name="fade">
            <calendar-availability-unmarked v-if="$store.state.calendarAvailabilityUnmarkedStatus" :schedules="targetSchedules" />
        </transition>
        <transition name="fade">
            <calendar-availability-success v-if="$store.state.calendarAvailabilitySuccessStatus" :title="title" :message="message" />
        </transition>
        <transition name="fade">
            <calendar-availability-prompt v-if="$store.state.calendarAvailabilityPromptStatus" :instructor="instructor" :targetDate="targetDate" :availabilityStatus="availabilityStatus" />
        </transition>
        <transition name="fade">
            <calendar-availability-partially-prompt v-if="$store.state.calendarAvailabilityPartiallyPromptStatus" :type="partiallyType" :targetDate="targetDate" :instructor="instructor" />
        </transition>
    </div>
</template>

<script>
    import CalendarAvailabilityMenuPrompt from './modals/CalendarAvailabilityMenuPrompt'
    import CalendarAvailabilityPrompt from './modals/CalendarAvailabilityPrompt'
    import CalendarAvailabilityActionPrompt from './modals/CalendarAvailabilityActionPrompt'
    import CalendarAvailabilityMarked from './modals/CalendarAvailabilityMarked'
    import CalendarAvailabilityUnmarked from './modals/CalendarAvailabilityUnmarked'
    import CalendarAvailabilitySuccess from './modals/CalendarAvailabilitySuccess'
    export default {
        props: {
            instructor: {
                default: null
            }
        },
        components: {
            CalendarAvailabilityMenuPrompt,
            CalendarAvailabilityPrompt,
            CalendarAvailabilityActionPrompt,
            CalendarAvailabilityMarked,
            CalendarAvailabilityUnmarked,
            CalendarAvailabilitySuccess
        },
        data () {
            return {
                partiallyType: 'marked',
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                monthName: '',
                yearName: '',
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                studios: [],
                schedules: [],
                targetSchedules: [],
                firstDate: '',
                lastDate: '',
                targetDate: [],
                availabilityStatus: '',
                title: '',
                message: '',
                selectedType: '',
                form: {
                    studio_id: 0
                }
            }
        },
        methods: {
            checkClass (data) {
                const me = this
                let result = ''
                switch (data.status) {
                    case 'available':
                        result = 'green'
                        break
                    case 'unavailable':
                        result = 'red'
                        break
                    case 'partially-available':
                        result = 'yellow'
                        break
                    case 'open':
                        result = 'violet'
                        break
                }
                return result
            },
            /**
             * toggle menu prompt for list of options */
            toggleMenuPrompt () {
                const me = this
                me.$store.state.bookerMenuPromptStatus = true
                document.body.classList.add('no_scroll')
            },
            /**
             * toggle prev month based on the current month and year */
            generatePrevCalendar () {
                const me = this
                me.currentMonth = me.currentMonth - 1
                if (me.currentMonth == 0) {
                    me.currentMonth = 12
                    me.currentYear = me.currentYear - 1
                }
                me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
            },
            /**
             * toggle next month based on the current month and year */
            generateNextCalendar () {
                const me = this
                me.currentMonth = me.currentMonth + 1
                if (me.currentMonth == 13) {
                    me.currentMonth = 1
                    me.currentYear = me.currentYear + 1
                }
                me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
            },
            /**
             * clear the table rows when generateCalendar() is called */
            clearTableRows () {
                document.querySelectorAll('.cms_table_calendar tbody tr').forEach(function(e){e.remove()})
            },
            /**
             * generate calendar based on the current date
             * @param  {[integer]}  year      current year
             * @param  {[integer]}  month     current month
             * @param  {[boolean]}  highlight status
             * @return {HTML}              table of calendar
             */
            async generateCalendar (year, month, highlight) {
                const me = this
                me.targetDate = []
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

                await me.$axios.get(`api/instructor-availabilities?studio_id=${me.form.studio_id}&instructor_id=${me.instructor.id}&year=${me.currentYear}&month=${me.currentMonth}`).then(res => {
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
                                        <div class='header_wrapper alt'>
                                            <div id="day_${startDate}" class="header_day_wrapper ${me.populateClass(startDate)}">
                                                <div class='header_day'>${startDate}</div>
                                                ${me.populateScheduler(startDate)}
                                            </div>
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
            /**
             * add event listener for each date
             * @param  {[integer]} startNum       start date of the month
             * @param  {[integer]} endNum         end date of the month
             * @param  {[integer]} firstDayExcess excess count of the month
             */
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
                            /**
                             * check classlist */
                            if (target.classList.contains('single')) {
                                target.classList.remove('single')
                                // /**
                                //  * check target end date if has end class and parent */
                                // if (target.parentNode.classList.contains('end')) {
                                //     target.parentNode.classList.remove('end', 'parent')
                                //
                                //     let newEndDate = document.getElementById(`day_${parseInt(target.id.split('_')[1]) - 1}`)
                                //     newEndDate.parentNode.classList.remove('middle')
                                //     newEndDate.parentNode.classList.add('end', 'parent')
                                // }
                                // /**
                                //  * check target start date if has start class and parent */
                                // if (target.parentNode.classList.contains('start')) {
                                //     target.parentNode.classList.remove('start', 'parent')
                                //
                                //     let newStartDate = document.getElementById(`day_${parseInt(target.id.split('_')[1]) + 1}`)
                                //     newStartDate.parentNode.classList.remove('middle')
                                //     newStartDate.parentNode.classList.add('start', 'parent')
                                // }
                                // /**
                                //  * check target middle date if has middle class */
                                // if (target.parentNode.classList.contains('middle')) {
                                //     /**
                                //      * Adjust the range when clicked in the middle */
                                //     if (me.firstDate < parseInt(target.innerText)) {
                                //
                                //         target.parentNode.classList.remove('middle')
                                //         target.classList.add('single')
                                //         target.parentNode.classList.add('start', 'parent')
                                //
                                //         for (let i = parseInt(target.innerText) - 1; i >= me.firstDate; i--) {
                                //             document.getElementById(`day_${i}`).classList.remove('single')
                                //             document.getElementById(`day_${i}`).parentNode.classList.remove('middle')
                                //             document.getElementById(`day_${i}`).parentNode.classList.remove('start')
                                //             document.getElementById(`day_${i}`).parentNode.classList.remove('parent')
                                //         }
                                //     }
                                //     target.parentNode.classList.remove('middle')
                                // }
                            } else {
                                /**
                                 * iterate each schedule */
                                me.schedules.forEach((data, index) => {
                                    let scheduleCurrent = me.$moment(data.date).format('D')
                                    /**
                                     * check same date */
                                    if (target.id.split('_')[1] == scheduleCurrent) {
                                        /**
                                         * check the date status */
                                        if (data.scheduledDates.length > 0) {
                                            if (data.status == 'available' || data.status == 'partially-available') {
                                                me.targetSchedules = data.scheduledDates

                                                /** toggle marked prompt status */
                                                me.$store.state.calendarAvailabilityMarkedStatus = true
                                                me.partiallyType = 'marked'
                                                document.body.classList.add('no_scroll')
                                            } else if (data.status == 'open') {
                                                me.targetSchedules = data.scheduledDates

                                                /** toggle unmarked prompt status */
                                                me.partiallyType = 'unmarked'
                                                me.$store.state.calendarAvailabilityUnmarkedStatus = true
                                                document.body.classList.add('no_scroll')
                                            }
                                        }
                                    }
                                })
                                target.classList.add('single')
                            }
                            me.checkClickDates(tempStart, tempEnd, tempExcess, target)
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
            checkClickDates (startNum, endNum, firstDayExcess, target) {
                const me = this
                let month = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('M')
                let year = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('YYYY')
                let ctr = 0
                let dates = []
                me.targetDate = []
                do {
                    startNum++
                    let elementDay = (document.getElementById(`day_${startNum}`) != null) ? document.getElementById(`day_${startNum}`) : null
                    /**
                     * Day **/
                    if (elementDay != null) {
                        if (target != elementDay) {
                            elementDay.classList.remove('single')
                        }
                        if (elementDay.classList.contains('single')) {
                            if (!elementDay.querySelector('.circle')) {
                                ctr++
                                dates.push(elementDay)
                            }
                        }
                    }
                } while (startNum < endNum + firstDayExcess)

                if (ctr > 0) {
                    me.targetDate = me.$moment(`${me.currentYear}-${me.currentMonth}-${target.id.split('_')[1]}`, 'YYYY-MM-D').format('YYYY-MM-DD')
                }

                // let first = ''
                // let last = ''

                // /**
                //  * check if the clicked dates is more than 1 */
                // if (ctr > 1) {
                //     /**
                //      * add class for the start and end */
                //     first = dates[0].id.split('_')[1]
                //     me.firstDate = dates[0].id.split('_')[1]
                //     last = dates[dates.length - 1].id.split('_')[1]
                //     me.lastDate = dates[dates.length - 1].id.split('_')[1]
                //     dates[0].parentNode.classList.add('start', 'parent')
                //     dates[dates.length - 1].parentNode.classList.add('end', 'parent')
                // } else {
                //     /**
                //      * removed the start and end class */
                //     if (dates[0] != undefined) {
                //         dates[0].parentNode.classList.remove('start', 'parent')
                //     }
                //     if (dates[dates.length - 1] != undefined) {
                //         dates[dates.length - 1].parentNode.classList.remove('end', 'parent')
                //     }
                // }
                //
                // /**
                //  * check if the clicked dates is between 1 and 2 */
                // if (ctr > 1 && ctr <= 2) {
                //     for (let i = last - 1; i != first; i--) {
                //         document.getElementById(`day_${i}`).classList.add('single')
                //         document.getElementById(`day_${i}`).parentNode.classList.add('middle')
                //     }
                // } else {
                //     /**
                //      * check if the clicked dates is more than 2 */
                //     if (ctr > 2) {
                //         /**
                //          * iterates each dates, if the dates has no parent class. add middle if in between */
                //         dates.forEach((data, index) => {
                //             if (!data.parentNode.classList.contains('parent')) {
                //                 data.parentNode.classList.add('middle')
                //             }
                //         })
                //     }
                // }
                //
                // if (ctr > 1) {
                //     for (let i = 0; i < endNum + firstDayExcess; i++) {
                //         let elementDay = (document.getElementById(`day_${i}`) != null) ? document.getElementById(`day_${i}`) : null
                //         /**
                //          * Day **/
                //         if (elementDay != null) {
                //             if (elementDay.classList.contains('single')) {
                //                 me.targetDates.push(me.$moment(`${me.currentYear}-${me.currentMonth}-${i}`, 'YYYY-MM-D').format('YYYY-MM-DD'))
                //             } else {
                //                 if (ctr > 1) {
                //                     elementDay.parentNode.parentNode.classList.add('disabled_day')
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     if (dates[0] != undefined) {
                //         me.targetDates.push(me.$moment(`${me.currentYear}-${me.currentMonth}-${dates[0].id.split('_')[1]}`, 'YYYY-MM-D').format('YYYY-MM-DD'))
                //     }
                //     for (let i = 0; i < endNum + firstDayExcess; i++) {
                //         let elementDay = (document.getElementById(`day_${i}`) != null) ? document.getElementById(`day_${i}`) : null
                //
                //         /**
                //          * Day **/
                //         if (elementDay != null) {
                //             elementDay.parentNode.parentNode.classList.remove('disabled_day')
                //         }
                //     }
                // }
            },
            /**
             * Populate the Class
             * adding class in the header_day_wrapper
             */
            populateClass (date) {
                const me = this
                let result = ''
                me.schedules.forEach((data, index) => {
                    let scheduleCurrent = me.$moment(data.date).format('D')
                    if (date == scheduleCurrent) {
                        result = data.status
                    }
                })
                return result
            },
            /**
             * Populate the Scheduler
             * adding circle if the date has no availability status or have
             */
            populateScheduler (date) {
                const me = this
                let result = ''
                me.schedules.forEach((data, index) => {
                    let scheduleCurrent = me.$moment(data.date).format('D')
                    if (date == scheduleCurrent) {
                        if (data.scheduledDates.length > 0) {
                            if (data.status == 'open') {
                                result += `<div class="circle open"></div>`
                            } else {
                                result += `<div class="circle"></div>`
                            }
                        }
                    }
                })
                return result
            },
            /**
             * check the past first week of the current month
             * @param  {[integer]} startDate start number of the month
             * @param  {[integer]} excess    excess count of the month
             * @return {[$moment]}           date
             */
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
            /**
             * check the past first week of the current month
             * @param  {[integer]} startDate start number of the month
             * @return {[$moment]}           date
             */
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
                        me.form.studio_id = me.studios[0].id

                        me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
                    }
                })
            }
        },
        mounted () {
            const me = this
            me.fetchData()
        }
    }
</script>
