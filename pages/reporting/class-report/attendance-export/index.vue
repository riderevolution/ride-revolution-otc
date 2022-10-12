<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance Export</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <download-csv
                            class="hidden me"
                            :data="attendanceExportAttributes"
                            :name="`attendance-export-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                            Export
                        </download-csv>
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
                                <label for="instructor_id">Instructor</label>
                                <select class="default_select alternate" name="instructor_id" v-model="form.instructor_id">
                                    <option value="" selected>All Instructors</option>
                                    <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :max-date="$moment().format('YYYY-MM-DD')" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :max-date="$moment().format('YYYY-MM-DD')" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Export</button>
                        </form>
                    </div>
                </section>
                <section id="content">
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
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Attendance Export',
                access: true,
                loaded: false,
                values: [],
                studios: [],
                instructors: [],
                studio: [],
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: '',
                    instructor_id: ''
                }
            }
        },
        computed: {
            attendanceExportAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Transaction Date': (value.user_package_count && value.user_package_count.payment) ? me.$moment(value.user_package_count.payment.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A',
                        'Reference Number': me.getPaymentCode(value.user_package_count),
                        'Promo Code': ((value.user_package_count && value.user_package_count.payment) && value.user_package_count.payment.promo_code_used != null) ? value.user_package_count.payment.promo_code_used : 'N/A',
                        'Payment Method': (value.user_package_count && value.user_package_count.payment_item) ? value.user_package_count.payment_item.payment_method.method : 'N/A',
                        'Studio': value.scheduled_date.schedule.studio.name,
                        'Package Used': (value.user_package_count) ? value.user_package_count.class_package.name : 'N/A',
                        'Booking Status': value.status,
                        'Reservation Timestamp': me.$moment(value.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Status Timestamp': me.$moment(value.updated_at).format('MMM DD, YYYY hh:mm A'),
                        'Schedule Name': (value.scheduled_date.schedule != null) ? value.scheduled_date.schedule.custom_name : value.scheduled_date.schedule.class_type.name,
                        'Schedule Date': me.$moment(value.scheduled_date.date).format('MMMM DD, YYYY'),
                        'Start Time': value.scheduled_date.schedule.start_time,
                        'Main Instructor': me.getInstructorsInSchedule(value.scheduled_date, 'main'),
                        'Primary Instructor': me.getInstructorsInSchedule(value.scheduled_date, 'primary'),
                        'Substitute Instructor': me.getInstructorsInSchedule(value.scheduled_date, 'substitute'),
                        'Additional Instructor': me.getInstructorsInSchedule(value.scheduled_date, 'additional'),
                        'Full Name': (value.user) ? `${value.user.first_name} ${value.user.last_name}` : `${value.guest_first_name} ${value.guest_last_name}`,
                        'Customer Type': value.customer_type,
                        'Email Address': (value.user) ? value.user.email : value.guest_email,
                        'Gross Revenue': me.computeRevenue(value, 'gross'),
                        'Discount': me.computeRevenue(value, 'discount'),
                        'Net Revenue': me.computeRevenue(value, 'net'),
                        'Comp Reason': ((value.user_package_count && value.user_package_count.payment_item) && value.user_package_count.payment_item.payment_method.comp_reason) ? value.user_package_count.payment_item.payment_method.comp_reason : 'N/A',
                        'Note': ((value.user_package_count && value.user_package_count.payment_item) && value.user_package_count.payment_item.payment_method.note) ? value.user_package_count.payment_item.payment_method.note : 'N/A',
                        'Remarks': ((value.user_package_count && value.user_package_count.payment_item) && value.user_package_count.payment_item.payment_method.remarks) ? value.user_package_count.payment_item.payment_method.remarks : 'N/A',
                        'Last Action Taken By': (value.employee) ? value.employee.fullname : 'Customer'
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
                                base_value = me.totalCount(data.revenue)
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

                if (data && data.payment && data.payment_item) {
                    switch (data.payment_item.payment_method.method) {
                        case 'paypal':
                            if (data.payment_item.payment_method.paypal_transaction_id) {
                                result = data.payment_item.payment_method.paypal_transaction_id
                            } else {
                                result = data.payment.payment_code
                            }
                            break
                        case 'paymaya':
                            result = data.payment_item.payment_method.paymaya_transaction_id
                            break
                        case 'paymongo':
                            result = data.payment_item.payment_method.paymongo_source_id
                            break
                        case 'gcash':
                            result = data.payment_item.payment_method.gcash_reference_number
                            break
                        case 'gc_code':
                            result = `${data.payment.payment_code} - ${data.payment_item.payment_method.gc_code}`
                            break
                        default:
                            result = data.payment.payment_code
                            break
                    }
                } else {
                    result = 'N/A'
                }

                return result
            },
            getInstructorsInSchedule (data, type) {
                let result = ''

                switch (type) {
                    case 'main':
                        result = data.schedule.instructor_schedules[0].user.fullname
                        break
                    case 'substitute':
                        result = data.schedule.instructor_schedules.filter((item) => {
                            return item.substitute == 1
                        })
                        result = (result.length > 0) ? result[0].user.fullname : 'N/A'
                        break
                    case 'additional':
                        result = data.schedule.instructor_schedules.filter((item, index) => {
                            if (index != 0) {
                                return (!item.substitute && !item.primary)
                            }
                        })
                        result = (result.length > 0) ? result[0].user.fullname : 'N/A'
                        break
                    case 'primary':
                        result = data.schedule.instructor_schedules.filter((item) => {
                            return item.primary == 1
                        })
                        result = (result.length > 0) ? result[0].user.fullname : 'N/A'
                        break
                }

                return result
            },
            submissionSuccess () {
                const me = this
                me.loader(true)

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)

                me.values = []

                me.$axios.post('api/exports/class-report/attendance-export', formData).then(res => {
                    setTimeout( () => {
                        me.values = res.data.bookings
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        document.querySelector('.me').click()
                    }, 500)
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
                me.$axios.get(`api/instructors?enabled=1&all=1`).then(res => {
                    me.instructors = res.data.instructors
                })

                setTimeout( () => {
                    me.loaded = true
                }, 500)
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchExtraAPI()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
