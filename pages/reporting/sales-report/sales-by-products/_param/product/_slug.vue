<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :event="''" @click.native="backToSlug($route.path)" to="/reporting/sales-report/sales-by-products" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Products</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ variant.variant }} - {{ (form.studio_id == 'os') ? 'Online Sales' : (form.studio_id != 0) ? studio.name : 'All Studios' }}</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ variant.variant }} ({{ variant.product.category.name }}).</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/products/${$route.params.param}/product/${$route.params.slug}?slug=${form.slug}&id=${form.id}&variant_id=${form.variant_id}&start_date=${form.start_date}&end_date=${form.end_date}&studio_id=${form.studio_id}`" target="_blank" class="action_btn alternate">Print</a>

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
                                <th class="sticky">Total</th>
                                <th class="sticky">Comp Reason</th>
                                <th class="sticky">Note</th>
                                <th class="sticky">Remarks</th>
                                <th class="sticky">Employee</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td colspan="2"><b>{{ total.qty }}</b></td>
                                <td><b>Php {{ totalCount(total.total_price) }}</b></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr v-for="(data, key) in res.result.data" :key="key">
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>
                                    <div class="thumb" v-if="data.payment.user != null">
                                        <img :src="data.payment.user.customer_details.images[0].path_resized" v-if="data.payment.user.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.payment.user.first_name.charAt(0) }}{{ data.payment.user.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.payment.user.id}/packages`)">{{ data.payment.user.fullname }}</div>
                                    </div>
                                    <div v-else>
                                        No Customer
                                    </div>
                                </td>
                                <td>{{ data.quantity }}</td>
                                <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                                <td>Php {{ (data.total) ? totalCount(data.total) : 0 }}</td>
                                <td>{{ (data.payment.comp_reason) ? data.payment.comp_reason : 'N/A' }}</td>
                                <td>{{ (data.payment.note) ? data.payment.note : 'N/A' }}</td>
                                <td>{{ (data.payment.remarks) ? data.payment.remarks : 'N/A' }}</td>
                                <td>
                                    <div v-if="data.payment.employee != null">
                                        {{ `${data.payment.employee.first_name} ${data.payment.employee.last_name}` }}
                                    </div>
                                    <div v-else>
                                        Customer
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
                        'Studio': me.getPaymentStudio(value.payment),
                        'Customer': (value.payment.user) ? value.payment.user.fullname : 'No Customer',
                        'Email Address': (value.payment.user) ? value.payment.user.email : 'No Customer Email',
                        'Contact Number': (value.payment.user) ? (value.payment.user.customer_details.co_contact_number != null) ? value.payment.user.customer_details.co_contact_number : (value.payment.user.customer_details.ec_contact_number) ? value.payment.user.customer_details.ec_contact_number : 'N/A' : 'No Customer Contact',
                        'Payment ID': value.payment.id,
                        'Reference Number': me.getPaymentCode(value.payment),
                        'Transaction Date': me.$moment(value.payment.updated_at).format('MMMM DD, YYYY hh:mm A'),
                        'Promo Code': (value.payment.promo_code_used != null) ? value.payment.promo_code_used : 'No Promo Code Used',
                        'Payment Status': value.payment.status,
                        'Payment Method': me.replacer(value.payment.payment_method.method),
                        'Payment Item Id': value.id,
                        'SKU ID': me.getPaymentItem(value, 'sku'),
                        'Item': me.getPaymentItem(value, 'name'),
                        'Item Category': (value.product_variant) ? value.product_variant.product.category.name : 'N/A',
                        'Quantity': value.quantity,
                        'Discount': `${(value.payment.promo_code_used != null) ? value.payment.discount.discount : 0}`,
                        'Price': `${(value.payment.promo_code_used != null) ? value.total : value.price_per_item}`,
                        'Employee': me.getPaymentDetails(value.payment, 'employee'),
                        'Comp Reason': (value.payment.comp_reason) ? value.payment.comp_reason : 'N/A',
                        'Note': (value.payment.note) ? value.payment.note : 'N/A',
                        'Remarks': (value.payment.remarks) ? value.payment.remarks : 'N/A'
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
                            result = 'No User'
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
            backToSlug (path) {
                const me = this
                let temp = path.split('/')
                temp.splice(temp.length - 1, 1)
                temp.splice(temp.length - 1, 1)
                temp = temp.join('/')
                me.$router.push(`${temp}?studio_id=${me.form.studio_id}&slug=${me.form.slug}&id=${me.form.id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
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
                if (me.$route.query.variant_id) {
                    me.form.variant_id = me.$route.query.variant_id
                }
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                }

                formData.append('slug', me.form.slug)
                formData.append('variant_id', me.form.variant_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)

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
