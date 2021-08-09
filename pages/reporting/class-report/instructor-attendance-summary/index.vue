<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Instructor Attendance Summary</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of instructor attendance and revenue per class schedule</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getClasses()" v-if="res.instructors.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.instructors.data.length > 0"
                                class="hidden me"
                                :data="instructorAttendanceSummaryAttributes"
                                :name="`instructor-attendance-summary-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id">
                                    <option value="" selected>All Class Types</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label>Instructors: <span>*</span></label>
                                <div class="form_select_custom" v-click-outside="closeCheckboxes">
                                    <span @click="toggleCheckboxes ^= true">{{ instructor_label }}</span>
                                    <div :class="`form_check_custom ${(toggleCheckboxes) ? 'active' : ''} ${(instructors.length > 6) ? 'scroll' : ''}`">
                                        <div class="check_custom select_all">
                                            <div :class="`custom_action_check ${(checkInstructor) ? 'checked' : ''}`" @click.prevent="toggleSelectAllInstructor($event)">Select All</div>
                                        </div>
                                        <div class="check_custom" v-for="(instructor, key) in instructors" :key="key">
                                            <input type="checkbox" :id="`instructor_${key}`" name="instructor_id" v-model="instructor.checked" class="action_check" @change="checkInstructorValue()">
                                            <label :for="`instructor_${key}`">{{ instructor.first_name }} {{ instructor.last_name }}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
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
                                <th class="stick">Instructor</th>
                                <th class="stick">Total Rides</th>
                                <th class="stick">Paying Riders</th>
                                <th class="stick">Comped Riders</th>
                                <th class="stick">First Timers</th>
                                <th class="stick">No Shows</th>
                                <th class="stick">Repeat</th>
                                <th class="stick">Avg Riders</th>
                                <th class="stick">Number Classes</th>
                                <th class="stick">Avg Spots</th>
                                <th class="stick">Capacity</th>
                                <th class="stick">Paying</th>
                                <th class="stick">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.instructors.data" v-if="res.instructors.data.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.first_name }} {{ data.last_name }}</td>
                                <td>{{ data.total_riders }}</td>
                                <td>{{ data.paying_riders }}</td>
                                <td>{{ data.comped_riders }}</td>
                                <td>{{ data.first_timers }}</td>
                                <td>{{ data.no_shows }}</td>
                                <td>{{ data.total_riders - (data.first_timers + data.no_shows) }}</td>
                                <td>{{ totalPercentage('average', data) }}</td>
                                <td>{{ data.number_of_classes }}</td>
                                <td>{{ (studio.online_class) ? 'N/A' : studio.capacity }}</td>
                                <td>{{ totalPercentage('capacity', data) }}</td>
                                <td>{{ totalPercentage('paying', data) }}</td>
                                <td>Php {{ totalCount(data.revenue) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="15">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>

                                                    <th>Total Rides</th>
                                                    <th>Paying Riders</th>
                                                    <th>Comped Riders</th>
                                                    <th>First Timers</th>
                                                    <th>No Shows</th>
                                                    <th>Repeat</th>
                                                    <th>Avg Riders</th>
                                                    <th>Avg Spots</th>
                                                    <th>Capacity</th>
                                                    <th>Paying</th>
                                                    <th>Total Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.instructor_schedules.length > 0">
                                                <tr v-for="(item, key) in data.instructor_schedules" :key="key">
                                                    <td>{{ item.total_riders }}</td>
                                                    <td>{{ item.paying_riders }}</td>
                                                    <td>{{ item.comped_riders }}</td>
                                                    <td>{{ item.first_timers }}</td>
                                                    <td>{{ item.no_shows }}</td>
                                                    <td>{{ item.total_riders - (item.first_timers + item.no_shows) }}</td>
                                                    <td>{{ totalPercentage('average', item) }}</td>
                                                    <td>{{ (studio.online_class) ? 'N/A' : studio.capacity }}</td>
                                                    <td>{{ totalPercentage('capacity', item) }}</td>
                                                    <td>{{ totalPercentage('paying', item) }}</td>
                                                    <td>Php {{ totalCount(item.revenue) }}</td>
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
                        <tbody class="no_results" v-if="res.instructors.data.length == 0">
                            <tr>
                                <td colspan="15">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.instructors.path" :current="res.instructors.current_page" :last="res.instructors.last_page" />
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
                    class_type_id: '',
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                instructor_label: 'Select Instructor',
                name: 'Instructor Attendance Summary',
                access: true,
                filter: true,
                loaded: false,
                toggleCheckboxes: false,
                rowCount: 0,
                res: [],
                values: [],
                studio: [],
                instructors: [],
                studios: [],
                classTypes: []
            }
        },
        computed: {
            instructorAttendanceSummaryAttributes () {
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
                        'Schedule Date': me.$moment(value.scheduled_date.date).format('MMMM DD, YYYY'),
                        'Start Time': value.scheduled_date.schedule.start_time,
                        'Instructor': me.getInstructorsInSchedule(value.scheduled_date, 1),
                        'Full Name': value.user.fullname,
                        'Customer Type': value.customer_type,
                        'Email Address': value.user.email,
                        'Gross Revenue': me.computeRevenue(value, 'gross'),
                        'Discount': me.computeRevenue(value, 'discount'),
                        'Net Revenue': me.computeRevenue(value, 'net'),
                        'Comp Reason': (value.user_package_count.payment_item.payment_method.comp_reason) ? value.user_package_count.payment_item.payment_method.comp_reason : 'N/A',
                        'Note': (value.user_package_count.payment_item.payment_method.note) ? value.user_package_count.payment_item.payment_method.note : 'N/A',
                        'Remarks': (value.user_package_count.payment_item.payment_method.remarks) ? value.user_package_count.payment_item.payment_method.remarks : 'N/A',
                        'Last Action Taken By': (value.employee) ? value.employee.fullname : 'Customer'
                    }))
                ]
            },
            checkInstructor () {
                const me = this
                let count = 0
                let result = false
                me.instructors.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.instructors.length) {
                    result = true
                } else {
                    result = false
                }
                return result
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
                    case 'paymongo':
                        result = data.payment_item.payment_method.paymongo_source_id
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
                if (data.status != 'cancelled') {
                    if (data.user_package_count.payment_item.payment_method.method != 'comp') {
                        switch (type) {
                            case 'gross':
                                base_value = me.totalCount(data.gross_revenue)
                                break
                            case 'net':
                                base_value = me.totalCount(data.net_revenue)
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
            getInstructorsInSchedule (data, export_status = null) {
                const me = this
                let result = ''
                if (data != '') {
                    let ins_ctr = 0, instructor = [], subInstructor = [], targetInstructor = []
                    data.schedule.instructor_schedules.forEach((ins, index) => {
                        if (ins.substitute == 0) {
                            ins_ctr += 1
                            subInstructor = ins
                        }
                        if (ins.primary == 1) {
                            instructor = ins
                        }
                    })

                    targetInstructor = (instructor != []) ? instructor : subInstructor

                    if (ins_ctr == 2) {
                        if (export_status != null) {
                            result = `${targetInstructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}`
                        } else {
                            result = `<b>${targetInstructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                        }
                    } else {
                        if (export_status != null) {
                            result = `${(targetInstructor.user) ? targetInstructor.user.fullname : 'No Instructor Set'}`
                        } else {
                            result = `<b>${(targetInstructor.user) ? targetInstructor.user.fullname : 'No Instructor Set'}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                        }
                    }
                }

                return result
            },
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.instructors.data[key].open ^= true
                if (me.res.instructors.data[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            checkInstructorValue () {
                const me = this
                let count = 0
                if (me.checkInstructor) {
                    me.instructors.forEach((data, index) => {
                        if (data.checked) {
                            count++
                        }
                    })
                }
                if (count == me.instructors.length) {
                    me.instructor_label = 'All Instructors Selected'
                } else {
                    me.instructor_label = 'Select Instructors'
                }
            },
            toggleSelectAllInstructor (event) {
                const me = this
                if (me.checkInstructor) {
                    me.instructors.forEach((data, index) => {
                        data.checked = false
                        me.hasStudio = true
                        me.instructor_label = 'Select Instructors'
                    })
                } else {
                    me.instructors.forEach((data, index) => {
                        data.checked = true
                        me.hasStudio = false
                        me.instructor_label = 'All Instructors Selected'
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            closeCheckboxes () {
                const me = this
                me.toggleCheckboxes = false
            },
            getClasses () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))

                me.instructors.forEach((data, key) => {
                    if (data.checked) {
                        formData.append('instructor_ids[]', data.id)
                    }
                })

                me.values = []
                me.loader(true)
                me.$axios.post(`api/exports/class-report/instructor-attendance-summary`, formData).then(res => {
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

                switch (type) {
                    case 'capacity':
                        if (data.avg_riders != 0) {
                            if (me.studio.online_class) {
                                percent = me.totalItems(`${(data.avg_riders / data.total_riders) * 100}`)
                            } else {
                                percent = me.totalItems(`${(data.avg_riders / me.studio.capacity) * 100}`)
                            }
                        }
                        break
                    case 'paying':
                        if (data.paying_riders != 0) {
                            percent = me.totalItems(`${((data.total_riders - data.comped_riders) / data.paying_riders) * 100}`)
                        }
                        if (percent > 100) {
                            percent = 100
                        } else {
                            if (percent == 'Infinity') {
                                percent = 100
                            }
                        }
                        break
                    case 'average':
                        if (data.avg_riders != 0) {
                            percent = me.totalItems(data.avg_riders / data.number_of_classes)
                        }
                        break
                }

                return (type == 'average') ? percent : `${percent}%`
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))

                me.instructors.forEach((data, key) => {
                    if (data.checked) {
                        formData.append('instructor_ids[]', data.id)
                    }
                })

                me.loader(true)
                me.filter = true

                me.$axios.post(`api/reporting/classes/instructor-attendance-summary`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
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
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            fetchData () {
                const me = this
                me.loader(true)

                let formData = new FormData()
                let studio_id = me.$cookies.get('CSID')

                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', studio_id)

                me.$axios.post(`api/reporting/classes/instructor-attendance-summary`, formData).then(res => {
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
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
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
                me.$axios.get(`api/instructors?enabled=1&all=1`).then(res => {
                    res.data.instructors.forEach((data, key) => {
                        data.checked = false
                        me.instructors.push(data)
                    })
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
        }
    }
</script>
