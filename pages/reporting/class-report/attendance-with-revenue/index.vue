<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance with Revenue</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Revenue for each class schedule</h2>
                        </div>
                        <div class="actions">
                            
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="0" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id">
                                    <option value="0" selected>All Class Types</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_package_id">Class Package</label>
                                <select class="default_select alternate" name="class_package_id">
                                    <option value="0" selected>All Class Packages</option>
                                    <option :value="classPackage.id" v-for="(classPackage, key) in classPackages" :key="key">{{ classPackage.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="instructor_id">Instructor</label>
                                <select class="default_select alternate" name="instructor_id">
                                    <option value="0" selected>All Instructors</option>
                                    <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="customer_type_id">Customer Type</label>
                                <select class="default_select alternate" name="customer_type_id">
                                    <option value="0" selected>All Customer Type</option>
                                    <option :value="type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ errors.first('start_date') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Class Type</th>
                                <th>Instructor</th>
                                <th>Total Riders</th>
                                <th>Total Revenue</th>
                                <th>Total Discount</th>
                                <th>Total Net Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res" v-if="res.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ $moment(data.date).format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment(data.schedule.start_time).format('h:mm A') }}</td>
                                <td>{{ (data.schedule.set_custom_name) ? data.schedule.custom_name : data.schedule.class_type.name }}</td>
                                <td>{{ data.schedule.instructor_schedules[0].user.first_name }} {{ data.schedule.instructor_schedules[0].user.last_name }}</td>
                                <td>{{ data.bookings.length }}</td>
                                <td>Php {{ totalCount(data.total_revenue) }}</td>
                                <td>0</td>
                                <td>Php {{ totalCount(data.total_net_revenue) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Spot</th>
                                                    <th>Customer</th>
                                                    <th>Status</th>
                                                    <th>Package Used</th>
                                                    <th>Revenue</th>
                                                    <th>Discount</th>
                                                    <th>Net Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.bookings.length > 0">
                                                <tr v-for="(booking, key) in data.bookings" :key="key">
                                                    <td>{{ booking.seat.number }}</td>
                                                    <td>{{ booking.user.first_name }} {{ booking.user.last_name }}</td>
                                                    <td>{{ replacer(booking.status).charAt(0).toUpperCase()}}{{ replacer(booking.status).slice(1) }}</td>
                                                    <td>{{ booking.user_package_count.class_package.name }}</td>
                                                    <td>Php {{ totalCount(booking.revenue) }}</td>
                                                    <td>Php 0</td>
                                                    <td>Php {{ totalCount(booking.net_revenue) }}</td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td :colspan="rowCount">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../.././../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                form: {
                    studio_id: 0,
                    instructor_id: 0,
                    class_type_id: 0,
                    class_package_id: 0,
                    customer_type_id: 0,
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment('2020-10-01').format('YYYY-MM-DD')
                },
                isUser: 0,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0,
                studios: [],
                types: [],
                classTypes: [],
                classPackages: [],
                instructors: [],
                name: 'Attendance with Revenue',
                access: true,
                loaded: false,
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.fetchData()
            },
            /**
             * Custom toggler for accordion
             * @param  {[object]} event
             * @param  {[int]} key
             * @return {[css]}
             */
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res[key].open ^= true
                if (me.res[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            fetchData () {
                const me = this
                me.loader(true)
                let studio_id = me.$cookies.get('CSID')
                me.form.studio_id = studio_id

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)
                formData.append('instructor_id', me.form.instructor_id)
                formData.append('class_type_id', me.form.class_type_id)
                formData.append('class_package_id', me.form.class_package_id)
                formData.append('customer_type_id', me.form.customer_type_id)
                me.$axios.post(`api/reporting/classes/attendance-with-revenue`, formData).then(res => {
                    setTimeout( () => {
                        let temp_bookings = []
                        res.data.scheduled_dates.forEach((schedule_date, pindex) => {
                            schedule_date.bookings.forEach((booking, cindex) => {
                                if (booking.user_package_count !== null) {
                                    res.data.scheduled_dates[pindex].bookings.splice(0, cindex)
                                }
                            })
                        })
                        me.res = res.data.scheduled_dates
                        me.fetchExtraAPI()
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                    }, 500)
                })
            },
            fetchExtraAPI () {
                const me = this
                me.$axios.get('api/studios?enabled=1').then(res => {
                    me.studios = res.data.studios
                })
                me.$axios.get(`api/instructors?enabled=1`).then(res => {
                    me.instructors = res.data.instructors.data
                })
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.types = res.data.customerTypes
                })
                me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
                    me.classTypes = res.data.classTypes
                })
                me.$axios.get(`api/packages/class-packages?enabled=1&get=1`).then(res => {
                    me.classPackages = res.data.classPackages
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
