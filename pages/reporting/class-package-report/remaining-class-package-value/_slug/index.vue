<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/reporting/class-package-report/remaining-class-package-value?type=${form.type}&cut_off_date=${form.cut_off_date}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Remaining Package Value</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ package.name }}</h1>
                                <span>Cut Off Date {{ $moment(form.cut_off_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of {{ package.name }}.</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getSales()" v-if="res.values.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.values.data.length > 0"
                                class="hidden me"
                                :data="remainingPackageValueSlugAttributes"
                                :name="`remaining-class-package-${form.type}-${$route.params.slug}-${$moment(form.cut_off_date).format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>

                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="status" :value="form.class_package_status">
                            <input type="hidden" name="days" :value="form.days">
                            <input type="hidden" name="type" :value="form.type">
                            <input type="hidden" name="id" :value="form.id">
                            <input type="hidden" name="cut_off_date" :value="form.cut_off_date">
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Purchase Location</th>
                                <th class="sticky">Customer Name</th>
                                <th class="sticky">Package Name</th>
                                <th class="sticky">Starting Count</th>
                                <th class="sticky">Remaining Count</th>
                                <th class="sticky">Starting Value</th>
                                <th class="sticky">Remaining Value</th>
                                <th class="sticky">Date of Purchase</th>
                                <th class="sticky">Package Status</th>
                                <th class="sticky">Package Expiration</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.values.data.length > 0">
                            <tr>
                                <td colspan="3"><b>Total</b></td>
                                <td><b>{{ (res.summary.starting_count != 'Unlimited') ? totalItems(res.summary.starting_count) : res.summary.starting_count }}</b></td>
                                <td><b>{{ (res.summary.remaining_count != 'Unlimited') ? totalItems(res.summary.remaining_count) : res.summary.remaining_count }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.starting_value) }}</b></td>
                                <td colspan="4"><b>Php {{ totalCount(res.summary.remaining_value) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.values.data" :key="key" v-if="res.values.data.length > 0">
                                <td>{{ (data.payment.studio) ? data.payment.studio.name : 'Old Package/Online Sale' }}</td>
                                <td>
                                    <div class="thumb">
                                        <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)" v-if="data.user != null">{{ data.user.fullname }}</div>
                                        <div v-else>N/A</div>
                                    </div>
                                </td>
                                <td>{{ data.class_package.name }}</td>
                                <td>{{ data.starting_class_count }}</td>
                                <td>{{ data.remaining_class_count }}</td>
                                <td>Php {{ totalCount(data.starting_value) }}</td>
                                <td>Php {{ totalCount(data.remaining_value) }}</td>
                                <td>{{ $moment(data.payment.created_at).format('MMM DD, YYYY hh:mm A') }}</td>
                                <td>{{ getPackageStatus(data) }}</td>
                                <td>{{ $moment((data.computed_expiration_date) ? data.computed_expiration_date : data.expiry_date_if_activated).format('MMM DD, YYYY hh:mm A') }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination
                        :apiRoute="res.values.path"
                        :current="res.values.current_page"
                        :last="res.values.last_page"
                    />
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
                name: 'Remaining Class Package Value',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                package: [],
                total: [],
                form: {
                    cut_off_date: this.$moment().format('YYYY-MM-DD'),
                    type: '',
                    class_package_status: '',
                    days: '',
                    id: 0
                }
            }
        },
        computed: {
            remainingPackageValueSlugAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': me.getPaymentStudio(value.payment),
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value.payment),
                        'Payment Method': (value.payment.payment_method) ? value.payment.payment_method.method : 'N/A',
                        'Class Package': value.class_package.name,
                        'Class Package SKU ID': value.class_package.sku_id,
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
            getPackageStatus (value) {
                let result = '',
                    current = this.$moment(this.$route.query.cut_off_date),
                    expiry = this.$moment((value.computed_expiration_date != null) ? value.computed_expiration_date : value.expiry_date_if_not_activated)

                if (parseInt(expiry.diff(current)) <= 0) {
                    result = 'Expired'
                } else {
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
                    result = 'Old Package/Online Sale'
                }

                return result
            },
            getPaymentCode (payment) {
                const me = this
                let result = ''

                if (payment.payment_method) {
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
                        case 'gcash':
                            result = payment.payment_method.gcash_reference_number
                            break
                        case 'gc_code':
                            result = `${payment.payment_code} - ${payment.payment_method.gc_code}`
                            break
                        default:
                            result = payment.payment_code
                            break
                    }
                } else {
                    result = payment.payment_code
                }

                return result
            },
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/packages/remaining-class-package-value/${me.$route.params.slug}?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.values.forEach((item, key) => {
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
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()

                if (me.$route.query.cut_off_date) me.form.cut_off_date = me.$route.query.cut_off_date
                if (me.$route.query.id) me.form.id = me.$route.query.id
                if (me.$route.query.type) me.form.type = me.$route.query.type
                if (me.$route.query.status) me.form.class_package_status = me.$route.query.status
                if (me.$route.query.days) me.form.days = me.$route.query.days

                formData.append('id', me.form.id)
                formData.append('cut_off_date', me.form.cut_off_date)
                formData.append('status', me.form.class_package_status)
                formData.append('days', me.form.days)
                formData.append('type', me.form.type)

                me.$axios.post(`api/reporting/packages/remaining-class-package-value/${me.$route.params.slug}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.package = res.data.class_package
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
