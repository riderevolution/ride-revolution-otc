<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/customer-report/customer-payable" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Customer Payable</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ customer.fullname }} Pending Amount</h1>
                            </div>
                            <div class="action_btn alternate no_margin" @click="openWindow(`/customers/${customer.id}/packages`)">View Customer</div>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/customer/customer-payable/${$route.params.slug}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.results.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.results.data.length > 0"
                                class="hidden me"
                                :data="customerPayableSlugAttributes"
                                :name="`customer-payable-${$route.params.slug}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <div class="actions nmb">
                            <div class="total no_pad">Total Pending Amount: Php {{ totalCount(total) }}</div>
                        </div>
                    </div>
                </section>
                <section id="content">
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
                                <th>Employee</th>
                            </tr>
                        </thead>
                        <tbody v-for="(data, key) in res.results.data" v-if="res.results.data.length > 0">
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
                        <tbody class="no_results" v-if="res.results.data.length == 0">
                            <tr>
                                <td colspan="11">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.results.path" :current="res.results.current_page" :last="res.results.last_page" />
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
                name: 'Customer Payable',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                customer: [],
                total: 0,
                values: []
            }
        },
        computed: {
            customerPayableSlugAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Reference Number': me.getPaymentCode(value.parent),
                        'Transaction Date': me.$moment(value.parent.updated_at).format('MMMM DD, YYYY hh:mm A'),
                        'Promo Code': (value.parent.promo_code_used != null) ? value.parent.promo_code_used : 'No Promo Code Used',
                        'Payment Status': value.parent.status,
                        'Payment Method': me.replacer(value.parent.payment_method.method),
                        'SKU ID': me.getPaymentItem(value, 'sku'),
                        'Item': me.getPaymentItem(value, 'name'),
                        'Item Category': (value.product_variant) ? value.product_variant.product.category.name : 'N/A',
                        'Quantity': value.quantity,
                        'Discount': `${(value.parent.promo_code_used != null) ? value.parent.discount.discount : 0}`,
                        'Price': `${(value.parent.promo_code_used != null) ? value.total : value.price_per_item}`,
                        'Customer': (value.parent.user) ? value.parent.user.fullname : 'No Customer',
                        'Email Address': (value.parent.user) ? value.parent.user.email : 'No Customer Email',
                        'Contact Number': (value.parent.user) ? (value.parent.user.customer_details.co_contact_number != null) ? value.parent.user.customer_details.co_contact_number : (value.parent.user.customer_details.ec_contact_number) ? value.parent.user.customer_details.ec_contact_number : 'N/A' : 'No Customer Contact',
                        'Comp Reason': (value.parent.comp_reason) ? value.parent.comp_reason : 'N/A',
                        'Note': (value.parent.note) ? value.parent.note : 'N/A',
                        'Remarks': (value.parent.remarks) ? value.parent.remarks : 'N/A',
                        'Studio': me.getPaymentStudio(value.parent),
                        'Employee': me.getPaymentDetails(value.parent, 'employee')
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
                    default:
                        result = payment.payment_code
                }

                return result
            },
            getSales () {
                const me = this
                let formData = new FormData()
                formData.append('all', 1)
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/customers/customer-payable/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {
                        res.data.results.forEach((parent, key) => {
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
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()

                me.$axios.post(`api/reporting/customers/customer-payable/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.customer = res.data.customer
                            me.total = res.data.total_pending_amount
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
