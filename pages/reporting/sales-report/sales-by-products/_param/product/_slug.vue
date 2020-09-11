<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :event="''" @click.native="backToSlug($route.path)" to="/reporting/sales-report/sales-by-products" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Products</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ variant.variant }} - {{ (form.studio_id != '') ? studio.name : 'All Studios' }} ({{ payment_status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ variant.variant }} ({{ variant.product.category.name }}).</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/products/${$route.params.param}/product/${$route.params.slug}?payment_status=${payment_status}&slug=${form.slug}&id=${form.id}&variant_id=${form.variant_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="productsParamProductAttributes"
                                :name="`sales-by-products-${$route.params.param}-product-${$route.params.slug}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>

                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="slug" :value="form.slug">
                            <input type="hidden" name="variant_id" :value="form.variant_id">
                            <input type="hidden" name="payment_status" :value="payment_status">
                            <input type="hidden" name="start_date" :value="form.start_date">
                            <input type="hidden" name="end_date" :value="form.end_date">
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Date of Purchase</th>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Qty.</th>
                                <th class="sticky">Payment</th>
                                <th class="sticky">Employee</th>
                                <th class="sticky">Total</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td colspan="3"><b>{{ total.qty }}</b></td>
                                <td><b>Php {{ totalCount(total.total_price) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.result.data" :key="key">
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.payment.user.id}/packages`" v-if="data.payment.user != null">{{ `${data.payment.user.fullname}` }}</nuxt-link>
                                    <div v-else>- -</div>
                                </td>
                                <td>{{ data.quantity }}</td>
                                <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                                <td>
                                    <div v-if="data.payment.employee != null">
                                        {{ `${data.payment.employee.first_name} ${data.payment.employee.last_name}` }}
                                    </div>
                                    <div v-else>
                                        N/A
                                    </div>
                                </td>
                                <td>Php {{ (data.total) ? totalCount(data.total) : 0 }}</td>
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
    import Foot from '../../../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Sales by Products',
                access: true,
                loaded: false,
                rowCount: 0,
                payment_status: 'all',
                res: [],
                values: [],
                studio: [],
                total: [],
                variant: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    slug: '',
                    id: 0,
                    studio_id: 0,
                    variant_id: 0
                }
            }
        },
        computed: {
            productsParamProductAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': (me.form.studio_id != '') ? me.studio.name : 'All Studios',
                        'Payment Status': me.payment_status,
                        'Variant': me.variant.variant,
                        'Date of Purchase': me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'Full Name': (value.payment.user) ? `${value.payment.user.fullname}` : '-',
                        'Qty': value.quantity,
                        'Payment': (value.payment) ? value.payment.payment_method.method : '-',
                        'Employee': (value.payment.employee != null) ? `${value.payment.employee.first_name} ${value.payment.employee.last_name}` : 'N/A',
                        'Total Income': `Php ${(value.total) ? me.totalCount(value.total) : 0}`
                    }))
                ]
            }
        },
        methods: {
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.param}/product/${me.$route.params.slug}?all=1`, formData).then(res => {
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
            backToSlug (path) {
                const me = this
                let temp = path.split('/')
                temp.splice(temp.length - 1, 1)
                temp.splice(temp.length - 1, 1)
                temp = temp.join('/')
                me.$router.push(`${temp}?payment_status=${me.payment_status}&studio_id=${me.form.studio_id}&slug=${me.form.slug}&id=${me.form.id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
            },

            fetchData (value) {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.slug = me.$route.query.slug
                me.form.id = me.$route.query.id
                me.form.variant_id = me.$route.query.variant_id
                me.loader(true)
                let formData = new FormData()
                formData.append('slug', me.form.slug)
                formData.append('variant_id', me.form.variant_id)
                formData.append('payment_status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                if (me.$route.query.studio_id.length > 0) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.param}/product/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total
                            me.variant = res.data.variant

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
