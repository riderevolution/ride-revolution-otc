<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Outstanding Store Credits</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                        <h2 class="header_subtitle">Store credits owned by Ride Revolution members</h2>
                    </div>
                    <div class="actions">
                        <a href="javascript:void(0)" class="action_btn">Print</a>
                        <a href="javascript:void(0)" class="action_btn margin">Export</a>
                    </div>
                </div>
                <div class="action_buttons alt">
                    <div class="actions">
                        <div class="total alt">Total Store Credits: Php946,000.00</div>
                    </div>
                </div>
            </section>
            <section id="content" v-if="loaded">
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th class="stick">Customer</th>
                            <th class="stick">Rewards</th>
                            <th class="stick">Store Credits Bought</th>
                            <th class="stick">Store Credits Refunded</th>
                            <th class="stick">Store Credits Remaining</th>
                            <th class="stick">Spent</th>
                            <th class="stick">Contact Number</th>
                            <th class="stick">Email Address</th>
                            <th class="stick">City</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.customers.data.length > 0">
                        <tr v-for="(data, key) in res.customers.data" :key="key">
                            <td>
                                <div class="thumb">
                                    <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                    <div class="table_image_default" v-else>
                                        {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                    </div>
                                    <nuxt-link class="table_data_link" :to="`${$route.path}/${data.id}/packages`" table_action_text>{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                </div>
                            </td>
                            <td>Black</td>
                            <td>Php 1,000.00</td>
                            <td>Php 1,000.00</td>
                            <td>Php 1,500.00</td>
                            <td>Php 500.00</td>
                            <td>{{ (data.customer_details != null) ? data.customer_details.co_contact_number : '-' }}</td>
                            <td>{{ data.email }}</td>
                            <td>Sample</td>
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
        <foot v-if="$store.state.isAuth" />
    </div>
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
            me.fetchData(1)
            me.fetchTypes()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
