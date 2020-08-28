<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
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
                                <div class="form_check toggler" @click="onlineClass ^= true">
                                    <input type="hidden" id="online_class" name="online_class" class="action_check" :value="(onlineClass) ? 1 : 0">
                                    <div :class="`toggle ${(onlineClass) ? 'active' : ''}`"></div>
                                    <label for="online_class">Online Class</label>
                                </div>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="name">Studio Name <span>*</span></label>
                                        <input type="text" name="name" placeholder="Enter studio name" autocomplete="off" class="default_text" v-validate="'required|max:100'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="color_code">Color Code <span>*</span></label>
                                        <input type="text" name="color_code" autocomplete="off" class="default_text" v-validate="'required|max:7'" placeholder="#000000">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('color_code')">{{ errors.first('color_code') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group">
                                    <label for="address">Address <span>*</span></label>
                                    <input type="text" name="address" placeholder="Enter address" autocomplete="off" class="default_text" v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('address')">{{ errors.first('address') | properFormat }}</span></transition>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="city">City <span>*</span></label>
                                        <input type="text" name="city" placeholder="Enter city" autocomplete="off" class="default_text" v-validate="'required|max:50'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('city')">{{ errors.first('city') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="state">State</label>
                                        <input type="text" name="state" placeholder="Enter state" autocomplete="off" class="default_text" v-validate="'required|max:50'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('state')">{{ errors.first('state') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="country">Country <span>*</span></label>
                                        <input type="text" name="country" placeholder="Enter country" autocomplete="off" class="default_text" v-validate="'required|max:50'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('country')">{{ errors.first('country') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="phone">Phone</label>
                                        <input type="text" name="phone" placeholder="Enter phone number" autocomplete="off" class="default_text" v-validate="{regex: '^[0-9\-_ ]*$', min: 7, max: 11}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('phone')">{{ errors.first('phone') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Targets</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="total_attendance">Total Attendace <span>*</span></label>
                                        <input type="text" name="total_attendance" placeholder="Enter total attendance" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('total_attendance')">{{ errors.first('total_attendance') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="package_sales">Package Sales <span>*</span></label>
                                        <input type="text" name="package_sales" placeholder="Enter package sales" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('package_sales')">{{ errors.first('package_sales') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="first_time_riders">First Time Riders <span>*</span></label>
                                        <input type="text" name="first_time_riders" placeholder="Enter first time riders" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('first_time_riders')">{{ errors.first('first_time_riders') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="returning_riders">Returning Riders <span>*</span></label>
                                        <input type="text" name="returning_riders" placeholder="Enter returning riders" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('returning_riders')">{{ errors.first('returning_riders') | properFormat }}</span></transition>
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
                onlineClass: false,
                loaded: false,
                backUpHTML: `<div class="form_wrapper"> <div class="form_header_wrapper"> <h2 class="form_title">Booking Restrictions</h2> </div> <div class="form_main_group"> <div class="form_flex"> <div class="form_group flex"> <label>Allowed time to book before class starts: <span>*</span></label> <div class="form_flex_input"> <input type="text" name="booking_hours" class="default_text number" autocomplete="off" v-model="form.booking.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'"> <div class="placeholder">hours</div> <div class="up" @click="addCount('booking', 'hour')"></div> <div class="down" @click="subtractCount('booking', 'hour')"></div> <transition name="slide"><span class="validation_errors" v-if="errors.has('booking_hours')">{{ errors.first('booking_hours') | properFormat }}</span></transition> </div> <div class="form_flex_input"> <input type="text" name="booking_minutes" class="default_text number" autocomplete="off" v-model="form.booking.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'"> <div class="placeholder">mins.</div> <div class="up" @click="addCount('booking', 'mins')"></div> <div class="down" @click="subtractCount('booking', 'mins')"></div> <transition name="slide"><span class="validation_errors" v-if="errors.has('booking_minutes')">{{ errors.first('booking_minutes') | properFormat }}</span></transition> </div> </div> <div class="form_group flex"> <label>Allowed time to cancel before class starts: <span>*</span></label> <div class="form_flex_input"> <input type="text" name="cancel_hours" class="default_text number" autocomplete="off" v-model="form.cancel.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'"> <div class="placeholder">hours</div> <div class="up" @click="addCount('cancel', 'hour')"></div> <div class="down" @click="subtractCount('cancel', 'hour')"></div> <transition name="slide"><span class="validation_errors" v-if="errors.has('cancel_hours')">{{ errors.first('cancel_hours') | properFormat }}</span></transition> </div> <div class="form_flex_input"> <input type="text" name="cancel_minutes" class="default_text number" autocomplete="off" v-model="form.cancel.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'"> <div class="placeholder">mins.</div> <div class="up" @click="addCount('cancel', 'mins')"></div> <div class="down" @click="subtractCount('cancel', 'mins')"></div> <transition name="slide"><span class="validation_errors" v-if="errors.has('cancel_minutes')">{{ errors.first('cancel_minutes') | properFormat }}</span></transition> </div> </div> </div> <div class="form_flex"> <div class="form_group flex"> <label>Time before customer is marked no show after class starts: <span>*</span></label> <div class="form_flex_input"> <input type="text" name="no_show_hours" class="default_text number" autocomplete="off" v-model="form.noShow.hour" maxlength="2" v-validate="'required|numeric|max_value:24|min_value:0'"> <div class="placeholder">hours</div> <div class="up" @click="addCount('noShow', 'hour')"></div> <div class="down" @click="subtractCount('noShow', 'hour')"></div> <transition name="slide"><span class="validation_errors" v-if="errors.has('no_show_hours')">{{ errors.first('no_show_hours') | properFormat }}</span></transition> </div> <div class="form_flex_input"> <input type="text" name="no_show_minutes" class="default_text number" autocomplete="off" v-model="form.noShow.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'"> <div class="placeholder">mins.</div> <div class="up" @click="addCount('noShow', 'mins')"></div> <div class="down" @click="subtractCount('noShow', 'mins')"></div> <transition name="slide"><span class="validation_errors" v-if="errors.has('no_show_minutes')">{{ errors.first('no_show_minutes') | properFormat }}</span></transition> </div> </div> </div> </div> </div>`,
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
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
