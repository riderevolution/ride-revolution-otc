<template>
  <div class="print_table" v-if="loaded">
    <div class="inline">
      <div class="logo">
        <img src="/logo.png" width="65px" />
        <div class="logo_title">
          Ride
          <br />
          Revolution
        </div>
      </div>
      <div class="text">
        <h2>Attendance With Revenue</h2>
        <h3>
          <span>
            {{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} -
            {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}
          </span>
        </h3>
      </div>
    </div>
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
      <tbody v-for="(data, key) in res" v-if="res.length > 0">
        <tr class="parent">
          <td class="toggler">
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
          <td>{{ getInstructorsInSchedule(data) }}</td>
          <td>{{ data.bookings.length }}</td>
          <td>Php {{ totalCount(data.total_revenue) }}</td>
          <td>Php {{ totalCount(data.total_discount) }}</td>
          <td>Php {{ totalCount(data.total_net_revenue) }}</td>
        </tr>
        <tr>
          <td class="pads" colspan="8">
            <div class="accordion_table show">
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
                      {{ replacer(booking.status).charAt(0).toUpperCase()
                      }}{{ replacer(booking.status).slice(1) }}
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
      <tbody class="no_results" v-if="res.length == 0">
        <tr>
          <td colspan="8">No Result(s) Found.</td>
        </tr>
      </tbody>
    </table>
    <div class="signature">
      <div class="label">SIGNATURE OVER PRINTED NAME</div>
    </div>
  </div>
</template>

<script>
  export default {
    layout: 'print',
    data() {
      return {
        loaded: false,
        studio: [],
        res: [],
        form: {
          start_date: this.$moment().format('YYYY-MM-DD'),
          end_date: this.$moment().format('YYYY-MM-DD'),
          customer_type_id: '',
          class_package_id: '',
          instructor_id: '',
          class_type_id: '',
          studio_id: ''
        }
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
      getInstructorsInSchedule(data, export_status = null) {
        const me = this
        let result = ''
        if (data != '') {
          let ins_ctr = 0,
            instructor = []
          data.schedule.instructor_schedules.forEach((ins, index) => {
            if (ins.substitute == 0) {
              ins_ctr += 1
            }
            if (ins.primary == 1) {
              instructor = ins
            }
          })

          if (ins_ctr == 2) {
            if (export_status != null) {
              result = `${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}`
            } else {
              result = `${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}`
            }
          } else {
            if (export_status != null) {
              result = `${instructor.user.fullname}`
            } else {
              result = `${instructor.user.fullname}`
            }
          }
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
      initial() {
        const me = this
        me.form.start_date = me.$route.query.start_date
        me.form.end_date = me.$route.query.end_date
        me.form.class_type_id = me.$route.query.class_type_id
        me.form.customer_type_id = me.$route.query.customer_type_id
        me.form.instructor_id = me.$route.query.instructor_id
        me.form.class_package_id = me.$route.query.class_package_id
        me.form.studio_id = me.$route.query.studio_id

        let formData = new FormData()
        formData.append('class_type_id', me.form.class_type_id)
        formData.append('customer_type_id', me.form.customer_type_id)
        formData.append('instructor_id', me.form.instructor_id)
        formData.append('class_package_id', me.form.class_package_id)
        formData.append('studio_id', me.$route.query.studio_id)
        formData.append('start_date', me.form.start_date)
        formData.append('end_date', me.form.end_date)
        formData.append('all', 1)

        me.$axios
          .post('api/reporting/classes/attendance-with-revenue', formData)
          .then(res => {
            if (res.data) {
              setTimeout(() => {
                me.res = res.data.scheduled_dates
                if (me.form.studio_id != '') {
                  me.$axios
                    .get(`api/studios/${me.$route.query.studio_id}`)
                    .then(res => {
                      me.studio = res.data.studio
                    })
                }
                me.loaded = true
                setTimeout(() => {
                  window.print()
                }, 1000)
              }, 500)
            }
          })
          .catch(err => {
            me.$store.state.errorList = err.response.data
            me.$store.state.errorStatus = true
          })
      }
    },
    mounted() {
      const me = this
      me.initial()
      window.onafterprint = function () {
        window.close()
      }
    }
  }
</script>
