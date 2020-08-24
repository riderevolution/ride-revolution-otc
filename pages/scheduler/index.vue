<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Scheduler</h1>
                        <div class="actions">
                            <download-csv
                                class="action_btn alternate"
                                :data="attributes"
                                :name="`schedule-${$moment().format('MM-DD-YY-hh-mm')}.csv`" v-if="schedules.length > 0">
                                Export Schedule
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper alternate">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id" @change="getStudio($event)">
                                    <option value="" disabled>Choose a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="instructor_id">Instructor</label>
                                <select class="default_select alternate" name="instructor_id" v-model="form.instructor_id">
                                    <option value="0" selected>All Instructors</option>
                                    <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                </select>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                        <div class="legends_wrapper">
                            <div class="legend_title gray"><span>&#x25CF;</span> Class Completed</div>
                            <div class="legend_title margin blue"><span>&#x25CF;</span> Published</div>
                            <div class="legend_title margin black"><span>&#x25CF;</span> Draft</div>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <div class="calendar_wrapper">
                        <div class="calendar_actions">
                            <div class="action_flex">
                                <div class="action_calendar_btn" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 0, 0)">This Month</div>
                                <div class="action_calendar_btn margin" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 1, 0)">This Week</div>
                            </div>
                            <div :class="`action_flex ${(schedules.length <= 0) ? 'disabled_gear' : '' }`">
                                <div class="gear_action">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="calendar_gear" id="gear_month" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" @click="monthGear()"> <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/> <g transform="translate(10.043 7.221)"> <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/> <line y2="2.197" transform="translate(8.916)" class="gear_2"/> <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/> <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/> <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/> </g> </svg>
                                    <div :class="`gear_overlay ${(monthStatus) ? 'active' : ''}`">
                                        <ul class='gear_list_wrapper'>
                                            <li class='gear_list'><div class='gear_item' @click="duplicateMonth()">Duplicate Month</div></li>
                                            <li class='gear_list'><div class='red gear_item' @click="clearMonth()">Clear Month</div></li>
                                        </ul>
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
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
            <transition name="fade">
                <calendar-clear v-if="$store.state.calendarClearStatus" :value="value" :type="calendarType" />
            </transition>
            <transition name="fade">
                <calendar-duplicate v-if="$store.state.calendarDuplicateStatus" :type="calendarType" :datePicked="value" :yearPicked="currentYear" :monthPicked="currentMonth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../components/Foot'
    import CalendarClear from '../../components/modals/CalendarClear'
    import CalendarDuplicate from '../../components/modals/CalendarDuplicate'
    export default {
        components: {
            Foot,
            CalendarClear,
            CalendarDuplicate
        },
        data () {
            const values = []
            return {
                values: [],
                name: 'Scheduler',
                access: true,
                lastRoute: '',
                loaded: false,
                monthStatus: false,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                value: 0,
                calendarType: 'day',
                monthName: '',
                yearName: '',
                studios: [],
                instructors: [],
                schedules: [],
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                form: {
                    studio_id: 0,
                    instructor_id: 0
                }
            }
        },
        computed: {
            attributes () {
                const me = this
                return [
                    ...this.values.map(value => ({
                        'ID': value.id,
                        'Date': this.$moment(value.date).format('MMMM DD, YYYY'),
                        'Start Time': value.schedule.start_time,
                        'End Time': value.schedule.end_time,
                        'Studio': value.schedule.studio.name,
                        'Peak Type': value.schedule.peak_type,
                        'Class Type': value.schedule.class_type.name,
                        'Custom Class Type Name': value.schedule.custom_name,
                        'Class Length': value.schedule.class_length_formatted,
                        'Class Credits': value.schedule.class_credits,
                        'Instructor': `${value.schedule.instructor_schedules[0].user.first_name} ${value.schedule.instructor_schedules[0].user.last_name}`,
                        'Substitute Instructor': `${(value.schedule.instructor_schedules[1]) ? `${value.schedule.instructor_schedules[1].user.first_name} ${value.schedule.instructor_schedules[1].user.last_name}` : '- -'}`,
                        'Zoom Link': value.zoom_link,
                        'No. of Bookings': value.bookings.length,
                        'No. of Available Seats': value.availableSeatsCount
                    }))
                ]
            }
        },
        methods: {
            async submissionSuccess () {
                const me = this
                me.generateCalendar(me.currentYear, me.currentMonth, 0, 1)
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
            async generateCalendar (year, month, highlight, search) {
                const me = this
                me.loader(true)
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
                if (search) {
                    await me.$axios.get(`api/schedules?year=${me.currentYear}&month=${me.currentMonth}&studio_id=${me.form.studio_id}&instructor_id=${me.form.instructor_id}`).then(res => {
                        me.schedules = res.data.schedules
                    })
                } else {
                    await me.$axios.get(`api/schedules?year=${me.currentYear}&month=${me.currentMonth}&studio_id=${me.form.studio_id}`).then(res => {
                        me.schedules = res.data.schedules
                    })
                }

                me.values = me.schedules

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
                                            <div class='header_menu'>
                                                <div class='menu_circles' id=menu_${startDate}>&#x25CF; &#x25CF; &#x25CF;</div>
                                                <div class='menu_overlay ${(j == 6) ? 'alternate' : ''}'>
                                                    <ul class='menu_list_wrapper'>
                                                        <li class='menu_list'><a class='menu_item' href='/${me.lastRoute}/${unixTimestamp}/create'>Add a Class</a></li>
                                                        <li class='menu_list'><a class='menu_item' href='${dayDate}'>Duplicate Day</a></li>
                                                        <li class='menu_list'><a class='red menu_item' href='${dayDate}'>Clear a Day</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="classes" id="class_${startDate}">
                                            ${me.populateScheduler(startDate)}
                                        </div>
                                        ${(j == 6) ? `
                                            <svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate}">
                                                <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/>
                                                <g transform="translate(10.043 7.221)">
                                                    <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/>
                                                    <line y2="2.197" transform="translate(8.916)" class="gear_2"/>
                                                    <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/>
                                                    <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/>
                                                    <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/>
                                                    <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/>
                                                    <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/>
                                                    <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/>
                                                    <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/>
                                                </g>
                                            </svg>
                                            <div class="gear_overlay">
                                                <ul class="gear_list_wrapper">
                                                    <li class="gear_list">
                                                        <div class="gear_item">Duplicate Week</div>
                                                    </li>
                                                    <li class="gear_list">
                                                        <div class="red gear_item">Clear Week</div>
                                                    </li>
                                                </ul>
                                            </div>` : '' }
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
                                            ${(j == 6 && i == 4) ? `
                                                <svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate - 1}">
                                                    <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/>
                                                    <g transform="translate(10.043 7.221)">
                                                        <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/>
                                                        <line y2="2.197" transform="translate(8.916)" class="gear_2"/>
                                                        <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/>
                                                        <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/>
                                                        <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/>
                                                        <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/>
                                                        <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/>
                                                        <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/>
                                                        <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/>
                                                    </g>
                                                </svg>
                                                <div class="gear_overlay">
                                                    <ul class="gear_list_wrapper">
                                                        <li class="gear_list">
                                                            <div class="gear_item">Duplicate Week</div>
                                                        </li>
                                                        <li class="gear_list">
                                                            <div class="red gear_item">Clear Week</div>
                                                        </li>
                                                    </ul>
                                                </div>` : '' }
                                        </td>`
                                    nextDate++
                                }
                            } else {
                                tableRow.innerHTML += `
                                    <td id="col_${i}" class='day_wrapper fade_in disabled_day'>
                                        <div class='header_wrapper'>
                                            <div class='header_day'>${nextDate}</div>
                                        </div>
                                        ${(j == 6 && i == 4) ? `
                                            <svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate - 1}">
                                                <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/>
                                                <g transform="translate(10.043 7.221)">
                                                    <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/>
                                                    <line y2="2.197" transform="translate(8.916)" class="gear_2"/>
                                                    <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/>
                                                    <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/>
                                                    <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/>
                                                    <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/>
                                                    <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/>
                                                    <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/>
                                                    <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/>
                                                </g>
                                            </svg>
                                            <div class="gear_overlay">
                                                <ul class="gear_list_wrapper">
                                                    <li class="gear_list">
                                                        <div class="gear_item">Duplicate Week</div>
                                                    </li>
                                                    <li class="gear_list">
                                                        <div class="red gear_item">Clear Week</div>
                                                    </li>
                                                </ul>
                                            </div>
                                        ` : '' }
                                    </td>
                                    `
                                nextDate++
                            }
                        }
                    }
                    calendarTable.appendChild(tableRow)
                }
                document.querySelectorAll('tr #col_5').forEach((element, index) => {
                    let lastValue = element.querySelector('.header_wrapper .header_day').innerHTML
                    let lastElement = document.querySelectorAll('tr #col_5')[document.querySelectorAll('tr #col_5').length - 1]
                    if (lastValue == 31 || lastValue == 30) {
                        lastElement.innerHTML += `
                        <svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate - 1}">
                            <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/>
                            <g transform="translate(10.043 7.221)">
                                <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/>
                                <line y2="2.197" transform="translate(8.916)" class="gear_2"/>
                                <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/>
                                <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/>
                                <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/>
                                <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/>
                                <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/>
                                <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/>
                                <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/>
                            </g>
                        </svg>
                        <div class="gear_overlay">
                            <ul class="gear_list_wrapper">
                                <li class="gear_list">
                                    <div class="gear_item">Clear Week</div>
                                </li>
                                <li class="gear_list">
                                    <div class="gear_item">Duplicate Week</div>
                                </li>
                            </ul>
                        </div>
                        `
                    }
                })
                setTimeout( () => {
                    me.clickDates(0, endDate, excess)
                    me.checkAllDayPerWeek()
                    me.loader(false)
                }, 500)
            },
            checkAllDayPerWeek () {
                const me = this
                let schedules = document.querySelectorAll('.cms_table_calendar tbody tr')
                schedules.forEach((schedule, sindex) => {
                    let days = schedule.querySelectorAll('td')
                    let ctr = 0
                    days.forEach((day, dindex) => {
                        if (day.classList.contains('disabled_menu')) {
                            ctr++
                        }
                        if (ctr == 7) {
                            day.classList.add('disabled_gear')
                        }
                    })
                })
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
                    let unixTimestamp = me.$moment(`${me.currentYear}-${me.currentMonth}-${scheduleCurrent}`, 'YYYY-MM-D').valueOf()
                    if (date == scheduleCurrent) {
                        if (data.schedule.private_class == 1) {
                            if (data.schedule.enabled == 1) {
                                result += `
                                    <a href="/${me.lastRoute}/${unixTimestamp}/${data.schedule.id}/edit?i=${data.id}" class="class_wrapper private">
                                        <div class="class_text margin"><img src="/icons/private-class.svg" /><span>${data.schedule.start_time}</span></div>
                                        <div class="class_text">${(data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name} (${data.schedule.class_length_formatted})</div>
                                    </a>`
                            } else {
                                result += `
                                    <a href="/${me.lastRoute}/${unixTimestamp}/${data.schedule.id}/edit?i=${data.id}" class="class_wrapper draft private">
                                        <div class="class_text margin"><img src="/icons/private-class.svg" /><span>${data.schedule.start_time}</span></div>
                                        <div class="class_text">${(data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name} (${data.schedule.class_length_formatted})</div>
                                    </a>`
                            }
                        } else {
                            if (data.schedule.enabled == 1) {
                                result += `
                                    <a href="/${me.lastRoute}/${unixTimestamp}/${data.schedule.id}/edit?i=${data.id}" class="class_wrapper ${(currentDate.diff(scheduleDate) < 0) ? 'completed' : 'original'}">
                                        <div class="class_text margin">${data.schedule.start_time}</div>
                                        <div class="class_text">${(data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name} (${data.schedule.class_length_formatted})</div>
                                    </a>`
                            } else {
                                result += `
                                    <a href="/${me.lastRoute}/${unixTimestamp}/${data.schedule.id}/edit?i=${data.id}" class="class_wrapper draft">
                                        <div class="class_text margin">${data.schedule.start_time}</div>
                                        <div class="class_text">${(data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name} (${data.schedule.class_length_formatted})</div>
                                    </a>`
                            }
                        }
                    }
                })
                return result
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target
                let startDate = 1
                let endDate = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').daysInMonth()
                let elementMonth = document.getElementById('gear_month')
                if (elementMonth !== target.ownerSVGElement && elementMonth !== target.parentNode.parentNode.parentNode.previousElementSibling) {
                    me.monthStatus = false
                }
                do {
                    let elementDay = document.getElementById(`menu_${startDate}`)
                    let elementWeek = document.getElementById(`gear_${startDate}`)
                    if (elementDay !== target && elementDay !== target.parentNode.parentNode.parentNode.previousElementSibling) {
                        if (elementDay.nextElementSibling.classList.contains('active')) {
                            elementDay.classList.remove('active')
                            elementDay.nextElementSibling.classList.remove('active')
                        }
                    }
                    if (elementWeek != null) {
                        if (elementWeek !== target.ownerSVGElement && elementWeek !== target.parentNode.parentNode.parentNode.previousElementSibling) {
                            if (elementWeek.nextElementSibling.classList.contains('active')) {
                                elementWeek.classList.remove('active')
                                elementWeek.nextElementSibling.classList.remove('active')
                            }
                        }
                    }
                    startDate++
                } while (startDate <= endDate)
            },
            monthGear () {
                const me = this
                me.value = me.$moment(`${me.currentYear}-${me.currentMonth}-1`, 'YYYY-MM-D').format('YYYY-MM-DD')
                me.monthStatus ^= true
            },
            clearMonth () {
                const me = this
                me.value = me.$moment(`${me.currentYear}-${me.currentMonth}-${1}`, 'YYYY-MM-DD').format('YYYY-MM-DD')
                me.calendarType = 'month'
                me.$store.state.calendarClearStatus = true
                document.body.classList.add('no_scroll')
            },
            duplicateMonth () {
                const me = this
                me.calendarType = 'month'
                me.$store.state.calendarDuplicateStatus = true
                document.body.classList.add('no_scroll')
            },
            clickDates (startNum, endNum, firstDayExcess) {
                const me = this
                let month = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('M')
                let year = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').format('YYYY')
                do {
                    startNum++
                    let elementDay = (document.getElementById(`menu_${startNum}`) != null) ? document.getElementById(`menu_${startNum}`) : null
                    let elementWeek = (document.getElementById(`gear_${startNum}`) != null) ? document.getElementById(`gear_${startNum}`) : null
                    let elementDayAdd = (elementDay != null) ? elementDay.nextElementSibling.querySelector('.menu_list_wrapper .add') : null
                    let elementDayClear = (elementDay != null) ? elementDay.nextElementSibling.querySelector('.menu_list_wrapper .clear') : null
                    let elementDayDuplicate = (elementDay != null) ? elementDay.nextElementSibling.querySelector('.menu_list_wrapper .duplicate') : null
                    let elementWeekClear = (elementWeek != null) ? elementWeek.nextElementSibling.querySelector('.gear_list_wrapper .clear') : null
                    let elementWeekDuplicate = (elementWeek != null) ? elementWeek.nextElementSibling.querySelector('.gear_list_wrapper .duplicate') : null
                    let classNode = (document.getElementById(`class_${startNum}`) != null) ? document.getElementById(`class_${startNum}`) : null
                    /**
                     * Day **/
                    if (elementDay != null) {
                        /**
                        * Toggle Day Overlay **/
                        elementDay.addEventListener('click', function(e) {
                            let me = this
                            let overlay = me.nextElementSibling
                            if (overlay.classList.contains('active')) {
                                overlay.classList.remove('active')
                            } else {
                                overlay.classList.add('active')
                            }
                        })
                        if (elementDayAdd != null) {
                            elementDayAdd.addEventListener('click', function(e) {
                                e.preventDefault()
                                me.$router.push(e.target.getAttribute('href'))
                            })
                        }
                        if (elementDayClear != null) {
                            elementDayClear.addEventListener('click', function(e) {
                                e.preventDefault()
                                me.value = e.target.getAttribute('href')
                                me.calendarType = 'day'
                                me.$store.state.calendarClearStatus = true
                                document.body.classList.add('no_scroll')
                            })
                        }
                        if (elementDayDuplicate != null) {
                            elementDayDuplicate.addEventListener('click', function(e) {
                                e.preventDefault()
                                me.value = e.target.getAttribute('href')
                                me.calendarType = 'day'
                                me.$store.state.calendarDuplicateStatus = true
                                document.body.classList.add('no_scroll')
                            })
                        }
                    }

                    /**
                     * Weekly **/
                    if (elementWeek != null && elementWeek != 0) {
                        /**
                        * Toggle Week Overlay **/
                        elementWeek.addEventListener('click', function(e) {
                            e.preventDefault()
                            let element = this
                            let overlay = element.nextElementSibling
                            let id = element.id.split('_')[1]
                            me.value = `${me.getFirstDayofWeek(id, firstDayExcess)}|||${me.getLastDayofWeek(id)}`
                            if (overlay.classList.contains('active')) {
                                overlay.classList.remove('active')
                                overlay.previousElementSibling.classList.remove('active')
                            } else {
                                overlay.classList.add('active')
                                overlay.previousElementSibling.classList.add('active')
                            }
                        })
                        if (elementWeekClear != null) {
                            elementWeekClear.addEventListener('click', function(e) {
                                e.preventDefault()
                                me.calendarType = 'week'
                                me.$store.state.calendarClearStatus = true
                                document.body.classList.add('no_scroll')
                            })
                        }
                        if (elementWeekDuplicate != null) {
                            elementWeekDuplicate.addEventListener('click', function(e) {
                                e.preventDefault()
                                me.calendarType = 'week'
                                me.$store.state.calendarDuplicateStatus = true
                                document.body.classList.add('no_scroll')
                            })
                        }
                    }

                    if (classNode != null) {
                        if (classNode.querySelectorAll('.class_wrapper').length > 0) {
                            classNode.querySelectorAll('.class_wrapper').forEach((element, index) => {
                                element.addEventListener('click', function(e) {
                                    e.preventDefault()
                                    me.$router.push(this.getAttribute('href'))
                                })
                            })
                            // classNode.querySelector('.class_wrapper').addEventListener('click', function(e) {
                            //     e.preventDefault()
                            //     me.$router.push(this.getAttribute('href'))
                            // })
                        }
                        if (classNode.querySelectorAll('.class_wrapper').length <= 0) {
                            classNode.parentNode.classList.add('disabled_menu')
                        }
                    }
                } while (startNum < endNum + firstDayExcess)
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
                let studio_id = me.$cookies.get('CSID')
                me.$axios.get('api/studios?enabled=1').then(res => {
                    me.studios = res.data.studios
                })
                me.$axios.get(`api/instructors?enabled=1&studio_id=${studio_id}`).then(res => {
                    me.instructors = res.data.instructors.data
                })
                me.form.studio_id = studio_id
                me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
            },
            getStudio (event) {
                const me = this
                let value = event.target.value
                me.$axios.get(`api/instructors?enabled=1&studio_id=${value}`).then(res => {
                    me.instructors = res.data.instructors.data
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
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
                        }, 500)
                    }
                }).catch(err => {
                    console.log(err);
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[1]
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
