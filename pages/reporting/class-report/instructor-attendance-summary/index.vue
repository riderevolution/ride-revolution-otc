<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Instructor Attendance Summary</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of instructor attendance and revenue per class schedule</h2>
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
                                <label for="type">Class Type</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Customer Types</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="type">Class Package</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Customer Types</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="type">Instructor</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Customer Types</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="type">Customer Type</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Customer Types</option>
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
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Date</th>
                                <th class="stick">Total Rides</th>
                                <th class="stick">Paying Riders</th>
                                <th class="stick">Comped Riders</th>
                                <th class="stick">First Timers</th>
                                <th class="stick">No Shows</th>
                                <th class="stick">Cancel</th>
                                <th class="stick">Waitlist</th>
                                <th class="stick">Repeat</th>
                                <th class="stick">Avg Riders</th>
                                <th class="stick">Number Classes</th>
                                <th class="stick">Avg Spots</th>
                                <th class="stick">Total Bikes</th>
                                <th class="stick">Capacity</th>
                                <th class="stick">Paying</th>
                                <th class="stick">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.customers.data.length > 0">
                            <tr>
                                <td><b>Summary</b></td>
                                <td><b>165</b></td>
                                <td><b>23</b></td>
                                <td><b>23</b></td>
                                <td><b>23</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>86%</b></td>
                                <td><b>83%</b></td>
                                <td><b>1000</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.customers.data" :key="key">
                                <td>{{ $moment().format('MMM DD, YYYY') }}</td>
                                <td>165</td>
                                <td>23</td>
                                <td>23</td>
                                <td>23</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>86%</td>
                                <td>83%</td>
                                <td>1000</td>
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
                <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" />
            </transition>
            <transition name="fade">
                <pending-transactions v-if="$store.state.pendingTransactionsStatus" />
            </transition>
            <transition name="fade">
                <customer-pending-quick-sale :value="transaction" v-if="$store.state.customerPendingQuickSaleStatus" />
            </transition>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import UserForm from '../../../../components/modals/UserForm'
    import RoleForm from '../../../../components/modals/RoleForm'
    import ConfirmStatus from '../../../../components/modals/ConfirmStatus'
    import PendingTransactions from '../../../../components/modals/PendingTransactions'
    import CustomerPendingQuickSale from '../../../../components/modals/CustomerPendingQuickSale'
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            UserForm,
            RoleForm,
            ConfirmStatus,
            PendingTransactions,
            CustomerPendingQuickSale,
            Pagination
        },
        data () {
            return {
                range: {
                    start: new Date(),
                    end: new Date()
                },
                name: 'Instructor Attendance Summary',
                access: true,
                loaded: false,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 'all',
                res: [],
                types: [],
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
