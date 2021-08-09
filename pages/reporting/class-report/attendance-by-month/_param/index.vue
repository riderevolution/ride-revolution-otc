<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ (scheduled_date.schedule.custom_name != null) ? scheduled_date.schedule.custom_name : scheduled_date.schedule.class_type.name }}</h1>
                                <span>{{ $moment(scheduled_date.schedule.start_time, 'hh:mm A').format('h:mm A') }}</span>
                            </div>
                            <h2 class="header_subtitle">{{ scheduled_date.schedule.class_length_formatted }}</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <download-csv
                                    class="action_btn alternate"
                                    :data="attributes"
                                    :name="`attendance-by-month-${$moment(scheduled_date.schedule.date).format('MM-DD-YY-hh-mm')}.csv`" v-if="res.length > 0">
                                    Export
                                </download-csv>
                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <div class="filter_flex" id="filter">
                            <div class="form_group alternate">
                                <label for="q">Find a Customer</label>
                                <input type="text" name="q" @input="submitFilter()" v-model="form.search" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate">
                            </div>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Spot</th>
                                <th class="sticky">Customer</th>
                                <th class="sticky">Status</th>
                                <th class="sticky">Type</th>
                                <th class="sticky">Email Address</th>
                                <th class="sticky">Package Used</th>
                                <th class="sticky">Revenue</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Net Revenue</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0 && !noSearchFound">
                            <tr v-for="(data, key) in populateUsers" :key="key" v-show="data.searched">
                                <td>{{ (data.seat.position != 'Online') ? data.seat.number : '-' }}</td>
                                <td>
                                    <div class="thumb">
                                        <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)">{{ data.user.first_name }} {{ data.user.last_name }}</div>
                                    </div>
                                </td>
                                <td>{{ replacer(data.status).charAt(0).toUpperCase()}}{{ replacer(data.status).slice(1) }}</td>
                                <td width="15%">
                                    <div class="thumb alt">
                                        <img :src="data.customer_type_image[0].path_resized" v-if="data.customer_type_image[0].path != null" />
                                        <div class="table_data_link">{{ data.customer_type }}</div>
                                    </div>
                                </td>
                                <td>{{ data.user.email }}</td>
                                <td>{{ (data.user_package_count) ? data.user_package_count.class_package.name : 'No Package Used' }}</td>
                                <td>Php {{ computeRevenue(data, 'revenue') }}</td>
                                <td>Php {{ computeRevenue(data, 'discount') }}</td>
                                <td>Php {{ computeRevenue(data, 'net') }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="6">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" class="hidden" id="online" @click="initial()"></button>
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
            Foot,
        },
        data () {
            const values = []
            return {
                name: 'Attendance by Month',
                access: true,
                loaded: false,
                rowCount: 0,
                res: [],
                studio: [],
                scheduled_date: [],
                values: [],
                form: {
                    search: ''
                },
                noSearchFound: false
            }
        },
        computed: {
            attributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
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
                        'Full Name': `${value.user.first_name} ${value.user.last_name}`,
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
            populateUsers () {
                const me = this
                let result = []
                me.res.forEach((data, index) => {
                    result.push(data)
                })
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
                            case 'revenue':
                                base_value = me.totalCount(data.revenue)
                                break
                            case 'net':
                                base_value = me.totalCount(data.net_revenue)
                                break
                            case 'discount':
                                base_value = me.totalCount(data.discount)
                                break
                        }
                        result = me.totalCount(base_value * parseInt(me.scheduled_date.schedule.class_credits))
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
            submitFilter () {
                const me = this
                let ctr = 0
                me.res.forEach((data, index) => {
                    let name = `${data.user.first_name} ${data.user.last_name}`
                    name = name.toLowerCase()
                    if (me.form.search != '') {
                        if (name.includes(me.form.search.toLowerCase())) {
                            data.searched = true
                        } else {
                            ctr++
                            data.searched = false
                        }
                    } else {
                        data.searched = true
                    }
                })
                if (ctr == me.res.length) {
                    me.noSearchFound = true
                } else {
                    me.noSearchFound = false
                }
            },
            toggleCustomer () {
                const me = this
                me.$store.state.onlineAttendanceCustomer = true
                document.body.classList.add('no_scroll')
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            toggleClose () {
                const me = this
                me.$store.state.onlineAttendanceLayoutStatus = false
                document.body.classList.remove('no_scroll')
            },
            formatClassDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('M/D/YY (ddd) h:mm A')
                    } else {
                        return this.$moment(value).format('MMMM DD, YYYY')
                    }
                }
            },
            initial () {
                const me = this
                let studio_id = (me.$route.query.studio_id) ? me.$route.query.studio_id : me.$cookies.get('CSID')
                me.loader(true)
                me.$axios.get(`api/reporting/classes/attendance-by-month/${me.$route.params.param}`).then(res => {
                    if (res.data) {
                        me.res = []
                        setTimeout( () => {
                            me.scheduled_date = res.data.scheduled_date
                            res.data.bookings.forEach((data, index) => {
                                data.searched = true
                                me.res.push(data)
                            })
                            me.values = me.res
                            me.$axios.get(`api/studios/${studio_id}`).then(res => {
                                me.studio = res.data.studio
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.initial()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
        }
    }
</script>
