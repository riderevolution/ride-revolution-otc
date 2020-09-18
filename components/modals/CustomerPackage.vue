<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()" v-if="loaded">
            <div class="modal_wrapper">
                <h2 class="form_title">Choose a Package <br><span>({{ $parent.schedule.schedule.class_credits }} class {{ ($parent.schedule.schedule.class_credits <= 1) ? 'CREDIT' : 'CREDITS' }} will be deducted)</span></h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group scrollable">
                    <div class="form_flex_radio alternate margin new">
                        <div :id="`pckg_${data.id}`" :class="`form_radio ${checkPackage(data, type)}`" v-for="(data, key) in res" :key="key">
                            <input type="radio" :id="`package_${key}`" :checked="(notExistingPackage) ? data.primary : user_package_count_id == data.id" :value="data.id" name="packages" class="action_radio" @change="selectPackage(data, key)">
                            <label :for="`package_${key}`">
                                <p>{{ data.class_package.name }} <br> <span class="id">Remaining Credits: {{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : data.count }}</span></p>
                                <p class="id">Package ID: {{ data.class_package.sku_id }}</p>
                            </label>
                        </div>
                    </div>
                    <div class="form_footer_wrapper" v-if="!switchPackage && !old_package_count_id">
                        <div class="button_group">
                            <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                    <div class="form_footer_wrapper" v-else-if="notExistingPackage && switchPackage">
                        <div class="button_group">
                            <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                    <div class="form_footer_wrapper" v-else-if="(!notExistingPackage && switchPackage) && new_package_count_id != old_package_count_id">
                        <div class="button_group">
                            <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            studioID: {
                default: 0
            },
            type: {
                type: String,
                default: 'create'
            }
        },
        data () {
            return {
                loaded: false,
                switchPackage: false,
                notExistingPackage: false,
                res: [],
                user_package_count_id: [],
                old_package_count_id: null,
                new_package_count_id: null
            }
        },
        methods: {
            checkPackage (data, type) {
                const me = this
                let result = ''

                switch (type) {
                    case 'create':
                    case 'create-guest':
                        if (data.primary) {
                            result = 'toggled'
                        } else {
                            if (data.disabled) {
                                result = 'disabled'
                            }
                        }
                        break
                    case 'update':
                    case 'waitlist':
                        if (!me.notExistingPackage) {
                            if (data.id == me.old_package_count_id) {
                                result = 'toggled'
                            } else {
                                if (data.disabled) {
                                    result = 'disabled'
                                }
                            }
                        } else {
                            if (data.primary) {
                                result = 'toggled'
                            }
                        }
                        break

                }
                return result
            },
            selectPackage (data, key) {
                const me = this
                let element = document.getElementById(`package_${key}`)
                me.user_package_count_id = data.id
                me.new_package_count_id = data.id
                me.$store.state.userPackageCountId = data.id
                me.res.forEach((value, index) => {
                    if (index == key) {
                        element.parentNode.classList.add('toggled')
                    } else {
                        if (document.getElementById(`package_${index}`)) {
                            document.getElementById(`package_${index}`).parentNode.classList.remove('toggled')
                        }
                    }
                })
            },
            toggleClose () {
                const me = this
                me.$store.state.customerPackageStatus = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        switch (me.type) {
                            case 'waitlist':
                                formData = new FormData(document.getElementById('default_form'))
                                formData.append('user_package_count_id', me.user_package_count_id)
                                formData.append('user_id', me.$store.state.customerID)
                                formData.append('scheduled_date_id', me.$store.state.scheduleID)
                                formData.append('studio_id', me.$parent.studioID)
                                me.loader(true)
                                me.$axios.post('api/waitlists', formData, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }).then(res => {
                                    if (res.data) {
                                        setTimeout( () => {
                                            me.$parent.actionMessage = 'Successfully added to waitlist.'
                                            me.$store.state.promptBookerActionStatus = true
                                        }, 500)
                                    }
                                }).catch(err => {
                                    setTimeout( () => {
                                        me.$store.state.errorOverlayStatus = true
                                        me.$store.state.errorList = err.response.data.errors
                                        me.$store.state.errorStatus = true
                                    }, 500)
                                }).then(() => {
                                    me.$store.state.customerPackageStatus = false
                                    setTimeout( () => {
                                        me.$parent.fetchWaitlist(me.$store.state.scheduleID)
                                        me.$store.state.userPackageCountId = 0
                                        me.$store.state.disableBookerUI = false
                                        me.$store.state.assignWaitlistBookerUI = false
                                        me.loader(false)
                                    }, 500)
                                })
                                break
                            case 'update':
                                formData = new FormData(document.getElementById('default_form'))
                                formData.append('booking_id', me.$store.state.bookingID)
                                formData.append('new_user_package_count_id', me.new_package_count_id)
                                formData.append('old_user_package_count_id', me.old_package_count_id)
                                me.loader(true)
                                me.$axios.post('api/bookings/change-package', formData, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }).then(res => {
                                    if (res.data) {
                                        setTimeout( () => {
                                            me.$parent.actionMessage = 'Successfully changed package.'
                                            me.$store.state.userPackageCountId = me.new_package_count_id
                                            me.$store.state.promptBookerActionStatus = true
                                            document.body.classList.add('no_scroll')
                                        }, 500)
                                    }
                                }).catch(err => {
                                    setTimeout( () => {
                                        me.$store.state.errorOverlayStatus = true
                                        me.$store.state.errorList = err.response.data.errors
                                        me.$store.state.errorStatus = true
                                    }, 500)
                                }).then(() => {
                                    me.$store.state.customerPackageStatus = false
                                    setTimeout( () => {
                                        me.$parent.getSeats()
                                        me.$parent.fetchWaitlist(me.$store.state.scheduleID)
                                        me.$store.state.disableBookerUI = false
                                        me.$store.state.assignWaitlistBookerUI = false
                                    }, 500)
                                })
                                break
                            case 'create-guest':
                                if (me.user_package_count_id != 0) {
                                    formData = new FormData()
                                    formData.append('scheduled_date_id', me.$store.state.scheduleID)
                                    formData.append('user_id', me.$store.state.customerID)
                                    formData.append('user_package_count_id', me.user_package_count_id)
                                    me.$axios.post('api/extras/check-if-user-is-booked-already', formData, {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    }).then(res => {
                                        if (res.data.result > 0) {
                                            me.$store.state.customerPackageStatus = false
                                            me.$store.state.assignStatus = true
                                            me.$parent.$refs.plan.assignType = 1
                                        }
                                    }).catch(err => {
                                        me.$store.state.errorOverlayStatus = true
                                        me.$store.state.errorList = err.response.data.errors
                                        me.$store.state.errorStatus = true
                                    })
                                } else {
                                    me.$store.state.errorOverlayStatus = true
                                    me.$store.state.errorList = ['Please select a Package']
                                    me.$store.state.errorStatus = true
                                }
                                break
                            case 'create':
                                if (me.user_package_count_id != 0) {
                                    formData = new FormData(document.getElementById('default_form'))
                                    formData.append('is_guest', 0)
                                    formData.append('scheduled_date_id', me.$store.state.scheduleID)
                                    formData.append('seat_id', me.$store.state.seat.id)
                                    formData.append('user_id', me.$store.state.customerID)
                                    formData.append('user_package_count_id', me.user_package_count_id)
                                    me.loader(true)
                                    me.$axios.post('api/bookings', formData, {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    }).then(res => {
                                        if (res.data) {
                                            setTimeout( () => {
                                                me.$parent.actionMessage = 'Seat has been successfully reserved.'
                                                me.$store.state.promptBookerActionStatus = true
                                                document.body.classList.remove('no_scroll')
                                            }, 500)
                                        }
                                    }).catch(err => {
                                        setTimeout( () => {
                                            me.$store.state.errorOverlayStatus = true
                                            me.$store.state.errorList = err.response.data.errors
                                            me.$store.state.errorStatus = true
                                        }, 500)
                                    }).then(() => {
                                        me.$store.state.customerPackageStatus = false
                                        setTimeout( () => {
                                            me.$parent.getSeats()
                                            me.$parent.fetchWaitlist(me.$store.state.scheduleID)
                                            me.$store.state.bookingID = 0
                                            me.$store.state.userPackageCountId = 0
                                            me.$store.state.seat = ''
                                            me.$store.state.disableBookerUI = false
                                            me.$store.state.assignWaitlistBookerUI = false
                                        }, 500)
                                    })
                                } else {
                                    me.$store.state.errorOverlayStatus = true
                                    me.$store.state.errorList = ['Please select a Package']
                                    me.$store.state.errorStatus = true
                                }
                                break
                        }
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            }
        },
        async mounted () {
            const me = this
            if (me.$store.state.customerID != 0) {
                me.loader(true)
                me.$axios.get(`api/customers/${me.$store.state.customerID}/packages?forOTCBooking=1&forWebBooking=1&scheduled_date_id=${me.$parent.schedule.id}`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            let ctr = 0
                            if (res.data.customer.user_package_counts.length > 0) {
                                res.data.customer.user_package_counts.forEach((data, index) => {
                                    if (parseInt(me.$moment(data.computed_expiration_date).diff(me.$moment())) > 0 || data.computed_expiration_date == null) {
                                        if (parseInt(data.count) > 0) {
                                            if (ctr == 0) {
                                                if (parseInt(data.count) >= me.$parent.schedule.schedule.class_credits) {
                                                    if (data.valid) {
                                                        me.user_package_count_id = data.id
                                                        me.new_package_count_id = data.id
                                                        me.$store.state.userPackageCountId = data.id
                                                        data.primary = true
                                                        ctr++
                                                    }
                                                }
                                            }
                                            if (parseInt(data.count) <= 0) {
                                                data.disabled = true
                                            } else {
                                                if (parseInt(data.count) < me.$parent.schedule.schedule.class_credits) {
                                                    data.disabled = true
                                                } else {
                                                    if (!data.valid) {
                                                        data.disabled = true
                                                    }
                                                }
                                            }
                                            me.res.push(data)
                                        } else {
                                            if (me.$store.state.seat && me.$store.state.seat.bookings.length > 0) {
                                                if (data.id == me.$store.state.seat.bookings[0].user_package_count_id) {
                                                    me.notExistingPackage = true
                                                }
                                            }
                                        }
                                    }
                                })
                                if (me.$store.state.seat && me.$store.state.seat.bookings.length > 0) {
                                    if (me.res.length > 0) {
                                        me.user_package_count_id = me.$store.state.seat.bookings[0].user_package_count_id
                                        me.new_package_count_id = me.$store.state.seat.bookings[0].user_package_count_id
                                        me.old_package_count_id = me.$store.state.seat.bookings[0].user_package_count_id
                                        me.switchPackage = true
                                    } else {
                                        me.$store.state.customerPackageStatus = false
                                        setTimeout( () => {
                                            me.$parent.$refs.plan.message = 'Please buy a class package first'
                                        }, 10)
                                        me.$parent.buyCredits = true
                                        document.getElementById('credits').classList.add('active')
                                        me.$scrollTo('#credits', {
                                            offset: -250
                                        })
                                        me.$store.state.promptBookerStatus = true
                                    }
                                } else {
                                    if (me.res.length <= 0) {
                                        me.$store.state.customerPackageStatus = false
                                        setTimeout( () => {
                                            me.$parent.$refs.plan.message = 'Please buy a class package first'
                                        }, 10)
                                        me.$parent.buyCredits = true
                                        document.getElementById('credits').classList.add('active')
                                        me.$scrollTo('#credits', {
                                            offset: -250
                                        })
                                        me.$store.state.promptBookerStatus = true
                                    }
                                }
                            } else {
                                me.$store.state.customerPackageStatus = false
                                setTimeout( () => {
                                    me.$parent.$refs.plan.message = 'Please buy a class package first'
                                }, 10)
                                me.$parent.buyCredits = true
                                document.getElementById('credits').classList.add('active')
                                me.$scrollTo('#credits', {
                                    offset: -250
                                })
                                me.$store.state.promptBookerStatus = true
                            }
                            me.loader(false)
                            me.loaded = true
                        }, 500)
                    }
                })
            }
        }
    }
</script>
