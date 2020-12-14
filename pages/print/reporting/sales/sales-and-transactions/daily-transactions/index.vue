<template>
    <div class="print_table" v-if="loaded">
        <div class="inline">
            <div class="logo">
                <img src="/logo.png" width="65px" />
                <div class="logo_title">
                    Ride <br/>
                    Revolution
                </div>
            </div>
            <div class="text">
                <h2>Sales by Products - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }}</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Transaction Date</th>
                    <th>Reference Number</th>
                    <th>Payment Method</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Customer</th>
                    <th>Contact No.</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(child, key) in res" :key="key">
                    <td>{{ $moment(child.parent.updated_at).format('MMM DD, YYYY hh:mm A') }}</td>
                    <td>{{ getPaymentCode(child.parent) }}</td>
                    <td class="capitalize">{{ replacer(child.parent.payment_method.method) }}</td>
                    <td>{{ getPaymentItem(child, 'name') }}</td>
                    <td>{{ (child.product_variant) ? child.product_variant.product.category.name : 'N/A' }}</td>
                    <td>{{ child.quantity }}</td>
                    <td class="price">
                        <p :class="`${(child.parent.promo_code_used !== null) ? 'prev_price' : ''}`" v-if="child.parent.promo_code_used !== null">PHP {{ totalCount(child.price_per_item * child.quantity) }}</p>
                        <p>PHP {{ totalCount((child.parent.promo_code_used !== null) ? child.total : child.price_per_item * child.quantity) }}</p>
                    </td>
                    <td>
                        <div class="table_data_link">{{ child.parent.user.fullname }}</div>
                    </td>
                    <td>
                        {{ (child.parent.user.customer_details.co_contact_number != null) ? child.parent.user.customer_details.co_contact_number : (child.parent.user.customer_details.ec_contact_number) ? child.parent.user.customer_details.ec_contact_number : 'N/A' }}
                    </td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td :colspan="rowCount">No Result(s) Found.</td>
                </tr>
            </tbody>
        </table>
        <div class="signature">
            <div class="label">SIGNATURE OVER PRINTED NAME</div>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'print',
        data () {
            return {
                loaded: false,
                res: [],
                studio: [],
                total: [],
                form: {
                    studio_id: ''
                }
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
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-and-transactions/sales-summary/daily?all=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            res.data.payments.forEach((parent, key) => {
                                parent.payment_items.forEach((child, key) => {
                                    child.parent = parent
                                    me.res.push(child)
                                })
                            })

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }

                            me.loaded = true
                            setTimeout( () => {
                                window.print()
                            }, 1000)
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                })
            }
        },
        mounted () {
			const me = this
            me.initial()
            window.onafterprint = function(){
                window.close()
            }
		}
    }
</script>
