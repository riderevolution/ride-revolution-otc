<template>
  <div :class="`seat_boxes ${position} ${layout}`" v-if="data.length > 0">
    <div
      :id="`seat_${position}_${lkey}`"
      :class="`seat_position ${addSeatClass(seat)}`"
      v-for="(seat, lkey) in data"
      @mouseover="toggle(seat, lkey, 'hover')"
      @mouseout="toggle(seat, lkey, 'out')"
    >
      <div class="seat_details" v-if="seat.status == 'blocked'">
        <div class="flex">
          <div class="info_image block">
            <img src="/icons/broken-bike-icon.svg" />
          </div>
          <span>Blocked Bike</span>
        </div>
      </div>

      <div
        class="seat_details"
        v-if="
          seat.status == 'signed-in' ||
          seat.status == 'reserved' ||
          seat.status == 'reserved-guest'
        "
      >
        <div class="seat_name">
          {{ seat.number }} -
          {{
            seat.bookings.length > 0 && seat.bookings[0].user != null
              ? seat.bookings[0].user.first_name
              : seat.bookings[0].guest_first_name
          }}
          {{
            seat.bookings.length > 0 && seat.bookings[0].user != null
              ? seat.bookings[0].user.last_name
              : seat.bookings[0].guest_last_name
          }}
        </div>
        <div class="seat_violator">
          {{ seat.status.charAt(0).toUpperCase() }}{{ seat.status.slice(1) }}
        </div>
        <template v-if="seat.bookings.length > 0 && seat.bookings[0].is_guest">
          <div class="seat_name alt margin">
            Booked By -
            <b>{{ seat.bookings[0].original_booker.fullname }}</b>
          </div>
        </template>

        <div
          :class="[
            'flex alt',
            (seat.bookings.length > 0 &&
              seat.bookings[0].user != null &&
              seat.bookings[0].user.has_first_timer) ||
            seat.bookings[0].is_guest == 1
              ? 'margin'
              : ''
          ]"
          v-if="seat.bookings.length > 0 && seat.bookings[0].user != null"
        >
          <template
            v-if="
              seat.bookings[0].user.bookings_count == 1 ||
              seat.bookings[0].user_package_count.class_package
                .por_restrict_to_new_customers == 1
            "
          >
            <div class="info_image">
              <img src="/icons/first-timer-icon.png" />
            </div>
            <span>First Timer</span>
          </template>
          <template v-else>
            <div class="info_image">
              <img
                :src="
                  seat.bookings[0].user.customer_details.customer_type.image
                    .path
                "
              />
            </div>
            <span>
              {{ seat.bookings[0].user.customer_details.customer_type.name }}
            </span>
          </template>
        </div>
        <div
          class="flex alt margin"
          v-if="
            seat.bookings.length > 0 &&
            seat.bookings[0].user != null &&
            seat.bookings[0].user_package_count.class_package
              .por_restrict_to_new_customers == 1
          "
        >
          <div class="info_image">
            <img src="/icons/first-timer-package-icon.png" />
          </div>
          <span>First Timer Package</span>
        </div>
        <div class="flex alt" v-if="seat.bookings[0].is_guest == 1">
          <div class="info_image">
            <img src="/icons/guest-icon.svg" />
          </div>
          <span>Guest</span>
        </div>
        <div class="seat_pending_total" v-if="seat.userPendingPayments">
          <img src="/icons/pending-payment-icon.svg" />
          <span>
            Php {{ totalCount(seat.userPendingPaymentsTotal) }} (Pending)
          </span>
        </div>
      </div>

      <div
        class="seat_available"
        @click="toggleSwitchSeat(seat)"
        v-if="
          seat.status == 'open' &&
          $store.state.disableBookerUI &&
          seat.bookings.length <= 0
        "
      ></div>

      <div
        class="seat_action"
        @click.self="
          toggleAction(
            seat.status,
            seat.bookings.length > 0 ? seat.bookings[0].id : null
          )
        "
      ></div>

      <div
        class="seat_pending"
        @click.self="
          checkPending(
            seat.bookings.length > 0 ? seat.bookings[0].user_id : null
          )
        "
        v-if="
          !$store.state.disableBookerUI &&
          seat.userPendingPayments > 0 &&
          seat.status != 'no-show' &&
          seat.past == 0
        "
      ></div>

      <div class="seat_overlay" @click="toggleMenu(seat, seat.status)">
        <div class="seat_number">{{ seat.number }}</div>
        <div
          class="seat_info"
          v-if="seat.comp.length > 0 || seat.bookings.length > 0"
        >
          <template
            v-if="
              (seat.comp.length &&
                seat.comp[0].user &&
                seat.comp[0].user_package_count &&
                (seat.comp[0].user.bookings_count == 1 ||
                  seat.comp[0].user_package_count.class_package
                    .por_restrict_to_new_customers == 1)) ||
              (seat.bookings.length &&
                seat.bookings[0].user &&
                seat.bookings[0].user_package_count &&
                (seat.bookings[0].user.bookings_count == 1 ||
                  seat.bookings[0].user_package_count.class_package
                    .por_restrict_to_new_customers == 1))
            "
          >
            <img src="/icons/first-timer-icon.png" />
          </template>
          <template v-else>
            <div
              class="info_image"
              v-if="seat.comp.length > 0 && seat.comp[0].user_id != null"
            >
              <img
                :src="
                  seat.comp[0].user.customer_details.customer_type.image.path
                "
              />
            </div>
            <div
              class="info_image"
              v-if="seat.bookings.length > 0 && seat.bookings[0].user != null"
            >
              <img
                :src="
                  seat.bookings[0].user.customer_details.customer_type.image
                    .path
                "
              />
            </div>
            <div
              class="info_image"
              v-if="seat.bookings.length > 0 && seat.bookings[0].is_guest == 1"
            >
              <img src="/icons/guest-icon.svg" />
            </div>
          </template>
        </div>
      </div>

      <h2 v-line-clamp="1" v-if="seat.comp.length > 0">
        {{
          seat.comp[0].user_id != null
            ? `${seat.comp[0].user.first_name} ${seat.comp[0].user.last_name}`
            : seat.comp[0].email
        }}
      </h2>

      <h2
        class="info_link"
        v-line-clamp="1"
        @click.self="getCurrentCustomer(seat)"
        v-if="seat.bookings.length > 0 && seat.bookings[0].user != null"
      >
        {{ seat.bookings[0].user.first_name }}
        {{ seat.bookings[0].user.last_name }}
      </h2>

      <h2
        v-line-clamp="1"
        v-if="seat.bookings.length > 0 && seat.bookings[0].user == null"
      >
        {{ seat.bookings[0].guest_first_name }}
        {{ seat.bookings[0].guest_last_name }}
      </h2>
      <!-- <div class="seat_info_blocked">
        <div class="info_image">
          <img src="/icons/broken-bike-icon.svg" />
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      position: {
        type: String,
        default: null
      },
      layout: {
        type: String,
        default: null
      },
      total: {
        type: Number,
        default: 0
      },
      data: {
        default: null
      },
      customer: {
        default: null
      }
    },
    methods: {
      getCurrentCustomer(seat) {
        const me = this
        let token = me.$cookies.get('70hokcotc3hhhn5')
        me.loader(true)
        for (
          let i = 0, i_len = me.$parent.$parent.$parent.results.length;
          i < i_len;
          i++
        ) {
          me.$parent.$parent.$parent.results[i].highlighted = false
        }
        for (
          let i = 0, i_len = me.$parent.$parent.$parent.schedules.length;
          i < i_len;
          i++
        ) {
          me.$parent.$parent.$parent.schedules[i].highlighted = false
        }
        me.$axios
          .get(
            `api/customers/${seat.bookings[0].user.id}?booking=${
              me.$parent.$parent.$parent.studio.online_class
                ? 'online'
                : 'studio'
            }`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
          .then(res => {
            if (res.data) {
              setTimeout(() => {
                me.$parent.$parent.$parent.customer = res.data.user
                me.$store.state.customer = res.data.user
                me.$store.state.customerID = res.data.user.id
                if (me.$parent.$parent.$parent.customer != '') {
                  if (me.$parent.$parent.$parent.customer.bookings) {
                    for (
                      let i = 0,
                        i_len = me.$parent.$parent.$parent.schedules.length;
                      i < i_len;
                      i++
                    ) {
                      for (
                        let j = 0,
                          j_len =
                            me.$parent.$parent.$parent.customer.bookings.length;
                        j < j_len;
                        j++
                      ) {
                        if (
                          me.$parent.$parent.$parent.schedules[i].id ==
                          me.$parent.$parent.$parent.customer.bookings[j]
                            .scheduled_date_id
                        ) {
                          me.$parent.$parent.$parent.schedules[
                            i
                          ].highlighted = true
                        }
                      }
                    }
                  }
                }
                me.loader(false)
              }, 500)
            }
          })
          .catch(err => {
            me.$store.state.errorList = err.response.data.errors
            me.$store.state.errorStatus = true
          })
      },
      toggle(seat, unique, type) {
        const me = this
        let target = document.getElementById(`seat_${me.position}_${unique}`)
        if (target.querySelector('.seat_details')) {
          switch (type) {
            case 'hover':
              target.querySelector('.seat_details').classList.add('active')
              break
            case 'out':
              target.querySelector('.seat_details').classList.remove('active')
              break
          }
        }
      },
      addSeatClass(seat) {
        const me = this
        let result = ''
        if (me.$parent.hasCustomer) {
          if (
            seat.bookings.length > 0 &&
            seat.bookings[0].original_booker_id == me.customer.id
          ) {
            result += 'highlight '
          }
        }
        if (me.$store.state.disableBookerUI) {
          if (seat.status == 'open') {
            result += 'available '
          } else {
            result += 'disabled '
          }
        }
        switch (seat.status) {
          case 'comp':
            if (seat.comp.length > 0) {
              result += 'comp'
            }
            break
          case 'reserved':
            result += 'sign_in'
            break
          case 'reserved-guest':
            result += 'sign_in_guest'
            break
          case 'blocked':
            result += 'comp blocked'
            break
          case 'signed-in':
            result += 'sign_out'
            break
          case 'no-show':
            result += 'no_show'
            break
        }
        return result
      },
      toggleMenu(seat, status) {
        const me = this
        let token = me.$cookies.get('70hokcotc3hhhn5')
        me.$store.state.compID = seat.comp.length > 0 ? seat.comp[0].id : 0
        me.$store.state.bookingID =
          seat.bookings.length > 0 ? seat.bookings[0].id : 0
        me.$store.state.userPackageCountId =
          seat.bookings.length > 0 ? seat.bookings[0].user_package_count_id : 0
        me.$store.state.seat = seat
        switch (status) {
          case 'open':
            if (me.$parent.hasCustomer && me.customer.id !== undefined) {
              let formData = new FormData()
              formData.append('scheduled_date_id', me.$store.state.scheduleID)
              formData.append('user_id', me.$store.state.customerID)
              me.$axios
                .post('api/extras/check-if-user-is-booked-already', formData, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                })
                .then(res => {
                  if (res.data.guestHere) {
                    me.$parent.message =
                      'This customer is already booked as a guest here.'
                    me.$store.state.promptBookerStatus = true
                    document.body.classList.add('no_scroll')
                  } else {
                    if (res.data.guests >= 5) {
                      me.$parent.message =
                        'The user has already reached the guest limit.'
                      me.$store.state.promptBookerStatus = true
                      document.body.classList.add('no_scroll')
                    } else {
                      if (res.data.result == 0) {
                        me.$store.state.customerPackageStatus = true
                        me.$parent.$parent.$parent.packageMethod = 'create'
                        document.body.classList.add('no_scroll')
                      } else {
                        me.$store.state.customerPackageStatus = true
                        me.$parent.$parent.$parent.packageMethod =
                          'create-guest'
                        document.body.classList.add('no_scroll')
                      }
                    }
                  }
                })
                .catch(err => {
                  me.$store.state.errorList = err.response.data.errors
                  me.$store.state.errorStatus = true
                })
            } else {
              me.$store.state.bookerMenuPromptStatus = true
              document.body.classList.add('no_scroll')
            }
            break
          case 'comp':
          case 'blocked':
            me.$store.state.bookerMenuPromptStatus = true
            document.body.classList.add('no_scroll')
            break
          case 'reserved':
          case 'reserved-guest':
            if (me.customer) {
              if (
                seat.bookings.length > 0 &&
                seat.bookings[0].original_booker_id == me.customer.id
              ) {
                me.$store.state.bookerMenuPromptStatus = true
                document.body.classList.add('no_scroll')
              }
            } else {
              me.$store.state.bookerMenuPromptStatus = true
              document.body.classList.add('no_scroll')
            }
            break
          case 'signed-in':
            if (seat.past == 1) {
              me.$store.state.bookerMenuPromptStatus = true
              document.body.classList.add('no_scroll')
            }
            break
          case 'no-show':
            me.$parent.$parent.$parent.change_status = true
            break
        }
      },
      toggleSwitchSeat(seat) {
        const me = this
        me.$store.state.seat = seat
        me.$store.state.promptSwitchSeatStatus = true
        document.body.classList.add('no_scroll')
      },
      checkPending(user_id) {
        const me = this
        me.$store.state.customerID = user_id
        me.$store.state.pendingCustomerID = user_id
        me.$store.state.pendingTransactionsStatus = true
        document.body.classList.add('no_scroll')
      },
      toggleAction(status, id) {
        const me = this
        let token = me.$cookies.get('70hokcotc3hhhn5')
        let formData = new FormData()
        if (status == 'reserved' && id != null) {
          me.$axios
            .post(`api/bookings/sign-in/${id}`, formData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then(res => {
              if (res.data) {
                setTimeout(() => {
                  me.$parent.$parent.$parent.getSeats()
                }, 10)
              }
            })
        } else if (status == 'reserved-guest' && id != null) {
          formData.append('booking_id', id)
          formData.append('status', 'signed-in')
          me.$axios
            .post('api/bookings/change-status', formData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then(res => {
              if (res.data) {
                setTimeout(() => {
                  me.$parent.$parent.$parent.getSeats()
                }, 10)
              }
            })
        } else if (status == 'signed-in' && id != null) {
          me.$store.state.bookingID = id
          me.$store.state.promptSignOutStatus = true
          document.body.classList.add('no_scroll')
        }
      }
    }
  }
</script>
