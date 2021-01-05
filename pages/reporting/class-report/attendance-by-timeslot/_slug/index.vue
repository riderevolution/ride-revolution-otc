<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/class-report/attendance-by-timeslot" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Attendance By Timeslot</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance by Timeslot {{ $route.params.slug }}</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getClasses()" v-if="res">
                                Export
                            </div>
                            <download-csv
                                class="hidden me"
                                :data="attendanceByTimeslotAttributes"
                                :name="`attendance-by-timeslot-${$route.params.slug}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent>
                            <input type="hidden" name="start_date" v-model="form.start_date">
                            <input type="hidden" name="end_date" v-model="form.end_date">
                            <input type="hidden" name="type" v-model="form.type">
                            <input type="hidden" name="class_type_id" v-model="form.class_type_id">
                            <input type="hidden" name="instructor_id" v-model="form.instructor_id">
                            <input type="hidden" name="studio_id" v-model="form.studio_id">
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Spot</th>
                                <th class="stick">Date</th>
                                <th class="stick">Time</th>
                                <th class="stick">Customer</th>
                                <th class="stick">Status</th>
                                <th class="stick">Package Used</th>
                                <th class="stick">Gross Revenue</th>
                                <th class="stick">Discount</th>
                                <th class="stick">Net Revenue</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.bookings.data.length > 0">
                            <tr v-for="(data, key) in res.bookings.data" :key="key">
                                <td>{{ (data.seat.position != 'Online') ? data.seat.number : '-' }}</td>
                                <td>{{ $moment(data.scheduled_date.date).format('MMMM DD, YYYY') }}</td>
                                <td>{{ data.scheduled_date.schedule.start_time }}</td>
                                <td>{{ getCustomerInfo(data, 'name') }}</td>
                                <td>{{ replacer(data.status).charAt(0).toUpperCase()}}{{ replacer(data.status).slice(1) }}</td>
                                <td>{{ data.class_package.name }}</td>
                                <td>Php {{ computeRevenue(data, 'revenue') }}</td>
                                <td>Php {{ computeRevenue(data, 'discount') }}</td>
                                <td>Php {{ computeRevenue(data, 'net') }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.bookings.path" :current="res.bookings.current_page" :last="res.bookings.last_page" />
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '~/components/Foot'
    import Pagination from '~/components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Attendance by Timeslot',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                studios: [],
                instructors: [],
                studio: [],
                classTypes: [],
                form: {
                    type: 'weekdays',
                    instructor_id: '',
                    studio_id: '',
                    class_type_id: '',
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            attendanceByTimeslotAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Transaction Date': me.$moment(value.user_package_count.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value.user_package_count),
                        'Promo Code': (value.user_package_count.payment.promo_code_used != null) ? value.user_package_count.payment.promo_code_used : 'N/A',
                        'Payment Method': value.user_package_count.payment_item.payment_method.method,
                        'Studio': me.studio.name,
                        'Package Used': (value.user_package_count) ? value.user_package_count.class_package.name : 'N/A',
                        'Booking Status': value.status,
                        'Reservation Timestamp': me.$moment(value.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Status Timestamp': me.$moment(value.updated_at).format('MMM DD, YYYY hh:mm A'),
                        'Schedule Name': (value.scheduled_date.schedule.custom_name != null) ? value.scheduled_date.schedule.custom_name : value.scheduled_date.schedule.class_type.name,
                        'Schedule Date': me.$moment(value.scheduled_date.schedule.date).format('MMMM DD, YYYY'),
                        'Start Time': value.scheduled_date.schedule.start_time,
                        'Instructor': me.getInstructorsInSchedule(value.scheduled_date, 1),
                        'Full Name': `${value.user.first_name} ${value.user.last_name}`,
                        'Customer Type': value.customer_type,
                        'Email Address': value.user.email,
                        'Gross Revenue': me.computeRevenue(value, 'gross'),
                        'Discount': me.computeRevenue(value, 'discount'),
                        'Net Revenue': me.computeRevenue(value, 'net'),
                        'Comp Reason': (value.user_package_count.payment_item.payment_method.comp_reason) ? value.user_package_count.payment_item.payment_method.comp_reason : 'N/A',
                        'Note': (value.user_package_count.payment_item.payment_method.note) ? value.user_package_count.payment_item.payment_method.note : 'N/A',
                        'Remarks': (value.user_package_count.payment_item.payment_method.remarks) ? value.user_package_count.payment_item.payment_method.remarks : 'N/A',
                        'Username': (value.employee) ? value.employee.fullname : 'Customer'
                    }))
                ]
            }
        },
        methods: {
            computeRevenue (data, type) {
                const me = this
                let result = ''
                let base_value = 0
                if (data.status != 'cancelled') {
                    if (data.user_package_count.payment_item.payment_method.method != 'comp') {
                        switch (type) {
                            case 'net':
                                base_value = me.totalCount(data.net_revenue)
                                break
                            case 'revenue':
                                base_value = me.totalCount(data.gross_revenue)
                                break
                            case 'discount':
                                base_value = me.totalCount(data.discount)
                                break
                        }
                        result = me.totalCount(base_value * parseInt(data.scheduled_date.schedule.class_credits))
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
            getCustomerInfo (data, type) {
                const me = this
                let result = ''
                switch (type) {
                    case 'name':
                        if (data.user != null) {
                            result = data.user.fullname
                        } else {
                            result = `${data.guest_first_name} ${data.guest_last_name}`
                        }
                        break
                }

                return result
            },
            getClasses () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []
                me.loader(true)
                me.$axios.post(`api/reporting/classes/attendance-with-revenue?for_export=1`, formData).then(res => {
                    if (res.data) {
                        me.values = res.data.export_data
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            fetchData (type) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                if (me.$route.query.class_type_id) {
                    me.form.class_type_id = me.$route.query.class_type_id
                    formData.append('class_type_id', me.$route.query.class_type_id)
                }
                if (me.$route.query.instructor_id) {
                    me.form.instructor_id = me.$route.query.instructor_id
                    formData.append('instructor_id', me.$route.query.instructor_id)
                }
                if (me.$route.query.type) {
                    me.form.type = me.$route.query.type
                    formData.append('type', me.$route.query.type)
                }
                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                    formData.append('start_date', me.$route.query.start_date)
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                    formData.append('end_date', me.$route.query.end_date)
                }

                me.$axios.post(`api/reporting/classes/attendance-by-timeslot/${me.$route.params.slug}`, formData).then(res => {
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
            }, 500)
        }
    }
</script>
