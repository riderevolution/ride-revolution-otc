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
                <h2>Sales by Subscription</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Date of Purchase</th>
                    <th>Reference No.</th>
                    <th>Customer</th>
                    <th>Class Package</th>
                    <th>Expiration Date</th>
                    <th>Method</th>
                    <th>Comp Reason</th>
                    <th>Comp Value</th>
                    <th>Discount</th>
                    <th>Total Income</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr class="parent bb">
                    <td colspan="7"><b>{{ total.name }}</b></td>
                    <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                </tr>
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ $moment(data.payment.created_at).format('MMM DD, YYYY hh:mm A') }}</td>
                    <td>{{ getPaymentCode(data.payment) }}</td>
                    <td>{{ data.payment.user.fullname }}</td>
                    <td>{{ data.class_package.name }}</td>
                    <td>{{ (data.computed_expiration_date) ? formatDate(data.computed_expiration_date, true) : formatDate(data.user_package_count.expiry_date_if_not_activated, true) }}</td>
                    <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                    <td>{{ (data.payment.payment_method.method == 'comp') ? data.payment.payment_method.comp_reason : 'N/A' }}</td>
                    <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                    <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                    <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="9">No Result(s) Found.</td>
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
            formatDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('MMM DD, YYYY hh:mm A')
                    } else {
                        return this.$moment(value).format('MMM DD, YYYY')
                    }
                }
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

                if (type == 'qty') {
                    payment.payment_items.forEach((payment_item, key) => {
                        result += payment_item.quantity
                    })
                }

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
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                formData.append('type', me.$route.query.type)

                me.$axios.post('api/reporting/sales/sales-by-subscription?export=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total

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
