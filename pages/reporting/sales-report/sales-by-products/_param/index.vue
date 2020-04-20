<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link to="/reporting/sales-report/sales-by-products" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Products</span></nuxt-link>
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>{{ replacer($route.params.param) }} (Paid)</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                        <h2 class="header_subtitle">Income from {{ replacer($route.params.param) }}.</h2>
                    </div>
                    <div class="actions">
                        <a href="javascript:void(0)" class="action_btn">Print</a>
                        <a href="javascript:void(0)" class="action_btn margin">Export</a>
                    </div>
                </div>
            </section>
            <section id="content">
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th class="sticky">Product Name</th>
                            <th class="sticky">Item Price</th>
                            <th class="sticky">Sold</th>
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
                            <td colspan="2"><b>Total</b></td>
                            <td><b>214</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                        </tr>
                        <tr v-for="(n, key) in 6" :key="key">
                            <td>
                                <nuxt-link class="table_data_link" :to="`${$route.path}/product/hope-in-the-bottle`">Hope in the Bottle</nuxt-link>
                            </td>
                            <td>Php 1,000</td>
                            <td>39</td>
                            <td>Php 1,000</td>
                            <td>Php 1,000</td>
                            <td>Php 1,000</td>
                            <td>Php 1,000</td>
                            <td>Php 1,000</td>
                            <td>Php 1,000</td>
                        </tr>
                    </tbody>
                    <!-- <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody> -->
                </table>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                range: {
                    start: new Date(),
                    end: new Date()
                },
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0,
                studios: [],
                tabStatus: 1
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(`api/staff/search`, formData).then(res => {
                    me.res = res.data.roles
                    me.rowCount = 4
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                    }, 500)
                })
            },
            toggleTab (status) {
                const me = this
                me.tabStatus = status
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
            fetchStudios () {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
            }
        },
        mounted () {
            const me = this
            me.fetchData(1)
            me.fetchStudios()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
