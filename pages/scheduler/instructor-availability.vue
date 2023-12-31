<template>
  <transition name="fade">
    <div class="content" v-if="loaded">
      <div id="admin" class="cms_dashboard">
        <section id="top_content" class="table">
          <div class="action_wrapper">
            <h1 class="header_title">Instructor Availability</h1>
            <div class="actions">
              <download-csv
                class="action_btn alternate"
                :data="scheduleAttributes"
                :name="`schedule-${$moment().format('MM-DD-YY-hh-mm')}.csv`" v-if="values.length > 0">
                Export
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
                  <option value="" selected>All Instructors</option>
                  <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                </select>
              </div>
              <div class="form_group margin">
                <label for="status">Status</label>
                <select class="default_select alternate" name="status" v-model="form.status">
                  <option value="" selected>All Status</option>
                  <option value="available">Available</option>
                  <option value="partially-available">Partially-Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="undecided">Undecided</option>
                </select>
              </div>
              <button type="submit" name="button" class="action_btn alternate margin">Search</button>
            </form>
            <div class="legends_wrapper">
              <div class="legend_title green"><span>&#x25CF;</span>&nbsp;Available</div>
              <div class="legend_title margin yellow"><span>&#x25CF;</span>&nbsp;Partially-Available</div>
              <div class="legend_title margin red"><span>&#x25CF;</span>&nbsp;Unavailable</div>
              <div class="legend_title margin black"><span>&#x25CF;</span>&nbsp;Undecided</div>
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
            <div class="cms_table_calendar_wrapper fix">
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
      <transition name="fade">
        <calendar-action-message v-if="$store.state.calendarActionSuccess" :message="message" />
      </transition>
    </div>
  </transition>
</template>

<script>
  import Foot from '../../components/Foot'
  import CalendarClear from '../../components/modals/CalendarClear'
  import CalendarDuplicate from '../../components/modals/CalendarDuplicate'
  import CalendarActionMessage from '../../components/modals/CalendarActionMessage'
  export default {
    components: {
      Foot,
      CalendarClear,
      CalendarDuplicate,
      CalendarActionMessage
    },
    data () {
      const values = []
      return {
        values: [],
        name: 'Scheduler',
        access: true,
        lastRoute: '',
        message: '',
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
        dateWithScheds: [],
        dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        form: {
          studio_id: 0,
          instructor_id: '',
          status: ''
        }
      }
    },
    computed: {
      scheduleAttributes () {
        const me = this
        return [
          ...me.values.map(value => ({
            'Date': (value.date) ? me.$moment(value.date).format('MMMM DD, YYYY') : 'N/A',
            'Instructor': value.user.fullname,
            'Status': value.status,
            'Studio': me.getStudioName()
          }))
        ]
      }
    },
    methods: {
      getStudioName () {
        const me = this
        let result = ''

        me.studios.forEach((item, i) => {
          if (item.id == me.form.studio_id) {
            result = item.name
          }
        })

        return result
      },
      async submissionSuccess () {
        const me = this
        me.values = []
        me.generateCalendar(me.currentYear, me.currentMonth, 0, 1)
      },
      generatePrevCalendar () {
        const me = this
        me.currentMonth = parseInt(me.currentMonth) - 1
        if (me.currentMonth == 0) {
          me.currentMonth = 12
          me.currentYear = me.currentYear - 1
        }
        me.generateCalendar(me.currentYear, me.currentMonth, 0, 0)
      },
      generateNextCalendar () {
        const me = this
        me.currentMonth = parseInt(me.currentMonth) + 1
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

        await me.$axios.get(`api/reporting/instructor-availability?year=${me.currentYear}&month=${me.currentMonth}&studio_id=${me.form.studio_id}&instructor_id=${me.form.instructor_id}&status=${me.form.status}`).then(res => {
          me.schedules = res.data.schedules
          me.values = me.schedules

          if (me.form.status == 'undecided') {
            me.values = []
          }

          me.dateWithScheds = []
          me.schedules.forEach((schedule, key) => {
            let scheduleCurrent = me.$moment(schedule.date).format('D')
            if (me.dateWithScheds.indexOf(scheduleCurrent) < 0) {
              me.dateWithScheds.push(scheduleCurrent)
            }
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
          document.querySelectorAll('tr #col_5').forEach((element, index) => {
            let lastValue = element.querySelector('.header_wrapper .header_day').innerHTML
            let lastElement = document.querySelectorAll('tr #col_5')[document.querySelectorAll('tr #col_5').length - 1]
          })
          setTimeout( () => {
            me.checkAllDayPerWeek()
            me.loader(false)
          }, 500)
        })
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
        let result = '',
          decided_instructors = []

        me.schedules.forEach((data, index) => {
          let scheduleCurrent = me.$moment(data.date).format('D')
          if (data.show) {
            let currentDate = me.$moment(`${me.currentYear}-${me.currentMonth}-${date}`)
            let scheduleDate = me.$moment()
            let unixTimestamp = me.$moment(`${me.currentYear}-${me.currentMonth}-${scheduleCurrent}`, 'YYYY-MM-D').valueOf()
            let className = '',
              status = ''
            switch (data.status) {
              case 'available':
                className = 'green'
                status = 'Available'
                break
              case 'partially-available':
                className = 'yellow'
                status = 'Partially-Available'
                break
              case 'unavailable':
                className = 'red'
                status = 'Unavailable'
                break
            }
            if (date == scheduleCurrent) {
              if (me.form.status != 'undecided') {
                result += `
                  <div class="class_wrapper ${className}">
                    <div class="class_text big margin">${(data.user) ? data.user.fullname : `${data.user.first_name} ${data.user.last_name}`}</div>
                    <div class="class_text">${status}</div>
                  </div>`
                if (data.times.length > 0) {
                  result += `
                    <div class="class_wrapper blue">
                      <div class="class_text big">${data.user.first_name}'s Schedule</div>
                    </div>`
                  data.times.forEach((time, key) => {
                    result += `
                      <div class="time_wrapper">
                        <div class="text">${time.time_from} - ${time.time_to}</div>
                      </div>`
                  })
                }
              }
            }
          }
          if (date == scheduleCurrent) {
            decided_instructors.push(data.user.id)
          }
        })

        let values = []

        if (me.schedules.length > 0) {
          if (me.form.instructor_id) {
            let added = false
            switch (me.form.status) {
              case '':
              case 'undecided':
                me.schedules.forEach((schedule, key) => {
                  if (me.dateWithScheds.indexOf(date.toString()) < 0) {
                    if (!added) {
                      result += me.populateInstructors(schedule.user)
                      values.push(me.populateUndecidedInstructors(date, schedule.user))
                      added = true
                    }
                  }
                })
                break
            }
          } else {
            switch (me.form.status) {
              case '':
              case 'undecided':
                me.instructors.forEach((item, i) => {
                  if (decided_instructors.indexOf(item.id) < 0) {
                    result += me.populateInstructors(item)
                    values.push(me.populateUndecidedInstructors(date, item))
                  }
                })
                break
            }
          }
        }
        if (values.length > 0) {
          values.forEach((value, i) => {
            me.values.push(value)
          })
        }

        return result
      },
      populateUndecidedInstructors (date, item) {
        const me = this
        return {
          'date': me.$moment(`${me.currentYear}-${me.currentMonth}-${date}`),
          user: {
            fullname: item.fullname
          },
          status: 'undecided'
        }
      },
      populateInstructors (item) {
        let result = ''

        result = `
          <div class="class_wrapper draft">
            <div class="class_text big margin">${item.fullname}</div>
            <div class="class_text">Undecided</div>
          </div>`

        return result
      },
      fetchData () {
        const me = this
        let studio_id = me.$cookies.get('CSID'),
          year = '',
          month = ''

        me.$axios.get('api/studios?enabled=1').then(res => {
          me.studios = res.data.studios
        })
        me.$axios.get(`api/instructors?enabled=1&studio_id=${studio_id}`).then(res => {
          me.instructors = res.data.instructors.data
          me.instructors.sort((a, b) => (a.fullname > b.fullname) ? 1 : -1)
        })
        me.form.studio_id = studio_id

        if (me.$cookies.get('scheduler')) {
          let scheduler = me.$cookies.get('scheduler')
          scheduler = scheduler.split('-')
          year = scheduler[0]
          month = scheduler[1]
          me.$cookies.remove('scheduler')
        } else {
          year = me.$moment().year()
          month = me.$moment().month() + 1
        }

        me.generateCalendar(me.currentYear = year, me.currentMonth = month, 0, 0)
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
    }
  }
</script>
