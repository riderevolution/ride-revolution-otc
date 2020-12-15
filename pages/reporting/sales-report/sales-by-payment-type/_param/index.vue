<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/reporting/sales-report/sales-by-payment-type?payment_status=${payment_status}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Payment Type</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ replacer($route.params.param) }} - {{ (form.studio_id != '') ? studio.name : 'All Studios' }} ({{ payment_status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">{{ totalItems(total) }} Transaction(s)</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/payment-type/${$route.params.param}?payment_status=${payment_status}&payment_method=${$route.params.param}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="paymentTypeParamAttributes"
                                :name="`sales-by-payment-type-${$route.params.slug}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>

                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="payment_status" :value="payment_status">
                            <input type="hidden" name="payment_method" :value="form.payment_method">
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
                                <th>Comp Reason</th>
                                <th>Note</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody :class="`tbp ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.result.data" v-if="res.result.data.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ getPaymentCode(data) }}</td>
                                <td>{{ $moment(data.updated_at).format('MMM DD, YYYY hh:mm A') }}</td>
                                <td>{{ getPaymentStudio(data) }}</td>
                                <td>{{ getPaymentDetails(data, 'qty') }}</td>
                                <td class="capitalize">{{ replacer(data.payment_method.method) }}</td>
                                <td>{{ getPaymentDetails(data, 'price') }}</td>
                                <td>{{ getPaymentDetails(data, 'employee') }}</td>
                                <td>
                                    <div class="table_actions">
                                        <div :class="`action_status ${(data.status == 'paid') ? 'green' : 'red' }`">{{ data.status }}</div>
                                        <div class="action_status red ml" v-if="data.promo_code_used !== null">Discounted</div>
                                    </div>
                                </td>
                                <td>{{ (data.payment_method.comp_reason) ? data.payment_method.comp_reason : 'N/A' }}</td>
                                <td>{{ (data.payment_method.note) ? data.payment_method.note : 'N/A' }}</td>
                                <td>{{ (data.payment_method.remarks) ? data.payment_method.remarks : (data.studio == null && data.payment_method.method == 'cash' ? 'From Import' : 'N/A' ) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="11">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Reference Number</th>
                                                    <th>Item</th>
                                                    <th>Category</th>
                                                    <th>Qty</th>
                                                    <th>Price</th>
                                                    <th>Customer</th>
                                                    <th>Contact/Emergency No.</th>
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
                                                    <td>
                                                        <div class="thumb">
                                                            <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                                            <div class="table_image_default" v-else>
                                                                <div class="overlay">
                                                                    {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                                                </div>
                                                            </div>
                                                            <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)">{{ data.user.fullname }}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {{ (data.user.customer_details.co_contact_number != null) ? data.user.customer_details.co_contact_number : (data.user.customer_details.ec_contact_number) ? data.user.customer_details.ec_contact_number : 'N/A' }}
                                                    </td>
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
                        <tbody class="no_results" v-if="res.result.data.length == 0">
                            <tr>
                                <td colspan="11">No Result(s) Found.</td>
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
    import Foot from '../../../../../components/Foot'
    import Pagination from '../../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Sales by Payment Type',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                payment_status: 'all',
                res: [],
                values: [],
                total: [],
                studio: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: '',
                    payment_method: ''
                }
            }
        },
        computed: {
            paymentTypeParamAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': me.getPaymentStudio(value.parent),
                        'Customer': `${value.parent.user.first_name} ${value.parent.user.last_name}`,
                        'Email Address': value.parent.user.email,
                        'Contact Number': (value.parent.user.customer_details.co_contact_number != null) ? value.parent.user.customer_details.co_contact_number : (value.parent.user.customer_details.ec_contact_number) ? value.parent.user.customer_details.ec_contact_number : 'N/A' ,
                        'Payment ID': value.parent.id,
                        'Reference Number': me.getPaymentCode(value.parent),
                        'Transaction Date': me.$moment(value.parent.updated_at).format('MMMM DD, YYYY hh:mm A'),
                        'Promo Code': (value.parent.promo_code_used != null) ? value.parent.promo_code_used : 'No Promo Code Used',
                        'Payment Status': value.parent.status,
                        'Payment Method': me.replacer(value.parent.payment_method.method),
                        'Payment Item Id': value.id,
                        'SKU ID': me.getPaymentItem(value, 'sku'),
                        'Item': me.getPaymentItem(value, 'name'),
                        'Item Category': (value.product_variant) ? value.product_variant.product.category.name : 'N/A',
                        'Quantity': value.quantity,
                        'Discount': `${(value.parent.promo_code_used != null) ? value.parent.discount.discount : 0}`,
                        'Price': `${(value.parent.promo_code_used != null) ? value.total : value.price_per_item}`,
                        'Employee': me.getPaymentDetails(value.parent, 'employee'),
                        'Comp Reason': (value.parent.comp_reason) ? value.parent.comp_reason : 'N/A',
                        'Note': (value.parent.note) ? value.parent.note : 'N/A',
                        'Remarks': (value.parent.remarks) ? value.parent.remarks : 'N/A'
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
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.param}?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.result.forEach((parent, key) => {
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
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.result.data[key].open ^= true
                if (me.res.result.data[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()

                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                }
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                }

                me.form.payment_method = me.$route.params.param

                formData.append('payment_status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('payment_method', me.form.payment_method)
                formData.append('studio_id', me.form.studio_id)

                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total

                            if (me.form.studio_id != 0 && me.form.studio_id != 'os') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            } else {
                                me.studio = {
                                    name: (me.form.studio_id == 'os' ? 'Online Sales' : 'All Studios')
                                }
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
                        const elements = document.querySelectorAll('.cms_table_accordion .tbp')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {

                if (me.$route.query.payment_status) {
                    me.payment_status = me.$route.query.payment_status
                }

                me.fetchData(me.payment_status)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
