<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/sales-by-payment-type" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Payment Type</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ replacer($route.params.param) }} - {{ (form.studio_id != '') ? studio.name : 'All Studios' }} ({{ status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">{{ totalItems(total) }} Transaction(s)</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/payment-type/${$route.params.param}?status=${status}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                            <download-csv
                                class="action_btn alternate margin"
                                :data="paymentTypeParamAttributes"
                                :name="`sales-by-payment-type-${$route.params.slug}-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Date</th>
                                <th class="sticky">Time</th>
                                <th class="sticky">Order ID</th>
                                <th class="sticky">Customer</th>
                                <th class="sticky">Status</th>
                                <th class="sticky">Total</th>
                                <th class="sticky">Employee</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment(data.updated_at).format('h:mm A') }}</td>
                                <td>{{ data.payment_code }}</td>
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.user.id}/packages`" v-if="data.user != null">{{ `${data.user.first_name} ${data.user.last_name}` }}</nuxt-link>
                                    <div v-else>N/A</div>
                                </td>
                                <td :class="`${(data.status == 'paid') ? 'green' : 'red'}`">{{ (data.status == 'paid') ? 'Paid' : 'Pending' }}</td>
                                <td>Php {{ (data.total) ? totalCount(data.total) : 0 }}</td>
                                <td>
                                    <div v-if="data.employee != null">
                                        {{ `${data.employee.first_name} ${data.employee.last_name}` }}
                                    </div>
                                    <div v-else>
                                        N/A
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
    import Foot from '../../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Sales by Payment Type',
                access: true,
                loaded: false,
                rowCount: 0,
                status: 'all',
                res: [],
                values: [],
                total: [],
                studio: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: '',
                    payment_method: ''
                }
            }
        },
        computed: {
            paymentTypeParamAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': (me.form.studio_id != '') ? me.studio.name : 'All Studios',
                        'Payment Type': me.$route.params.param,
                        'Payment status': me.status,
                        'Date': me.$moment(value.updated_at).format('MMMM DD, YYYY'),
                        'Time': me.$moment(value.updated_at).format('h:mm A'),
                        'Order ID': value.payment_code,
                        'Customer': `${value.user.first_name} ${value.user.last_name}`,
                        'Status': (value.status == 'paid') ? 'Paid' : 'Pending',
                        'Total': value.total,
                        'Employee': (value.employee != null) ? `${value.employee.first_name} ${value.employee.last_name}` : 'N/A'
                    }))
                ]
            }
        },
        methods: {
            fetchData (value) {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.payment_method = me.$route.params.param
                me.loader(true)
                let formData = new FormData()
                formData.append('status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('payment_method', me.form.payment_method)
                if (me.$route.query.studio_id.length > 0) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total

                            res.data.result.forEach((item, i) => {
                                me.values.push(item)
                            })

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }

                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.status = me.$route.query.status
                me.fetchData(me.status)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
