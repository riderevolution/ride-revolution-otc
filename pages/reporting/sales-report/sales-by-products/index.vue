<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Products</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from products sold</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/products?studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                                <div class="action_btn alternate" @click="getSales()" v-if="res.length > 0">
                                    Export
                                </div>

                                <download-csv
                                    v-if="res.length > 0"
                                    class="hidden me"
                                    :data="productsAttributes"
                                    :name="`sales-by-products-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
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
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Item</th>
                                <th class="sticky">Sold</th>
                                <th class="sticky">Returned</th>
                                <th class="sticky">Comp</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Taxes</th>
                                <th class="sticky">Gross</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Profit</th>
                                <th class="sticky">Cost</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>{{ total.returned }}</b></td>
                                <td><b>{{ total.comp }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(total.gross) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link :event="''" class="table_data_link" :to="`${$route.path}/${convertToSlug(data.name)}`" @click.native="toggleInnerReport(`${(data.name == 'Gift Cards') ? 'gift-card' : 'product-variant'}`, `${$route.path}/${convertToSlug(data.name)}`, data.id)">{{ data.name }}</nuxt-link>
                                </td>
                                <td>{{ (data.sold) ? data.sold : 0 }}</td>
                                <td>{{ (data.returned) ? data.returned : 0 }}</td>
                                <td>{{ (data.comp) ? data.comp : 0 }}</td>
                                <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                <td>Php {{ (data.gross) ? totalCount(data.gross) : 0 }}</td>
                                <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                <td :class="`${(data.total_profit) ? (data.total_profit <= 0 ? 'red' : 'green') : ''}`">Php {{ (data.total_profit) ? totalCount(data.total_profit) : 0 }}</td>
                                <td>Php {{ (data.total_cost) ? totalCount(data.total_cost) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
                            </tr>
                        </tbody>
                    </table>
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
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Sales by Products',
                access: true,
                loaded: false,
                rowCount: 0,
                studios: [],
                values: [],
                res: [],
                total: [],
                total_count: 0,
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: 0
                }
            }
        },
        computed: {
            productsAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Reference Number': me.getPaymentCode(value.parent),
                        'Transaction Date': me.$moment(value.parent.updated_at).format('MMMM DD, YYYY hh:mm A'),
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
                        'Username': me.getPaymentDetails(value.parent, 'employee')
                    }))
                ]
            },
        },
        methods: {
            getSales () {
                const me = this
                me.loader (true)
                me.values = []
                let formData = new FormData(document.getElementById('filter'))
                formData.append('export', 1)

                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        res.data.payments.forEach((parent, key) => {
                            parent.payment_items.forEach((child, key) => {
                                child.parent = parent
                                me.values.push(child)
                            })
                        })
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
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
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != 0) {
                    me.studios.forEach((studio, index) => {
                        if (studio.id == me.form.studio_id) {
                            result = studio.name
                        }
                    })
                } else {
                    result = 'All Studios'
                }
                return result
            },
            toggleInnerReport (type, path, id) {
                const me = this
                window.open(`${path}?studio_id=${me.form.studio_id}&slug=${type}&id=${id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`, '_blank')
            },
            submitFilter () {
                const me = this
                me.values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.total_count
                            me.res = res.data.result
                            me.total = res.data.total
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
            },
            fetchData () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                if (me.form.studio_id != '') {
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.total_count
                            me.res = res.data.result
                            me.total = res.data.total

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
