<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Add a New Studio</h1>
                </div>
            </section>
            <section id="content">
                <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Studio Details</h2>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="name">Studio Name <span>*</span></label>
                                    <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required|max:100'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="color_code">Color Code <span>*</span></label>
                                    <input type="text" name="color_code" autocomplete="off" class="default_text" v-validate="'required|max:7'" placeholder="#000000">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('color_code')">{{ errors.first('color_code') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_group">
                                <label for="address_line_1">Address Line 1 <span>*</span></label>
                                <input type="text" name="address_line_1" autocomplete="off" class="default_text" v-validate="'required'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('address_line_1')">{{ errors.first('address_line_1') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="address_line_2">Address Line 2</label>
                                <input type="text" name="address_line_2" autocomplete="off" class="default_text">
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="city">City <span>*</span></label>
                                    <input type="text" name="city" autocomplete="off" class="default_text" v-validate="'required|max:50'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('city')">{{ errors.first('city') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="state">State</label>
                                    <input type="text" name="state" autocomplete="off" class="default_text" v-validate="'required|max:50'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('state')">{{ errors.first('state') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="country">Country <span>*</span></label>
                                    <input type="text" name="country" autocomplete="off" class="default_text" v-validate="'required|max:50'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('country')">{{ errors.first('country') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="phone">Phone <span>*</span></label>
                                    <input type="text" name="phone" autocomplete="off" class="default_text" v-validate="'required|numeric|min:7|max:15'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('phone')">{{ errors.first('phone') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_group">
                                <label for="purchase_email">Purchase Email <span>*</span></label>
                                <input type="email" name="purchase_email" autocomplete="off" class="default_text" v-validate="'required|email|max:100'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('purchase_email')">{{ errors.first('purchase_email') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="reservations_email">Reservations Email <span>*</span></label>
                                <input type="email" name="reservations_email" autocomplete="off" class="default_text" v-validate="'required|email|max:100'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('reservations_email')">{{ errors.first('reservations_email') | properFormat }}</span></transition>
                            </div>
                        </div>
                    </div>
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Booking Restrictions</h2>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex">
                                <div class="form_group flex">
                                    <label>Allowed time to book before class starts: <span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="booking_hours" class="default_text number" autocomplete="off" v-model="form.booking.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'">
                                        <div class="placeholder">hours</div>
                                        <div class="up" @click="addCount('booking', 'hour')"></div>
                                        <div class="down" @click="subtractCount('booking', 'hour')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('booking_hours')">{{ errors.first('booking_hours') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <input type="text" name="booking_minutes" class="default_text number" autocomplete="off" v-model="form.booking.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                        <div class="placeholder">mins.</div>
                                        <div class="up" @click="addCount('booking', 'mins')"></div>
                                        <div class="down" @click="subtractCount('booking', 'mins')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('booking_minutes')">{{ errors.first('booking_minutes') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group flex">
                                    <label>Allowed time to cancel before class starts: <span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="cancel_hours" class="default_text number" autocomplete="off" v-model="form.cancel.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'">
                                        <div class="placeholder">hours</div>
                                        <div class="up" @click="addCount('cancel', 'hour')"></div>
                                        <div class="down" @click="subtractCount('cancel', 'hour')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('cancel_hours')">{{ errors.first('cancel_hours') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <input type="text" name="cancel_minutes" class="default_text number" autocomplete="off" v-model="form.cancel.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                        <div class="placeholder">mins.</div>
                                        <div class="up" @click="addCount('cancel', 'mins')"></div>
                                        <div class="down" @click="subtractCount('cancel', 'mins')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('cancel_minutes')">{{ errors.first('cancel_minutes') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group flex">
                                    <label>Time before customer is marked no show after class starts: <span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="no_show_hours" class="default_text number" autocomplete="off" v-model="form.noShow.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'">
                                        <div class="placeholder">hours</div>
                                        <div class="up" @click="addCount('noShow', 'hour')"></div>
                                        <div class="down" @click="subtractCount('noShow', 'hour')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('no_show_hours')">{{ errors.first('no_show_hours') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <input type="text" name="no_show_minutes" class="default_text number" autocomplete="off" v-model="form.noShow.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                        <div class="placeholder">mins.</div>
                                        <div class="up" @click="addCount('noShow', 'mins')"></div>
                                        <div class="down" @click="subtractCount('noShow', 'mins')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('no_show_minutes')">{{ errors.first('no_show_minutes') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                lastRoute: '',
                prevRoute: '',
                form: {
                    booking: {
                        hour: '-',
                        mins: '-'
                    },
                    cancel: {
                        hour: '-',
                        mins: '-'
                    },
                    noShow: {
                        hour: '-',
                        mins: '-'
                    },
                }
            }
        },
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        let lastValue = ''
                        for (let i = 1; i < newValue.length; i++) {
                            lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
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
                        formData.append('allowed_time_no_show', `${(me.form.noShow.hour * 3600) + (me.form.noShow.mins * 60) + (0 * 1)}+${me.form.noShow.hour}:${me.form.noShow.mins}`)
                        me.loader(true)
                        me.$axios.post('api/studios', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$router.push(`/admin/${me.prevRoute}/${me.lastRoute}`)
                                }
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
                            case 'noShow':
                                data != 0 && (me.form.noShow.hour = 0)
                                data < 24 && (me.form.noShow.hour = (data += 1))
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
                            case 'noShow':
                                data != 0 && (me.form.noShow.mins = 0)
                                data < 60 && (me.form.noShow.mins = (data += 1))
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
                            case 'noShow':
                                data > 0 && (me.form.noShow.hour = (data -= 1))
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
                            case 'noShow':
                                data > 0 && (me.form.noShow.mins = (data -= 1))
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
                            case 'noShow':
                                me.validateAdd(parseInt(me.form.noShow.hour), value, type)
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
                            case 'noShow':
                                me.validateAdd(parseInt(me.form.noShow.mins), value, type)
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
                            case 'noShow':
                                me.validateSubtract(parseInt(me.form.noShow.hour), value, type)
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
                            case 'noShow':
                                me.validateSubtract(parseInt(me.form.noShow.mins), value, type)
                                break
                        }
                        break
                }
            },
        },
        async mounted () {
            const me = this
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
