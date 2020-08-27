<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :event="''" @click.native="backToSlug($route.path)" to="/reporting/sales-report/sales-by-products" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Products</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ variant.variant }} - {{ (form.studio_id != '') ? studio.name : 'All Studios' }} ({{ status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ variant.variant }} ({{ variant.product.category.name }}).</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/products/${$route.params.param}/product/${$route.params.slug}?status=${status}&slug=${form.slug}&id=${form.id}&variant_id=${form.variant_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                            <download-csv
                                v-if="res.length > 0"
                                class="action_btn alternate margin"
                                :data="productsParamProductAttributes"
                                :name="`sales-by-products-${$route.params.param}-product-${$route.params.slug}-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
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
                        <tbody v-if="res.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td colspan="3"><b>{{ total.qty }}</b></td>
                                <td><b>Php {{ totalCount(total.total_price) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.payment.user.id}/packages`" v-if="data.payment.user != null">{{ `${data.payment.user.first_name} ${data.payment.user.last_name}` }}</nuxt-link>
                                    <div v-else>N/A</div>
                                </td>
                                <td>{{ data.quantity }}</td>
                                <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                                <td>
                                    <div v-if="data.employee != null">
                                        {{ `${data.employee.first_name} ${data.employee.last_name}` }}
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
                status: 'all',
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
                        'Payment Status': me.status,
                        'Variant': me.variant.variant,
                        'Date of Purchase': (value.name) ? value.name : me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'Full Name': (value.payment) ? `${value.payment.user.first_name} ${value.payment.user.last_name}` : '-',
                        'Qty': (value.qty) ? value.qty : value.quantity,
                        'Payment': (value.payment) ? value.payment.payment_method.method : '-',
                        'Employee': (value.employee != null) ? `${value.employee.first_name} ${value.employee.last_name}` : 'N/A',
                        'Total Income': `Php ${(value.total_price) ? value.total_price : value.total}`
                    }))
                ]
            }
        },
        methods: {
            backToSlug (path) {
                const me = this
                let temp = path.split('/')
                temp.splice(temp.length - 1, 1)
                temp.splice(temp.length - 1, 1)
                temp = temp.join('/')
                me.$router.push(`${temp}?status=${me.status}&studio_id=${me.form.studio_id}&slug=${me.form.slug}&id=${me.form.id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
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
                formData.append('status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                if (me.$route.query.studio_id.length > 0) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.param}/product/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.variant = res.data.variant

                            res.data.result.forEach((item, i) => {
                                me.values.push(item)
                            })

                            me.values.push(res.data.total)

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
