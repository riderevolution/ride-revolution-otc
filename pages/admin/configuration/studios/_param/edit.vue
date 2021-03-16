<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Update {{ res.name }}</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()">
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
                                        <input type="text" name="name" autocomplete="off" class="default_text" placeholder="Enter studio name" v-validate="'required|max:100'" v-model="res.name">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ properFormat(errors.first('name')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="color_code">Color Code <span>*</span></label>
                                        <input type="text" name="color_code" autocomplete="off" class="default_text" v-validate="'required|max:7'" placeholder="#000000" v-model="res.color_code">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('color_code')">{{ properFormat(errors.first('color_code')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group">
                                    <label for="capacity">Capacity <span>*</span></label>
                                    <input type="text" name="capacity" autocomplete="off" class="default_text" v-validate="'required'" v-model="res.capacity">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('capacity')">{{ properFormat(errors.first('capacity')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="address">Address <span>*</span></label>
                                    <input type="text" name="address" autocomplete="off" placeholder="Enter address" class="default_text" v-validate="'required'" v-model="res.address">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('address')">{{ properFormat(errors.first('address')) }}</span></transition>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="city">City<span>*</span></label>
                                        <input type="text" name="city" autocomplete="off" placeholder="Enter city" class="default_text" v-validate="'required|max:50'" v-model="res.city">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('city')">{{ properFormat(errors.first('city')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="state">State</label>
                                        <input type="text" name="state" autocomplete="off" placeholder="Enter state" class="default_text" v-validate="'required|max:50'" v-model="res.state">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('state')">{{ properFormat(errors.first('state')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="country">Country<span>*</span></label>
                                        <input type="text" name="country" autocomplete="off" placeholder="Enter country" class="default_text" v-validate="'required|max:50'" v-model="res.country">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('country')">{{ properFormat(errors.first('country')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="phone">Phone</label>
                                        <input type="text" name="phone" autocomplete="off" placeholder="Enter phone number" class="default_text" v-validate="{regex: '^[0-9\-_ ]*$', min: 7, max: 11}" v-model="res.phone">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('phone')">{{ properFormat(errors.first('phone')) }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Class Schedule</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="publish_day">Publish Day <span>*</span></label>
                                        <select class="default_select alternate" v-validate="{ required: true }" name="publish_day" v-model="form.publish_day">
                                            <option value="" selected disabled>Choose a day</option>
                                            <option :value="data" v-for="(data, key) in days" :key="key">{{ data }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('publish_day')">{{ properFormat(errors.first('publish_day')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="publish_time">Publish Time <span>*</span></label>
                                        <v-ctk v-model="form.publish_time" :only-time="true" :format="'hh:mm'" :formatted="'hh:mm'" :no-label="true" :color="'#33b09d'" id="publish_time" name="publish_time" :label="'Select start time'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('publish_time')">{{ properFormat(errors.first('publish_time')) }}</span></transition>
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
                                        <label for="total_attendance">Total Attendance <span>*</span></label>
                                        <input type="text" name="total_attendance" placeholder="Enter total attendance" v-model="res.target_total_attendance" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('total_attendance')">{{ properFormat(errors.first('total_attendance')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="package_sales">Package Sales <span>*</span></label>
                                        <input type="text" name="package_sales" placeholder="Enter package sales" v-model="res.target_package_sales" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('package_sales')">{{ properFormat(errors.first('package_sales')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="first_time_riders">First Time Riders <span>*</span></label>
                                        <input type="text" name="first_time_riders" placeholder="Enter first time riders" autocomplete="off" v-model="res.target_first_time_riders" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('first_time_riders')">{{ properFormat(errors.first('first_time_riders')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="returning_riders">Returning Riders <span>*</span></label>
                                        <input type="text" name="returning_riders" placeholder="Enter returning riders" v-model="res.target_returning_riders" autocomplete="off" class="default_text" v-validate="'required|numeric|min:1|max:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('returning_riders')">{{ properFormat(errors.first('returning_riders')) }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" :checked="res.enabled == 1">
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
    import Foot from '~/components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Configuration',
                access: true,
                loaded: false,
                onlineClass: false,
                res: [],
                lastRoute: '',
                prevRoute: '',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                form: {
                    publish_day: '',
                    publish_time: ''
                }
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('schedule_publish_day', me.form.publish_day)
                        formData.append('schedule_publish_time', me.form.publish_time)

                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/studios/${me.$route.params.param}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                me.notify('Content has been Updated')
                                me.$router.push(`/admin/${me.prevRoute}/${me.lastRoute}`)
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
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
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.$axios.get(`api/studios/${me.$route.params.param}`).then(res => {
                    me.res = res.data.studio
                    me.form.publish_day = me.res.schedule_publish_day
                    me.form.publish_time = me.res.schedule_publish_time
                    me.onlineClass = (me.res.online_class == 1) ? true : false
                    me.loaded = true
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
