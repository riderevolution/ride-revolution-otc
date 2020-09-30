<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Customers</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems(res.customers.total) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <nuxt-link :to="`${$route.path}/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add New Customer</nuxt-link>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group alternate">
                                <label for="q">Find a Customer</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate">
                            </div>
                            <div class="form_group margin">
                                <label for="type">Customer Type</label>
                                <select class="default_select alternate" name="type">
                                    <option value="" selected>All Customer Types</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                                </select>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Full Name</th>
                                <th class="stick">Type</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">Contact No.</th>
                                <th class="stick">Pending Payment</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.customers.data.length > 0">
                            <tr v-for="(data, key) in res.customers.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <nuxt-link class="table_data_link" :to="`${$route.path}/${data.id}/packages`">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                    </div>
                                </td>
                                <td>{{ data.customer_details.customer_type.name }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : '-' }}</td>
                                <td>
                                    <div class="table_actions" v-if="data.totalPendingPayments">
                                        <div class="table_action_text red">Php {{ totalCount(data.totalPendingPayments) }}</div>
                                        <div class="link table_action_success" @click="togglePendingTransactions(data.id)">Pay Now</div>
                                    </div>
                                    <div v-else>
                                        -
                                    </div>
                                </td>
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
    </transition>
</template>

<script>
    import Foot from '../../components/Foot'
    import Pagination from '../../components/Pagination'
    import UserForm from '../../components/modals/UserForm'
    import RoleForm from '../../components/modals/RoleForm'
    import ConfirmStatus from '../../components/modals/ConfirmStatus'
    import PendingTransactions from '../../components/modals/PendingTransactions'
    import CustomerPendingQuickSale from '../../components/modals/CustomerPendingQuickSale'
    export default {
        components: {
            Foot,
            Pagination,
            UserForm,
            RoleForm,
            ConfirmStatus,
            PendingTransactions,
            CustomerPendingQuickSale
        },
        data () {
            return {
                name: 'Customers',
                filter: false,
                access: true,
                pagination: 20,
                loaded: false,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 1,
                res: [],
                types: [],
                transaction: []
            }
        },
        methods: {
            submitPaginate () {
                const me = this
                me.fetchData(me.status)
            },
            togglePendingTransactions (id) {
                const me = this
                me.$store.state.pendingCustomerID = id
                me.$store.state.pendingTransactionsStatus = true
                document.body.classList.add('no_scroll')
            },
            submissionSuccess () {
                const me = this
                me.filter = true
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
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
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
