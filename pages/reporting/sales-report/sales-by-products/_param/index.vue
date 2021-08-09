<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/sales-by-products" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Products</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ category.name }} - {{ (form.studio_id == 'os') ? 'Online Sales' : (form.studio_id != 0) ? studio.name : 'All Studios' }}</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ category.name }}.</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/products/${$route.params.param}?studio_id=${form.studio_id}&slug=${form.slug}&id=${form.id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="productsParamAttributes"
                                :name="`sales-by-products-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="slug" :value="form.slug">
                            <input type="hidden" name="id" :value="form.id">
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
                                <th class="sticky">Product Name</th>
                                <th class="sticky">Item Price</th>
                                <th class="sticky">Sold</th>
                                <th class="sticky">Gross</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Taxes</th>
                                <th class="sticky">Profit</th>
                                <th class="sticky">Cost</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>Php {{ totalCount(total.gross) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.result.data" :key="key">
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
                                <td>Php {{ (totalCount(data.gross)) ? totalCount(data.gross) : 0 }}</td>
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
                name: 'Sales by Products',
                access: true,
                loaded: false,
                rowCount: 0,
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
                        'Reference Number': me.getPaymentCode(value.parent),
                        'Transaction Date': me.$moment(value.parent.created_at).format('MMMM DD, YYYY hh:mm A'),
                        'Payment Status': value.parent.status,
                        'Payment Method': me.replacer(value.parent.payment_method.method),
                        'Promo Code': (value.parent.promo_code_used != null) ? value.parent.promo_code_used : 'No Promo Code Used',
                        'Quantity': value.quantity,
                        'Gross Price': value.gross,
                        'Discount Price': value.discount,
                        'Net Price': value.net,
                        'Studio': me.getPaymentStudio(value.parent),
                        'Customer': (value.parent.user) ? value.parent.user.fullname : 'No Customer',
                        'Email Address': (value.parent.user) ? value.parent.user.email : 'No Customer Email',
                        'Contact Number': (value.parent.user) ? (value.parent.user.customer_details.co_contact_number != null) ? value.parent.user.customer_details.co_contact_number : (value.parent.user.customer_details.ec_contact_number) ? value.parent.user.customer_details.ec_contact_number : 'N/A' : 'No Customer Contact',
                        'SKU ID': me.getPaymentItem(value, 'sku'),
                        'Item': me.getPaymentItem(value, 'name'),
                        'Item Category': (value.product_variant) ? value.product_variant.product.category.name : 'N/A',
                        'Comp Reason': (value.parent.payment_method.comp_reason) ? value.parent.payment_method.comp_reason : 'N/A',
                        'Note': (value.parent.payment_method.note) ? value.parent.payment_method.note : 'N/A',
                        'Remarks': (value.parent.remarks) ? value.parent.remarks : 'N/A',
                        'Last Action Taken By': me.getPaymentDetails(value.parent, 'employee')
                    }))
                ]
            }
        },
        methods: {
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('export', 1)

                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        res.data.payments.forEach((parent, key) => {
                            parent.payment_items.forEach((child, key) => {
                                child.parent = parent
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
            getPaymentItem (payment_item, type) {
                const me = this
                let result = ''

                if (type == 'sku') {
                    switch (payment_item.type) {
                        case 'class-package':
                        case 'promo-package':
                            result = payment_item.class_package.sku_id
                            break
                        case 'product-variant':
                            result = payment_item.product_variant.sku_id
                            break
                        case 'custom-gift-card':
                            result = payment_item.gift_card.card_code
                            break
                        case 'physical-gift-card':
                            result = payment_item.gift_card.sku_id
                            break
                        case 'store-credit':
                            result = payment_item.store_credit.sku_id
                            break
                    }
                } else {
                    switch (payment_item.type) {
                        case 'class-package':
                        case 'promo-package':
                            result = payment_item.class_package.name
                            break
                        case 'product-variant':
                            result = `${payment_item.product_variant.product.name} ${payment_item.product_variant.variant}`
                            break
                        case 'custom-gift-card':
                            result = `Digital Gift Card - ${payment_item.gift_card.card_code}`
                            break
                        case 'physical-gift-card':
                            result = `Physical Gift Card - ${payment_item.gift_card.card_code}`
                            break
                        case 'store-credit':
                            result = payment_item.store_credit.name
                            break
                    }
                }

                return result
            },
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
                        let temp_price = 0
                        payment.payment_items.forEach((payment_item, key) => {
                            if (payment.promo_code_used !== null) {
                                temp_price += parseInt(payment_item.total)
                            } else {
                                temp_price += parseInt(payment_item.price_per_item)
                            }
                        })
                        result = `Php ${me.totalCount(temp_price)}`
                        break
                    case 'employee':
                        if (payment.employee != null) {
                            result = `${payment.employee.first_name} ${payment.employee.last_name}`
                        } else {
                            result = 'Customer'
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
                        if (payment.payment_method.paypal_transaction_id) {
                            result = payment.payment_method.paypal_transaction_id
                        } else {
                            result = payment.payment_code
                        }
                        break
                    case 'paymaya':
                        result = payment.payment_method.paymaya_transaction_id
                        break
                    case 'paymongo':
                        result = payment.payment_method.paymongo_source_id
                        break
                    default:
                        result = payment.payment_code
                }

                return result
            },
            toggleInnerReport (type, path, id) {
                const me = this
                me.$router.push(`${path}?slug=${type}&id=${me.form.id}&studio_id=${me.form.studio_id}&variant_id=${id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()

                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                }
                if (me.$route.query.slug) {
                    me.form.slug = me.$route.query.slug
                }
                if (me.$route.query.id) {
                    me.form.id = me.$route.query.id
                }
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                }

                formData.append('slug', me.form.slug)
                formData.append('id', me.form.id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)

                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total
                            me.category = res.data.category

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
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
