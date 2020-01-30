<template>
    <div class="instructor_tab_content">
        <div v-if="type == 'class-schedules' && loaded">
            <div class="calendar_wrapper">
                <div class="calendar_actions">
                    <div class="action_flex">
                        <a href="javascript:void(0)" class="action_calendar_btn" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 0, 0)">This Month</a>
                        <a href="javascript:void(0)" class="action_calendar_btn margin" @click="generateCalendar(currentYear = $moment().year(), currentMonth = $moment().month() + 1, 1, 0)">This Week</a>
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
                loaded: true,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                monthName: '',
                yearName: '',
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
                                        <div class='header_wrapper'>
                                            <div class='header_day ${(me.currentDate == startDate) ? 'active' : '' }'>${startDate}</div>
                                            <div class='header_menu'>
                                                <div class='menu_circles' id=menu_${startDate}>&#x25CF; &#x25CF; &#x25CF;</div>
                                                <div class='menu_overlay ${(j == 6) ? 'alternate' : ''}'>
                                                    <ul class='menu_list_wrapper'>
                                                        <li class='menu_list'><a class='add menu_item' href='/${me.lastRoute}/${unixTimestamp}/create'>Add a Class</a></li>
                                                        <li class='menu_list'><a class='clear menu_item' href='${dayDate}'>Clear a Day</a></li>
                                                        <li class='menu_list'><a class='duplicate menu_item' href='${dayDate}'>Duplicate Day</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        ${(j == 6) ? `<svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate}"> <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/> <g transform="translate(10.043 7.221)"> <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/> <line y2="2.197" transform="translate(8.916)" class="gear_2"/> <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/> <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/> <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/> </g> </svg><div class="gear_overlay"><ul class="gear_list_wrapper"> <li class="gear_list"><a class="clear gear_item" href="javascript:void(0)">Clear Week</a></li> <li class="gear_list"><a class="duplicate gear_item" href="javascript:void(0)">Duplicate Week</a></li> </ul> </div>` : '' }
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
                                            ${(j == 6 && i == 4) ? `<svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate - 1}"> <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/> <g transform="translate(10.043 7.221)"> <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/> <line y2="2.197" transform="translate(8.916)" class="gear_2"/> <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/> <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/> <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/> </g> </svg><div class="gear_overlay"><ul class="gear_list_wrapper"> <li class="gear_list"><a class="clear gear_item" href="javascript:void(0)">Clear Week</a></li> <li class="gear_list"><a class="duplicate gear_item" href="javascript:void(0)">Duplicate Week</a></li> </ul> </div>` : '' }
                                        </td>`
                                    nextDate++
                                }
                            } else {
                                tableRow.innerHTML += `
                                    <td id="col_${i}" class='day_wrapper fade_in disabled_day'>
                                        <div class='header_wrapper'>
                                            <div class='header_day'>${nextDate}</div>
                                        </div>
                                        ${(j == 6 && i == 4) ? `<svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate - 1}"> <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/> <g transform="translate(10.043 7.221)"> <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/> <line y2="2.197" transform="translate(8.916)" class="gear_2"/> <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/> <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/> <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/> </g> </svg><div class="gear_overlay"><ul class="gear_list_wrapper"> <li class="gear_list"><a class="clear gear_item" href="javascript:void(0)">Clear Week</a></li> <li class="gear_list"><a class="duplicate gear_item" href="javascript:void(0)">Duplicate Week</a></li> </ul> </div>` : '' }
                                    </td>`
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
                        lastElement.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="38.568" height="32.924" viewBox="0 0 38.568 32.924" class="calendar_gear" id="gear_${startDate - 1}"> <rect width="38.569" height="32.924" rx="3" transform="translate(0 0)"/> <g transform="translate(10.043 7.221)"> <ellipse cx="6.719" cy="6.719" rx="6.719" ry="6.719" transform="translate(2.196 2.197)" class="gear_2"/> <line y2="2.197" transform="translate(8.916)" class="gear_2"/> <line y2="2.197" transform="translate(8.916 15.635)" class="gear_2"/> <line x2="2.197" transform="translate(0 8.916)" class="gear_2"/> <line x2="2.197" transform="translate(15.635 8.916)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(2.611 2.611)" class="gear_2"/> <line x2="1.553" y2="1.553" transform="translate(13.667 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(2.611 13.667)" class="gear_2"/> <line y1="1.553" x2="1.553" transform="translate(13.667 2.611)" class="gear_2"/> </g> </svg><div class="gear_overlay"><ul class="gear_list_wrapper"> <li class="gear_list"><a class="clear gear_item" href="javascript:void(0)">Clear Week</a></li> <li class="gear_list"><a class="duplicate gear_item" href="javascript:void(0)">Duplicate Week</a></li> </ul> </div>`
                    }
                })
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
                me.generateCalendar(me.currentYear = me.$moment().year(), me.currentMonth = me.$moment().month() + 1, 0, 0)
                me.loaded = true
            },
        },
        mounted () {
            const me = this
            me.fetchData()
        },
    }
</script>
