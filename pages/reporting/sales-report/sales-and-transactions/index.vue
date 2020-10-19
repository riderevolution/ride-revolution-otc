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
                            <a :href="`/print/reporting/sales/sales-and-transactions/sales-summary/sales-breakdown?status=${tabStatus}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate" v-if="tabStatus == 'summary'">Print</a>
                            <a :href="`/print/${apiRoute}?status=${tabStatus}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}&filtered=${filtered}`" target="_blank" class="action_btn alternate" v-else>Print</a>
                            <download-csv
                                v-if="tabStatus == 'summary'"
                                class="action_btn alternate"
                                :data="salesBreakdownAttributes"
                                :name="`sales-breakdown-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                            <download-csv
                                v-else
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
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                    <option value="ol">Website/Online Sales</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tabStatus == 'summary') ? 'active' : ''}`" @click="toggleTab('summary', 'sales-summary', 'reporting/sales/sales-and-transactions/sales-summary')">Sales Summary</div>
                        <div :class="`status ${(tabStatus == 'packages') ? 'active' : ''}`" @click="toggleTab('packages', 'sales-summary-product', 'reporting/sales/sales-and-transactions/sales-summary/class-packages')">Class Packages</div>
                        <div :class="`status ${(tabStatus == convertToSlug(category.name)) ? 'active' : ''}`" v-for="(category, key) in categories" :key="key" @click="toggleTab(convertToSlug(category.name), 'sales-summary-product', `reporting/sales/sales-and-transactions/sales-summary/product-categories/${category.id}`)">{{ category.name }}</div>
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
                                    <td>{{ data.name }}</td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="cms_table_toggler">
                            <a :href="`/print/reporting/sales/sales-and-transactions/sales-summary/income-breakdown?status=${tabStatus}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                            <download-csv
                                v-if="res.income_breakdown.length > 0"
                                class="action_btn alternate"
                                :data="incomeBreakdownAttributes"
                                :name="`income-breakdown-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
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
                                    <td>{{ data.name }}</td>
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
                                    <th>Qty</th>
                                    <th>ITY</th>
                                    <th>ITD</th>
                                    <th>CA</th>
                                    <th>GC</th>
                                    <th>CC</th>
                                    <th>DC/EPS</th>
                                    <th>CQ</th>
                                    <th>PP</th>
                                    <th>PM</th>
                                    <th>RC</th>
                                    <th>SC</th>
                                </tr>
                            </thead>
                            <tbody v-if="!filtered">
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">{{ res.item_total.totalQty }}</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalITY) }}</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalITD) }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.cash }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.gcash }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.creditCard }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.debitCard }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.check }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.paypal }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.paymaya }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.recurly }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.storeCredit }}</td>
                                </tr>
                                <tr v-for="(data, key) in res.items" :key="key">
                                    <td>{{ (data.card_code) ? data.card_code : (data.variant ? data.variant : data.name) }}</td>
                                    <td>{{ (data.qty) ? data.qty : 0 }}</td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.cash : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.gcash : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.creditCard : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.debitCard : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.check : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.paypal : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.paymaya : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.recurly : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.storeCredit : 0 }}</td>
                                </tr>
                            </tbody>
                            <tbody v-else-if="filtered">
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">{{ res.item_total.totalQty }}</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalITY) }}</td>
                                    <td class="green">Php {{ totalCount(res.item_total.totalITD) }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.cash }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.gcash }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.creditCard }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.debitCard }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.check }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.paypal }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.paymaya }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.recurly }}</td>
                                    <td class="green">{{ res.item_payment_mode_total.storeCredit }}</td>
                                </tr>
                                <tr v-for="(data, key) in res.items" :key="key" v-if="data.qty > 0">
                                    <td>{{ (data.card_code) ? data.card_code : (data.variant ? data.variant : data.name) }}</td>
                                    <td>{{ (data.qty) ? data.qty : 0 }}</td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.cash : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.gcash : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.creditCard : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.debitCard : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.check : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.paypal : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.paymaya : 0 }}</td>
                                    <td>{{ (data.paymentModes) ? data.paymentModes.recurly : 0 }}</td>
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
            const income_values = []
            const sales_values = []
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
                income_values: [],
                sales_values: [],
                sales_summary_values: [],
                studios: [],
                categories: [],
                form: {
                    studio_id: '',
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            incomeBreakdownAttributes () {
                const me = this
                return [
                    ...me.income_values.map(value => ({
                        'Studio': me.getStudio(),
                        'Payment Type': (value.name) ? value.name : 'Total',
                        'ITY': (value.ITY) ? me.totalCount(value.ITY) : me.totalCount(value.incomeBreakdownITYTotal),
                        'ITD': (value.ITD) ? me.totalCount(value.ITD) : me.totalCount(value.incomeBreakdownITDTotal)
                    }))
                ]
            },
            salesBreakdownAttributes () {
                const me = this
                return [
                    ...me.sales_values.map(value => ({
                        'Studio': me.getStudio(),
                        'Payment Type': (value.name) ? value.name : 'Total',
                        'ITY': (value.ITY) ? me.totalCount(value.ITY) : me.totalCount(value.salesBreakdownITYTotal),
                        'ITD': (value.ITD) ? me.totalCount(value.ITD) : me.totalCount(value.salesBreakdownITDTotal)
                    }))
                ]
            },
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
                        'RC': (key == current_length) ? me.res.item_payment_mode_total.recurly : (value.paymentModes) ? value.paymentModes.cash : 0,
                        'SC': (key == current_length) ? me.res.item_payment_mode_total.storeCredit : (value.paymentModes) ? value.paymentModes.cash : 0
                    }))
                ]
            }
        },
        methods: {
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != '') {
                    me.studios.forEach((studio, index) => {
                        if (studio.id == me.form.studio_id) {
                            result = studio.name
                        }
                    })
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

                                res.data.incomeBreakdown.forEach((item, i) => {
                                    me.income_values.push(item)
                                })
                                me.income_values.push(res.data.incomeBreakdownTotal)

                                res.data.salesBreakdown.forEach((item, i) => {
                                    me.sales_values.push(item)
                                })
                                me.sales_values.push(res.data.salesBreakdownTotal)

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

                                res.data.incomeBreakdown.forEach((item, i) => {
                                    me.income_values.push(item)
                                })
                                me.income_values.push(res.data.incomeBreakdownTotal)

                                res.data.salesBreakdown.forEach((item, i) => {
                                    me.sales_values.push(item)
                                })
                                me.sales_values.push(res.data.salesBreakdownTotal)

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
                let studio_id = me.$cookies.get('CSID')
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                formData.append('studio_id',  studio_id)
                me.$axios.post(`api/${me.apiRoute}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.sales_breakdown = res.data.salesBreakdown
                            me.res.sales_breakdown_total = res.data.salesBreakdownTotal
                            me.res.income_breakdown = res.data.incomeBreakdown
                            me.res.income_breakdown_total = res.data.incomeBreakdownTotal

                            res.data.incomeBreakdown.forEach((item, i) => {
                                me.income_values.push(item)
                            })
                            me.income_values.push(res.data.incomeBreakdownTotal)

                            res.data.salesBreakdown.forEach((item, i) => {
                                me.sales_values.push(item)
                            })
                            me.sales_values.push(res.data.salesBreakdownTotal)

                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
                                    me.form.studio_id = studio_id
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
