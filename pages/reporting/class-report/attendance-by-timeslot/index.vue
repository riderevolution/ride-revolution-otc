<template>
  <transition name="fade">
    <div class="content" v-if="loaded">
      <div id="admin" class="cms_dashboard">
        <section id="top_content" class="table">
          <div class="action_wrapper">
            <div>
              <div class="header_title">
                <h1>Attendance by Timeslot</h1>
                <span>
                  {{ $moment(form.start_date).format('MMMM DD, YYYY') }}
                </span>
              </div>
              <h2 class="header_subtitle">Average attendance per time slot.</h2>
            </div>
            <div class="actions">
              <div
                class="action_btn alternate"
                @click="getClasses()"
                v-if="res"
              >
                Export
              </div>
              <download-csv
                class="hidden me"
                :data="attendanceByTimeslotAttributes"
                :name="`attendance-by-timeslot-${$moment(
                  form.start_date
                ).format('MM-DD-YY')}-${$moment(form.end_date).format(
                  'MM-DD-YY'
                )}.csv`"
              >
                Export
              </download-csv>
            </div>
          </div>
          <div class="filter_wrapper">
            <form
              class="filter_flex"
              id="filter"
              @submit.prevent="submitFilter()"
            >
              <div class="form_group">
                <label for="studio_id">Studio</label>
                <select
                  class="default_select alternate"
                  name="studio_id"
                  v-model="form.studio_id"
                >
                  <option value="" selected>Choose a Studio</option>
                  <option
                    :value="studio.id"
                    v-for="(studio, key) in studios"
                    :key="key"
                  >
                    {{ studio.name }}
                  </option>
                </select>
              </div>
              <div class="form_group margin">
                <label for="class_type_id">Class Type</label>
                <select
                  class="default_select alternate"
                  name="class_type_id"
                  v-model="form.class_type_id"
                >
                  <option value="" selected>All Class Type</option>
                  <option
                    :value="classType.id"
                    v-for="(classType, key) in classTypes"
                    :key="key"
                  >
                    {{ classType.name }}
                  </option>
                </select>
              </div>
              <div class="form_group margin">
                <label for="instructor_id">Instructor</label>
                <select
                  class="default_select alternate"
                  name="instructor_id"
                  v-model="form.instructor_id"
                >
                  <option value="" selected>All Instructors</option>
                  <option
                    :value="instructor.id"
                    v-for="(instructor, key) in instructors"
                    :key="key"
                  >
                    {{ instructor.first_name }} {{ instructor.last_name }}
                  </option>
                </select>
              </div>
              <div class="form_group margin">
                <label for="start_date">
                  Start Date
                  <span>*</span>
                </label>
                <v-ctk
                  v-model="form.start_date"
                  :only-date="true"
                  :format="'YYYY-MM-DD'"
                  :no-button="true"
                  :formatted="'YYYY-MM-DD'"
                  :no-label="true"
                  :color="'#33b09d'"
                  :id="'start_date'"
                  :name="'start_date'"
                  :label="'Select start date'"
                  v-validate="'required'"
                ></v-ctk>
                <transition name="slide">
                  <span
                    class="validation_errors"
                    v-if="errors.has('start_date')"
                  >
                    {{ errors.first('start_date') | properFormat }}
                  </span>
                </transition>
              </div>
              <div class="form_group margin">
                <label for="end_date">
                  End Date
                  <span>*</span>
                </label>
                <v-ctk
                  v-model="form.end_date"
                  :only-date="true"
                  :format="'YYYY-MM-DD'"
                  :no-button="true"
                  :formatted="'YYYY-MM-DD'"
                  :no-label="true"
                  :color="'#33b09d'"
                  :id="'end_date'"
                  :name="'end_date'"
                  :label="'Select end date'"
                  :min-date="$moment(form.start_date).format('YYYY-MM-DD')"
                  v-validate="'required'"
                ></v-ctk>
                <transition name="slide">
                  <span class="validation_errors" v-if="errors.has('end_date')">
                    {{ errors.first('end_date') | properFormat }}
                  </span>
                </transition>
              </div>
              <div class="form_group margin">
                <div class="form_check alternate">
                  <input
                    type="checkbox"
                    id="no_show"
                    name="booking_status"
                    class="action_check"
                    v-model="form.booking_status"
                  />
                  <label for="no_show">Remove No Show?</label>
                </div>
              </div>
              <input type="hidden" name="type" v-model="tabStatus" />
              <button
                type="submit"
                name="button"
                class="action_btn alternate margin"
              >
                Search
              </button>
            </form>
          </div>
        </section>
        <section id="content">
          <div class="cms_table_toggler">
            <div
              :class="`status ${tabStatus == 'weekdays' ? 'active' : ''}`"
              @click="toggleTab('weekdays')"
            >
              Weekdays
            </div>
            <div
              :class="`status ${tabStatus == 'weekends' ? 'active' : ''}`"
              @click="toggleTab('weekends')"
            >
              Weekends
            </div>
          </div>
          <div class="cms_five_row">
            <div
              class="column"
              v-for="(data, parent_key) in res"
              :key="parent_key"
            >
              <div class="column_header">
                <div class="day">{{ parent_key }}</div>
                <div class="avg">Avg. {{ computeTotalAvg(data) }}</div>
              </div>
              <div class="column_content">
                <table class="cms_table_alt">
                  <thead>
                    <tr>
                      <th>Time Slots</th>
                      <th>Avg. Total Riders</th>
                    </tr>
                  </thead>
                  <tbody v-if="data.length > 0">
                    <tr v-for="(timeslot, key) in data" :key="key">
                      <td>
                        <div
                          class="name pointer"
                          @click="routePush(timeslot, parent_key)"
                        >
                          {{ timeslot.time }}
                        </div>
                      </td>
                      <td>
                        {{ timeslot.average }}
                      </td>
                    </tr>
                  </tbody>
                  <tbody class="no_results" v-else>
                    <tr>
                      <td colspan="2">No Result(s) Found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
      Foot
    },
    data() {
      const values = []
      return {
        name: 'Attendance by Timeslot',
        access: true,
        loaded: false,
        rowCount: 0,
        tabStatus: 'weekdays',
        res: [],
        values: [],
        studios: [],
        instructors: [],
        studio: [],
        classTypes: [],
        form: {
          booking_status: false,
          instructor_id: '',
          studio_id: '',
          class_type_id: '',
          start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
          end_date: this.$moment().format('YYYY-MM-DD')
        }
      }
    },
    computed: {
      attendanceByTimeslotAttributes() {
        const me = this
        return [
          ...me.values.map((value, key) => ({
            'Transaction Date': me
              .$moment(value.user_package_count.payment.created_at)
              .format('MMM DD, YYYY hh:mm A'),
            'Reference Number': me.getPaymentCode(value.user_package_count),
            'Promo Code':
              value.user_package_count.payment.promo_code_used != null
                ? value.user_package_count.payment.promo_code_used
                : 'N/A',
            'Payment Method':
              value.user_package_count.payment_item.payment_method.method,
            Studio: value.scheduled_date.schedule.studio.name,
            'Package Used': value.user_package_count
              ? value.user_package_count.class_package.name
              : 'N/A',
            'Package Shared By': value.shared
              ? value.user_package_count.user.fullname
              : 'N/A',
            'Booking Status': value.status,
            'Reservation Timestamp': me
              .$moment(value.created_at)
              .format('MMM DD, YYYY hh:mm A'),
            'Status Timestamp': me
              .$moment(value.updated_at)
              .format('MMM DD, YYYY hh:mm A'),
            'Schedule Name':
              value.scheduled_date.schedule.custom_name != null
                ? value.scheduled_date.schedule.custom_name
                : value.scheduled_date.schedule.class_type.name,
            'Schedule Date': me
              .$moment(value.scheduled_date.date)
              .format('MMMM DD, YYYY'),
            Day: me.$moment(value.scheduled_date.date).format('dddd'),
            Type: me.tabStatus,
            'Start Time': value.scheduled_date.schedule.start_time,
            'Main Instructor': me.getInstructorsInSchedule(
              value.scheduled_date,
              'main'
            ),
            'Primary Instructor': me.getInstructorsInSchedule(
              value.scheduled_date,
              'primary'
            ),
            'Substitute Instructor': me.getInstructorsInSchedule(
              value.scheduled_date,
              'substitute'
            ),
            'Additional Instructor': me.getInstructorsInSchedule(
              value.scheduled_date,
              'additional'
            ),
            'Full Name': value.user
              ? value.user.fullname
              : `${value.guest_first_name} ${value.guest_last_name}`,
            'Customer Type': value.customer_type,
            'Email Address': value.user ? value.user.email : value.guest_email,
            'Gross Revenue': me.computeRevenue(value, 'gross'),
            Discount: me.computeRevenue(value, 'discount'),
            'Net Revenue': me.computeRevenue(value, 'net'),
            'Comp Reason': value.user_package_count.payment_item.payment_method
              .comp_reason
              ? value.user_package_count.payment_item.payment_method.comp_reason
              : 'N/A',
            Note: value.user_package_count.payment_item.payment_method.note
              ? value.user_package_count.payment_item.payment_method.note
              : 'N/A',
            Remarks: value.user_package_count.payment_item.payment_method
              .remarks
              ? value.user_package_count.payment_item.payment_method.remarks
              : 'N/A',
            'Last Action Taken By': value.employee
              ? value.employee.fullname
              : 'Customer'
          }))
        ]
      }
    },
    methods: {
      routePush(data, parent_key) {
        const me = this
        window.open(
          `${me.$route.path}/${data.time}?start_date=${
            me.form.start_date
          }&end_date=${me.form.end_date}&class_type_id=${
            me.form.class_type_id
          }&studio_id=${me.form.studio_id}&instructor_id=${
            me.form.instructor_id
          }&type=${me.tabStatus}&day=${parent_key.toLowerCase()}`,
          '_blank'
        )
      },
      getClasses() {
        const me = this
        let formData = new FormData(document.getElementById('filter'))
        formData.append('no_show', me.form.booking_status ? 1 : 0)
        me.values = []
        me.loader(true)
        me.$axios
          .post(`api/exports/class-report/attendance-by-timeslot`, formData)
          .then(res => {
            if (res.data) {
              me.values = res.data.export_data
            }
          })
          .catch(err => {})
          .then(() => {
            me.loader(false)
            document.querySelector('.me').click()
          })
      },
      computeRevenue(data, type) {
        const me = this
        let result = ''
        let base_value = 0
        if (data.status != 'cancelled') {
          if (
            data.user_package_count.payment_item.payment_method.method != 'comp'
          ) {
            switch (type) {
              case 'net':
                base_value = me.totalCount(data.net_revenue)
                break
              case 'revenue':
                base_value = me.totalCount(data.gross_revenue)
                break
              case 'discount':
                base_value = me.totalCount(data.discount)
                break
            }
            result = me.totalCount(
              base_value * parseInt(data.scheduled_date.schedule.class_credits)
            )
          } else {
            result = 0
          }
        } else {
          result = 0
        }

        return result
      },
      getPaymentCode(data) {
        const me = this
        let result = ''

        if (data.payment_item.payment_method) {
          switch (data.payment_item.payment_method.method) {
            case 'paypal':
              if (data.payment_item.payment_method.paypal_transaction_id) {
                result = data.payment_item.payment_method.paypal_transaction_id
              } else {
                result = data.payment.payment_code
              }
              break
            case 'paymaya':
              result = data.payment_item.payment_method.paymaya_transaction_id
              break
            case 'paymongo':
              result = data.payment_item.payment_method.paymongo_source_id
              break
            case 'gcash':
              result = data.payment_item.payment_method.gcash_reference_number
              break
            case 'gc_code':
              result = `${data.payment.payment_code} - ${data.payment_item.payment_method.gc_code}`
              break
            default:
              result = data.payment.payment_code
              break
          }
        } else {
          result = data.payment.payment_code
        }

        return result
      },
      getInstructorsInSchedule(data, type) {
        let result = ''

        switch (type) {
          case 'main':
            result = data.schedule.instructor_schedules[0].user.fullname
            break
          case 'substitute':
            result = data.schedule.instructor_schedules.filter(item => {
              return item.substitute == 1
            })
            result = result.length > 0 ? result[0].user.fullname : 'N/A'
            break
          case 'additional':
            result = data.schedule.instructor_schedules.filter(
              (item, index) => {
                if (index != 0) {
                  return !item.substitute && !item.primary
                }
              }
            )
            result = result.length > 0 ? result[0].user.fullname : 'N/A'
            break
          case 'primary':
            result = data.schedule.instructor_schedules.filter(item => {
              return item.primary == 1
            })
            result = result.length > 0 ? result[0].user.fullname : 'N/A'
            break
        }

        return result
      },
      getStudio() {
        const me = this
        let result = ''
        if (me.form.studio_id != '') {
          me.studios.forEach((studio, index) => {
            if (studio.id == me.form.studio_id) {
              result = studio.name
            }
          })
        } else {
          result = 'All Studios'
        }
        return result
      },
      getClassType() {
        const me = this
        let result = ''

        if (me.form.class_type_id != '') {
          me.$axios
            .get(`api/packages/class-types/${me.form.class_type_id}`)
            .then(res => {
              result = res.data.classType.name
            })
        } else {
          result = 'All Class Type'
        }

        return result
      },
      computeTotalAvg(data) {
        const me = this
        let avg = 0

        if (data.length > 0) {
          data.forEach((timeslot, key) => {
            avg += timeslot.average
          })
          avg = avg / data.length
        }

        return me.totalItems(avg)
      },
      toggleTab(status) {
        const me = this
        me.tabStatus = status
        me.fetchData(status)
      },
      submitFilter() {
        const me = this
        me.fetchData(me.tabStatus)
      },
      fetchData(type) {
        const me = this
        me.values = []
        me.loader(true)
        let formData = new FormData()
        formData.append('studio_id', me.form.studio_id)
        formData.append('class_type_id', me.form.class_type_id)
        formData.append('instructor_id', me.form.instructor_id)
        formData.append('start_date', me.form.start_date)
        formData.append('end_date', me.form.end_date)
        formData.append('no_show', me.form.booking_status ? 1 : 0)
        formData.append('type', type)

        me.$axios
          .post(`api/reporting/classes/attendance-by-timeslot`, formData)
          .then(res => {
            setTimeout(() => {
              me.res = res.data
              me.loaded = true
            }, 500)
          })
          .catch(err => {
            me.$store.state.errorList = err.response.data.errors
            me.$store.state.errorStatus = true
          })
          .then(() => {
            setTimeout(() => {
              me.loader(false)
            }, 500)
            me.rowCount = document.getElementsByTagName('th').length
          })
      },
      fetchExtraAPI() {
        const me = this
        let token = me.$cookies.get('70hokcotc3hhhn5')
        me.$axios
          .get('api/studios', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(res => {
            if (res.data) {
              me.studios = res.data.studios
              me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
                me.studio = res.data.studio
              })
            }
          })
        me.$axios.get(`api/instructors?enabled=1&all=1`).then(res => {
          me.instructors = res.data.instructors
        })
        me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
          me.classTypes = res.data.classTypes
        })
      }
    },
    async mounted() {
      const me = this
      await me.checkPagePermission(me)
      if (me.access) {
        let studio_id = me.$cookies.get('CSID')
        me.form.studio_id = studio_id
        me.fetchExtraAPI()
        me.fetchData('weekdays')
      } else {
        me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 500)
    }
  }
</script>
