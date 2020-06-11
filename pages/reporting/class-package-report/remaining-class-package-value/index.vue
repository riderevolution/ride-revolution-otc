<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Remaining Package Value</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">
                                Summary of rider count and revenue per class schedule
                                <ul>
                                    <li>Classes which are after the cutoff date are excluded</li>
                                    <li>Comps are excluded</li>
                                    <li>The value of unlimiteds is calculated as a ratio of days that the series has been active over the total days to expire of the series</li>
                                </ul>
                            </h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
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
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th>Class Package</th>
                                <th>Starting Class Count</th>
                                <th>Starting Value</th>
                                <th>Remaining Class Count</th>
                                <th>Remaining Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Summary</b></td>
                                <td><b>20,000</b></td>
                                <td><b>Php 1,000,000</b></td>
                                <td><b>777</b></td>
                                <td><b>Php 10,000</b></td>
                            </tr>
                            <tr v-for="(n, key) in 10" :key="key">
                                <td>Package</td>
                                <td>165</td>
                                <td>Php 23</td>
                                <td>23</td>
                                <td>Php 23</td>
                            </tr>
                        </tbody>
                        <!-- <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody> -->
                    </table>
                    <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
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
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            return {
                range: {
                    start: new Date(),
                    end: new Date()
                },
                loaded: false,
                rowCount: 0,
                res: [],
                types: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
            },
            fetchData () {
                const me = this
                me.loaded = true
            },
            fetchTypes () {
                const me = this
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.types = res.data.customerTypes
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            me.fetchTypes()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
