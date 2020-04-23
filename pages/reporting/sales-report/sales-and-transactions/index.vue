<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Sales &amp; Transactions</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                    </div>
                    <div class="actions">
                        <a href="javascript:void(0)" class="action_btn">Print</a>
                        <a href="javascript:void(0)" class="action_btn margin">Export</a>
                    </div>
                </div>
                <div class="filter_wrapper">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                        <div class="form_group">
                            <label for="studio">Branch</label>
                            <select class="default_select alternate" name="studio">
                                <option value="" selected>All Studios</option>
                                <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="start_date">Start Date</label>
                            <input type="date" name="start_date" class="default_text date" />
                        </div>
                        <div class="form_group margin">
                            <label for="end_date">End Date</label>
                            <input type="date" name="end_date" class="default_text date" />
                        </div>
                        <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                    </form>
                </div>
            </section>
            <section id="content">
                <div class="cms_table_toggler">
                    <div :class="`status ${(tabStatus == 1) ? 'active' : ''}`" @click="toggleTab(1)">Sales Summary</div>
                    <div :class="`status ${(tabStatus == 2) ? 'active' : ''}`" @click="toggleTab(2)">Class Packages</div>
                    <div :class="`status ${(tabStatus == 3) ? 'active' : ''}`" @click="toggleTab(3)">Food &amps; Beverages</div>
                    <div :class="`status ${(tabStatus == 4) ? 'active' : ''}`" @click="toggleTab(4)">Merchandise</div>
                    <div :class="`status ${(tabStatus == 5) ? 'active' : ''}`" @click="toggleTab(5)">Gift Cards</div>
                    <div :class="`status ${(tabStatus == 6) ? 'active' : ''}`" @click="toggleTab(6)">Promotions</div>
                    <div :class="`status ${(tabStatus == 7) ? 'active' : ''}`" @click="toggleTab(7)">Store Credits</div>
                </div>
                <table class="cms_table">
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
                        <tr v-for="(n, key) in 5" :key="key">
                            <td>Class Package</td>
                            <td>Php 24,000</td>
                            <td>Php 24,000</td>
                        </tr>
                        <tr>
                            <td class="green">Total</td>
                            <td class="green">Php 24,000</td>
                            <td class="green">Php 24,000</td>
                        </tr>
                    </tbody>
                    <!-- <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody> -->
                </table>
                <table class="cms_table">
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
                        <tr v-for="(n, key) in 5" :key="key">
                            <td>Payment Type</td>
                            <td>Php 24,000</td>
                            <td>Php 24,000</td>
                        </tr>
                        <tr>
                            <td class="green">Total</td>
                            <td class="green">Php 24,000</td>
                            <td class="green">Php 24,000</td>
                        </tr>
                    </tbody>
                    <!-- <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody> -->
                </table>
                <div class="table_notepad">
                    <h2 class="footer_title">Notepad</h2>
                    <div class="notepad_text">
                        <textarea name="notepad" rows="10"></textarea>
                    </div>
                </div>
            </section>
        </div>
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
