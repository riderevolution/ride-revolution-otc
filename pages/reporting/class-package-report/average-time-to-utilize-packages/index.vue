<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Average Time to Utilize Packages</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th>Class Package</th>
                                <th>Total Package Count</th>
                                <th>Total Sales Amount</th>
                                <th>Utilization Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(n, key) in 10" :key="key">
                                <td>Package</td>
                                <td>{{ n }}</td>
                                <td>Php 23,000</td>
                                <td>23 Days</td>
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
                name: 'Average Time to Utilize Packages',
                access: true,
                loaded: false,
                rowCount: 0,
                res: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
            },
            fetchData () {
                const me = this
                me.loaded = true
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
            }, 300)
        }
    }
</script>
