<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Sales by Class Package</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                        <h2 class="header_subtitle">Income from class package sold.</h2>
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
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th>Class Package</th>
                            <th>Sold</th>
                            <th>Returned</th>
                            <th>Comp</th>
                            <th>Discount</th>
                            <th>Taxes</th>
                            <th>Total Income</th>
                            <th>Comp Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><b>Total</b></td>
                            <td><b>500</b></td>
                            <td><b>2</b></td>
                            <td><b>3</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                        </tr>
                        <tr v-for="(n, key) in 6" :key="key">
                            <td>
                                <nuxt-link class="table_data_link" :to="`${$route.path}/singe-class-package`">Single Class Package</nuxt-link>
                            </td>
                            <td>100</td>
                            <td>100</td>
                            <td>100</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
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
