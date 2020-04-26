<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/sales-by-payment-type" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Payment Type</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ replacer($route.params.param) }} ({{ status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">{{ totalItems(total) }} Transaction(s)</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
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
                                <td>N/A</td>
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
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                loaded: false,
                rowCount: 0,
                status: 'all',
                res: [],
                total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: '',
                    payment_method: ''
                }
            }
        },
        methods: {
            toggleInnerReport (type, path, id) {
                const me = this
                me.$router.push(`${path}?status=${me.status}&slug=${type}&id=${me.form.id}&variant_id=${id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('payment_method', me.form.payment_method)
                if (me.form.studio_id != '') {
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.loaded = true
                            console.log(res.data);
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
        mounted () {
            const me = this
            setTimeout( () => {
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                }
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.payment_method = me.$route.params.param
                me.status = me.$route.query.status
                me.fetchData(me.status)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 750)
        }
    }
</script>
