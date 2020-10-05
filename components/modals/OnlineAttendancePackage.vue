<template>
    <div class="default_modal alternate">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()" v-if="loaded">
            <div class="modal_wrapper">
                <h2 class="form_title">Choose a Package <br><span>({{ schedule.schedule.class_credits }} class {{ (schedule.schedule.class_credits <= 1) ? 'CREDIT' : 'CREDITS' }} will be deducted)</span></h2>
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
            type: {
                type: String,
                default: 'create'
            },
            customer: {
                type: Object/Array,
                default: null
            },
            schedule: {
                type: Object/Array,
                default: null
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
                        if (data.primary) {
                            result = 'toggled'
                        } else {
                            if (data.disabled) {
                                result = 'disabled'
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
                me.$store.state.onlineAttendancePackage = false
            },
            submissionSuccess () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        if (me.user_package_count_id != 0) {
                            formData = new FormData(document.getElementById('default_form'))
                            formData.append('user_package_count_id', me.user_package_count_id)
                            formData.append('is_guest', 0)
                            formData.append('scheduled_date_id', me.schedule.id)
                            formData.append('seat_id', 123)
                            formData.append('user_id', me.customer.id)
                            me.loader(true)
                            me.$axios.post('api/bookings', formData, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.$store.state.onlineAttendanceCustomer = false
                                    me.$store.state.onlineAttendancePackage = false
                                    setTimeout( () => {
                                        me.$parent.$parent.actionMessage = 'Succesfully added a customer.'
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
                                setTimeout( () => {
                                    document.getElementById('online').click()
                                }, 500)
                            })
                        } else {
                            me.$store.state.errorOverlayStatus = true
                            me.$store.state.errorList = ['Please select a Package']
                            me.$store.state.errorStatus = true
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
            if (me.customer != null) {
                me.loader(true)
                me.$axios.get(`api/customers/${me.customer.id}/packages?forOTCBooking=1&forWebBooking=1&scheduled_date_id=${me.schedule.id}`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            let ctr = 0
                            if (res.data.customer.user_package_counts.length > 0) {
                                res.data.customer.user_package_counts.forEach((data, index) => {
                                    if (parseInt(me.$moment((data.computed_expiration_date != null) ? data.computed_expiration_date : data.expiry_date_if_not_activated).diff(me.$moment())) > 0) {
                                        if (parseInt(data.count) > 0) {
                                            if (ctr == 0) {
                                                if (parseInt(data.count) >= me.schedule.schedule.class_credits) {
                                                    if (data.valid) {
                                                        me.user_package_count_id = data.id
                                                        me.new_package_count_id = data.id
                                                        data.primary = true
                                                        ctr++
                                                    }
                                                }
                                            }
                                            if (parseInt(data.count) <= 0) {
                                                data.disabled = true
                                            } else {
                                                if (parseInt(data.count) < me.schedule.schedule.class_credits) {
                                                    data.disabled = true
                                                } else {
                                                    if (!data.valid) {
                                                        data.disabled = true
                                                    }
                                                }
                                            }
                                            me.res.push(data)
                                        } else {
                                            me.notExistingPackage = true
                                        }
                                    }
                                })
                            } else {
                                me.$store.state.onlineAttendancePackage = false
                                setTimeout( () => {
                                    me.$parent.$parent.plan.message = 'Please buy a class package first'
                                }, 10)
                                me.$store.state.promptBookerStatus = true
                            }

                            let disabled_ctr = 0

                            me.res.forEach((item, i) => {
                                if (item.disabled) {
                                    disabled_ctr += 1
                                }
                            })

                            if (disabled_ctr == me.res.length) {
                                me.$store.state.onlineAttendancePackage = false
                                setTimeout( () => {
                                    me.$parent.$parent.plan.message = 'Please buy a class package first'
                                }, 10)
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
