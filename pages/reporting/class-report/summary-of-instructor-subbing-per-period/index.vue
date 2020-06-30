<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Summary of Instructor Subbing per Period</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Instructor Subbing per class schedule.</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn">Print</a>
                            <a href="javascript:void(0)" class="action_btn margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="type">Branch</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Customer Types</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="type">Instructor</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Instructor</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
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
                        <div class="total">Total Subbed Classes: {{ totalItems(res.customers.total) }}</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Date</th>
                                <th class="stick">Time</th>
                                <th class="stick">Class Type</th>
                                <th class="stick">Schedule Released</th>
                                <th class="stick">Branch</th>
                                <th class="stick">Primary Instructor</th>
                                <th class="stick">Substitute Instructor</th>
                                <th class="stick">Remarks</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.customers.data.length > 0">
                            <tr v-for="(data, key) in res.customers.data" :key="key">
                                <td>{{ $moment().format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment().format('h:mm A') }}</td>
                                <td>Sample</td>
                                <td>Yes</td>
                                <td>Malate</td>
                                <td>Steve Kurt</td>
                                <td>Young Steve</td>
                                <td>HelLowszxc</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" />
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
                name: 'Summary of Instructor Subbing per Period',
                access: true,
                loaded: false,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 'all',
                res: [],
                types: [],
                range: {
                    start: new Date(),
                    end: new Date()
                },
                transaction: []
            }
        },
        methods: {
            togglePendingTransactions (id) {
                const me = this
                me.$store.state.pendingCustomerID = id
                me.$store.state.pendingTransactionsStatus = true
                document.body.classList.add('no_scroll')
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
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
            toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'roles'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'role'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleStatus (value) {
                const me = this
                me.status = value
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
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.types = res.data.customerTypes
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
                me.fetchTypes()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
