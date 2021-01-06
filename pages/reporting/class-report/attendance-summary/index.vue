<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance Summary</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of rider count and revenue per class schedule</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class/attendance-summary?studio_id=${form.studio_id}&class_package_id=${form.class_package_id}&customer_type_id=${form.customer_type_id}&instructor_id=${form.instructor_id}&class_type_id=${form.class_type_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getClasses()" v-if="res.schedules.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.schedules.data.length > 0"
                                class="hidden me"
                                :data="attendanceSummaryAttributes"
                                :name="`attendance-summary-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id" v-model="form.class_type_id">
                                    <option value="" selected>All Class Types</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_package_id">Class Package</label>
                                <select class="default_select alternate" name="class_package_id" v-model="form.class_package_id">
                                    <option value="" selected>All Class Packages</option>
                                    <option :value="classPackage.id" v-for="(classPackage, key) in classPackages" :key="key">{{ classPackage.name }}</option>
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
                                <label for="customer_type_id">Customer Type</label>
                                <select class="default_select alternate" name="customer_type_id" v-model="form.customer_type_id">
                                    <option value="" selected>All Customer Type</option>
                                    <option :value="type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'" :max-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :max-date="$moment().format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th class="stick">Date</th>
                                <th class="stick">Total Riders</th>
                                <th class="stick">Paying Riders</th>
                                <th class="stick">Comped Riders</th>
                                <th class="stick">First Timers</th>
                                <th class="stick">No Shows</th>
                                <th class="stick">Cancel</th>
                                <th class="stick">Waitlist</th>
                                <th class="stick">Repeat</th>
                                <th class="stick">Avg Riders</th>
                                <th class="stick">Number Classes</th>
                                <th class="stick">Avg Spots</th>
                                <th class="stick">Capacity</th>
                                <th class="stick">Paying</th>
                                <th class="stick">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.schedules.data" v-if="res.schedules.data.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ $moment(data.date, 'YYYY-MM-DD').format('MMM DD, YYYY') }}</td>
                                <td>{{ countValues(data, 'total_riders') }}</td>
                                <td>{{ countValues(data, 'paying_riders') }}</td>
                                <td>{{ countValues(data, 'comped_riders') }}</td>
                                <td>{{ countValues(data, 'first_timers') }}</td>
                                <td>{{ countValues(data, 'no_shows') }}</td>
                                <td>{{ countValues(data, 'cancel') }}</td>
                                <td>{{ countValues(data, 'waitlist') }}</td>
                                <td>{{ countValues(data, 'total_riders') - (countValues(data, 'first_timers') + countValues(data, 'no_shows')) }}</td>
                                <td>{{ totalPercentage('average', data) }}</td>
                                <td>{{ totalItems(data.number_of_classes) }}</td>
                                <td>{{ (studio.online_class) ? 'N/A' : studio.capacity }}</td>
                                <td>{{ totalPercentage('capacity', data) }}</td>
                                <td>{{ totalPercentage('paying', data) }}</td>
                                <td>Php {{ totalCount(countValues(data, 'revenue')) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="15">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Start Time</th>
                                                    <th>Total Riders</th>
                                                    <th>Paying Riders</th>
                                                    <th>Comped Riders</th>
                                                    <th>First Timers</th>
                                                    <th>No Show</th>
                                                    <th>Cancel</th>
                                                    <th>Waitlist</th>
                                                    <th>Repeat</th>
                                                    <th>Avg Riders</th>
                                                    <th>Number Of Classes</th>
                                                    <th>Avg Spots</th>
                                                    <th>Capacity</th>
                                                    <th>Paying</th>
                                                    <th>Total Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.classes.length > 0">
                                                <tr v-for="(item, key) in data.classes" :key="key">
                                                    <td>{{ item.start_time }}</td>
                                                    <td>{{ countValues(item, 'total_riders') }}</td>
                                                    <td>{{ countValues(item, 'paying_riders') }}</td>
                                                    <td>{{ countValues(item, 'comped_riders') }}</td>
                                                    <td>{{ countValues(item, 'first_timers') }}</td>
                                                    <td>{{ countValues(item, 'no_shows') }}</td>
                                                    <td>{{ countValues(item, 'cancel') }}</td>
                                                    <td>{{ countValues(item, 'waitlist') }}</td>
                                                    <td>{{ countValues(item, 'total_riders') - (countValues(item, 'first_timers') + countValues(item, 'no_shows')) }}</td>
                                                    <td>{{ totalPercentage('average', item) }}</td>
                                                    <td>{{ item.number_of_classes }}</td>
                                                    <td>{{ (studio.online_class) ? 'N/A' : studio.capacity }}</td>
                                                    <td>{{ totalPercentage('capacity', item) }}</td>
                                                    <td>{{ totalPercentage('paying', item) }}</td>
                                                    <td>Php {{ totalCount(countValues(item, 'revenue')) }}</td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td colspan="15">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-if="res.schedules.data.length == 0">
                            <tr>
                                <td colspan="15">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.schedules.path" :current="res.schedules.current_page" :last="res.schedules.last_page" />
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
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                form: {
                    studio_id: '',
                    instructor_id: '',
                    class_type_id: '',
                    class_package_id: '',
                    customer_type_id: '',
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Attendance Summary',
                access: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                studios: [],
                studio: [],
                types: [],
                classTypes: [],
                classPackages: [],
                instructors: [],
            }
        },
        computed: {
            attendanceSummaryAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Transaction Date': me.$moment(value.booking.user_package_count.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value.booking.user_package_count),
                        'Promo Code': (value.booking.user_package_count.payment.promo_code_used != null) ? value.booking.user_package_count.payment.promo_code_used : 'N/A',
                        'Payment Method': value.booking.user_package_count.payment_item.payment_method.method,
                        'Studio': me.studio.name,
                        'Package Used': (value.booking.user_package_count) ? value.booking.user_package_count.class_package.name : 'N/A',
                        'Booking Status': value.booking.status,
                        'Reservation Timestamp': me.$moment(value.booking.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Status Timestamp': me.$moment(value.booking.updated_at).format('MMM DD, YYYY hh:mm A'),
                        'Schedule Name': (value.schedule_date.schedule.custom_name != null) ? value.schedule_date.schedule.custom_name : value.schedule_date.schedule.class_type.name,
                        'Schedule Date': me.$moment(value.booking.scheduled_date.date).format('MMMM DD, YYYY'),
                        'Start Time': value.schedule_date.schedule.start_time,
                        'Instructor': me.getInstructorsInSchedule(value.schedule_date, 1),
                        'Full Name': `${value.booking.user.first_name} ${value.booking.user.last_name}`,
                        'Customer Type': value.booking.customer_type,
                        'Email Address': value.booking.user.email,
                        'Gross Revenue': me.computeRevenue(value, 'gross'),
                        'Discount': me.computeRevenue(value, 'discount'),
                        'Net Revenue': me.computeRevenue(value, 'net'),
                        'Comp Reason': (value.booking.user_package_count.payment_item.payment_method.comp_reason) ? value.booking.user_package_count.payment_item.payment_method.comp_reason : 'N/A',
                        'Note': (value.booking.user_package_count.payment_item.payment_method.note) ? value.booking.user_package_count.payment_item.payment_method.note : 'N/A',
                        'Remarks': (value.booking.user_package_count.payment_item.payment_method.remarks) ? value.booking.user_package_count.payment_item.payment_method.remarks : 'N/A',
                        'Username': (value.booking.employee) ? value.booking.employee.fullname : 'Customer'
                    }))
                ]
            }
        },
        methods: {
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
            computeRevenue (data, type) {
                const me = this
                let result = ''
                let base_value = 0
                if (data.booking.status != 'cancelled') {
                    if (data.booking.user_package_count.payment_item.payment_method.method != 'comp') {
                        switch (type) {
                            case 'gross':
                                base_value = me.totalCount(data.booking.gross_revenue)
                                break
                            case 'net':
                                base_value = me.totalCount(data.booking.net_revenue)
                                break
                            case 'discount':
                                base_value = me.totalCount(data.booking.discount)
                                break
                        }
                        result = me.totalCount(base_value * parseInt(data.schedule_date.schedule.class_credits))
                    } else {
                        result = 0
                    }
                } else {
                    result = 0
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
                            result = `<b>${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                        }
                    } else {
                        if (export_status != null) {
                            result = `${instructor.user.fullname}`
                        } else {
                            result = `<b>${instructor.user.fullname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                        }
                    }
                }

                return result
            },
            countValues (data, type) {
                const me = this
                let result = 0

                switch (type) {
                    case 'total_riders':
                        result += data.total_riders
                        break
                    case 'paying_riders':
                        result += data.paying_riders
                        break
                    case 'comped_riders':
                        result += data.comped_riders
                        break
                    case 'first_timers':
                        result += data.first_timers
                        break
                    case 'no_shows':
                        result += data.no_shows
                        break
                    case 'cancel':
                        result += data.cancel
                        break
                    case 'waitlist':
                        result += data.waitlist
                        break
                    case 'repeats':
                        result += data.repeats
                        break
                    case 'revenue':
                        result += data.revenue
                        break
                }
                return result
            },
            getClasses () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []
                me.loader(true)
                me.$axios.post(`api/reporting/classes/attendance-summary-export`, formData).then(res => {
                    if (res.data) {
                        me.values = res.data.bookings
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            totalPercentage (type, data) {
                const me = this
                let percent = 0
                let total_riders = 0
                let avg_riders = 0
                let paying_riders = 0
                let comped_riders = 0
                let no_shows = 0
                let to_less = 0

                switch (type) {
                    case 'capacity':
                        if (data.temp_avg_riders != 0) {
                            if (me.studio.online_class) {
                                total_riders += data.total_riders
                                avg_riders += data.temp_avg_riders
                            } else {
                                avg_riders += data.temp_avg_riders
                            }
                        }
                        break
                    case 'paying':
                        if (data.paying_riders != 0) {
                            paying_riders += data.paying_riders
                            comped_riders += data.comped_riders
                        }
                        break
                    case 'average':
                        if (data.temp_avg_riders != 0) {
                            avg_riders += data.temp_avg_riders
                            no_shows += data.no_shows
                            comped_riders += data.comped_riders
                        }
                        break
                }
                switch (type) {
                    case 'capacity':
                        if (avg_riders != 0) {
                            if (me.studio.online_class) {
                                percent = me.totalItems(`${(avg_riders / total_riders) * 100}`)
                            } else {
                                percent = me.totalItems(`${(avg_riders / me.studio.capacity) * 100}`)
                            }
                        }
                        break
                    case 'paying':
                        percent = me.totalItems(`${(paying_riders / data.total_riders) * 100}`)
                        break
                    case 'average':
                        to_less = no_shows + comped_riders
                        percent = me.totalItems(avg_riders / data.number_of_classes)
                        break
                }

                return (type == 'average') ? percent : `${(percent == 'infinity') ? 100 : percent}%`
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.filter = true

                me.$axios.post(`api/reporting/classes/attendance-summary`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
                            me.studio = res.data.studio
                        })
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                    }, 500)
                })
            },
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.schedules.data[key].open ^= true
                if (me.res.schedules.data[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            fetchData () {
                const me = this
                let formData = new FormData()
                let studio_id = me.$cookies.get('CSID')

                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', studio_id)

                me.$axios.post(`api/reporting/classes/attendance-summary`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
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
                me.fetchExtraAPI()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        },
        beforeMount () {
            const me = this
            me.loader(true)
        }
    }
</script>
