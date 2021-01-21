<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales Export</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <download-csv
                            class="hidden me"
                            :data="salesExportAttributes"
                            :name="`sales-export-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                            Export
                        </download-csv>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="0" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                    <option value="os">Website/Online Sales</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Export</button>
                        </form>
                    </div>
                </section>
                <section id="content">
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
                name: 'Sales Export',
                access: true,
                loaded: false,
                values: [],
                studios: [],
                studio: [],
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: ''
                }
            }
        },
        computed: {
            salesExportAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
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
                        if (payment.payment_method.paypal_transaction_id) {
                            result = payment.payment_method.paypal_transaction_id
                        } else {
                            result = payment.payment_code
                        }
                        break
                    case 'paymaya':
                        result = payment.payment_method.paymaya_transaction_id
                        break
                    default:
                        result = payment.payment_code
                }

                return result
            },
            submissionSuccess () {
                const me = this
                me.loader(true)

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)

                me.values = []

                me.$axios.post('api/reporting/sales/sales-export', formData).then(res => {
                    setTimeout( () => {
                        res.data.sales.forEach((parent, key) => {
                            parent.payment_items.forEach((child, key) => {
                                child.parent = parent
                                me.values.push(child)
                            })
                        })
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        document.querySelector('.me').click()
                    }, 500)
                })
            },
            fetchExtraAPI () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let studio_id = me.$cookies.get('CSID')
                me.$axios.get('api/studios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                        me.form.studio_id = studio_id
                        me.$axios.get(`api/studios/${studio_id}`).then(res => {
                            me.studio = res.data.studio
                        })
                        me.loaded = true
                    }
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchExtraAPI()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
