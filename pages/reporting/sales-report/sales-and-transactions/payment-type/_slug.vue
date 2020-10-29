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
                            <div class="action_btn alternate" @click="getTransactions()" v-if="res.payments.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.payments.data.length > 0"
                                class="hidden me"
                                :data="salesSummaryPaymentType"
                                :name="`sales-summary-payment-type-${$route.params.slug}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>

                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="start_date" :value="form.start_date">
                            <input type="hidden" name="end_date" :value="form.end_date">
                            <input type="hidden" name="studio_id" :value="form.studio_id">
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Reference Number</th>
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
                            <tr>
                                <td class="pads" colspan="9">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>SKU ID</th>
                                                    <th>Item</th>
                                                    <th>Category</th>
                                                    <th>Qty</th>
                                                    <th>Price</th>
                                                    <th>Customer</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.payment_items.length > 0">
                                                <tr v-for="(child, key) in data.payment_items" :key="key">
                                                    <td>{{ getPaymentItem(child, 'sku') }}</td>
                                                    <td>{{ getPaymentItem(child, 'name') }}</td>
                                                    <td>{{ (child.product_variant) ? child.product_variant.product.category.name : 'N/A' }}</td>
                                                    <td>{{ child.quantity }}</td>
                                                    <td class="price">
                                                        <p :class="`${(data.promo_code_used !== null) ? 'prev_price' : ''}`" v-if="data.promo_code_used !== null">PHP {{ totalCount(child.price_per_item) }}</p>
                                                        <p>PHP {{ totalCount(child.total) }}</p>
                                                    </td>
                                                    <td>
                                                        <div class="thumb">
                                                            <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                                            <div class="table_image_default" v-else>
                                                                <div class="overlay">
                                                                    {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                                                </div>
                                                            </div>
                                                            <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)">{{ data.user.first_name }} {{ data.user.last_name }}</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td colspan="8">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-if="res.payments.data.length == 0">
                            <tr>
                                <td colspan="8">No Result(s) Found.</td>
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
            salesSummaryPaymentType () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Payment ID': value.parent.id,
                        'Reference Number': me.getPaymentCode(value.parent),
                        'Transaction Date': me.$moment(value.parent.updated_at).format('MMMM DD, YYYY hh:mm A'),
                        'Studio': me.getPaymentStudio(value.parent),
                        'Payment Status': value.parent.status,
                        'Payment Method': me.replacer(value.parent.payment_method.method),
                        'Quantity': value.quantity,
                        'Price': `Php ${(value.parent.promo_code_used != null) ? value.total : value.price_per_item}`,
                        'Payment Item Id': value.id,
                        'SKU ID': me.getPaymentItem(value, 'sku'),
                        'Item': me.getPaymentItem(value, 'name'),
                        'Item Category': (value.product_variant) ? value.product_variant.product.category.name : 'N/A',
                        'Customer': `${value.parent.user.first_name} ${value.parent.user.last_name}`,
                        'Email Address': value.parent.user.email,
                        'Contact Number': (value.parent.user.customer_details.co_contact_number != null) ? value.parent.user.customer_details.co_contact_number : value.parent.user.customer_details.ec_contact_number,
                        'Employee': me.getPaymentDetails(value.parent, 'employee'),
                        'Remarks': value.parent.remarks
                    }))
                ]
            }
        },
        methods: {
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
                            result = payment_item.gift_card.sku_id
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
            getTransactions () {
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

                        res.data.payments.forEach((payment, index) => {
                            payment.payment_items.forEach((payment_item, index) => {
                                payment_item.parent = payment
                                me.values.push(payment_item)
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
