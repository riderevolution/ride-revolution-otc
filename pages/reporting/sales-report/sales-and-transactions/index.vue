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
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id">
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
                        <div :class="`status ${(tabStatus == 'summary') ? 'active' : ''}`" @click="toggleTab('summary', 'sales-summary', 'api/reporting/sales/sales-and-transactions/sales-summary')">Sales Summary</div>
                        <div :class="`status ${(tabStatus == 'packages') ? 'active' : ''}`" @click="toggleTab('packages', 'sales-summary-product', 'api/reporting/sales/sales-and-transactions/sales-summary/class-packages')">Class Packages</div>
                        <div :class="`status ${(tabStatus == convertToSlug(category.name)) ? 'active' : ''}`" v-for="(category, key) in categories" :key="key" @click="toggleTab(convertToSlug(category.name), 'sales-summary-product', `api/reporting/sales/sales-and-transactions/sales-summary/product-categories/${category.id}`)">{{ category.name }}</div>
                        <div :class="`status ${(tabStatus == 'gift-cards') ? 'active' : ''}`" @click="toggleTab('gift-cards', 'sales-summary-product', 'api/reporting/sales/sales-and-transactions/sales-summary/gift-cards')">Gift Cards</div>
                        <div :class="`status ${(tabStatus == 'promos') ? 'active' : ''}`" @click="toggleTab('promos', 'sales-summary-product', 'api/reporting/sales/sales-and-transactions/sales-summary/promos')">Promotions</div>
                        <div :class="`status ${(tabStatus == 'store-credits') ? 'active' : ''}`" @click="toggleTab('store-credits', 'sales-summary-product', 'api/reporting/sales/sales-and-transactions/sales-summary/store-credits')">Store Credits</div>
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
                                <tr v-for="(data, key) in res.sales_breakdown" :key="key">
                                    <td>{{ data.name }}</td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                </tr>
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">Php {{ totalCount(res.sales_breakdown_total.salesBreakdownITYTotal) }}</td>
                                    <td class="green">Php {{ totalCount(res.sales_breakdown_total.salesBreakdownITDTotal) }}</td>
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
                                <tr v-for="(data, key) in res.income_breakdown" :key="key">
                                    <td>{{ data.name }}</td>
                                    <td>Php {{ totalCount(data.ITY) }}</td>
                                    <td>Php {{ totalCount(data.ITD) }}</td>
                                </tr>
                                <tr>
                                    <td class="green">Total</td>
                                    <td class="green">Php {{ totalCount(res.income_breakdown_total.incomeBreakdownITYTotal) }}</td>
                                    <td class="green">Php {{ totalCount(res.income_breakdown_total.incomeBreakdownITDTotal) }}</td>
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
                                    <th>SC</th>
                                </tr>
                            </thead>
                            <tbody>
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
                                    <td>{{ (data.paymentModes) ? data.paymentModes.storeCredit : 0 }}</td>
                                </tr>
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
                                    <td class="green">{{ res.item_payment_mode_total.storeCredit }}</td>
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
            return {
                name: 'Sales & Transactions',
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
                apiRoute: 'api/reporting/sales/sales-and-transactions/sales-summary',
                studios: [],
                categories: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            toggleTab (status, slug, apiRoute) {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post(`${apiRoute}`, formData).then(res => {
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
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post(`${me.apiRoute}`, formData).then(res => {
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
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                me.$axios.post(`${me.apiRoute}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.sales_breakdown = res.data.salesBreakdown
                            me.res.sales_breakdown_total = res.data.salesBreakdownTotal
                            me.res.income_breakdown = res.data.incomeBreakdown
                            me.res.income_breakdown_total = res.data.incomeBreakdownTotal

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
