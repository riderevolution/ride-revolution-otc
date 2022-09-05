<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Purchase Orders</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems(res.purchaseOrders.total) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Unpaid</div>
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Paid</div>
                                <div :class="`status ${(status == 2) ? 'active' : ''}`" @click="toggleOnOff(2)">Received</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <nuxt-link :to="`${$route.path}/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>New Purchase Order</nuxt-link>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="supplier_id">Supplier</label>
                                <select class="default_select alternate" name="supplier_id">
                                    <option value="" selected>All Suppliers</option>
                                    <option :value="supplier.id" v-for="(supplier, key) in suppliers" :key="key">{{ supplier.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="q">Find a purchase order</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a purchase order" class="default_text search_alternate">
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">P.O. Number</th>
                                <th class="stick">Supplier</th>
                                <th class="stick">Studio</th>
                                <th class="stick">Total Quantity</th>
                                <th class="stick">Shipping Cost</th>
                                <!-- <th class="stick">Additional Cost</th> -->
                                <th class="stick">Total</th>
                                <th class="stick">Requisition Date</th>
                                <th class="stick">Status</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.purchaseOrders.data.length > 0">
                            <tr v-for="(data, key) in res.purchaseOrders.data" :key="key">
                                <td><nuxt-link class="table_data_link alternate" :to="`${$route.path}/${data.id}/show`">{{ data.purchase_order_number }}</nuxt-link></td>
                                <td>{{ data.supplier.name }}</td>
                                <td>{{ data.studio.name }}</td>
                                <td>{{ data.total_qty }}</td>
                                <td>PHP {{ totalCount(data.total_shipping_cost) }}</td>
                                <!-- <td>PHP {{ totalCount(data.total_additional_cost) }}</td> -->
                                <td>PHP {{ totalCount(data.total_cost) }}</td>
                                <td>{{ formatDate(data.created_at) }}</td>
                                <td :class="`${(data.paid == 1) ? 'green' : 'red'}`" v-if="status != 2">{{ (data.paid == 1) ? 'Paid' : 'Unpaid' }}</td>
                                <td class="green" v-else>Received</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.purchaseOrders.path" :current="res.purchaseOrders.current_page" :last="res.purchaseOrders.last_page" />
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../components/Foot'
    import Pagination from '../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            return {
                name: 'Purchase Order',
                filter: false,
                access: true,
                loaded: false,
                prevRoute: '',
                rowCount: 0,
                status: 0,
                res: [],
                suppliers: [],
                studios: [],
                form_search: {
                    user: ''
                }
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.filter = true
                let formData = new FormData(document.getElementById('filter'))
                formData.append('status', me.status)
                me.loader(true)
                me.$axios.post(`api/inventory/purchase-orders/search`, formData).then(res => {
                    me.res = res.data
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 650)
                })
            },
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/inventory/purchase-orders?status=${value}`).then(res => {
                    me.res = res.data
                    me.loaded = true
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 650)
                })
            },
            async fetchStudiosSuppliers () {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
                me.$axios.get('api/suppliers').then(res => {
                    me.suppliers = res.data.suppliers.data
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(0)
                me.fetchStudiosSuppliers()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
