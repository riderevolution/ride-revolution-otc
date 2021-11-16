<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Promotions Redeemed</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of promos used by customers</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/promotion?studio_id=${form.studio_id}&promo_id=${form.promo_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                                <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                    Export
                                </div>
                                <download-csv
                                    v-if="res.result.data.length > 0"
                                    class="hidden me"
                                    :data="promotionsAttributes"
                                    :name="`promotions-redeemed-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                    Export
                                </download-csv>

                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" v-model="form.studio_id" name="studio_id">
                                    <option value="0" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                    <option value="os">Website/Online Sales</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="promo_id">Promo</label>
                                <select class="default_select alternate" name="promo_id" v-model="form.promo_id">
                                    <option value="0" selected>All Promos</option>
                                    <option :value="promo.id" v-for="(promo, key) in promos" :key="key">{{ promo.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ errors.first('start_date') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Grand Total: Php {{ totalCount(total_count) }}</div>
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
                        <tbody :class="`tbp ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.result.data" v-if="res.result.data.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.name }}</td>
                                <td>{{ data.promo_code }}</td>
                                <td>{{ data.total_codes }}</td>
                                <td>Php {{ totalCount(data.total_discount) }}</td>
                                <td class="alt_2 capitalize">{{ data.discount_type }}</td>
                                <td>{{ (data.discount_type == 'percent') ? `${data.discount_percent}%` : `Php ${data.discount_flat_rate}` }}</td>
                                <td>{{ totalItems(data.redemption_limit - data.total_codes) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="13">
                                    <div class="accordion_table">
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
                                                        <div class="thumb" v-if="child.payment.user">
                                                            <img :src="child.payment.user.customer_details.images[0].path_resized" v-if="child.payment.user.customer_details.images[0].path != null" />
                                                            <div class="table_image_default" v-else>
                                                                <div class="overlay">
                                                                    {{ child.payment.user.first_name.charAt(0) }}{{ child.payment.user.last_name.charAt(0) }}
                                                                </div>
                                                            </div>
                                                            <div class="table_data_link" @click="openWindow(`/customers/${child.payment.user.id}/packages`)">{{ child.payment.user.fullname }}</div>
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
                        <tbody class="no_results" v-if="res.result.data.length == 0">
                            <tr>
                                <td colspan="13">No Result(s) Found.</td>
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
                name: 'Promotions Redeemed',
                filter: true,
                access: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                studios: [],
                total_count: 0,
                promos: [],
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: 0,
                    promo_id: 0
                }
            }
        },
        computed: {
            promotionsAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Reference Number': me.getPaymentCode(value.payment),
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMMM DD, YYYY hh:mm A'),
                        'Payment Status': value.payment.status,
                        'Payment Method': me.replacer(value.payment.payment_method.method),
                        'Promo Code': (value.payment.promo_code_used != null) ? value.payment.promo_code_used : 'No Promo Code Used',
                        'Quantity': value.payment_item.quantity,
                        'Gross Price': value.payment_item.gross,
                        'Discount Price': value.payment_item.discount,
                        'Net Price': value.payment_item.net,
                        'Studio': (value.payment.studio) ? value.payment.studio.name : 'Website/Online',
                        'Customer': (value.payment.user) ? value.payment.user.fullname : 'No Customer',
                        'Email Address': (value.payment.user) ? value.payment.user.email : 'No Customer Email',
                        'Contact Number': (value.payment.user) ? (value.payment.user.customer_details.co_contact_number != null) ? value.payment.user.customer_details.co_contact_number : (value.payment.user.customer_details.ec_contact_number) ? value.payment.user.customer_details.ec_contact_number : 'N/A' : 'No Customer Contact',
                        'SKU ID': me.getPaymentItem(value.payment_item, 'sku'),
                        'Item': me.getPaymentItem(value.payment_item, 'name'),
                        'Item Category': (value.payment_item.product_variant) ? value.payment_item.product_variant.product.category.name : 'N/A',
                        'Comp Reason': (value.payment.payment_method.comp_reason) ? value.payment.payment_method.comp_reason : 'N/A',
                        'Note': (value.payment.payment_method.note) ? value.payment.payment_method.note : 'N/A',
                        'Remarks': (value.payment.payment_method.remarks) ? value.payment.payment_method.remarks : 'N/A',
                        'Last Action Taken By': (value.payment.employee) ? value.payment.employee.fullname : 'Customer'
                    }))
                ]
            }
        },
        methods: {
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
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('export', 1)

                me.values = []
                me.loader(true)
                me.$axios.post('api/reporting/sales/promotions-redeemed', formData).then(res => {
                    if (res.data) {
                        me.values = res.data.result
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
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/promotions-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.loaded = true
                            me.total_count = res.data.grand_total
                            me.res = res.data
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
            },
            fetchData () {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)
                formData.append('promo_id', me.form.promo_id)

                me.$axios.post('api/reporting/sales/promotions-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
                            me.res = res.data

                            me.$axios.get('api/inventory/promos?enabled=1').then(res => {
                                if (res.data) {
                                    me.promos = res.data.promos.data
                                }
                            })

                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
                                }
                            })

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
                let studio_id = me.$cookies.get('CSID')
                me.form.studio_id = studio_id
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
