<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Outstanding Store Credits</h1>
                            </div>
                            <h2 class="header_subtitle">Store credits owned by Ride Revolution members</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/customer/outstanding-credits`" target="_blank" class="action_btn alternate">Print</a>
                            <div class="action_btn alternate" @click="getCustomers()" v-if="res.results.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.results.data.length > 0"
                                class="hidden me"
                                :data="outstadingCreditsAttributes"
                                :name="`outstanding-credits-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="fetchData()">
                            <div class="form_group alternate">
                                <label for="q">Find a Customer</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate" v-model="form.query">
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                    <div class="action_buttons">
                        <div class="actions nmb">
                            <div class="total">Total Store Credits: Php {{ totalCount(total) }}</div>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Member ID</th>
                                <th class="stick">Customer</th>
                                <th class="stick">Customer Type</th>
                                <th class="stick">Cumulative Store Credits</th>
                                <th class="stick">Total Spent</th>
                                <th class="stick">Remaining Store Credits</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Email Address</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.results.data.length > 0">
                            <tr v-for="(data, key) in res.results.data" :key="key">
                                <td>{{ data.member_id }}</td>
                                <td>
                                    <nuxt-link :to="`/reporting/customer-report/outstanding-credits/${data.id}`" class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link">{{ data.fullname }}</div>
                                    </nuxt-link>
                                </td>
                                <td>{{ data.customer_details.customer_type.name }}</td>
                                <td class="blue">Php {{ totalCount(data.total_store_credits_bought) }}</td>
                                <td class="red">Php {{ totalCount(data.store_credits.amount) }}</td>
                                <td class="green">Php {{ totalCount(-(parseInt(data.store_credits.amount) - parseInt(data.total_store_credits_bought))) }}</td>
                                <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A' }}</td>
                                <td>{{ data.email }}</td>
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
                name: 'Outstanding Credits',
                access: true,
                loaded: false,
                filter: true,
                rowCount: 0,
                status: 'all',
                total: 0,
                res: [],
                values: [],
                form: {
                    query: ''
                }
            }
        },
        computed: {
            outstadingCreditsAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Transaction Date': me.$moment(value.payment.created_at).format('MMM DD, YYYY hh:mm A'),
                        'Reference Number': me.getPaymentCode(value.payment),
                        'Item': me.getPaymentLineItem(value.payment_item),
                        'Quantity': value.payment_item.quantity,
                        'Total': value.payment_item.total,
                        'Status': value.payment.status,
                        'Method': value.payment.payment_method.method,
                        'Refunded': (value.payment_item.refunded) ? 'Yes' : 'No',
                        'Refund Types': (value.payment_item.refund_types) ? value.payment_item.refund_types : 'N/A',
                        'Refund Remarks': (value.payment_item.refund_remarks) ? value.payment_item.refund_remarks : 'N/A',
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

                if (payment_item.store_credit) {
                    result = payment_item.store_credit.name
                } else {
                    result = payment_item.class_package.name
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
            getCustomers () {
                const me = this
                let formData = new FormData()
                formData.append('q', me.form.query)
                formData.append('all', 1)
                formData.append('export', 1)

                me.values = []
                me.loader(true)
                me.$axios.post('api/exports/customer-report/outstanding-store-credits', formData).then(res => {
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
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('q', me.form.query)

                me.$axios.post('api/reporting/customers/outstanding-store-credits', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total = res.data.total_store_credits
                            me.res = res.data

                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
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
