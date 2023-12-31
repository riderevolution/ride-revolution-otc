<template>
  <transition name="fade">
    <div class="booker_table" v-if="loaded">
      <form
        id="action"
        class="table_layout"
        @submit.prevent="submitAttendance()"
      >
        <div class="info">
          <div class="text"></div>
          <div class="action_buttons" v-if="schedule">
            <div class="action_btn" @click="toggleCustomer()">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17.016"
                height="17.016"
                viewBox="0 0 17.016 17.016"
              >
                <defs></defs>
                <g transform="translate(-553 -381)">
                  <circle
                    class="add"
                    cx="8.508"
                    cy="8.508"
                    r="8.508"
                    transform="translate(553 381)"
                  />
                  <g transform="translate(558.955 386.955)">
                    <line
                      class="add_sign"
                      y2="5.233"
                      transform="translate(2.616 0)"
                    />
                    <line
                      class="add_sign"
                      x2="5.233"
                      transform="translate(0 2.616)"
                    />
                  </g>
                </g>
              </svg>
              <span>Add Customer</span>
            </div>
          </div>
        </div>
        <div class="action_wrapper" v-if="res.length > 0">
          <div class="form_group">
            <label for="q">Find a Customer</label>
            <input
              type="text"
              name="q"
              @input="submitFilter()"
              v-model="form.search"
              autocomplete="off"
              placeholder="Search for a customer"
              class="default_text search_alternate"
            />
          </div>
          <div class="actions">
            <div class="total">Total: {{ totalItems(res.length) }}</div>
            <download-csv
              class="action_btn alternate"
              :data="attributes"
              :name="`online-class-attendance-${$moment(
                schedule.schedule.date
              ).format('MM-DD-YY-hh-mm')}.csv`"
              v-if="res.length > 0"
            >
              Export
            </download-csv>
          </div>
        </div>
        <div class="scroll">
          <table class="cms_table alt">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Email Address</th>
                <th>Package Used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody v-if="res.length > 0 && !noSearchFound">
              <tr
                v-for="(data, key) in populateUsers"
                :key="key"
                v-show="data.searched"
              >
                <td>
                  <div class="thumb">
                    <img
                      :src="data.user.customer_details.images[0].path_resized"
                      v-if="data.user.customer_details.images[0].path != null"
                    />
                    <div class="table_image_default" v-else>
                      <div class="overlay">
                        {{ data.user.first_name.charAt(0)
                        }}{{ data.user.last_name.charAt(0) }}
                      </div>
                    </div>
                    <div
                      class="table_data_link"
                      @click="openWindow(`/customers/${data.user.id}/packages`)"
                    >
                      {{ data.user.first_name }} {{ data.user.last_name }}
                    </div>
                  </div>
                </td>
                <td width="15%">
                  <template
                    v-if="
                      data.user.bookings_count == 1 &&
                      data.user_package_count &&
                      data.user_package_count.class_package
                        .por_restrict_to_new_customers == 1
                    "
                  >
                    <div class="thumb alt">
                      <img src="/icons/first-timer-icon.png" />
                      <div class="table_data_link">First Timer</div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="thumb alt">
                      <img
                        :src="data.customer_type_image[0].path_resized"
                        v-if="data.customer_type_image[0].path != null"
                      />
                      <div class="table_data_link">
                        {{ data.customer_type }}
                      </div>
                    </div>
                  </template>
                </td>
                <td>{{ data.user.email }}</td>
                <td>
                  <p>
                    {{
                      data.user_package_count
                        ? data.user_package_count.class_package.name
                        : 'N/A'
                    }}
                  </p>
                  <template v-if="data.user_package_count">
                    <p
                      :class="['table_violator', data.shared ? 'pink' : 'blue']"
                    >
                      {{ data.shared ? 'Shared By' : 'Owned By' }}:
                      {{ data.user_package_count.user.fullname }}
                    </p>
                  </template>
                </td>
                <td width="15%">
                  <div class="form_group no_margin">
                    <select
                      class="default_select alternate"
                      :name="`status[${key}]`"
                      v-model="data.status"
                    >
                      <option value="reserved" selected>Reserved</option>
                      <option value="signed-in">Signed In</option>
                      <option value="no-show">No Show</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <input type="hidden" name="booking_id[]" :value="data.id" />
                </td>
              </tr>
            </tbody>
            <tbody class="no_results" v-else>
              <tr>
                <td colspan="6">No Result(s) Found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cta" v-if="res.length > 0">
          <button type="submit" name="submit" class="action_btn alternate">
            Submit
          </button>
        </div>
        <button
          type="button"
          class="hidden"
          id="online"
          @click="initial()"
        ></button>
      </form>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      schedule: {
        default: null
      },
      instructorDashboard: {
        default: false
      },
      studio: {
        type: Object / Array,
        default: function () {
          return {}
        }
      }
    },
    data() {
      const values = []
      return {
        loaded: false,
        rowCount: 0,
        res: [],
        values: [],
        form: {
          search: ''
        },
        noSearchFound: false
      }
    },
    computed: {
      attributes() {
        const me = this
        return [
          ...me.values.map(value => ({
            'Transaction Date': me
              .$moment(value.user_package_count.payment.created_at)
              .format('MMM DD, YYYY hh:mm A'),
            'Reference Number': me.getPaymentCode(value.user_package_count),
            'Promo Code':
              value.user_package_count.payment.promo_code_used != null
                ? value.user_package_count.payment.promo_code_used
                : 'N/A',
            'Payment Method': value.user_package_count.has_payment_item
              ? value.user_package_count.payment_item.payment_method.method
              : 'N/A',
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
              me.schedule.schedule.custom_name != null
                ? me.schedule.schedule.custom_name
                : me.schedule.schedule.class_type.name,
            'Schedule Date': me
              .$moment(me.schedule.date)
              .format('MMMM DD, YYYY'),
            'Start Time': me.schedule.schedule.start_time,
            'Main Instructor': me.getInstructorsInSchedule(me.schedule, 'main'),
            'Primary Instructor': me.getInstructorsInSchedule(
              me.schedule,
              'primary'
            ),
            'Substitute Instructor': me.getInstructorsInSchedule(
              me.schedule,
              'substitute'
            ),
            'Additional Instructor': me.getInstructorsInSchedule(
              me.schedule,
              'additional'
            ),
            'Full Name': `${value.user.first_name} ${value.user.last_name}`,
            'Customer Type':
              value.user.bookings_count === 1 &&
              value.user_package_count &&
              value.user_package_count.class_package
                .por_restrict_to_new_customers == 1
                ? 'First Timer'
                : value.customer_type,
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
            Username: value.employee ? value.employee.fullname : 'Customer',
            'Username Email': value.employee ? value.employee.email : 'Customer'
          }))
        ]
      },
      populateUsers() {
        const me = this
        let result = []
        me.res.forEach((data, index) => {
          result.push(data)
        })
        return result
      }
    },
    methods: {
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
      computeRevenue(data, type) {
        const me = this
        let result = ''
        let base_value = 0
        if (data.status != 'cancelled') {
          if (data.user_package_count.has_payment_item) {
            if (
              data.user_package_count.payment_item.payment_method.method !=
              'comp'
            ) {
              switch (type) {
                case 'gross':
                  base_value = me.totalCount(data.gross_revenue)
                  break
                case 'net':
                  base_value = me.totalCount(data.net_revenue)
                  break
                case 'discount':
                  base_value = me.totalCount(data.discount)
                  break
              }
              result = me.totalCount(
                base_value * parseInt(me.schedule.schedule.class_credits)
              )
            } else {
              result = 0
            }
          } else {
            result = 0
          }
        } else {
          result = 0
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
      submitFilter() {
        const me = this
        let ctr = 0
        me.res.forEach((data, index) => {
          let name = `${data.user.first_name} ${data.user.last_name}`
          name = name.toLowerCase()
          if (me.form.search != '') {
            if (name.includes(me.form.search.toLowerCase())) {
              data.searched = true
            } else {
              ctr++
              data.searched = false
            }
          } else {
            data.searched = true
          }
        })
        if (ctr == me.res.length) {
          me.noSearchFound = true
        } else {
          me.noSearchFound = false
        }
      },
      toggleCustomer() {
        const me = this
        me.$store.state.onlineAttendanceCustomer = true
        document.body.classList.add('no_scroll')
      },
      openWindow(slug) {
        const me = this
        window.open(
          `${window.location.origin}${slug}`,
          '_blank',
          `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${
            document.documentElement.clientWidth / 2
          },top=${document.documentElement.clientHeight / 2}`
        )
      },
      toggleClose() {
        const me = this
        me.$store.state.onlineAttendanceLayoutStatus = false
        document.body.classList.remove('no_scroll')
      },
      formatClassDate(value, withTime) {
        if (value) {
          if (withTime) {
            return this.$moment(value).format('M/D/YY (ddd) h:mm A')
          } else {
            return this.$moment(value).format('MMMM DD, YYYY')
          }
        }
      },
      submitAttendance() {
        const me = this
        let token = me.$cookies.get('70hokcotc3hhhn5')
        let formData = new FormData(document.getElementById('action'))
        formData.append('scheduled_date_id', me.schedule.id)
        me.loader(true)
        me.$axios
          .post('api/online-class-bookings/bulk-update', formData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(res => {
            setTimeout(() => {
              if (res.data) {
                me.$store.state.onlineAttendancePrompt = true
                document.body.classList.add('no_scroll')
                me.res = []
                setTimeout(() => {
                  res.data.bookings.forEach((data, index) => {
                    data.searched = true
                    me.res.push(data)
                  })
                  me.values = me.res
                }, 500)
              }
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
          })
      },
      initial() {
        const me = this
        me.loader(true)
        if (!me.schedule) {
          setTimeout(() => {
            me.loaded = true
            me.loader(false)
          }, 500)
        } else {
          me.$axios
            .get(
              `api/online-class-bookings?scheduled_date_id=${me.schedule.id}`
            )
            .then(res => {
              if (res.data) {
                me.res = []
                setTimeout(() => {
                  res.data.bookings.forEach((data, index) => {
                    data.searched = true
                    me.res.push(data)
                  })
                  me.values = me.res
                  me.loaded = true
                }, 500)
              }
            })
            .catch(err => {
              me.$store.state.errorList = err.response.data.errors
              me.$store.state.errorStatus = true
            })
            .then(() => {
              setTimeout(() => {
                me.rowCount = document.getElementsByTagName('th').length
                me.loader(false)
              }, 500)
            })
        }
      }
    },
    mounted() {
      const me = this
      me.initial()
    }
  }
</script>
