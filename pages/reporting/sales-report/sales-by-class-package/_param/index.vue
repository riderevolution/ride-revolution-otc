<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/sales-by-class-package" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Class Package</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ package.name }} ({{ status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ package.name }}.</h2>
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
                                <th class="sticky">Date of Purchase</th>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Qty.</th>
                                <th class="sticky">Payment</th>
                                <th class="sticky">Comp Reason</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td colspan="3"><b>{{ total.qty }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.payment.user.id}/packages`" v-if="data.payment.user != null">{{ `${data.payment.user.first_name} ${data.payment.user.last_name}` }}</nuxt-link>
                                    <div v-else>N/A</div>
                                </td>
                                <td>{{ data.quantity }}</td>
                                <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                                <td>{{ (data.payment.payment_method.method == 'comp') ? data.payment.payment_method.comp_reason : 'N/A' }}</td>
                                <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
                package: [],
                total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    slug: '',
                    id: 0
                }
            }
        },
        methods: {
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('slug', me.form.slug)
                formData.append('id', me.form.id)
                formData.append('status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.$cookies.get('CSID'))
                me.$axios.post(`api/reporting/sales/sales-by-class-package/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            console.log(res.data);
                            me.res = res.data.result
                            me.total = res.data.total
                            me.package = res.data.package
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
        mounted () {
            const me = this
            setTimeout( () => {
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.slug = me.$route.query.slug
                me.form.id = me.$route.query.id
                me.status = me.$route.query.status
                me.fetchData(me.status)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
