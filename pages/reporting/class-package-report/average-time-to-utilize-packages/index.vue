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
                            <div class="action_btn alternate" @click="getPackages()" v-if="res.packages.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.packages.data.length > 0"
                                class="hidden me"
                                :data="averageTimeToUtilizePackagesAttributes"
                                :name="`average-time-to-utilize-packages-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Class Package</th>
                                <th class="sticky">Total Package Count</th>
                                <th class="sticky">Total Sales Amount</th>
                                <th class="sticky">Utilization Rate</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.packages.data.length > 0">
                            <tr v-for="(data, key) in res.packages.data" :key="key">
                                <td>{{ data.name }}</td>
                                <td>{{ (data.class_count_unlimited == 1) ? 'Unlimited' : data.class_count }}</td>
                                <td>Php {{ totalCount(data.totalSalesAmount) }}</td>
                                <td>{{ data.utilizationRate }} Days</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.packages.path" :current="res.packages.current_page" :last="res.packages.last_page" />
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
            const values = []
            return {
                name: 'Average Time to Utilize Packages',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: []
            }
        },
        computed: {
            averageTimeToUtilizePackagesAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Class Package': value.name,
                        'Total Package Count': (value.class_count_unlimited == 1) ? 'Unlimited' : value.class_count,
                        'Total Sales Amount': `Php ${me.totalCount(value.totalSalesAmount)}`,
                        'Utilization Rate': value.utilizationRate
                    }))
                ]
            }
        },
        methods: {
            getPackages () {
                const me = this
                let formData = new FormData()
                me.loader(true)
                me.$axios.post(`api/reporting/packages/average-time-to-utilize-packages?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.packages.forEach((item, index) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            fetchData () {
                const me = this
                let formData = new FormData()
                me.loader(true)
                me.$axios.post(`api/reporting/packages/average-time-to-utilize-packages`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
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
            }, 300)
        }
    }
</script>
