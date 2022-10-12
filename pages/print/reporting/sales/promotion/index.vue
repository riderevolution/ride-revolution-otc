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
                <h2>Promotions Redeemed - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ ($route.query.promo_id != 0) ? promo.name : 'All Promotions' }})</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table_accordion">
            <thead>
                <tr>
                    <th>Promo</th>
                    <th>Promo Code</th>
                    <th>Total Codes</th>
                    <th>Total Discount</th>
                    <th>Discount Type</th>
                    <th>Discount Value</th>
                    <th>Remaining</th>
                </tr>
            </thead>
            <tbody v-for="(data, key) in res">
                <tr class="parent">
                    <td>{{ data.name }}</td>
                    <td>{{ data.promo_code }}</td>
                    <td>{{ data.total_codes }}</td>
                    <td>Php {{ totalCount(data.total_discount) }}</td>
                    <td class="alt_2 capitalize">{{ data.discount_type }}</td>
                    <td>{{ (data.discount_type == 'percent') ? `${data.discount_percent}%` : `Php ${data.discount_flat_rate}` }}</td>
                    <td>{{ totalItems(data.redemption_limit - data.total_codes) }}</td>
                </tr>
                <tr>
                    <td class="pads" colspan="13">
                        <div class="accordion_table show">
                            <table class="cms_table alt">
                                <thead>
                                    <tr>
                                        <th>Reference Number</th>
                                        <th>Customer</th>
                                        <th>Item</th>
                                        <th>Category</th>
                                        <th>Qty.</th>
                                        <th>Gross Price</th>
                                        <th>Discount Price</th>
                                        <th>Net Price</th>
                                    </tr>
                                </thead>
                                <tbody v-if="data.payment_items.length > 0">
                                    <tr v-for="(child, key) in data.payment_items" :key="key">
                                        <td>{{ getPaymentCode(child) }}</td>
                                        <td>
                                            <div class="thumb" v-if="data.user">
                                                <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                                <div class="table_image_default" v-else>
                                                    <div class="overlay">
                                                        {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                                    </div>
                                                </div>
                                                <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)">{{ data.user.fullname }}</div>
                                            </div>
                                            <div v-else>
                                                No Customer
                                            </div>
                                        </td>
                                        <td>{{ getPaymentItem(child, 'name') }}</td>
                                        <td>{{ (child.product_variant) ? child.product_variant.product.category.name : 'N/A' }}</td>
                                        <td>{{ child.quantity }}</td>
                                        <td class="price">
                                            <p>PHP {{ totalCount(child.gross) }}</p>
                                        </td>
                                        <td class="price">
                                            <p>PHP {{ totalCount(child.discount) }}</p>
                                        </td>
                                        <td class="price">
                                            <p>PHP {{ totalCount(child.net) }}</p>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody class="no_results" v-else>
                                    <tr>
                                        <td colspan="13">No Result(s) Found.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tbody class="no_results" v-if="res.length == 0">
                <tr>
                    <td colspan="13">No Result(s) Found.</td>
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
                total_count: 0,
                res: [],
                promo: [],
                studio: [],
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
            getPaymentCode (payment) {
                const me = this
                let result = ''

                if (payment.payment_method) {
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
                        case 'gcash':
                            result = payment.payment_method.gcash_reference_number
                            break
                        case 'gc_code':
                            result = `${payment.payment_code} - ${payment.payment_method.gc_code}`
                            break
                        default:
                            result = payment.payment_code
                            break
                    }
                } else {
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
                if (me.$route.query.promo_id) {
                    formData.append('promo_id', me.$route.query.promo_id)
                }

                formData.append('all', 1)

                me.$axios.post('api/reporting/sales/promotions-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
                            me.res = res.data.result

                            if (me.form.studio_id != 0) {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }

                            if (me.$route.query.promo_id != 0) {
                                me.$axios.get(`api/inventory/promos/${me.$route.query.promo_id}`).then(res => {
                                    me.promo = res.data.promo
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
