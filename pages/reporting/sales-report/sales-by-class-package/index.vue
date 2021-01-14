<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Class Package</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from class package sold.</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/class-package?start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="classPackageAttributes"
                                :name="`sales-by-class-package-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tab == 'studio') ? 'active' : ''}`" @click="toggleStatus('studio')">Studio</div>
                        <div :class="`status ${(tab == 'online') ? 'active' : ''}`" @click="toggleStatus('online')">Online</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Package</th>
                                <th class="sticky">Sold</th>
                                <th class="sticky">Returned</th>
                                <th class="sticky">Comp</th>
                                <th class="sticky">Gross</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Taxes</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr class="parent bb">
                                <td><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>{{ total.returned }}</b></td>
                                <td><b>{{ total.comp }}</b></td>
                                <td><b>Php {{ totalCount(total.gross) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.result.data" :key="key">
                                <td>
                                    <div class="table_data_link" @click="openWindowInside(data)">{{ data.name }}</div>
                                </td>
                                <td>{{ (data.sold) ? data.sold : 0 }}</td>
                                <td>{{ (data.returned) ? data.returned : 0 }}</td>
                                <td>{{ (data.comp) ? data.comp : 0 }}</td>
                                <td>Php {{ (data.gross) ? totalCount(data.gross) : 0 }}</td>
                                <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="9">No Result(s) Found.</td>
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
                name: 'Sales by Class Package',
                access: true,
                filter: true,
                loaded: false,
                res: [],
                values: [],
                total: [],
                tab: 'studio',
                form: {
                    start_date: this.$moment().subtract(1, 'day').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            classPackageAttributes () {
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
            openWindowInside (data) {
                const me = this
                window.open(`${me.$route.path}/${data.slug}?slug=class-package&id=${data.id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`, '_blank')
            },
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-class-package?all=1&export=1`, formData).then(res => {
                    if (res.data) {
                        res.data.payment_items.forEach((data, key) => {
                            me.values.push(data)
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
            toggleStatus (value) {
                const me = this
                me.tab = value

                let formData = new FormData(document.getElementById('filter'))
                formData.append('type', me.tab)

                me.loader(true)
                me.$axios.post('api/reporting/sales/sales-by-class-package', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total

                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            submitFilter () {
                const me = this
                me.values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                formData.append('type', me.tab)

                me.$axios.post('api/reporting/sales/sales-by-class-package', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total

                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()

                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                formData.append('type', me.tab)
                
                me.$axios.post('api/reporting/sales/sales-by-class-package', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total

                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {

                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                }

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
