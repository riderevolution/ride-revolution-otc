<template>
    <div :class="`seat_boxes ${position} ${layout}`" v-if="data.length > 0">
        <div :class="`seat_position ${(seat.status == 'open' && $store.state.disableBookerUI) ? 'available' : ''} ${(seat.bookings.length > 0 && (seat.bookings[0].user != null && seat.bookings[0].user.id == $parent.$parent.$parent.customer.id)) ? 'highlight' : ''} ${(seat.status == 'open') ? '' : (seat.status == 'comp' ? (seat.comp.length > 0 ? 'comp' : '') : (seat.status == 'reserved') ? 'sign_in' : (seat.status == 'blocked' ? 'comp blocked' : (!$store.state.disableBookerUI && seat.status == 'signed-in' ? 'sign_out' : (seat.status == 'no-show' ? 'no_show' : (seat.status == 'reserved-guest') ? 'sign_in_guest' : ''))))}`" v-for="(seat, lkey) in data">

            <div class="seat_available" @click="toggleSwitchSeat(seat)" v-if="seat.status == 'open' && $store.state.disableBookerUI && seat.bookings.length <= 0"></div>
            <div class="seat_action" @click.self="toggleAction(seat.status, (seat.bookings.length > 0) ? seat.bookings[0].id : null)" v-if="seat.past == 0"></div>
            <div class="seat_pending" @click.self="checkPending((seat.bookings.length > 0) ? seat.bookings[0].user_id : null)" v-if="!$store.state.disableBookerUI && seat.userPendingPayments > 0 && seat.status != 'no-show' && seat.past == 0"></div>
            <div :class="`seat_overlay ${($store.state.disableBookerUI) ? 'disabled' : ''}`" @click="toggleMenu(seat, seat.status)">
                <div class="seat_number">{{ seat.number }}</div>
                <div class="seat_info" v-if="seat.comp.length > 0 || seat.bookings.length > 0">
                    <div class="info_image" v-if="seat.comp.length > 0 && seat.comp[0].user_id != null">
                        <img :src="seat.comp[0].user.customer_details.customer_type.image.path" />
                    </div>
                    <div class="info_image" v-if="seat.bookings.length > 0 && seat.bookings[0].user != null">
                        <img :src="seat.bookings[0].user.customer_details.customer_type.image.path" />
                    </div>
                    <div class="info_image" v-if="seat.bookings.length > 0 && seat.bookings[0].is_guest == 1">
                        <img src="/icons/guest-icon.svg" />
                    </div>
                    <h2 v-line-clamp="1">{{ (seat.comp.length > 0) ? (seat.comp[0].user_id != null ? seat.comp[0].user.first_name : seat.comp[0].email) : (seat.bookings.length > 0 && seat.bookings[0].user != null ? seat.bookings[0].user.first_name : seat.bookings[0].guest_first_name) }} {{ (seat.comp.length > 0) ? (seat.comp[0].user_id != null ? seat.comp[0].user.last_name : '') : (seat.bookings.length > 0 && seat.bookings[0].user != null ? seat.bookings[0].user.last_name : seat.bookings[0].guest_last_name) }}</h2>
                </div>
            </div>
            <div class="seat_info_blocked">
                <div class="info_image">
                    <img src="/icons/broken-bike-icon.svg" />
                </div>
            </div>
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
            }
        },
        methods: {
            toggleMenu (seat, status) {
                const me = this
                me.$store.state.compID = (seat.comp.length > 0) ? seat.comp[0].id : 0
                me.$store.state.bookingID = (seat.bookings.length > 0) ? seat.bookings[0].id : 0
                me.$store.state.classPackageID = (seat.bookings.length > 0) ? seat.bookings[0].class_package_id : 0
                me.$store.state.seat = seat
                switch (status) {
                    case 'open':
                        // if (seat.past == 0) {
                            if (me.$parent.hasCustomer && me.$parent.$parent.$parent.customer.id != '') {
                                let formData = new FormData()
                                formData.append('scheduled_date_id', me.$store.state.scheduleID)
                                formData.append('user_id', me.$store.state.customerID)
                                me.$axios.post('api/extras/check-if-user-is-booked-already', formData).then(res => {
                                    if (res.data.guests >= 5) {
                                        me.$parent.message = 'The user has already reached the guest limit.'
                                        me.$store.state.promptBookerStatus = true
                                        document.body.classList.add('no_scroll')
                                    } else {
                                        if (res.data.result == 0) {
                                            me.$store.state.customerPackageStatus = true
                                            me.$parent.$parent.$parent.packageMethod = 'create'
                                            document.body.classList.add('no_scroll')
                                        } else {
                                            me.$parent.assignType = 1
                                            me.$store.state.assignStatus = true
                                            document.body.classList.add('no_scroll')
                                        }
                                    }
                                }).catch(err => {
                                    me.$store.state.errorList = err.response.data.errors
                                    me.$store.state.errorStatus = true
                                })
                            } else {
                                me.$store.state.bookerMenuPromptStatus = true
                                document.body.classList.add('no_scroll')
                            }
                        // }
                        break
                    case 'comp':
                    case 'blocked':
                        me.$store.state.bookerMenuPromptStatus = true
                        document.body.classList.add('no_scroll')
                        break
                    case 'reserved':
                    case 'reserved-guest':
                        me.$store.state.bookerMenuPromptStatus = true
                        document.body.classList.add('no_scroll')
                        break
                    case 'signed-in':
                        if (seat.past == 1) {
                            me.$store.state.bookerMenuPromptStatus = true
                            document.body.classList.add('no_scroll')
                        }
                        break
                }
            },
            toggleSwitchSeat (seat) {
                const me = this
                me.$store.state.seat = seat
                me.$store.state.promptSwitchSeatStatus = true
                document.body.classList.add('no_scroll')
            },
            checkPending (user_id) {
                const me = this
                me.$store.state.customerID = user_id
                me.$store.state.pendingCustomerID = user_id
                me.$store.state.pendingTransactionsStatus = true
                document.body.classList.add('no_scroll')
            },
            toggleAction (status, id) {
                const me = this
                let formData = new FormData()
                if (status == 'reserved' && id != null) {
                    me.$axios.post(`api/bookings/sign-in/${id}`, formData).then(res => {
                        if (res.data) {
                            setTimeout( () => {
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
        },
    }
</script>
