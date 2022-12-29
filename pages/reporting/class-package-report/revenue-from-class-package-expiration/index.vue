<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Revenue From Class Package Expiration</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Expiration details of each class package</h2>
                        </div>
                        <div class="actions">
                            <!-- <a :href="`/print/reporting/class-package/remaining-package-value?start_date=${form.start_date}`" target="_blank" class="action_btn alternate">Print</a> -->

                            <div class="action_btn alternate" @click="getPackages()" v-if="res.groups.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.groups.length > 0"
                                class="hidden me"
                                :data="classPackageExpirationAttributes"
                                :name="`class-package-expiration-${$moment(form.start_date).format('MM-DD-YY-hh-mm')}-${$moment(form.end_date).format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'" :max-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :max-date="$moment().format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
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
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.groups" v-if="res.groups.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.name }}</td>
                                <td>Php {{ totalCount(data.revenue) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Package Type</th>
                                                    <th>Class Package</th>
                                                    <th>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(value, key) in data.values" :key="key">
                                                    <td>{{ value.package_type.name }}</td>
                                                    <td>{{ value.name }}</td>
                                                    <td>Php {{ totalCount((data.not_activated) ? value.expiration_revenue : value.expired_revenue) }}</td>
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
                        <tbody class="no_results" v-if="res.groups.length == 0">
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
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
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
            classPackageExpirationAttributes () {
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
                        'Comp Reason': (value.payment.payment_method) ? value.payment.payment_method.comp_reason : 'N/A',
                        'Note': (value.payment.payment_method) ? value.payment.payment_method.note : 'N/A',
                        'Remarks': (value.payment.payment_method) ? value.payment.payment_method.remarks : 'N/A',
                        'Last Action Taken By': me.getPaymentDetails(value.payment, 'employee')
                    }))
                ]
            }
        },
        methods: {
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.groups[key].open ^= true
                if (me.res.groups[key].open) {
                    if (target.parentNode.parentNode.querySelector('.accordion_table')) {
                        target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                    }
                } else {
                    if (target.parentNode.parentNode.querySelector('.accordion_table')) {
                        target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                    }
                }
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
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', me.tab)

                me.loader(true)
                me.$axios.post('api/reporting/packages/class-package-expiration', formData).then(res => {
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
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', me.tab)
                formData.append('all', 1)
                me.values = []
                me.loader(true)
                me.$axios.post('api/reporting/packages/class-package-expiration', formData).then(res => {
                    if (res.data) {
                        me.values = res.data.values
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
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', 'studio')
                me.$axios.post('api/reporting/packages/class-package-expiration', formData).then(res => {
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
