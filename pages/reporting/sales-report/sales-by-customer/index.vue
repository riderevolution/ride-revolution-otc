<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Customer</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Total sales from each Ride Revolution member</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/customer?customer_type_id=${form.customer_type_id}&gender=${form.gender}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                                <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                    Export
                                </div>
                                <download-csv
                                    v-if="res.result.data.length > 0"
                                    class="hidden me"
                                    :data="customerAttributes"
                                    :name="`sales-by-customer-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                    Export
                                </download-csv>

                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="customer_type_id">Customer Type</label>
                                <select class="default_select alternate" name="customer_type_id" v-model="form.customer_type_id">
                                    <option value="" selected>All Customer Type</option>
                                    <option :value="type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="gender">Gender</label>
                                <select class="default_select alternate" name="gender" v-model="form.gender">
                                    <option value="" selected>All Gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
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
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Type</th>
                                <th class="sticky">Email</th>
                                <th class="sticky">Class Package Total</th>
                                <th class="sticky">Gift Card Total</th>
                                <th class="sticky">Store Credits Total</th>
                                <th class="sticky">Merchandise Total</th>
                                <th class="sticky">Total Comp</th>
                                <th class="sticky">Total Gross</th>
                                <th class="sticky">Total Discount</th>
                                <th class="sticky">Total Net</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr v-for="(data, key) in res.result.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                                    </div>
                                </td>
                                <td>{{ data.customer_details.customer_type.name }}</td>
                                <td>{{ data.email }}</td>
                                <td>Php {{ totalCount(data.total_class_package) }}</td>
                                <td>Php {{ totalCount(data.total_gift_card) }}</td>
                                <td>Php {{ totalCount(data.total_store_credit) }}</td>
                                <td>Php {{ totalCount(data.total_merchandise) }}</td>
                                <td>Php {{ totalCount(data.total_comp) }}</td>
                                <td>Php {{ totalCount(data.total_income) }}</td>
                                <td>Php {{ totalCount(data.total_discount) }}</td>
                                <td>Php {{ totalCount(data.total_net) }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
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
                name: 'Sales by Customer',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                status: 1,
                res: [],
                values: [],
                types: [],
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    gender: '',
                    customer_type_id: ''
                }
            }
        },
        computed: {
            customerAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value.payment),
                        'Item': me.getPaymentLineItem(value.payment_item),
                        'Quantity': value.payment_item.quantity,
                        'Total': value.payment_item.total,
                        'Status': value.payment.status,
                        'Method': value.payment.payment_method.method,
                        'Studio': (value.payment.studio) ? value.payment.studio.name : 'Website/Online',
                        'Customer': value.customer.fullname,
                        'Member ID': value.customer.member_id,
                        'Customer Type': value.customer.customer_details.customer_type.name,
                        'Email Address': value.customer.email,
                        'Contact Number': (value.customer.customer_details.co_contact_number != null) ? value.customer.customer_details.co_contact_number : (value.customer.customer_details.ec_contact_number) ? value.customer.customer_details.ec_contact_number : 'N/A',
                        'Comp Reason': (value.payment.payment_method.comp_reason) ? value.payment.payment_method.comp_reason : 'N/A',
                        'Note': (value.payment.payment_method.note) ? value.payment.payment_method.note : 'N/A',
                        'Remarks': (value.payment.payment_method.remarks) ? value.payment.payment_method.remarks : 'N/A',
                        'Last Action Taken By': (value.payment.employee) ? value.payment.employee.fullname : 'No Employee'
                    }))
                ]
            }
        },
        methods: {
            getPaymentLineItem (payment_item) {
                const me = this
                let result = ''

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
                        result = payment.payment_method.paymongo_transaction_id
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
                me.$axios.post('api/exports/sales-report/sales-by-customer', formData).then(res => {
                    if (res.data) {
                        res.data.results.forEach((item, key) => {
                            me.values.push(item)
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
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/sales-by-customer', formData).then(res => {
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
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/sales/sales-by-customer', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data

                            me.$axios.get('api/extras/customer-types').then(res => {
                                if (res.data) {
                                    me.types = res.data.customerTypes
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
