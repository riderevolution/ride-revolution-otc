<template>
    <div :class="`seat_boxes ${position} ${layout}`" v-if="data.length > 0">
        <div :class="`seat_position ${(seat.status == 'open' && $store.state.disableBookerUI) ? 'available' : ''} ${(seat.bookings.length > 0 && (seat.bookings[0].user != null && seat.bookings[0].user.id == $parent.$parent.$parent.customer.id)) ? 'highlight' : ''} ${(seat.status == 'open') ? '' : (seat.status == 'comp' ? (seat.comp.length > 0 ? 'comp' : '') : (seat.status == 'reserved') ? (seat.bookings.length > 0 && seat.bookings[0].user != null ? 'sign_in' : 'sign_in_guest') : (seat.status == 'blocked' ? 'comp blocked' : (!$store.state.disableBookerUI && seat.status == 'signed-in' ? 'sign_out' : (seat.status == 'no-show' ? 'no_show' : ''))))}`" v-for="(seat, lkey) in data">
            <div :id="`seat_menu_${seat.number}`" class="seat_menu" @click.self="toggleMenu($event)" v-if="!$store.state.disableBookerUI && !$parent.hasCustomer && seat.status == 'open'">&#x25CF;&#x25CF;&#x25CF;</div>

            <div :id="`seat_menu_${seat.number}`" class="seat_menu" @click.self="toggleMenu($event)" v-if="!$store.state.disableBookerUI && !$parent.hasCustomer && (seat.status == 'comp' || seat.status == 'blocked')">&#x25CF;&#x25CF;&#x25CF;</div>

            <div :id="`seat_menu_${seat.number}`" class="seat_menu" @click.self="toggleMenu($event)" v-if="!$store.state.disableBookerUI && seat.bookings.length > 0 && (seat.bookings[0].user != null && seat.bookings[0].user.id == $parent.$parent.$parent.customer.id) && seat.status != 'signed-in'">&#x25CF;&#x25CF;&#x25CF;</div>

            <div :id="`seat_menu_${seat.number}`" class="seat_menu" @click.self="toggleMenu($event)" v-if="!$store.state.disableBookerUI && (seat.bookings.length > 0 && seat.bookings[0].original_booker_id == $parent.$parent.$parent.customer.id) && (seat.status != 'signed-in' && seat.status != 'no-show')">&#x25CF;&#x25CF;&#x25CF;</div>

            <div :id="`seat_menu_${seat.number}`" class="seat_menu" @click.self="toggleMenu($event)" v-if="!$store.state.disableBookerUI && !$parent.hasCustomer && (seat.bookings.length > 0 && seat.bookings[0].is_guest == 1) && (seat.status != 'signed-in' && seat.status != 'no-show')">&#x25CF;&#x25CF;&#x25CF;</div>

            <ul class="seat_overlay_menu">
                <li v-if="(!$store.state.disableBookerUI && !$parent.hasCustomer) && (seat.status == 'open' || seat.status == 'comp')"><a href="javascript:void(0)" class="seat_item" @click="seatStatus(seat, seat.status, 'comp')">{{ (seat.status == 'comp') ? 'Remove Comp' : 'Comp' }}</a></li>
                <li v-if="(!$store.state.disableBookerUI && !$parent.hasCustomer) && (seat.status == 'open' || seat.status == 'blocked')"><a href="javascript:void(0)" class="seat_item" @click="seatStatus(seat, seat.status, 'broken')">{{ (seat.status == 'blocked') ? 'Make Vacant' : 'Broken Bike' }}</a></li>
                <li v-if="seat.past == 0 && !$store.state.disableBookerUI && (seat.bookings.length > 0 && seat.status == 'reserved') && (seat.bookings[0].user != null && seat.bookings[0].user.id == $parent.$parent.$parent.customer.id)" @click="switchPackage(seat.bookings[0].id, seat.bookings[0].class_package_id)"><a href="javascript:void(0)" class="seat_item">Switch Package</a></li>
                <li v-if="seat.past == 0 && !$store.state.disableBookerUI && (seat.bookings.length > 0 && seat.status == 'reserved') && (seat.bookings[0].user != null && seat.bookings[0].user.id == $parent.$parent.$parent.customer.id)" @click="switchSeat(seat.bookings[0].id)"><a href="javascript:void(0)" class="seat_item">Switch Seat</a></li>

                <li v-if="seat.past == 0 && !$store.state.disableBookerUI && (seat.bookings.length > 0 && seat.status == 'reserved') && (seat.bookings[0].user != null && seat.bookings[0].user.id == $parent.$parent.$parent.customer.id || seat.bookings[0].original_booker_id == $parent.$parent.$parent.customer.id)"><a href="javascript:void(0)" @click="cancelSeat(seat.bookings[0].id)" class="seat_item cancel">{{ (seat.bookings[0].user != null) ? 'Cancel Seat' : 'Cancel Guest' }}</a></li>

                <li v-if="seat.past == 0 && !$store.state.disableBookerUI && (seat.bookings.length > 0 && seat.bookings[0].is_guest == 1) && seat.status == 'reserved' && !$parent.hasCustomer"><a href="javascript:void(0)" class="seat_item cancel">{{ (seat.bookings[0].user != null) ? 'Cancel Seat' : 'Cancel Guest' }}</a></li>

                <li v-if="(seat.bookings.length > 0 && (seat.bookings[0].user != null || seat.bookings[0].user == null)) && seat.past == 1 && seat.status != 'no-show'"><a href="javascript:void(0)" class="seat_item cancel" @click="noShow('booking', seat.bookings[0].id)">No Show</a></li>
                <li v-if="(seat.comp.length > 0 && (seat.comp[0].user != null || seat.comp[0].user == null)) && seat.past == 1 && seat.status != 'no-show'"><a href="javascript:void(0)" class="seat_item cancel" @click="noShow('comp', seat.comp[0].id)">No Show</a></li>

            </ul>

            <div class="seat_available" @click="toggleSwitchSeat(seat.id)" v-if="seat.status == 'open' && $store.state.disableBookerUI && seat.bookings.length <= 0"></div>
            <div class="seat_available" @click="signIn('open', seat)" v-if="seat.status == 'open' && $store.state.assignWaitlistBookerUI && $store.state.disableBookerUI && seat.bookings.length <= 0"></div>
            <div class="seat_number" @click="signIn(seat.status, seat)">{{ seat.number }}</div>
            <div class="seat_pending" @click.self="checkPending((seat.bookings.length > 0) ? seat.bookings[0].user_id : null)" v-if="!$store.state.disableBookerUI && seat.userPendingPayments > 0 && seat.status != 'no-show'"></div>
            <div class="seat_action" @click.self="toggleAction(seat.status, (seat.bookings.length > 0) ? seat.bookings[0].id : null)"></div>
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
            noShow (type, id) {
                const me = this
                let formData = new FormData()
                formData.append('_method', 'PATCH')
                formData.append('type', type)
                formData.append('data_id', id)
                me.loader(true)
                me.$axios.post('api/bookings/no-show', formData).then(res => {
                    if (res.data) {
                        me.$parent.message = 'No Show Confirmed.'
                        me.$store.state.promptBookerStatus = true
                        document.body.classList.add('no_scroll')
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.$parent.$parent.$parent.getSeats()
                    }, 500)
                })
            },
            cancelSeat (booking_id) {
                const me = this
                me.$store.state.bookingID = booking_id
                me.$store.state.promptCancelStatus = true
                document.body.classList.add('no_scroll')
            },
            checkPending (user_id) {
                const me = this
                me.$store.state.customerID = user_id
                me.$store.state.pendingCustomerID = user_id
                me.$store.state.pendingTransactionsStatus = true
                document.body.classList.add('no_scroll')
            },
            toggleSwitchSeat (seat_id) {
                const me = this
                me.$store.state.seatID = seat_id
                me.$store.state.promptSwitchSeatStatus = true
                document.body.classList.add('no_scroll')
            },
            switchSeat (booking_id) {
                const me = this
                me.$store.state.bookingID = booking_id
                me.$store.state.disableBookerUI = true
                me.$parent.message = 'Please select a new seat.'
                me.$store.state.promptBookerStatus = true
                document.body.classList.add('no_scroll')
            },
            switchPackage (booking_id, class_package_id) {
                const me = this
                me.$store.state.bookingID = booking_id
                me.$store.state.classPackageID = class_package_id
                me.$store.state.customerPackageStatus = true
                me.$parent.$parent.$parent.packageMethod = 'update'
                document.body.classList.add('no_scroll')
            },
            signIn (status, seat) {
                const me = this
                if (status == 'open' && seat.past == 0) {
                    if (me.$store.state.customerID != 0) {
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
                        me.$parent.message = 'Please select a customer first.'
                        me.$parent.$parent.$parent.findCustomer = false
                        me.$store.state.promptBookerStatus = true
                        document.body.classList.add('no_scroll')
                    }
                } else {
                    if (status == 'open' && seat.past == 1) {
                        me.$parent.message = 'Sorry, this class is over.'
                        me.$store.state.promptBookerStatus = true
                        document.body.classList.add('no_scroll')
                    }
                }
                me.$store.state.seatID = seat.id
            },
            seatStatus (data, status, type) {
                const me = this
                me.$store.state.compID = (data.comp.length > 0) ? data.comp[0].id : 0
                switch (type) {
                    case 'comp':
                        me.$parent.assignType = 0
                        if (status == 'comp') {
                            me.$store.state.removeAssignStatus = true
                        } else {
                            me.$store.state.assignStatus = true
                        }
                        document.body.classList.add('no_scroll')
                        break
                    case 'broken':
                        me.$parent.hasCancel = true
                        me.$parent.message = 'Are you sure you want to continue?'
                        me.$store.state.promptStatus = true
                        document.body.classList.add('no_scroll')
                        break
                }
                me.$store.state.seatID = data.id
            },
            toggleMenu (event) {
                const me = this
                let element = event.target
                if (element.nextElementSibling.classList.contains('active')) {
                    element.nextElementSibling.classList.remove('active')
                } else {
                    element.nextElementSibling.classList.add('active')
                }
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
