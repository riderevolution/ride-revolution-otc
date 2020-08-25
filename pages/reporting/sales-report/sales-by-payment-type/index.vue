<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Payment Type</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income for each payment type, except store credit.</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/payment-type?status=${status}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                            <download-csv
                                class="action_btn alternate margin"
                                :data="paymentTypeAttributes"
                                :name="`sales-by-payment-type-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" v-model="form.studio_id" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ errors.first('start_date') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(status == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                        <div :class="`status ${(status == 'paid') ? 'active' : ''}`" @click="toggleTab('paid')">Paid</div>
                        <div :class="`status ${(status == 'pending') ? 'active' : ''}`" @click="toggleTab('pending')">Pending</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th>Payment</th>
                                <th>Transaction Count</th>
                                <th>Gross Receipts</th>
                                <th>Gross Refunds</th>
                                <th>Sales Tax</th>
                                <th>Refund Tax</th>
                                <th>Net of Receipts</th>
                                <th>Net of Refunds</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>{{ payment_total.name }}</b></td>
                                <td><b>{{ payment_total.transaction_count }}</b></td>
                                <td><b>Php {{ totalCount(payment_total.gross_receipts) }}</b></td>
                                <td><b>Php {{ totalCount(payment_total.gross_refunds) }}</b></td>
                                <td><b>Php {{ totalCount(payment_total.sales_tax) }}</b></td>
                                <td><b>Php {{ totalCount(payment_total.sales_tax) }}</b></td>
                                <td><b>Php {{ totalCount(payment_total.net_receipts) }}</b></td>
                                <td><b>Php {{ totalCount(payment_total.net_refunds) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link :event="''" class="table_data_link" :to="`${$route.path}/${data.unique}`" @click.native="toggleInnerReport(`${$route.path}/${data.unique}`)">{{ data.name }}</nuxt-link>
                                </td>
                                <td>{{ data.transaction_count }}</td>
                                <td>Php {{ totalCount(data.gross_receipts) }}</td>
                                <td>Php {{ totalCount(data.gross_refunds) }}</td>
                                <td>Php {{ totalCount(data.sales_tax) }}</td>
                                <td>Php {{ totalCount(data.sales_tax) }}</td>
                                <td>Php {{ totalCount(data.net_receipts) }}</td>
                                <td>Php {{ totalCount(data.net_refunds) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="cms_table_toggler">
                        <a :href="`/print/reporting/sales/payment-type/register-sales-summary?status=${status}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                        <download-csv
                            class="action_btn alternate"
                            :data="registerSalesSummaryAttributes"
                            :name="`register-sales-summary-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                            Export
                        </download-csv>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th colspan="3" class="cms_table_title">
                                    <span>Register Sales Summary</span>
                                    <span class="date">{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                                </th>
                            </tr>
                            <tr>
                                <th>Branch</th>
                                <th>Subtotal</th>
                                <th>Tax</th>
                                <th>Refund Subtotal</th>
                                <th>Refund Tax</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>{{ studio_total.name }}</b></td>
                                <td><b>Php {{ totalCount(studio_total.subtotal) }}</b></td>
                                <td><b>Php {{ totalCount(studio_total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(studio_total.subtotal_refund) }}</b></td>
                                <td><b>Php {{ totalCount(studio_total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(studio_total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in studio_res" :key="key">
                                <td>{{ data.name }}</td>
                                <td>Php {{ (data.subtotal) ? totalCount(data.subtotal) : 0 }}</td>
                                <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                <td>Php {{ (data.subtotal_refund) ? totalCount(data.subtotal_refund) : 0 }}</td>
                                <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Sales by Payment Type',
                access: true,
                loaded: false,
                rowCount: 0,
                status: 'all',
                studios: [],
                values: [],
                summary_values: [],
                res: [],
                studio_res: [],
                payment_total: [],
                studio_total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: ''
                }
            }
        },
        computed: {
            paymentTypeAttributes () {
                const me = this
                return [
                    ...this.values.map(value => ({
                        'Payment': value.name,
                        'Payment Status': this.status,
                        'Transaction Count': value.transaction_count,
                        'Gross Receipts': value.gross_receipts,
                        'Gross Refunds': value.gross_refunds,
                        'Sales Tax': value.sales_tax,
                        'Refund Tax': value.sales_tax,
                        'Net of Receipts': value.net_receipts,
                        'Net of Refunds': value.net_refunds
                    }))
                ]
            },
            registerSalesSummaryAttributes () {
                const me = this
                return [
                    ...this.summary_values.map(value => ({
                        'Branch': value.name,
                        'Subtotal': (value.subtotal) ? value.subtotal : 0,
                        'Tax': (value.total_tax) ? value.total_tax : 0,
                        'Refund Subtotal': (value.subtotal_refund) ? value.subtotal_refund : 0,
                        'Refund Tax': (value.total_tax) ? value.total_tax : 0,
                        'Total': (value.total_income) ? value.total_income : 0
                    }))
                ]
            }
        },
        methods: {
            toggleInnerReport (path) {
                const me = this
                if (me.form.studio_id != '') {
                    me.$router.push(`${path}?status=${me.status}&studio_id=${me.form.studio_id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
                } else {
                    me.$router.push(`${path}?status=${me.status}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
                }
            },
            toggleTab (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                formData.append('status', me.status)
                me.$axios.post('api/reporting/sales/sales-by-payment-type', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.payment_total = res.data.payment_grand_total
                            me.studio_res = res.data.studio_sales_summary
                            me.studio_total = res.data.studio_grand_total
                            console.log(res.data);
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
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                formData.append('status', value)
                if (me.form.studio_id != '') {
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-by-payment-type', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.values = res.data.result
                            me.payment_total = res.data.payment_grand_total
                            me.values.push(res.data.payment_grand_total)

                            me.studio_res = res.data.studio_sales_summary
                            me.summary_values = res.data.studio_sales_summary
                            me.studio_total = res.data.studio_grand_total
                            me.summary_values.push(res.data.studio_grand_total)

                            let token = me.$cookies.get('70hokcotc3hhhn5')

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
                me.fetchData('all')
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
