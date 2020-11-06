<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales &amp; Transactions</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <div class="actions">
                            <a :href="`/print/${apiRoute}?status=${tabStatus}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}&filtered=${filtered}`" target="_blank" class="action_btn alternate" v-if="tabStatus != 'summary'">Print</a>
                            <download-csv
                                v-if="tabStatus != 'summary'"
                                class="action_btn alternate"
                                :data="salesSummaryAttributes"
                                :name="`${tabStatus}-summary-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
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
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tabStatus == 'summary') ? 'active' : ''}`" @click="toggleTab('summary', 'sales-summary', 'reporting/sales/sales-and-transactions/sales-summary')">Sales Summary</div>
                        <div :class="`status ${(tabStatus == 'class-packages') ? 'active' : ''}`" @click="toggleTab('class-packages', 'sales-summary-product', 'reporting/sales/sales-and-transactions/sales-summary/class-packages')">Class Packages</div>
                        <div :class="`status ${(tabStatus == category.slug) ? 'active' : ''}`" v-for="(category, key) in categories" :key="key" @click="toggleTab(category.slug, 'sales-summary-product', `reporting/sales/sales-and-transactions/sales-summary/product-categories/${category.id}`)">{{ category.name }}</div>
                        <div :class="`status ${(tabStatus == 'gift-cards') ? 'active' : ''}`" @click="toggleTab('gift-cards', 'sales-summary-product', 'reporting/sales/sales-and-transactions/sales-summary/gift-cards')">Gift Cards</div>
                        <div :class="`status ${(tabStatus == 'promos') ? 'active' : ''}`" @click="toggleTab('promos', 'sales-summary-product', 'reporting/sales/sales-and-transactions/sales-summary/promos')">Promotions</div>
                        <div :class="`status ${(tabStatus == 'store-credits') ? 'active' : ''}`" @click="toggleTab('store-credits', 'sales-summary-product', 'reporting/sales/sales-and-transactions/sales-summary/store-credits')">Store Credits</div>
                    </div>
                    <div v-if="slug == 'sales-summary'">
                        <table class="cms_table alt">
                            <thead>
                                <tr>
                                    <th colspan="3" class="cms_table_title">Sales Breakdown</th>
                                </tr>
                                <tr>
                                    <th>Name</th>
                                    <th>ITY</th>
                                    <th>ITD</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">Php {{ totalCount(res.sales_breakdown_total.salesBreakdownITYTotal) }}</td>
                                    <td class="green">Php {{ totalCount(res.sales_breakdown_total.salesBreakdownITDTotal) }}</td>
                                </tr>
                                <tr v-for="(data, key) in res.sales_breakdown" :key="key">
                                    <td>
                                        <div class="table_data_link" @click="toggleTab(data.status, 'sales-summary-product', `reporting/sales/sales-and-transactions/sales-summary/${data.status}`)">{{ data.name }}</div>
                                    </td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="cms_table alt">
                            <thead>
                                <tr>
                                    <th colspan="3" class="cms_table_title">Income Breakdown</th>
                                </tr>
                                <tr>
                                    <th>Payment Type</th>
                                    <th>ITY</th>
                                    <th>ITD</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">Php {{ totalCount(res.income_breakdown_total.incomeBreakdownITYTotal) }}</td>
                                    <td class="green">Php {{ totalCount(res.income_breakdown_total.incomeBreakdownITDTotal) }}</td>
                                </tr>
                                <tr v-for="(data, key) in res.income_breakdown" :key="key">
                                    <td>
                                        <div class="table_data_link" @click="toggledPaymentType(data)">{{ data.name }}</div>
                                    </td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- <div class="table_notepad">
                            <h2 class="footer_title">Notepad</h2>
                            <div class="notepad_text">
                                <textarea name="notepad" rows="10"></textarea>
                            </div>
                        </div> -->
                    </div>
                    <div v-else>
                        <table class="cms_table alt">
                            <thead>
                                <tr>
                                    <th class="cms_table_title">Items</th>
                                    <th colspan="3" class="cms_table_title">Income</th>
                                    <th colspan="6" class="cms_table_title">Mode of Payment</th>
                                </tr>
                                <tr>
                                    <th>Items</th>
                                    <th>Sum</th>
                                    <th>ITY</th>
                                    <th>ITD</th>
                                    <th>CA</th>
                                    <th>GC</th>
                                    <th>CC</th>
                                    <th>DC/EPS</th>
                                    <th>CQ</th>
                                    <th>PP</th>
                                    <th>PM</th>
                                    <!-- <th>RC</th> -->
                                    <th>SC</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalSum) }}</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalITY) }}</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalITD) }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.cash }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.gcash }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.creditCard }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.debitCard }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.check }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.paypal }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.paymaya }}</td>
                                    <!-- <td class="green">{{ res.item_payment_mode_total.recurly }}</td> -->
                                    <td class="green">{{ res.item_payment_mode_total.storeCredit }}</td>
                                </tr>
                                <tr v-for="(data, key) in res.items" :key="key" v-if="data.sum > 0">
                                    <td>
                                        <div class="table_data_link">{{ (data.card_code) ? data.card_code : (data.variant ? data.variant : data.name) }}</div>
                                    </td>
                                    <td>Php {{ (data.sum) ? totalCount(data.sum) : 0 }}</td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.cash : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.gcash : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.creditCard : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.debitCard : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.check : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.paypal : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.paymaya : 0 }}</td>
                                    <!-- <td>{{ (data.paymentModes) ? data.paymentModes.recurly : 0 }}</td> -->
                                    <td>{{ (data.paymentModes) ? data.paymentModes.storeCredit : 0 }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
            const sales_summary_values = []
            return {
                name: 'Sales & Transactions',
                filtered: false,
                access: true,
                loaded: false,
                rowCount: 0,
                tabStatus: 'summary',
                res: {
                    sales_breakdown: [],
                    sales_breakdown_total: [],
                    income_breakdown: [],
                    income_breakdown_total: [],
                    items: [],
                    item_total: [],
                    item_payment_mode_total: []
                },
                slug: 'sales-summary',
                apiRoute: 'reporting/sales/sales-and-transactions/sales-summary',
                sales_summary_values: [],
                studios: [],
                categories: [],
                form: {
                    studio_id: 0,
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            salesSummaryAttributes () {
                const me = this
                let current_length = me.sales_summary_values.length - 1
                return [
                    ...me.sales_summary_values.map((value, key) => ({
                        'Studio': me.getStudio(),
                        'Items': (key == current_length) ? 'Total' : (value.card_code) ? value.card_code : (value.variant ? value.variant : value.name),
                        'Qty': (key == current_length) ? value.totalQty : (value.qty ? value.qty : 0),
                        'ITY': `Php ${(key == current_length) ? me.totalCount(value.totalITY) : me.totalCount(value.ITY)}`,
                        'ITD': `Php ${(key == current_length) ? me.totalCount(value.totalITD) : me.totalCount(value.ITD)}`,
                        'CA': (key == current_length) ? me.res.item_payment_mode_total.cash : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'GC': (key == current_length) ? me.res.item_payment_mode_total.gcash : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'CC': (key == current_length) ? me.res.item_payment_mode_total.creditCard : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'DC/EPS': (key == current_length) ? me.res.item_payment_mode_total.debitCard : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'CQ': (key == current_length) ? me.res.item_payment_mode_total.check : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'PP': (key == current_length) ? me.res.item_payment_mode_total.paypal : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'PM': (key == current_length) ? me.res.item_payment_mode_total.paymaya : (value.paymentModes) ? value.paymentModes.cash : 0,
                        // 'RC': (key == current_length) ? me.res.item_payment_mode_total.recurly : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'SC': (key == current_length) ? me.res.item_payment_mode_total.storeCredit : (value.paymentModes) ? value.paymentModes.cash : 0
                    }))
                ]
            }
        },
        methods: {
            toggledPaymentType (payment_type) {
                const me = this
                me.$router.push(`${me.$route.path}/payment-type/${payment_type.status}?tab_status=${me.tabStatus}&start_date=${me.form.start_date}&end_date=${me.form.end_date}&studio_id=${me.form.studio_id}`)
            },
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != 0) {
                    if (me.form.studio_id == 'os') {
                        result = 'Website/Online Sales'
                    } else {
                        me.studios.forEach((studio, index) => {
                            if (studio.id == me.form.studio_id) {
                                result = studio.name
                            }
                        })
                    }
                } else {
                    result = 'All Studios'
                }
                return result
            },
            toggleTab (status, slug, apiRoute) {
                const me = this
                me.income_values = []
                me.sales_values = []
                me.sales_summary_values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post(`api/${apiRoute}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.slug = slug
                            me.tabStatus = status
                            me.apiRoute = apiRoute
                            if (me.slug == 'sales-summary') {
                                me.res.sales_breakdown = res.data.salesBreakdown
                                me.res.sales_breakdown_total = res.data.salesBreakdownTotal
                                me.res.income_breakdown = res.data.incomeBreakdown
                                me.res.income_breakdown_total = res.data.incomeBreakdownTotal
                            } else {
                                me.res.items = res.data.items
                                me.res.item_total = res.data.total
                                me.res.item_payment_mode_total = res.data.paymentModesTotal

                                res.data.items.forEach((item, i) => {
                                    me.sales_summary_values.push(item)
                                })
                                me.sales_summary_values.push(res.data.total)
                            }
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            submitFilter () {
                const me = this
                me.income_values = []
                me.sales_values = []
                me.sales_summary_values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post(`api/${me.apiRoute}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            if (me.slug == 'sales-summary') {
                                me.res.sales_breakdown = res.data.salesBreakdown
                                me.res.sales_breakdown_total = res.data.salesBreakdownTotal
                                me.res.income_breakdown = res.data.incomeBreakdown
                                me.res.income_breakdown_total = res.data.incomeBreakdownTotal
                            } else {
                                me.res.items = res.data.items
                                me.res.item_total = res.data.total
                                me.res.item_payment_mode_total = res.data.paymentModesTotal

                                res.data.items.forEach((item, i) => {
                                    me.sales_summary_values.push(item)
                                })
                                me.sales_summary_values.push(res.data.total)
                            }
                            me.filtered = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let studio_id = me.$cookies.get('CSID'), ctr = 0
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    ctr += 1
                } else {
                    me.form.studio_id = studio_id
                }

                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                    ctr += 1
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                    ctr += 1
                }
                if (me.$route.query.tab_status) {
                    me.tabStatus = me.$route.query.tab_status
                    ctr += 1
                }

                if (ctr > 1) {
                    me.filtered = true
                }

                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('studio_id',  me.form.studio_id)
                me.$axios.post(`api/${me.apiRoute}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.sales_breakdown = res.data.salesBreakdown
                            me.res.sales_breakdown_total = res.data.salesBreakdownTotal
                            me.res.income_breakdown = res.data.incomeBreakdown
                            me.res.income_breakdown_total = res.data.incomeBreakdownTotal

                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
                                }
                            })

                            me.$axios.get('api/inventory/product-categories?enabled=1').then(res => {
                                if (res.data) {
                                    me.categories = res.data.productCategories
                                }
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
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
