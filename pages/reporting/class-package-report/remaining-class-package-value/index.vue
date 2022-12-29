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
                            <!-- <a :href="`/print/reporting/class-package/remaining-package-value?cut_off_date=${form.cut_off_date}`" target="_blank" class="action_btn alternate">Print</a> -->
                            <div class="action_btn alternate" @click="getPackages()" v-if="res.classPackages.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.classPackages.length > 0"
                                class="hidden me"
                                :data="remainingPackageValueAttributes"
                                :name="`remaining-package-value-${tab}-${$moment(form.cut_off_date).format('MM-DD-YY-hh-mm')}.csv`">
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
                            <div class="form_group margin">
                                <label for="class_package_id">Class Packages</label>
                                <select class="default_select alternate" v-model="form.class_package_id" name="class_package_id">
                                    <option value="" selected>All Class Packages</option>
                                    <option :value="class_package.id" v-for="(class_package, key) in res.filteredPackages" :key="key">{{ class_package.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_package_status">Class Package Status</label>
                                <select class="default_select alternate" v-model="form.class_package_status" name="class_package_status">
                                    <option value="" selected>All Class Package Status</option>
                                    <option value="frozen">Frozen</option>
                                    <option value="active">Active</option>
                                    <option value="not-active">Not Active</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="days">Days</label>
                                <select class="default_select alternate" v-model="form.days" name="days">
                                    <option value="" selected>All Days</option>
                                    <option :value="day.value" v-for="(day, key) in days" :key="key">{{ day.name }}</option>
                                </select>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tab == 'studio') ? 'active' : ''}`" @click="toggleStatus('studio')">Studio</div>
                        <div :class="`status ${(tab == 'online') ? 'active' : ''}`" @click="toggleStatus('online')">Online Class</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Class Package</th>
                                <th class="sticky">Package Type</th>
                                <th class="sticky">Quantity</th>
                                <th class="sticky">Starting Class Count</th>
                                <th class="sticky">Remaining Class Count</th>
                                <th class="sticky">Starting Value</th>
                                <th class="sticky">Remaining Value</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.classPackages.length > 0">
                            <tr class="parent bb">
                                <td colspan="2"><b>Total</b></td>
                                <td><b>{{ totalItems(res.summary.quantity) }}</b></td>
                                <td><b>{{ totalItems(res.summary.starting_class_count) }}</b></td>
                                <td><b>{{ totalItems(res.summary.remaining_class_count) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.starting_value) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.remaining_value) }}</b></td>
                            </tr>
                            <tr v-for="(value, key) in res.classPackages" :key="key">
                                <td>
                                    <div class="table_data_link" @click="openWindowInside(value)">{{ value.name }}</div>
                                </td>
                                <td>{{ value.package_type.name }}</td>
                                <td>{{ value.quantity }}</td>
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
                    cut_off_date: this.$moment().format('YYYY-MM-DD'),
                    class_package_id: '',
                    class_package_status: '',
                    days: ''
                },
                name: 'Remaining Class Package Value',
                access: true,
                filter: true,
                loaded: false,
                res: [],
                tab: 'studio',
                values: [],
                days: [
                    {
                        name: '7 days',
                        value: 7
                    },
                    {
                        name: '14 days',
                        value: 14
                    },
                    {
                        name: '21 days',
                        value: 21
                    },
                    {
                        name: '30 days',
                        value: 30
                    },
                    {
                        name: '60 days',
                        value: 60
                    },
                    {
                        name: '90 days',
                        value: 90
                    },
                    {
                        name: '120 days',
                        value: 120
                    },
                    {
                        name: '180 days',
                        value: 180
                    },
                    {
                        name: '360 days',
                        value: 360
                    }
                ]
            }
        },
        computed: {
            remainingPackageValueAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Studio': me.getPaymentStudio(value.payment),
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value),
                        'Payment Method': (value.payment.payment_method) ? value.payment.payment_method.method : 'N/A',
                        'Class Package': value.class_package.name,
                        'Class Package Price': (value.payment.promo_code_used != null) ? value.payment_item.total : value.payment_item.price_per_item,
                        'Class Package Status': me.getPackageStatus(value),
                        'Estimated Price Per Class': value.estimated_price_per_class,
                        'Original Count': value.original_package_count,
                        'Used Count': value.original_package_count - value.count,
                        'Remaining Credits': value.count,
                        'Remaining Peso Value': value.remaining_value,
                        'Activation Date': (value.class_package.activation_date != 'NA') ? (value.class_package.activation_date != null ? me.$moment(value.class_package.activation_date).format('MMM DD, YYYY hh:mm A') : 'N/A') : 'N/A',
                        'Expiration Date': (value.computed_expiration_date) ? me.$moment(value.computed_expiration_date).format('MMM DD, YYYY hh:mm A') : 'N/A',
                        'Expiration If Not Activated': (value.class_package.expiry_date_if_not_activated) ? me.$moment(value.class_package.expiry_date_if_not_activated).format('MMM DD, YYYY hh:mm A') : 'N/A',
                        'Customer': value.user.fullname,
                        'Email': value.user.email,
                        'Contact Number': (value.user.customer_details.co_contact_number != null) ? value.user.customer_details.co_contact_number : (value.user.customer_details.ec_contact_number) ? value.user.customer_details.ec_contact_number : 'N/A',
                        'Comp Reason': (value.payment.payment_method) ? value.payment.payment_method.comp_reason : 'N/A',
                        'Note': (value.payment.payment_method) ? value.payment.payment_method.note : 'N/A',
                        'Remarks': (value.payment.payment_method) ? value.payment.payment_method.remarks : 'N/A',
                        'Last Action Taken By': me.getPaymentDetails(value.payment, 'employee')
                    }))
                ]
            }
        },
        methods: {
            openWindowInside (data) {
                const me = this
                let query_params = new URLSearchParams()
                query_params.append('id', data.id)
                query_params.append('type', me.tab)
                query_params.append('cut_off_date', me.form.cut_off_date)
                query_params.append('status', me.form.class_package_status)
                query_params.append('days', me.form.days)

                query_params = query_params.toString()
                window.open(`${me.$route.path}/${data.slug}?${query_params}`, '_blank')
            },
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
                    }
                } else {
                    switch (payment_item.type) {
                        case 'class-package':
                        case 'promo-package':
                            result = payment_item.class_package.name
                    }
                }

                return result
            },
            getPaymentDetails (payment, type) {
                const me = this
                let result = 0

                switch (type) {
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
                    result = 'Old Package/Online Sale'
                }

                return result
            },
            getPaymentCode (data) {
                const me = this
                let result = ''

                if (data.payment.payment_method) {
                    switch (data.payment.payment_method.method) {
                        case 'paypal':
                            if (data.payment.payment_method.paypal_transaction_id) {
                                result = data.payment.payment_method.paypal_transaction_id
                            } else {
                                result = data.payment.payment_code
                            }
                            break
                        case 'paymaya':
                            result = data.payment.payment_method.paymaya_transaction_id
                            break
                        case 'paymongo':
                            result = data.payment.payment_method.paymongo_source_id
                            break
                        case 'gcash':
                            result = data.payment.payment_method.gcash_reference_number
                            break
                        case 'gc_code':
                            result = `${data.payment.payment_code} - ${data.payment.payment_method.gc_code}`
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
            toggleStatus (value) {
                const me = this
                me.tab = value

                let formData = new FormData()
                formData.append('cut_off_date', me.form.cut_off_date)
                formData.append('class_package_id', me.form.class_package_id)
                formData.append('class_package_status', me.form.class_package_status)
                formData.append('days', me.form.days)
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

                if (!me.loaded) {
                    if (me.$route.query.cut_off_date) me.form.cut_off_date = me.$route.query.cut_off_date
                    if (me.$route.query.type) me.tab = me.$route.query.type
                }

                formData.append('cut_off_date', me.form.cut_off_date)
                formData.append('class_package_id', me.form.class_package_id)
                formData.append('class_package_status', me.form.class_package_status)
                formData.append('days', me.form.days)
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
