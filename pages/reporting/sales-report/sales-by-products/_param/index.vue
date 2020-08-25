<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/sales-by-products" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Products</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ category.name }} - {{ (form.studio_id != '') ? studio.name : 'All Studios' }} ({{ status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ category.name }}.</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/products/${$route.params.param}?status=${status}&studio_id=${form.studio_id}&slug=${form.slug}&id=${form.id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                            <download-csv
                                class="action_btn alternate margin"
                                :data="productsParamAttributes"
                                :name="`sales-by-products-${$route.params.param}-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Product Name</th>
                                <th class="sticky">Item Price</th>
                                <th class="sticky">Sold</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Taxes</th>
                                <th class="sticky">Profit</th>
                                <th class="sticky">Cost</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link v-if="form.slug == 'product-variant'" :event="''" class="table_data_link" :to="`${$route.path}/product/${convertToSlug(data.variant)}`" @click.native="toggleInnerReport(`${(form.slug == 'gift-card') ? 'gift-card' : 'product-variant'}`, `${$route.path}/product/${convertToSlug(data.variant)}`, data.id)">{{ data.variant }}</nuxt-link>
                                    <div v-else>{{ data.card_code }}</div>
                                </td>
                                <td>
                                    <div v-if="form.slug == 'product-variant'">
                                        Php {{ totalCount(data.sale_price) }}
                                    </div>
                                    <div v-else>
                                        Php {{ totalCount(data.class_package.price) }}
                                    </div>
                                </td>
                                <td>{{ (data.sold) ? data.sold : 0 }}</td>
                                <td>Php {{ (totalCount(data.total_comp)) ? totalCount(data.total_comp) : 0 }}</td>
                                <td>Php {{ (totalCount(data.total_discount)) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (totalCount(data.total_tax)) ? totalCount(data.total_tax) : 0 }}</td>
                                <td :class="`${(data.total_profit) ? (data.total_profit <= 0 ? 'red' : 'green') : ''}`">Php {{ (totalCount(data.total_profit)) ? totalCount(data.total_profit) : 0 }}</td>
                                <td>Php {{ (totalCount(data.total_cost)) ? totalCount(data.total_cost) : 0 }}</td>
                                <td>Php {{ (totalCount(data.total_income)) ? totalCount(data.total_income) : 0 }}</td>
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
                name: 'Sales by Products',
                access: true,
                loaded: false,
                rowCount: 0,
                status: 'all',
                res: [],
                values: [],
                studio: [],
                total: [],
                category: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    slug: '',
                    studio_id: '',
                    id: 0
                }
            }
        },
        computed: {
            productsParamAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': (me.form.studio_id != '') ? me.studio.name : 'All Studios',
                        'Payment Status': me.status,
                        'Product Name': (value.name) ? value.name : (me.form.slug == 'product-variant' ? value.variant : value.code),
                        'Item Price': (me.form.slug == 'product-variant') ? value.sale_price : value.class_package.price,
                        'Sold': (value.sold) ? value.sold : 0,
                        'Comp Value': `Php ${(value.total_comp) ? value.total_comp : 0}`,
                        'Discount': `Php ${(value.total_discount) ? value.total_discount : 0}`,
                        'Taxes': `Php ${(value.total_tax) ? value.total_tax : 0}`,
                        'Profit': `Php ${(value.total_profit) ? value.total_profit : 0}`,
                        'Cost': `Php ${(value.total_cost) ? value.total_cost : 0}`,
                        'Total Income': `Php ${(value.total_income) ? value.total_income : 0}`,
                    }))
                ]
            }
        },
        methods: {
            toggleInnerReport (type, path, id) {
                const me = this
                me.$router.push(`${path}?status=${me.status}&slug=${type}&id=${me.form.id}&variant_id=${id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
            },
            fetchData (value) {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.slug = me.$route.query.slug
                me.form.id = me.$route.query.id
                me.loader(true)
                let formData = new FormData()
                formData.append('slug', me.form.slug)
                formData.append('id', me.form.id)
                formData.append('status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                if (me.$route.query.studio_id.length > 0) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.category = res.data.category

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
