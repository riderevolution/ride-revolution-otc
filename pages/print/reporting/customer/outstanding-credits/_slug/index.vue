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
                <h2>{{ customer.fullname }} Store Credits</h2>
                <div class="total">Total Store Credits: Php {{ totalCount(total) }}</div>
            </div>
        </div>
        <table class="cms_table_accordion">
            <thead>
                <tr>
                    <th>Transaction Date</th>
                    <th>Studio</th>
                    <th>Total Qty.</th>
                    <th>Payment Method</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Comp Reason</th>
                    <th>Note</th>
                    <th>Remarks</th>
                    <th>Transaction By</th>
                </tr>
            </thead>
            <tbody v-for="(data, key) in res" v-if="res.length > 0">
                <tr class="parent">
                    <td>{{ $moment(data.updated_at).format('MMM DD, YYYY hh:mm A') }}</td>
                    <td>{{ getPaymentStudio(data) }}</td>
                    <td>{{ getPaymentDetails(data, 'qty') }}</td>
                    <td class="capitalize">{{ replacer(data.payment_method.method) }}</td>
                    <td>{{ getPaymentDetails(data, 'price') }}</td>
                    <td>
                        <div class="table_actions">
                            <div :class="`action_status ${(data.status == 'paid') ? 'green' : 'red' }`">{{ data.status }}</div>
                            <div class="action_status red ml" v-if="data.promo_code_used !== null">Discounted</div>
                        </div>
                    </td>
                    <td>{{ (data.payment_method.comp_reason) ? data.payment_method.comp_reason : 'N/A' }}</td>
                    <td>{{ (data.payment_method.note) ? data.payment_method.note : 'N/A' }}</td>
                    <td>{{ (data.payment_method.remarks) ? data.payment_method.remarks : (data.studio == null && data.payment_method.method == 'cash' ? 'From Import' : 'N/A' ) }}</td>
                    <td>{{ getPaymentDetails(data, 'employee') }}</td>
                </tr>
                <tr>
                    <td class="pads" colspan="11">
                        <div class="accordion_table show">
                            <table class="cms_table alt">
                                <thead>
                                    <tr>
                                        <th>Reference Number</th>
                                        <th>Item</th>
                                        <th>Category</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Refund Type</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody v-if="data.payment_items.length > 0">
                                    <tr v-for="(child, key) in data.payment_items" :key="key">
                                        <td>{{ getPaymentCode(data) }}</td>
                                        <td>{{ getPaymentItem(child, 'name') }}</td>
                                        <td>{{ (child.product_variant) ? child.product_variant.product.category.name : 'N/A' }}</td>
                                        <td>{{ child.quantity }}</td>
                                        <td class="price">
                                            <p :class="`${(data.promo_code_used !== null) ? 'prev_price' : ''}`" v-if="data.promo_code_used !== null">PHP {{ totalCount(child.price_per_item * child.quantity) }}</p>
                                            <p>PHP {{ totalCount((data.promo_code_used !== null) ? child.total : child.price_per_item * child.quantity) }}</p>
                                        </td>
                                        <td>{{ (child.refund_remarks) ? child.refund_remarks : 'N/A' }}</td>
                                        <td class="alt_2">{{ (child.refund_type) ? replacer(child.refund_type) : 'N/A' }}</td>
                                    </tr>
                                </tbody>
                                <tbody class="no_results" v-else>
                                    <tr>
                                        <td colspan="7">No Result(s) Found.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tbody class="no_results" v-if="res.length == 0">
                <tr>
                    <td colspan="11">No Result(s) Found.</td>
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
                customer: [],
                total: 0
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
                        result = payment.payment_method.paypal_transaction_id
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
                formData.append('all', 1)

                me.$axios.post(`api/reporting/customers/outstanding-store-credits/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.customer = res.data.customer
                            me.total = res.data.total_store_credits_bought
                            me.res = res.data.results

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
