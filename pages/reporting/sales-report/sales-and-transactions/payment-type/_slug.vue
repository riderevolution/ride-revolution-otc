<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales Summary - Income Breakdown</h1>
                                <span>({{ replacer($route.params.slug) }})</span>
                            </div>
                            <h2 class="header_subtitle">{{ $moment(form.start_date).format('MMMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMMM DD, YYYY') }}</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getClasses()" v-if="res.payments.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.payments.data.length > 0"
                                class="hidden me"
                                :data="attendanceByScheduleAttributes"
                                :name="`attendance-by-schedule-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Transaction Date</th>
                                <th>Studio</th>
                                <th>Total Qty.</th>
                                <th>Payment Method</th>
                                <th>Total Price</th>
                                <th>Employee</th>
                                <th>Status</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.payments.data" v-if="res.payments.data.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ getPaymentCode(data) }}</td>
                                <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY hh:mm A') }}</td>
                                <td>{{ getPaymentStudio(data) }}</td>
                                <td>{{ getPaymentDetails(data, 'qty') }}</td>
                                <td class="capitalize">{{ replacer(data.payment_method.method) }}</td>
                                <td>{{ getPaymentDetails(data, 'price') }}</td>
                                <td>{{ getPaymentDetails(data, 'employee') }}</td>
                                <td>
                                    <div class="table_actions">
                                        <div :class="`action_status ${(data.status == 'paid') ? 'green' : 'red' }`">{{ data.status }}</div>
                                    </div>
                                </td>
                                <td>{{ (data.payment_method.remarks) ? data.payment_method.remarks : '-' }}</td>
                            </tr>
                            <!-- <tr>
                                <td class="pads" colspan="7">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Class Type</th>
                                                    <th>Instructor</th>
                                                    <th>Bookings</th>
                                                    <th>Riders</th>
                                                    <th>Revenue</th>
                                                    <th>Discount</th>
                                                    <th>Net Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(value, key) in data.values" :key="key">
                                                    <td>{{ value.schedule.start_time }}</td>
                                                    <td>{{ (value.schedule.set_custom_name) ? value.schedule.custom_name : value.schedule.class_type.name }}</td>
                                                    <td>{{ getInstructorsInSchedule(value) }}</td>
                                                    <td>{{ totalItems(value.bookings.length) }}</td>
                                                    <td>{{ totalItems(value.riders) }}</td>
                                                    <td>Php {{ totalCount(value.revenue) }}</td>
                                                    <td>Php {{ totalCount(value.discount) }}</td>
                                                    <td>Php {{ totalCount(value.net_revenue) }}</td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td colspan="7">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr> -->
                        </tbody>
                        <tbody class="no_results" v-if="res.payments.data.length == 0">
                            <tr>
                                <td colspan="7">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.payments.path" :current="res.payments.current_page" :last="res.payments.last_page" />
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
                form: {
                    studio_id: 0,
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                res: [],
                total_count: 0,
                studio: [],
                values: [],
                name: 'Sales & Transactions',
                access: true,
                loaded: false,
                filter: true
            }
        },
        computed: {
            attendanceByScheduleAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Schedule ID': value.id,
                        'Studio': me.studio.name,
                        'Date': me.$moment(value.date).format('MMMM DD, YYYY'),
                        'Time': value.schedule.start_time,
                        'Class Type': (value.schedule.set_custom_name) ? value.schedule.custom_name : value.schedule.class_type.name,
                        'Instructor': me.getInstructorsInSchedule(value),
                        'Bookings': me.totalItems(value.bookings .length),
                        'Riders': me.totalItems(value.riders),
                        'Revenue': me.totalCount(value.revenue),
                        'Discount': me.totalCount(value.discount),
                        'Net Revenue': me.totalCount(value.net_revenue)
                    }))
                ]
            }
        },
        methods: {
            getPaymentDetails (payment, type) {
                const me = this
                let result = 0

                payment.payment_items.forEach((payment_item, key) => {
                    switch (type) {
                        case 'qty':
                            result += payment_item.quantity
                            break
                    }
                })

                switch (type) {
                    case 'qty':
                        result = me.totalItems(result)
                        break
                    case 'price':
                        result = `Php ${me.totalCount(payment.total)}`
                        break
                    case 'employee':
                        if (payment.employee != null) {
                            result = `${payment.employee.first_name} ${payment.employee.last_name}`
                        } else {
                            result = '-'
                        }
                        break
                }

                return result
            },
            getPaymentStudio (payment) {
                const me = this
                let result = ''

                if (payment.studio != null) {
                    result = payment.studio.name
                } else {
                    result = 'Website/Online'
                }

                return result
            },
            getPaymentCode (payment) {
                const me = this
                let result = ''

                switch (payment.payment_method.method) {
                    case 'paypal':
                        result = payment.payment_method.paypal_transaction_id
                        break
                    case 'paymaya':
                        result = payment.payment_method.paymaya_transaction_id
                        break
                    default:
                        result = payment.payment_code
                }

                return result
            },
            getClasses () {
                const me = this
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)
                formData.append('all', 1)
                me.values = []
                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-and-transactions/sales-summary/payment-type/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {

                        res.data.scheduled_dates.forEach((item, index) => {
                            item.values.forEach((child, index) => {
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
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.payments.data[key].open ^= true
                if (me.res.payments.data[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            fetchData () {
                const me = this
                let studio_id = me.$cookies.get('CSID')
                me.loader(true)

                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                } else {
                    me.form.studio_id = studio_id
                }

                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                }

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)
                me.$axios.post(`api/reporting/sales/sales-and-transactions/sales-summary/payment-type/${me.$route.params.slug}`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data

                        if (me.form.studio_id != 0 && me.form.studio_id != 'os') {
                            me.fetchExtraAPI()
                        }
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
                me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
                    me.studio = res.data.studio
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
