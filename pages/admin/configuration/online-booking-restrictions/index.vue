<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/configuration`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Configuration</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Online Booking Restrictions</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()">
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Configuration</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label>Allowed time to book before class starts: <span>*</span></label>
                                        <div class="form_flex_input">
                                            <input type="text" name="booking_hours" class="default_text number" autocomplete="off" v-model="form.booking.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'">
                                            <div class="placeholder">hours</div>
                                            <!-- <div class="up" @click="addCount('booking', 'hour')"></div>
                                            <div class="down" @click="subtractCount('booking', 'hour')"></div> -->
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('booking_hours')">{{ errors.first('booking_hours') | properFormat }}</span></transition>
                                        </div>
                                        <div class="form_flex_input">
                                            <input type="text" name="booking_minutes" class="default_text number" autocomplete="off" v-model="form.booking.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                            <div class="placeholder">mins.</div>
                                            <!-- <div class="up" @click="addCount('booking', 'mins')"></div>
                                            <div class="down" @click="subtractCount('booking', 'mins')"></div> -->
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('booking_minutes')">{{ errors.first('booking_minutes') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_group flex">
                                        <label>Allowed time to cancel before class starts: <span>*</span></label>
                                        <div class="form_flex_input">
                                            <input type="text" name="cancel_hours" class="default_text number" autocomplete="off" v-model="form.cancel.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'">
                                            <div class="placeholder">hours</div>
                                            <!-- <div class="up" @click="addCount('cancel', 'hour')"></div>
                                            <div class="down" @click="subtractCount('cancel', 'hour')"></div> -->
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('cancel_hours')">{{ errors.first('cancel_hours') | properFormat }}</span></transition>
                                        </div>
                                        <div class="form_flex_input">
                                            <input type="text" name="cancel_minutes" class="default_text number" autocomplete="off" v-model="form.cancel.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                            <div class="placeholder">mins.</div>
                                            <!-- <div class="up" @click="addCount('cancel', 'mins')"></div>
                                            <div class="down" @click="subtractCount('cancel', 'mins')"></div> -->
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('cancel_minutes')">{{ errors.first('cancel_minutes') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check"></div>
                                <div class="button_group">
                                    <nuxt-link :to="`/admin/configuration`" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Configuration',
                access: true,
                loaded: false,
                form: {
                    booking: {
                        hour: '-',
                        mins: '-'
                    },
                    cancel: {
                        hour: '-',
                        mins: '-'
                    }
                }
            }
        },
        filters: {
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('.')
                if (newValue.length > 1) {
                    newValue = newValue[1].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].split('_')
                        if (newValue.length > 1) {
                            let firstValue = ''
                            let lastValue = ''
                            if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                                firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                            }
                            for (let i = 1; i < newValue.length; i++) {
                                if (newValue[i] != 'id') {
                                    lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                                }
                            }
                            newValue = firstValue + ' ' + lastValue
                        } else {
                            newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                        }
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
                    if (message[0].split('file').length > 1) {
                        message = message[0].split('file')[1]
                        return `The ${newValue} field${message}`
                    } else {
                        return `The ${newValue}`
                    }
                }
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('allowed_time_booking', `${(me.form.booking.hour * 3600) + (me.form.booking.mins * 60) + (0 * 1)}+${me.form.booking.hour}:${me.form.booking.mins}`)
                        formData.append('allowed_time_cancel', `${(me.form.cancel.hour * 3600) + (me.form.cancel.mins * 60) + (0 * 1)}+${me.form.cancel.hour}:${me.form.cancel.mins}`)
                        me.loader(true)
                        formData.append('_method', 'PATCH')
                        me.$axios.post('api/booking-restrictions/2', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Restriction has been Updated')
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                location.reload()
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
							offset: -250
						})
                    }
                })
            },
            validateAdd (data, value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'booking':
                                data != 0 && (me.form.booking.hour = 0)
                                data < 24 && (me.form.booking.hour = (data += 1))
                                break
                            case 'cancel':
                                data != 0 && (me.form.cancel.hour = 0)
                                data < 24 && (me.form.cancel.hour = (data += 1))
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'booking':
                                data != 0 && (me.form.booking.mins = 0)
                                data < 60 && (me.form.booking.mins = (data += 1))
                                break
                            case 'cancel':
                                data != 0 && (me.form.cancel.mins = 0)
                                data < 60 && (me.form.cancel.mins = (data += 1))
                                break
                        }
                        break
                }
            },
            validateSubtract (data, value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'booking':
                                data > 0 && (me.form.booking.hour = (data -= 1))
                                break
                            case 'cancel':
                                data > 0 && (me.form.cancel.hour = (data -= 1))
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'booking':
                                data > 0 && (me.form.booking.mins = (data -= 1))
                                break
                            case 'cancel':
                                data > 0 && (me.form.cancel.mins = (data -= 1))
                                break
                        }
                        break
                }
            },
            addCount (value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'booking':
                                me.validateAdd(parseInt(me.form.booking.hour), value, type)
                                break
                            case 'cancel':
                                me.validateAdd(parseInt(me.form.cancel.hour), value, type)
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'booking':
                                me.validateAdd(parseInt(me.form.booking.mins), value, type)
                                break
                            case 'cancel':
                                me.validateAdd(parseInt(me.form.cancel.mins), value, type)
                                break
                        }
                        break
                }
            },
            subtractCount (value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'booking':
                                me.validateSubtract(parseInt(me.form.booking.hour), value, type)
                                break
                            case 'cancel':
                                me.validateSubtract(parseInt(me.form.cancel.hour), value, type)
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'booking':
                                me.validateSubtract(parseInt(me.form.booking.mins), value, type)
                                break
                            case 'cancel':
                                me.validateSubtract(parseInt(me.form.cancel.mins), value, type)
                                break
                        }
                        break
                }
            },
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loader(true)
                me.$axios.get('api/booking-restrictions/2').then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.form.booking.hour = res.data.booking_restriction.allowed_time_booking.split('+')[1].split(':')[0]
                            me.form.booking.mins = res.data.booking_restriction.allowed_time_booking.split('+')[1].split(':')[1]

                            me.form.cancel.hour = res.data.booking_restriction.allowed_time_cancel.split('+')[1].split(':')[0]
                            me.form.cancel.mins = res.data.booking_restriction.allowed_time_cancel.split('+')[1].split(':')[1]

                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
        }
    }
</script>
