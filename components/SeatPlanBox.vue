<template>
    <div :class="`seat_boxes ${position} ${layout}`" v-if="data.length > 0">
        <div :id="`seat_${position}_${lkey}`" :class="`seat_position ${addSeatClass(seat)}`" v-for="(seat, lkey) in data" @mouseover="toggle(seat, lkey, 'hover')" @mouseout="toggle(seat, lkey, 'out')">
            <div class="seat_details" v-if="seat.status == 'blocked'">
                <div class="flex">
                    <div class="info_image block">
                        <img src="/icons/broken-bike-icon.svg" />
                    </div>
                    <span>Blocked Bike</span>
                </div>
            </div>
            <div class="seat_details" v-if="seat.status == 'signed-in' || seat.status == 'reserved'">
                <div class="seat_name">{{ seat.number }} - {{ seat.bookings[0].user.first_name }} {{ seat.bookings[0].user.last_name }}</div>
                <div class="seat_violator">{{ seat.status.charAt(0).toUpperCase() }}{{ seat.status.slice(1) }}</div>
                <div class="flex alt margin">
                    <div class="info_image" v-if="seat.bookings.length > 0 && seat.bookings[0].user != null">
                        <img :src="seat.bookings[0].user.customer_details.customer_type.image.path" />
                    </div>
                    <span>{{ seat.bookings[0].user.customer_details.customer_type.name }}</span>
                </div>
                <div class="flex alt" v-if="seat.bookings.length > 0 && seat.bookings[0].user != null && seat.bookings[0].user.has_first_timer">
                    <div class="info_image">
                        <img src="/icons/first-timer-package-icon.png" />
                    </div>
                    <span>First Timer Package</span>
                </div>
                <div class="seat_pending_total" v-if="seat.userPendingPayments">
                    <img src="/icons/pending-payment-icon.svg">
                    <span>Php {{ totalCount(seat.userPendingPaymentsTotal) }} (Pending)</span>
                </div>
            </div>
            <div class="seat_details" v-if="seat.status == 'reserved-guest'">
                <div class="seat_name">{{ seat.number }} - {{ (seat.bookings.length > 0 && seat.bookings[0].user != null) ? seat.bookings[0].user.first_name : seat.bookings[0].guest_first_name }} {{ (seat.bookings.length > 0 && seat.bookings[0].user != null) ? seat.bookings[0].user.last_name : seat.bookings[0].guest_last_name }}</div>
                <div class="seat_violator">{{ seat.status.charAt(0).toUpperCase() }}{{ seat.status.slice(1) }}</div>
                <div class="flex alt margin" v-if="seat.bookings.length > 0 && seat.bookings[0].user != null">
                    <div class="info_image">
                        <img :src="seat.bookings[0].user.customer_details.customer_type.image.path" />
                    </div>
                    <span>{{ seat.bookings[0].user.customer_details.customer_type.name }}</span>
                </div>
                <div class="flex alt margin" v-if="seat.bookings.length > 0 && seat.bookings[0].user != null && seat.bookings[0].user.has_first_timer">
                    <div class="info_image">
                        <img src="/icons/first-timer-package-icon.png" />
                    </div>
                    <span>First Timer Package</span>
                </div>
                <div class="flex alt">
                    <div class="info_image" v-if="seat.bookings[0].is_guest == 1">
                        <img src="/icons/guest-icon.svg" />
                    </div>
                    <span>Guest</span>
                </div>
                <div class="seat_pending_total" v-if="seat.userPendingPayments">
                    <img src="/icons/pending-payment-icon.svg">
                    <span>Php {{ totalCount(seat.userPendingPaymentsTotal) }} (Pending)</span>
                </div>
            </div>
            <div class="seat_available" @click="toggleSwitchSeat(seat)" v-if="seat.status == 'open' && $store.state.disableBookerUI && seat.bookings.length <= 0"></div>
            <div class="seat_action" @click.self="toggleAction(seat.status, (seat.bookings.length > 0) ? seat.bookings[0].id : null)"></div>
            <div class="seat_pending" @click.self="checkPending((seat.bookings.length > 0) ? seat.bookings[0].user_id : null)" v-if="!$store.state.disableBookerUI && seat.userPendingPayments > 0 && seat.status != 'no-show' && seat.past == 0"></div>
            <div class="seat_overlay" @click="toggleMenu(seat, seat.status)">
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
            }
        },
        methods: {
            toggle (seat, unique, type) {
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
            addSeatClass (seat) {
                const me = this
                let result = ''
                if (me.$parent.hasCustomer) {
                    if (seat.bookings.length > 0 && (seat.bookings[0].original_booker_id == me.$parent.$parent.$parent.customer.id)) {
                        result += 'highlight '
                    } else {
                        if (seat.status != 'open' && seat.status != 'comp' && seat.status != 'blocked') {
                            result += 'disabled '
                        }
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
            toggleMenu (seat, status) {
                const me = this
                me.$store.state.compID = (seat.comp.length > 0) ? seat.comp[0].id : 0
                me.$store.state.bookingID = (seat.bookings.length > 0) ? seat.bookings[0].id : 0
                me.$store.state.userPackageCountId = (seat.bookings.length > 0) ? seat.bookings[0].user_package_count_id : 0
                me.$store.state.seat = seat
                switch (status) {
                    case 'open':
                        if (me.$parent.hasCustomer && me.$parent.$parent.$parent.customer.id != '') {
                            let formData = new FormData()
                            formData.append('scheduled_date_id', me.$store.state.scheduleID)
                            formData.append('user_id', me.$store.state.customerID)
                            me.$axios.post('api/extras/check-if-user-is-booked-already', formData).then(res => {
                                if (res.data.guestHere) {
                                    me.$parent.message = 'This customer is already booked as a guest here.'
                                    me.$store.state.promptBookerStatus = true
                                    document.body.classList.add('no_scroll')
                                } else {
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
                                            me.$store.state.customerPackageStatus = true
                                            me.$parent.$parent.$parent.packageMethod = 'create-guest'
                                            document.body.classList.add('no_scroll')
                                        }
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
