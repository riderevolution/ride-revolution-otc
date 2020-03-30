<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionCreateSuccess()" v-if="type == 'create'">
            <div class="modal_wrapper">
                <h2 class="form_title">Choose a Package <br><span>({{ $parent.schedule.schedule.class_credits }} class credits will be deducted)</span></h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_flex_radio alternate margin">
                        <div class="form_radio" v-for="(data, key) in res" v-if="data.count > 0" :key="key">
                            <input type="radio" :id="`package_${key}`" :value="data.class_package.id" name="packages" class="action_radio" @change="selectPackage(data, key)">
                            <label :for="`package_${key}`">
                                <p>{{ data.class_package.name }} <br> <span class="id">Remaining Credits: {{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : data.count }}</span></p>
                                <p class="id">Package ID: {{ data.class_package.sku_id }}</p>
                            </label>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <form id="default_form" class="overlay" @submit.prevent="submissionCreateGuestSuccess()" v-if="type == 'create-guest'">
            <div class="modal_wrapper">
                <h2 class="form_title">Choose a Package <br><span>({{ $parent.schedule.schedule.class_credits }} class credits will be deducted)</span></h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_flex_radio alternate margin">
                        <div class="form_radio" v-for="(data, key) in res" v-if="data.count > 0" :key="key">
                            <input type="radio" :id="`package_${key}`" :value="data.class_package.id" name="packages" class="action_radio" @change="selectPackage(data, key)">
                            <label :for="`package_${key}`">
                                <p>{{ data.class_package.name }} <br> <span class="id">Remaining Credits: {{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : data.count }}</span></p>
                                <p class="id">Package ID: {{ data.class_package.sku_id }}</p>
                            </label>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <form id="default_form" class="overlay" @submit.prevent="submissionUpdateSuccess()" v-if="type == 'update'">
            <div class="modal_wrapper">
                <h2 class="form_title">Choose a Package <br><span>({{ $parent.schedule.schedule.class_credits }} class credits will be deducted)</span></h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_flex_radio alternate margin">
                        <div :class="`form_radio ${($store.state.classPackageID == data.class_package.id) ? 'toggled' : ''}`" v-if="data.count > 0" v-for="(data, key) in res" :key="key">
                            <input type="radio" :id="`package_${key}`" :checked="$store.state.classPackageID == data.class_package.id" :value="data.class_package.id" name="packages" class="action_radio" @change="selectPackage(data, key)">
                            <label :for="`package_${key}`">
                                <p>{{ data.class_package.name }} <br> <span class="id">Remaining Credits: {{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : data.count }}</span></p>
                                <p class="id">Package ID: {{ data.class_package.sku_id }}</p>
                            </label>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <form id="default_form" class="overlay" @submit.prevent="submissionWaitlistSuccess()" v-if="type == 'waitlist'">
            <div class="modal_wrapper">
                <h2 class="form_title">Choose a Package <br><span>({{ $parent.schedule.schedule.class_credits }} class credits will be deducted)</span></h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_flex_radio alternate margin">
                        <div :class="`form_radio ${($store.state.classPackageID == data.class_package.id) ? 'toggled' : ''}`" v-for="(data, key) in res" :key="key">
                            <input type="radio" :id="`package_${key}`" :checked="$store.state.classPackageID == data.class_package.id" :value="data.class_package.id" name="packages" class="action_radio" @change="selectPackage(data, key)">
                            <label :for="`package_${key}`">
                                <p>{{ data.class_package.name }} <br> <span class="id">Remaining Credits: {{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : data.count }}</span></p>
                                <p class="id">Package ID: {{ data.class_package.sku_id }}</p>
                            </label>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
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
                type: String,
                default: 0
            },
            type: {
                type: String,
                default: 'create'
            }
        },
        data () {
            return {
                res: [],
                class_package_id: [],
                old_package_count_id: null,
                new_package_count_id: null
            }
        },
        methods: {
            selectPackage (data, key) {
                const me = this
                let element = document.getElementById(`package_${key}`)
                me.class_package_id = data.class_package.id
                me.new_package_count_id = data.id
                me.$store.state.classPackageID = data.class_package.id
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
            submissionWaitlistSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('class_package_id', me.$store.state.classPackageID)
                        formData.append('user_id', me.$store.state.customerID)
                        formData.append('scheduled_date_id', me.$store.state.scheduleID)
                        formData.append('studio_id', me.$parent.studioID)
                        me.loader(true)
                        me.$axios.post('api/waitlists', formData).then(res => {
                            if (res.data) {
                                setTimeout( () => {
                                    me.$parent.actionMessage = 'Successfully added to waitlist.'
                                    me.$store.state.promptBookerActionStatus = true
                                }, 500)
                            }
                        }).catch(err => {
                            setTimeout( () => {
                                me.$store.state.errorList = err.response.data.errors
                                me.$store.state.errorStatus = true
                            }, 500)
                        }).then(() => {
                            me.$store.state.customerPackageStatus = false
                            setTimeout( () => {
                                me.$parent.fetchWaitlist(me.$store.state.scheduleID)
                                me.$store.state.classPackageID = 0
                                me.$store.state.disableBookerUI = false
                                me.$store.state.assignWaitlistBookerUI = false
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            submissionUpdateSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('booking_id', me.$store.state.bookingID)
                        formData.append('new_user_package_count_id', me.new_package_count_id)
                        formData.append('old_user_package_count_id', me.old_package_count_id)
                        me.loader(true)
                        me.$axios.post('api/bookings/change-package', formData).then(res => {
                            if (res.data) {
                                setTimeout( () => {
                                    me.$parent.actionMessage = 'Successfully changed package.'
                                    me.$store.state.classPackageID = me.new_package_count_id
                                    me.$store.state.promptBookerActionStatus = true
                                    document.body.classList.add('no_scroll')
                                }, 500)
                            }
                        }).catch(err => {
                            setTimeout( () => {
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
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            submissionCreateGuestSuccess () {
                const me = this
                if (me.class_package_id != 0) {
                    let formData = new FormData()
                    formData.append('scheduled_date_id', me.$store.state.scheduleID)
                    formData.append('user_id', me.$store.state.customerID)
                    me.$axios.post('api/extras/check-if-user-is-booked-already', formData).then(res => {
                        if (res.data.result > 0) {
                            me.$store.state.customerPackageStatus = false
                            me.$store.state.assignStatus = true
                            me.$parent.$refs.plan.assignType = 1
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    })
                }
            },
            submissionCreateSuccess () {
                const me = this
                if (me.class_package_id != 0) {
                    let formData = new FormData(document.getElementById('default_form'))
                    formData.append('is_guest', 0)
                    formData.append('scheduled_date_id', me.$store.state.scheduleID)
                    formData.append('seat_id', me.$store.state.seat.id)
                    formData.append('user_id', me.$store.state.customerID)
                    formData.append('class_package_id', me.class_package_id)
                    me.loader(true)
                    me.$axios.post('api/bookings', formData).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.$parent.actionMessage = 'Seat has been successfully reserved.'
                                me.$store.state.promptBookerActionStatus = true
                                document.body.classList.remove('no_scroll')
                            }, 500)
                        }
                    }).catch(err => {
                        setTimeout( () => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }, 500)
                    }).then(() => {
                        me.$store.state.customerPackageStatus = false
                        setTimeout( () => {
                            me.$parent.getSeats()
                            me.$parent.fetchWaitlist(me.$store.state.scheduleID)
                            me.$store.state.bookingID = 0
                            me.$store.state.classPackageID = 0
                            me.$store.state.seat = ''
                            me.$store.state.disableBookerUI = false
                            me.$store.state.assignWaitlistBookerUI = false
                        }, 500)
                    })
                } else {
                    me.$store.state.errorList = ['Please select a Package']
                    me.$store.state.errorStatus = true
                }
            }
        },
        async mounted () {
            const me = this
            if (me.$store.state.customerID != 0) {
                me.loader(true)
                me.$axios.get(`api/customers/${me.$store.state.customerID}/packages?forOTCBooking=1`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            if (res.data.customer.user_package_counts.length > 0) {
                                me.res = res.data.customer.user_package_counts
                                me.res.forEach((data, index) => {
                                    if (me.$store.state.classPackageID == data.class_package.id) {
                                        me.old_package_count_id = data.id
                                    }
                                })
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
                        }, 500)
                    }
                })
            }
        }
    }
</script>
