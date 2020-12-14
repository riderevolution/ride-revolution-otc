<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance by Timeslot</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Average attendance per time slot.</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getClasses()" v-if="res">
                                Export
                            </div>
                            <download-csv
                                class="hidden me"
                                :data="attendanceByTimeslotAttributes"
                                :name="`attendance-by-timeslot-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="" selected>Choose a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id" v-model="form.class_type_id">
                                    <option value="" selected>All Class Type</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ errors.first('start_date') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tabStatus == 'weekdays') ? 'active' : ''}`" @click="toggleTab('weekdays')">Weekdays</div>
                        <div :class="`status ${(tabStatus == 'weekends') ? 'active' : ''}`" @click="toggleTab('weekends')">Weekends</div>
                    </div>
                    <div class="cms_five_row">
                        <div class="column" v-for="(data, key) in res" :key="key">
                            <div class="column_header">
                                <div class="day">{{ key }}</div>
                                <div class="avg">Avg. {{ computeTotalAvg(data) }}</div>
                            </div>
                            <div class="column_content">
                                <table class="cms_table_alt">
                                    <thead>
                                        <tr>
                                            <th>Time Slots</th>
                                            <th>Avg. Total Riders</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="data.length > 0">
                                        <tr v-for="(timeslot, key) in data" :key="key">
                                            <td class="name none">{{ timeslot.time }}</td>
                                            <td>
                                                {{ timeslot.average }}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tbody class="no_results" v-else>
                                        <tr>
                                            <td colspan="2">No Result(s) Found.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
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
            const values = []
            return {
                name: 'Attendance by Timeslot',
                access: true,
                loaded: false,
                rowCount: 0,
                tabStatus: 'weekdays',
                res: [],
                values: [],
                studios: [],
                studio: [],
                classTypes: [],
                form: {
                    studio_id: '',
                    class_type_id: '',
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            attendanceByTimeslotAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Reference Number': me.getPaymentCode(value.user_package_count),
                        'Promo Code': (value.user_package_count.payment.promo_code_used != null) ? value.user_package_count.payment.promo_code_used : 'N/A',
                        'Payment Method': value.user_package_count.payment_item.payment_method.method,
                        'Studio': me.studio.name,
                        'Package Used': (value.user_package_count) ? value.user_package_count.class_package.name : 'N/A',
                        'Booking ID': value.id,
                        'Booking Status': value.status,
                        'Reservation Timestamp': me.$moment(value.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Status Timestamp': me.$moment(value.updated_at).format('MMM DD, YYYY hh:mm A'),
                        'Employee': (value.employee) ? value.employee.fullname : 'No User',
                        'Schedule Name': (value.schedule.custom_name != null) ? value.schedule.custom_name : value.schedule.class_type.name,
                        'Schedule Date': me.$moment(value.date).format('MMMM DD, YYYY'),
                        'Start Time': value.schedule.start_time,
                        'Instructor': me.getInstructorsInSchedule(value, 1),
                        'Customer ID': value.user.id,
                        'Full Name': value.user.fullname,
                        'Customer Type': value.user.customer_details.customer_type.name,
                        'Email Address': value.user.email,
                        'Revenue': me.computeRevenue(value, value, 'revenue'),
                        'Discount': me.computeRevenue(value, value, 'discount'),
                        'Net Revenue': me.computeRevenue(value, value, 'net')
                    }))
                ]
            }
        },
        methods: {
            getClasses () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []
                me.loader(true)
                me.$axios.post(`api/reporting/classes/attendance-with-revenue?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.scheduled_dates.forEach((item, index) => {
                            item.bookings.forEach((child, index) => {
                                child.schedule = item.schedule
                                child.parent = false
                                me.values.push(child)
                            })
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            computeRevenue (data, booking, type) {
                const me = this
                let result = ''
                let base_value = 0
                if (booking.status != 'cancelled') {
                    if (booking.user_package_count.payment_item.payment_method.method != 'comp') {
                        switch (type) {
                            case 'net':
                                base_value = me.totalCount(booking.net_revenue)
                                break
                            case 'revenue':
                                base_value = me.totalCount(booking.revenue)
                                break
                            case 'discount':
                                base_value = me.totalCount(booking.discount)
                                break
                        }
                        result = me.totalCount(base_value * parseInt(data.schedule.class_credits))
                    } else {
                        result = 0
                    }
                } else {
                    result = 0
                }

                return result
            },
            getPaymentCode (data) {
                const me = this
                let result = ''

                switch (data.payment_item.payment_method.method) {
                    case 'paypal':
                        result = data.payment_item.payment_method.paypal_transaction_id
                        break
                    case 'paymaya':
                        result = data.payment_item.payment_method.paymaya_transaction_id
                        break
                    default:
                        result = data.payment.payment_code
                }

                return result
            },
            getInstructorsInSchedule (data, export_status = null) {
                const me = this
                let result = ''
                if (data != '') {
                    let ins_ctr = 0, instructor = []
                    data.schedule.instructor_schedules.forEach((ins, index) => {
                        if (ins.substitute == 0) {
                            ins_ctr += 1
                        }
                        if (ins.primary == 1) {
                            instructor = ins
                        }
                    })

                    if (ins_ctr == 2) {
                        if (export_status != null) {
                            result = `${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}`
                        } else {
                            result = `${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}`
                        }
                    } else {
                        if (export_status != null) {
                            result = `${instructor.user.fullname}`
                        } else {
                            result = `${instructor.user.fullname}`
                        }
                    }
                }

                return result
            },
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != '') {
                    me.studios.forEach((studio, index) => {
                        if (studio.id == me.form.studio_id) {
                            result = studio.name
                        }
                    })
                } else {
                    result = 'All Studios'
                }
                return result
            },
            getClassType () {
                const me = this
                let result = ''

                if (me.form.class_type_id != '') {
                    me.$axios.get(`api/packages/class-types/${me.form.class_type_id}`).then(res => {
                        result = res.data.classType.name
                    })
                } else {
                    result = 'All Class Type'
                }

                return result
            },
            computeTotalAvg (data) {
                const me = this
                let avg = 0

                if (data.length > 0) {
                    data.forEach((timeslot, key) => {
                        avg += timeslot.average
                    })
                    avg = avg / data.length
                }

                return me.totalItems(avg)
            },
            toggleTab (status) {
                const me = this
                me.tabStatus = status
                me.fetchData(status)
            },
            submitFilter () {
                const me = this
                me.fetchData(me.tabStatus)
            },
            fetchData (type) {
                const me = this
                me.values = []
                me.loader(true)
                let formData = new FormData()
                formData.append('studio_id', me.form.studio_id)
                formData.append('class_type_id', me.form.class_type_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', type)

                me.$axios.post(`api/reporting/classes/attendance-by-timeslot`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            fetchExtraAPI () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let studio_id = me.$cookies.get('CSID')
                me.$axios.get('api/studios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                        me.form.studio_id = studio_id
                        me.$axios.get(`api/studios/${studio_id}`).then(res => {
                            me.studio = res.data.studio
                        })
                    }
                })
                me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
                    me.classTypes = res.data.classTypes
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchExtraAPI()
                me.fetchData('weekdays')
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
