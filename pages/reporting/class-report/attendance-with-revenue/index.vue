<template>
  <transition name="fade">
    <div class="content" v-if="loaded">
      <div id="admin" class="cms_dashboard">
        <section id="top_content" class="table">
          <div class="action_wrapper">
            <div>
              <div class="header_title">
                <h1>Attendance with Revenue</h1>
                <span>
                  {{ $moment(form.start_date).format('MMMM DD, YYYY') }}
                </span>
              </div>
              <h2 class="header_subtitle">Revenue for each class schedule</h2>
            </div>
            <div class="actions">
              <a
                :href="`/print/reporting/class/attendance-with-revenue?studio_id=${form.studio_id}&class_package_id=${form.class_package_id}&customer_type_id=${form.customer_type_id}&instructor_id=${form.instructor_id}&class_type_id=${form.class_type_id}&start_date=${form.start_date}&end_date=${form.end_date}`"
                target="_blank"
                class="action_btn alternate"
              >
                Print
              </a>

              <div
                class="action_btn alternate"
                @click="getClasses()"
                v-if="res.scheduled_dates.data.length > 0"
              >
                Export
              </div>
              <download-csv
                v-if="res.scheduled_dates.data.length > 0"
                class="hidden me"
                :data="attendanceWithRevenueAttributes"
                :name="`attendance-with-revenue-${$moment(
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
              @submit.prevent="submissionSuccess()"
            >
              <div class="form_group">
                <label for="studio_id">Studio</label>
                <select
                  class="default_select alternate"
                  name="studio_id"
                  v-model="form.studio_id"
                >
                  <option value="0" selected>All Studios</option>
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
                  <option value="0" selected>All Class Types</option>
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
                <label for="class_package_id">Class Package</label>
                <select
                  class="default_select alternate"
                  name="class_package_id"
                  v-model="form.class_package_id"
                >
                  <option value="0" selected>All Class Packages</option>
                  <option
                    :value="classPackage.id"
                    v-for="(classPackage, key) in classPackages"
                    :key="key"
                  >
                    {{ classPackage.name }}
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
                  <option value="0" selected>All Instructors</option>
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
                <label for="customer_type_id">Customer Type</label>
                <select
                  class="default_select alternate"
                  name="customer_type_id"
                  v-model="form.customer_type_id"
                >
                  <option value="0" selected>All Customer Type</option>
                  <option :value="type.id" v-for="(type, index) in types">
                    {{ type.name }}
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
                  :max-date="$moment().format('YYYY-MM-DD')"
                  :label="'Select start date'"
                  v-validate="'required'"
                ></v-ctk>
                <transition name="slide">
                  <span
                    class="validation_errors"
                    v-if="errors.has('start_date')"
                  >
                    {{ properFormat(errors.first('start_date')) }}
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
                  :max-date="$moment().format('YYYY-MM-DD')"
                  v-validate="'required'"
                ></v-ctk>
                <transition name="slide">
                  <span class="validation_errors" v-if="errors.has('end_date')">
                    {{ properFormat(errors.first('end_date')) }}
                  </span>
                </transition>
              </div>
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
          <table class="cms_table_accordion">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Class Type</th>
                <th>Instructor</th>
                <th>Total Riders</th>
                <th>Total Gross Revenue</th>
                <th>Total Discount</th>
                <th>Total Net Revenue</th>
              </tr>
            </thead>
            <tbody
              :class="`content_wrapper ${data.open ? 'toggled' : ''}`"
              v-for="(data, key) in res.scheduled_dates.data"
              v-if="res.scheduled_dates.data.length > 0"
            >
              <tr class="parent">
                <td class="toggler" @click.self="toggleAccordion($event, key)">
                  {{ $moment(data.date).format('MMMM DD, YYYY') }}
                </td>
                <td>{{ data.schedule.start_time }}</td>
                <td>
                  {{
                    data.schedule.set_custom_name
                      ? data.schedule.custom_name
                      : data.schedule.class_type.name
                  }}
                </td>
                <td v-html="instructorData(data, 'name')"></td>
                <td>{{ data.bookings.length }}</td>
                <td>Php {{ totalCount(data.total_revenue) }}</td>
                <td>Php {{ totalCount(data.total_discount) }}</td>
                <td>Php {{ totalCount(data.total_net_revenue) }}</td>
              </tr>
              <tr>
                <td class="pads" colspan="8">
                  <div class="accordion_table">
                    <table class="cms_table alt">
                      <thead>
                        <tr>
                          <th>Spot</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Package Used</th>
                          <th>Gross Revenue</th>
                          <th>Discount</th>
                          <th>Net Revenue</th>
                        </tr>
                      </thead>
                      <tbody v-if="data.bookings.length > 0">
                        <tr v-for="(booking, key) in data.bookings" :key="key">
                          <td>
                            {{
                              booking.seat.position != 'Online'
                                ? booking.seat.number
                                : '-'
                            }}
                          </td>
                          <td>{{ getCustomerInfo(booking, 'name') }}</td>
                          <td>
                            {{
                              replacer(booking.status).charAt(0).toUpperCase()
                            }}
                            {{ replacer(booking.status).slice(1) }}
                          </td>
                          <td>
                            <p>{{ booking.class_package.name }}</p>
                            <p
                              :class="[
                                'table_violator',
                                booking.shared ? 'pink' : 'blue'
                              ]"
                            >
                              {{ booking.shared ? 'Shared By' : 'Owned By' }}:
                              {{ booking.user_package_count.user.fullname }}
                            </p>
                          </td>
                          <td>Php {{ computeRevenue(booking, 'revenue') }}</td>
                          <td>Php {{ computeRevenue(booking, 'discount') }}</td>
                          <td>Php {{ computeRevenue(booking, 'net') }}</td>
                        </tr>
                      </tbody>
                      <tbody class="no_results" v-else>
                        <tr>
                          <td colspan="7">No Result(s) Found.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody
              class="no_results"
              v-if="res.scheduled_dates.data.length == 0"
            >
              <tr>
                <td colspan="8">No Result(s) Found.</td>
              </tr>
            </tbody>
          </table>
          <pagination
            :apiRoute="res.scheduled_dates.path"
            :current="res.scheduled_dates.current_page"
            :last="res.scheduled_dates.last_page"
          />
        </section>
      </div>
      <transition name="fade">
        <foot v-if="$store.state.isAuth" />
      </transition>
    </div>
  </transition>
</template>

<script>
  import Foot from '~/components/Foot'
  import Pagination from '~/components/Pagination'
  export default {
    components: {
      Foot,
      Pagination
    },
    data() {
      const values = []
      return {
        form: {
          studio_id: 0,
          instructor_id: 0,
          class_type_id: 0,
          class_package_id: 0,
          customer_type_id: 0,
          start_date: this.$moment().format('YYYY-MM-DD'),
          end_date: this.$moment().format('YYYY-MM-DD')
        },
        isUser: 0,
        id: 0,
        type: 0,
        rowCount: 0,
        status: 1,
        res: [],
        total_count: 0,
        studios: [],
        studio: [],
        types: [],
        values: [],
        classTypes: [],
        classPackages: [],
        instructors: [],
        name: 'Attendance with Revenue',
        access: true,
        loaded: false,
        filter: true
      }
    },
    computed: {
      attendanceWithRevenueAttributes() {
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
            Studio: me.studio.name,
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
            'Full Name': value.user.fullname,
            'Customer Type': value.customer_type,
            'Email Address': value.user.email,
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
              case 'gross':
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
      getCustomerInfo(data, type) {
        const me = this
        let result = ''
        switch (type) {
          case 'name':
            if (data.user != null) {
              result = data.user.fullname
            } else {
              result = `${data.guest_first_name} ${data.guest_last_name}`
            }
            break
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
      instructorData(data, type) {
        let main = null,
          substitute = null,
          additional = null,
          sub_primary = false,
          result = ''

        if (data) {
          main = data.schedule.instructor_schedules.filter(item => {
            return item.primary == 1
          })
          main =
            main.length > 0
              ? main[0].user
              : data.schedule.instructor_schedules[0].user

          substitute = data.schedule.instructor_schedules.filter(item => {
            return item.substitute == 1
          })
          substitute = substitute.length > 0 ? substitute[0].user : null

          additional = data.schedule.instructor_schedules.filter(
            (item, index) => {
              if (index != 0) {
                return !item.substitute && !item.primary
              }
            }
          )
          additional = additional.length > 0 ? additional[0].user : null

          sub_primary = substitute
            ? substitute.fullname == main.fullname
              ? true
              : false
            : false

          switch (type) {
            case 'name':
              if (sub_primary) {
                if (additional) {
                  result = `${substitute.instructor_details.nickname} + ${additional.instructor_details.nickname}`
                } else {
                  result = substitute.fullname
                }
              } else {
                if (substitute && additional) {
                  result = `${main.instructor_details.nickname} + ${substitute.instructor_details.nickname} + ${additional.instructor_details.nickname}`
                }
                if (!substitute && additional) {
                  result = `${main.instructor_details.nickname} + ${additional.instructor_details.nickname}`
                }
                if (substitute && !additional) {
                  result = `${main.instructor_details.nickname} + ${substitute.instructor_details.nickname}`
                }
                if (!substitute && !additional) {
                  result = main.fullname
                }
              }
              break
          }
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
      getClasses() {
        const me = this
        let formData = new FormData(document.getElementById('filter'))

        me.values = []
        me.loader(true)
        me.$axios
          .post('api/exports/class-report/attendance-with-revenue', formData)
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
      submissionSuccess() {
        const me = this
        me.filter = true
        me.fetchData()
      },
      /**
       * Custom toggler for accordion
       * @param  {[object]} event
       * @param  {[int]} key
       * @return {[css]}
       */
      toggleAccordion(event, key) {
        const me = this
        const target = event.target
        me.res.scheduled_dates.data[key].open ^= true
        if (me.res.scheduled_dates.data[key].open) {
          target.parentNode.parentNode.querySelector(
            '.accordion_table'
          ).style.height = `${
            target.parentNode.parentNode.querySelector('.accordion_table')
              .scrollHeight
          }px`
        } else {
          target.parentNode.parentNode.querySelector(
            '.accordion_table'
          ).style.height = 0
        }
      },
      fetchData() {
        const me = this
        me.loader(true)

        let formData = new FormData()
        formData.append('start_date', me.form.start_date)
        formData.append('end_date', me.form.end_date)
        formData.append('studio_id', me.form.studio_id)
        formData.append('instructor_id', me.form.instructor_id)
        formData.append('class_type_id', me.form.class_type_id)
        formData.append('class_package_id', me.form.class_package_id)
        formData.append('customer_type_id', me.form.customer_type_id)
        me.$axios
          .post('api/reporting/classes/attendance-with-revenue', formData)
          .then(res => {
            setTimeout(() => {
              res.data.scheduled_dates.data.forEach((item, index) => {
                item.open = false
              })

              me.res = res.data

              me.fetchExtraAPI()
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
              const elements = document.querySelectorAll(
                '.cms_table_accordion .content_wrapper'
              )
              elements.forEach((element, index) => {
                element.querySelector('.accordion_table').style.height = 0
              })
            }, 500)
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
        me.$axios.get('api/extras/customer-types').then(res => {
          me.types = res.data.customerTypes
        })
        me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
          me.classTypes = res.data.classTypes
        })
        me.$axios
          .get(`api/packages/class-packages?enabled=1&get=1`)
          .then(res => {
            me.classPackages = res.data.classPackages
          })
      }
    },
    async mounted() {
      const me = this
      await me.checkPagePermission(me)
      if (me.access) {
        if (me.$cookies.get('CSID')) {
          let studio_id = me.$cookies.get('CSID')
          me.form.studio_id = studio_id
        }
        me.fetchData()
      } else {
        me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 300)
    }
  }
</script>
