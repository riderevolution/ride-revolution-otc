<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
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
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="start_date">Start Date</label>
                                <input type="date" name="start_date" v-model="form.start_date" class="default_text date" />
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date</label>
                                <input type="date" name="end_date" v-model="form.end_date"  class="default_text date" />
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
                    <table class="cms_table">
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
                                <td><b>Php 0</b></td>
                                <td><b>Php {{ totalCount(payment_total.sales_tax) }}</b></td>
                                <td><b>Php 0</b></td>
                                <td><b>Php {{ totalCount(payment_total.net_receipts) }}</b></td>
                                <td><b>Php 0</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link class="table_data_link" :to="`${$route.path}/${data.unique}`">{{ data.name }}</nuxt-link>
                                </td>
                                <td>{{ data.transaction_count }}</td>
                                <td>Php {{ totalCount(data.gross_receipts) }}</td>
                                <td>Php 0</td>
                                <td>Php {{ totalCount(data.sales_tax) }}</td>
                                <td>Php 0</td>
                                <td>Php {{ totalCount(data.net_receipts) }}</td>
                                <td>Php 0</td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="cms_table">
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
                                <td><b>Php 0</b></td>
                                <td><b>Php 0</b></td>
                                <td><b>Php {{ totalCount(studio_total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in studio_res" :key="key">
                                <td>Greenbelt</td>
                                <td>Php 24,000</td>
                                <td>Php 24,000</td>
                                <td>Php 24,000</td>
                                <td>Php 24,000</td>
                                <td>Php 24,000</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                loaded: false,
                rowCount: 0,
                status: 'all',
                res: [],
                studio_res: [],
                payment_total: [],
                studio_total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
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
                formData.append('studio_id', me.$cookies.get('CSID'))
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.total_count
                            me.res = res.data.result
                            me.total = res.data.total
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
                formData.append('studio_id', me.$cookies.get('CSID'))
                me.$axios.post('api/reporting/sales/sales-by-payment-type', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.payment_total = res.data.payment_grand_total
                            me.studio_res = res.data.studio_sales_summary
                            me.studio_total = res.data.studio_grand_total
                            me.loaded = true
                        }, 500)
                        console.log(res.data);
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
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData('all')
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 750)
        }
    }
</script>
