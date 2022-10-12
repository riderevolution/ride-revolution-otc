<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Revenue Summary</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">This report classifies gift cards and store credits as income. It excludes tax and refunds.</h2>
                        </div>
                        <div class="actions">
                            <download-csv
                                class="hidden me"
                                :data="revenueSummaryAttributes"
                                :name="`revenue-summary-${exported_report}-report-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-button="true" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-button="true" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total: Php {{ form.total }}</div>
                    </div>
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Total Revenue</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res" v-if="res.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.name }}</td>
                                <td>Php {{ totalCount(data.total) }}</td>
                                <td width="105px">
                                    <template v-if="data.values.length > 0">
                                        <div class="table_actions">
                                            <a href="#" class="table_action_edit pointer" @click.prevent="exportRevenue(data)">Export</a>
                                        </div>
                                    </template>
                                </td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(value, key) in data.values" :key="key">
                                                    <td>{{ getName(data, value)  }}</td>
                                                    <td>Php {{ totalCount(value.revenue) }}</td>
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
                                <td colspan="8">No Result(s) Found.</td>
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
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    total: 0
                },
                res: [],
                values: [],
                name: 'Revenue Summary',
                access: true,
                loaded: false,
                type: '',
                exported_report: ''
            }
        },
        computed: {
            revenueSummaryAttributes () {
                const me = this

                switch (me.type) {
                    case 'class_package':
                        return [
                            ...me.values.map((value, key) => ({
                                'Schedule Date': me.$moment(value.scheduled_date.date).format('MMMM DD, YYYY'),
                                'Status': value.scheduled_date.status,
                                'Transaction Date': me.$moment(value.user_package_count.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                                'Reference Number': me.getPaymentCode(value.user_package_count),
                                'Payment Method': value.user_package_count.payment_item.payment_method.method,
                                'Class Package': value.user_package_count.class_package.name,
                                'Customer': value.user.fullname,
                                'Email': value.user.email,
                                'Comp Reason': (value.user_package_count.payment_item.payment_method.comp_reason) ? value.user_package_count.payment_item.payment_method.comp_reason : 'N/A',
                                'Note': (value.user_package_count.payment_item.payment_method.note) ? value.user_package_count.payment_item.payment_method.note : 'N/A',
                                'Remarks': (value.user_package_count.payment_item.payment_method.remarks) ? value.user_package_count.payment_item.payment_method.remarks : 'N/A',
                                'Revenue': `Php ${me.totalCount(value.revenue)}`
                            }))
                        ]
                        break
                    case 'gift_card':
                    case 'variant':
                        return [
                            ...me.values.map(value => ({
                                'Studio': me.getPaymentStudio(value.payment),
                                'Customer': (value.payment.user) ? value.payment.user.fullname : 'No Customer',
                                'Email Address': (value.payment.user) ? value.payment.user.email : 'No Customer Email',
                                'Contact Number': (value.payment.user) ? (value.payment.user.customer_details.co_contact_number != null) ? value.payment.user.customer_details.co_contact_number : (value.payment.user.customer_details.ec_contact_number) ? value.payment.user.customer_details.ec_contact_number : 'N/A' : 'No Customer Contact',
                                'Payment ID': value.payment.id,
                                'Reference Number': me.getPaymentCode(value.payment),
                                'Transaction Date': me.$moment(value.payment.created_at).format('MMMM DD, YYYY hh:mm A'),
                                'Promo Code': (value.payment.promo_code_used != null) ? value.payment.promo_code_used : 'No Promo Code Used',
                                'Payment Status': value.payment.status,
                                'Payment Method': me.replacer(value.payment.payment_method.method),
                                'Payment Item Id': value.id,
                                'SKU ID': me.getPaymentItem(value, 'sku'),
                                'Item': me.getPaymentItem(value, 'name'),
                                'Item Category': (value.product_variant) ? value.product_variant.product.category.name : 'N/A',
                                'Quantity': value.quantity,
                                'Discount': `${(value.payment.promo_code_used != null) ? (value.payment.discount) ? value.payment.discount.discount : 0 : 0}`,
                                'Price': `${(value.payment.promo_code_used != null) ? value.total : value.price_per_item}`,
                                'Comp Reason': (value.payment.payment_method.comp_reason) ? value.payment.payment_method.comp_reason : 'N/A',
                                'Note': (value.payment.payment_method.note) ? value.payment.payment_method.note : 'N/A',
                                'Remarks': (value.payment.payment_method.remarks) ? value.payment.payment_method.remarks : 'N/A',
                                'Last Action Taken By': me.getPaymentDetails(value.payment, 'employee')
                            }))
                        ]
                        break
                    case 'class_package_expiration':
                        return [
                            ...me.values.map((value, key) => ({
                                'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                                'Reference Number': me.getPaymentCode(value),
                                'Payment Method': (value.payment_item.payment_method) ? value.payment_item.payment_method.method : 'N/A',
                                'Class Package': value.class_package.name,
                                'Estimated Price Per Class': value.estimated_price_per_class,
                                'Original Count': value.original_package_count,
                                'Used Count': value.count,
                                'Activation Date': (value.activation_date) ? me.$moment(value.activation_date).format('MMM DD, YYYY hh:mm A') : 'N/A',
                                'Expiration Date': (value.computed_expiration_date) ? me.$moment(value.computed_expiration_date).format('MMM DD, YYYY hh:mm A') : 'N/A',
                                'Expiration If Not Activated': (value.expiry_date_if_not_activated) ? me.$moment(value.expiry_date_if_not_activated).format('MMM DD, YYYY hh:mm A') : 'N/A',
                                'Customer': value.user.fullname,
                                'Email': value.user.email,
                                'Comp Reason': (value.payment_item.payment_method.comp_reason) ? value.payment_item.payment_method.comp_reason : 'N/A',
                                'Note': (value.payment_item.payment_method.note) ? value.payment_item.payment_method.note : 'N/A',
                                'Remarks': (value.payment_item.payment_method.remarks) ? value.payment_item.payment_method.remarks : 'N/A',
                                'Revenue': `Php ${me.totalCount(value.revenue)}`
                            }))
                        ]
                        break
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
            getPaymentCode (data) {
                const me = this
                let result = ''

                if (data.payment_item.payment_method) {
                    switch (data.payment_item.payment_method.method) {
                        case 'paypal':
                            if (data.payment_item.payment_method.paypal_transaction_id) {
                                result = data.payment_item.payment_method.paypal_transaction_id
                            } else {
                                result = data.payment.payment_code
                            }
                            break
                        case 'paymaya':
                            result = data.payment_item.payment_method.paymaya_transaction_id
                            break
                        case 'paymongo':
                            result = data.payment_item.payment_method.paymongo_source_id
                            break
                        case 'gcash':
                            result = data.payment_item.payment_method.gcash_reference_number
                            break
                        case 'gc_code':
                            result = `${data.payment.payment_code} - ${data.payment_item.payment_method.gc_code}`
                            break
                        default:
                            result = data.payment.payment_code
                            break
                    }
                } else {
                    result = data.payment.payment_code
                }

                return result
            },
            exportRevenue (data) {
                const me = this
                me.type = data.type

                switch (data.type) {
                    case 'class_package':
                        me.exported_report = 'from-class-packages'
                        break
                    case 'variant':
                        me.exported_report = 'from-products'
                        break
                    case 'class_package_expiration':
                        me.exported_report = 'from-series-expiration'
                        break
                    case 'gift_card':
                        me.exported_report = 'from-gift-cards'
                        break
                }

                let form_data = new FormData()
                form_data.append('start_date', me.form.start_date)
                form_data.append('end_date', me.form.end_date)
                form_data.append('type', data.type);
                form_data.append('export', 1);

                me.loader(true)
                me.$axios.post(`api/reporting/sales/revenue-summary-export`, form_data).then(res => {
                    if (res.data) {
                        me.values = res.data.values
                    }
                }).catch((err) => {
                }).then(() => {
                    me.loader(false)
                    document.querySelector(`.me`).click()
                })
            },
            getName (parent, child) {
                const me = this
                let result = ''

                switch (parent.type) {
                    case 'class_package':
                        result = child.name
                        break
                    case 'variant':
                        result = child.variant
                        break
                    case 'gift_card':
                        result = `${child.card_code}- ${child.class_package.name}`
                        break
                }

                return result
            },
            submissionSuccess () {
                const me = this
                me.fetchData()
            },
            /**
             * Custom toggler for accordion
             * @param  {[object]} event
             * @param  {[int]} key
             * @return {[css]}
             */
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res[key].open ^= true
                if (me.res[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            fetchData () {
                const me = this
                me.form.total = 0
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/sales/revenue-summary', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.groups

                            me.form.total = me.totalCount(res.data.total)
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
                            element.classList.remove('toggled')
                            element.querySelector('.accordion_table').style.height = 0
                        })
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
            }, 300)
        }
    }
</script>
