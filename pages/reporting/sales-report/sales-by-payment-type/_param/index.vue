<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/sales-by-payment-type" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Payment Type</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ replacer($route.params.param) }} - {{ (form.studio_id != '') ? studio.name : 'All Studios' }} ({{ payment_status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">{{ totalItems(total) }} Transaction(s)</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/payment-type/${$route.params.param}?payment_status=${payment_status}&payment_method=${$route.params.param}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="paymentTypeParamAttributes"
                                :name="`sales-by-payment-type-${$route.params.slug}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>

                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="payment_status" :value="payment_status">
                            <input type="hidden" name="payment_method" :value="form.payment_method">
                            <input type="hidden" name="start_date" :value="form.start_date">
                            <input type="hidden" name="end_date" :value="form.end_date">
                            <input type="hidden" name="studio_id" :value="form.studio_id">
                        </form>
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
                                <th class="sticky">Remarks</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr v-for="(data, key) in res.result.data" :key="key">
                                <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment(data.updated_at).format('h:mm A') }}</td>
                                <td>{{ data.payment_code }}</td>
                                <td>
                                    <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)" v-if="data.user != null">{{ `${data.user.first_name} ${data.user.last_name}` }}</div>
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
                                <td>{{ data.payment_method.remarks }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.result.path" :current="res.result.current_page" :last="res.result.last_page" />
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
    import Pagination from '../../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Sales by Payment Type',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                payment_status: 'all',
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
                        'Payment Status': me.payment_status,
                        'Date': me.$moment(value.updated_at).format('MMMM DD, YYYY'),
                        'Time': me.$moment(value.updated_at).format('h:mm A'),
                        'Order ID': value.payment_code,
                        'Customer': (value.user == null) ? 'N/A' : `${value.user.first_name} ${value.user.last_name}`,
                        'Status': (value.status == 'paid') ? 'Paid' : 'Pending',
                        'Total': value.total,
                        'Employee': (value.employee != null) ? `${value.employee.first_name} ${value.employee.last_name}` : 'N/A',
                        'Remarks': value.payment_method.remarks
                    }))
                ]
            }
        },
        methods: {
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.param}?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.result.forEach((item, key) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            fetchData (value) {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.payment_method = me.$route.params.param
                me.loader(true)
                let formData = new FormData()
                formData.append('payment_status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('payment_method', me.form.payment_method)
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total

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
                me.payment_status = me.$route.query.payment_status
                me.fetchData(me.payment_status)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
