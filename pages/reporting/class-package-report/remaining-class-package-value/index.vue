<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Remaining Package Value</h1>
                                <span>{{ $moment(form.cut_off_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">
                                Summary of rider count and revenue per class schedule
                                <ul>
                                    <li>Classes which are after the cutoff date are excluded</li>
                                    <li>Comps are excluded</li>
                                    <li>The value of unlimiteds is calculated as a ratio of days that the series has been active over the total days to expire of the series</li>
                                </ul>
                            </h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class-package/remaining-package-value?cut_off_date=${form.cut_off_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getPackages()" v-if="res.classPackages.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.classPackages.length > 0"
                                class="hidden me"
                                :data="remainingPackageValueAttributes"
                                :name="`remaining-package-value-${$moment(form.cut_off_date).format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="cut_off_date">Cut Off Date</label>
                                <v-ctk v-model="form.cut_off_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'cut_off_date'" :name="'cut_off_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('cut_off_date')">{{ properFormat(errors.first('cut_off_date')) }}</span></transition>
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
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Starting Class Count</th>
                                <th>Remaining Class Count</th>
                                <th>Starting Value</th>
                                <th>Remaining Value</th>
                            </tr>
                        </thead>
                        <tbody class="content_wrapper">
                            <tr class="parent">
                                <td><b>Total</b></td>
                                <td><b>{{ totalItems(res.summary.starting_class_count) }}</b></td>
                                <td><b>{{ totalItems(res.summary.remaining_class_count) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.starting_value) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.remaining_value) }}</b></td>
                            </tr>
                            <tr></tr>
                        </tbody>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.classPackages" v-if="res.classPackages.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.name }}</td>
                                <td>{{ (data.starting_class_count == 'Unlimited') ? data.starting_class_count : totalItems(data.starting_class_count) }}</td>
                                <td>{{ (data.remaining_class_count == 'Unlimited') ? data.remaining_class_count : totalItems(data.remaining_class_count) }}</td>
                                <td>Php {{ totalCount(data.starting_value) }}</td>
                                <td>Php {{ totalCount(data.remaining_value) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Package Type</th>
                                                    <th>Class Package</th>
                                                    <th>Starting Class Count</th>
                                                    <th>Remaining Class Count</th>
                                                    <th>Starting Value</th>
                                                    <th>Remaining Value</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(value, key) in data.values" :key="key">
                                                    <td>{{ value.package_type.name }}</td>
                                                    <td>{{ value.name }}</td>
                                                    <td>{{ (value.starting_class_count == 'Unlimited') ? value.starting_class_count : totalItems(value.starting_class_count) }}</td>
                                                    <td>{{ (value.remaining_class_count == 'Unlimited') ? value.remaining_class_count : totalItems(value.remaining_class_count) }}</td>
                                                    <td>Php {{ totalCount(value.starting_value) }}</td>
                                                    <td>Php {{ totalCount(value.remaining_value) }}</td>
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
                        <tbody class="no_results" v-if="res.classPackages.length == 0">
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
    import Pagination from '~/components/Pagination'

    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                form: {
                    cut_off_date: this.$moment().format('YYYY-MM-DD')
                    // end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Remaining Class Package Value',
                access: true,
                filter: true,
                loaded: false,
                res: [],
                tab: 'studio',
                values: []
            }
        },
        computed: {
            remainingPackageValueAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value),
                        'Payment Method': (value.payment_item.payment_method) ? value.payment_item.payment_method.method : 'N/A',
                        'Class Package': value.class_package.name,
                        'Class Package Price': value.payment_item.price_per_item,
                        'Class Package Status': me.getPackageStatus(value),
                        'Estimated Price Per Class': value.estimated_price_per_class,
                        'Original Count': value.original_package_count,
                        'Used Count': value.original_package_count - value.count,
                        'Remaining Credits': value.count,
                        'Remaining Peso Value': value.remaining_value,
                        'Activation Date': (value.activation_date) ? me.$moment(value.activation_date).format('MMM DD, YYYY hh:mm A') : 'N/A',
                        'Expiration Date': (value.computed_expiration_date) ? me.$moment(value.computed_expiration_date).format('MMM DD, YYYY hh:mm A') : 'N/A',
                        'Expiration If Not Activated': (value.expiry_date_if_not_activated) ? me.$moment(value.expiry_date_if_not_activated).format('MMM DD, YYYY hh:mm A') : 'N/A',
                        'Customer': value.user.fullname,
                        'Email': value.user.email,
                        'Comp Reason': (value.payment_item.payment_method) ? value.payment_item.payment_method.comp_reason : 'N/A',
                        'Note': (value.payment_item.payment_method) ? value.payment_item.payment_method.note : 'N/A',
                        'Remarks': (value.payment_item.payment_method) ? value.payment_item.payment_method.remarks : 'N/A'
                    }))
                ]
            }
        },
        methods: {
            getPackageStatus (value) {
                let result = ''

                if (value.frozen) {
                    result = 'Frozen'
                    if (value.activation_date == 'N/A' || !value.activation_date) {
                        result += ' & Not Activated'
                    }
                } else {
                    if (value.activation_date == 'N/A' || !value.activation_date) {
                        result = 'Not Activated'
                    } else {
                        result = 'Active'
                    }
                }

                return result
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
            getPaymentCode (data) {
                const me = this
                let result = ''

                if (data.payment_item.payment_method) {
                    switch (data.payment_item.payment_method.method) {
                        case 'paypal':
                            result = data.payment_item.payment_method.paypal_transaction_id
                            break
                        case 'paymaya':
                            result = data.payment_item.payment_method.paymaya_transaction_id
                            break
                        case 'paymongo':
                            result = data.payment_item.payment_method.paymongo_source_id
                            break
                        default:
                            result = data.payment.payment_code
                    }
                } else {
                    result = data.payment.payment_code
                }

                return result
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
                me.res.classPackages[key].open ^= true
                if (me.res.classPackages[key].open) {
                    if (target.parentNode.parentNode.querySelector('.accordion_table')) {
                        target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                    }
                } else {
                    if (target.parentNode.parentNode.querySelector('.accordion_table')) {
                        target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                    }
                }
            },
            toggleStatus (value) {
                const me = this
                me.tab = value

                let formData = new FormData()
                formData.append('cut_off_date', me.form.cut_off_date)
                formData.append('type', me.tab)

                me.loader(true)
                me.$axios.post('api/reporting/packages/remaining-class-package-value', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            if (element.querySelector('.accordion_table')) {
                                element.querySelector('.accordion_table').style.height = 0
                            }
                        })
                    }, 500)
                })
            },
            getPackages () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('type', me.tab)

                me.values = []
                me.loader(true)
                me.$axios.post('api/reporting/packages/remaining-class-package-value-export', formData).then(res => {
                    if (res.data) {
                        res.data.values.forEach((item, index) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            submissionSuccess () {
                const me = this
                me.fetchData()
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('cut_off_date', me.form.cut_off_date)
                formData.append('type', me.tab)
                me.$axios.post('api/reporting/packages/remaining-class-package-value', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            if (element.querySelector('.accordion_table')) {
                                element.querySelector('.accordion_table').style.height = 0
                            }
                        })
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data != 0) {
                        setTimeout( () => {
                            me.form.studio_id = res.data.user.current_studio_id
                            me.fetchData()
                        }, 500)
                    }
                }).catch(err => {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
