<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Inventory Value Report</h1>
                            </div>
                            <h2 class="header_subtitle">Expiration details of each product items</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
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
                                <label for="value_as_of">Value as of</label>
                                <input type="date" name="value_as_of" v-model="form.value_as_of" class="default_text date" />
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tabStatus == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All: 800</div>
                        <div :class="`status ${(tabStatus == 'merch') ? 'active' : ''}`" @click="toggleTab('merch')">Merchandise: 100</div>
                        <div :class="`status ${(tabStatus == 'food') ? 'active' : ''}`" @click="toggleTab('food')">Food &amp; Beverage: 400</div>
                        <div :class="`status ${(tabStatus == 'gift') ? 'active' : ''}`" @click="toggleTab('gift')">Gift Cards: 100</div>
                    </div>
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Product Name</th>
                                <th class="stick">SKU ID</th>
                                <th class="stick">In Stock</th>
                                <th class="stick">Price (Per Piece)</th>
                                <th class="stick">Total Cost of Good</th>
                                <th class="stick">Retail Value</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.customers.data.length > 0">
                            <tr v-for="(data, key) in 5" :key="key">
                                <td>SAmple ASpmple</td>
                                <td>123786123876</td>
                                <td>12</td>
                                <td>Php 24,000</td>
                                <td>Php 24,000</td>
                                <td>Php 24,000</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
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
    import Foot from '../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                loaded: false,
                rowCount: 0,
                tabStatus: 'all',
                res: [],
                studios: [],
                form: {
                    value_as_of: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            togglePendingTransactions (id) {
                const me = this
                me.$store.state.pendingCustomerID = id
                me.$store.state.pendingTransactionsStatus = true
                document.body.classList.add('no_scroll')
            },
            submitFilter () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.tabStatus)
                me.loader(true)
                me.$axios.post(`api/customers/search`, formData).then(res => {
                    me.res = res.data
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleTab (value) {
                const me = this
                me.tabStatus = value
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers?enabled=${value}`).then(res => {
                    me.res = res.data
                    me.loaded = true
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
            fetchTypes () {
                const me = this
                me.$axios.get('api/studios?enabled=1').then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                    }
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            me.fetchTypes()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
