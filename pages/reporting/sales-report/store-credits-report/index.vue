<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Store Credits Report</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of store credits per customers</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <div class="action_btn alternate" @click="getSales()" v-if="res.results.data.length > 0">
                                    Export
                                </div>
                                <download-csv
                                    v-if="res.results.data.length > 0"
                                    class="hidden me"
                                    :data="storeCreditsAttributes"
                                    :name="`store-credits-report-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
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
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
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
                                <th class="sticky">Contact No.</th>
                                <th class="sticky">Cumulative Store Credits</th>
                                <th class="sticky">Total Spent</th>
                                <th class="sticky">Remaining Store Credits</th>
                                <th class="sticky">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.results.data.length > 0">
                            <tr v-for="(data, key) in res.results.data" :key="key">
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
                                <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A' }}</td>
                                <td class="blue">Php {{ totalCount(data.total_store_credits_bought) }}</td>
                                <td class="red">Php {{ totalCount(data.store_credits.amount) }}</td>
                                <td class="green">Php {{ totalCount(-(parseInt(data.store_credits.amount) - parseInt(data.total_store_credits_bought))) }}</td>
                                <td width="175px">
                                    <div class="table_actions">
                                        <a href="#" class="table_action_edit pointer" @click.prevent="openWindowInside(data)">View Transactions</a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.results.path" :current="res.results.current_page" :last="res.results.last_page" />
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
                name: 'Store Credits Report',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                studios: [],
                values: [],
                total_count: 0,
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: 0
                }
            }
        },
        computed: {
            storeCreditsAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value.payment),
                        'Item': value.payment_item.store_credit.name,
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
                        'Last Action Taken By': (value.payment.employee) ? value.payment.employee.fullname : 'Customer'
                    }))
                ]
            }
        },
        methods: {
            openWindowInside (data) {
                const me = this
                window.open(`${me.$route.path}/${data.id}/view?start_date=${me.form.start_date}&end_date=${me.form.end_date}&studio_id=${me.form.studio_id}`, '_blank')
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
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
                formData.append('export', 1)
                me.values = []

                me.loader(true)
                me.$axios.post('api/reporting/sales/store-credits-report', formData).then(res => {
                    me.values = res.data.results
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/store-credits-report', formData).then(res => {
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
                let token = me.$cookies.get('70hokcotc3hhhn5')

                formData.append('studio_id', me.form.studio_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)

                me.$axios.post('api/reporting/sales/store-credits-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data

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
