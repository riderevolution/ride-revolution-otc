<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Studio Receiving</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems(res.purchaseOrders.total) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Pending</div>
                                <div :class="`status ${(status == 2) ? 'active' : ''}`" @click="toggleOnOff(2)">Received</div>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">P.O. Number</th>
                                <th class="stick">Supplier</th>
                                <th class="stick">Studio</th>
                                <th class="stick">Requisition Date</th>
                                <th class="stick">Delivery Date</th>
                                <th class="stick">Lead Time</th>
                                <th class="stick">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.purchaseOrders.data.length > 0">
                            <tr v-for="(data, key) in res.purchaseOrders.data" :key="key">
                                <td>{{ data.purchase_order_number }}</td>
                                <td>{{ data.supplier.name }}</td>
                                <td>{{ data.studio.name }}</td>
                                <td>{{ formatDate(data.created_at) }}</td>
                                <td :class="`${(data.paid == 2) ? '' : 'red'}`">{{ (data.paid == 2) ? formatDate(data.delivery_date) : 'Pending' }}</td>
                                <td>{{ (data.paid == 2) ? data.lead_time : '-' }}</td>
                                <td>
                                    <div class="table_actions" v-if="data.paid == 1">
                                        <nuxt-link class="table_action_success" :to="`${$route.path}/${data.id}/receive`">Receive</nuxt-link>
                                    </div>
                                    <div class="table_actions" v-else>
                                        <nuxt-link class="table_action_edit" :to="`${$route.path}/${data.id}/show`">View</nuxt-link>
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
                    <pagination :apiRoute="res.purchaseOrders.path" :current="res.purchaseOrders.current_page" :last="res.purchaseOrders.last_page" />
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../components/Foot'
    import Pagination from '../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            return {
                name: 'Studio Receiving',
                access: true,
                loaded: false,
                prevRoute: '',
                rowCount: 0,
                status: 1,
                res: []
            }
        },
        methods: {
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
                let studio_id = me.$cookies.get('CSID')
                me.$axios.get(`api/inventory/purchase-orders?status=${value}&studio_id=${studio_id}`).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
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
