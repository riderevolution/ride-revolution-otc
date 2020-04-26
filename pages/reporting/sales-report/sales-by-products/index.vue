<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Products</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from products sold</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                                <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                            </div>
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
                        <div class="total">Total: {{ totalItems(total_count) }}</div>
                        <div :class="`status ${(status == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                        <div :class="`status ${(status == 'paid') ? 'active' : ''}`" @click="toggleTab('paid')">Paid</div>
                        <div :class="`status ${(status == 'pending') ? 'active' : ''}`" @click="toggleTab('pending')">Pending</div>
                    </div>
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="sticky">Item</th>
                                <th class="sticky">Sold</th>
                                <th class="sticky">Returned</th>
                                <th class="sticky">Comp</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Taxes</th>
                                <th class="sticky">Total Income</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Cost</th>
                                <th class="sticky">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>0</b></td>
                                <td><b>{{ total.comp }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                                <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link :event="''" class="table_data_link" :to="`${$route.path}/${convertToSlug(data.name)}`" @click.native="toggleInnerReport(`${(data.name == 'Gift Cards') ? 'gift-card' : 'product-variant'}`, `${$route.path}/${convertToSlug(data.name)}`, data.id)">{{ data.name }}</nuxt-link>
                                </td>
                                <td>{{ (data.sold) ? data.sold : 0 }}</td>
                                <td>0</td>
                                <td>{{ (data.comp) ? data.comp : 0 }}</td>
                                <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
                                <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                <td>Php {{ (data.total_cost) ? totalCount(data.total_cost) : 0 }}</td>
                                <td :class="`${(data.total_profit) ? (data.total_profit <= 0 ? 'red' : 'green') : ''}`">Php {{ (data.total_profit) ? totalCount(data.total_profit) : 0 }}</td>
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
                total: [],
                total_count: 0,
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            toggleInnerReport (type, path, id) {
                const me = this
                me.$router.push(`${path}?status=${me.status}&slug=${type}&id=${id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
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
                formData.append('studio_id', me.$cookies.get('CSID')
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
                formData.append('studio_id', me.$cookies.get('CSID')
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.total_count
                            me.res = res.data.result
                            me.total = res.data.total
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
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData('all')
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 750)
        }
    }
</script>
