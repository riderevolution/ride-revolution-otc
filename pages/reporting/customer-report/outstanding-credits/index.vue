<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Outstanding Store Credits</h1>
                            </div>
                            <h2 class="header_subtitle">Store credits owned by Ride Revolution members</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="action_buttons alt">
                        <div class="actions">
                            <div class="total alt">Total Store Credits: Php {{ totalCount(total) }}</div>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Rewards</th>
                                <th class="stick">Store Credits Bought</th>
                                <th class="stick">Store Credits Remaining</th>
                                <th class="stick">Spent</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.id}/packages`">{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                </td>
                                <td>Black</td>
                                <td>Php {{ totalCount(data.totalBroughtStoreCredits) }}</td>
                                <td>Php {{ totalCount(data.store_credits.amount) }}</td>
                                <td>Php {{ totalCount(data.totalBroughtStoreCredits - data.store_credits.amount) }}</td>
                                <td>{{ (data.customer_details != null) ? data.customer_details.co_contact_number : 'N/A' }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ (data.customer_details != null) ? data.customer_details.pa_city : 'N/A' }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </transition>
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
                loaded: false,
                rowCount: 0,
                status: 'all',
                total: 0,
                res: []
            }
        },
        methods: {
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                me.$axios.post('api/reporting/customers/outstanding-store-credits', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total = res.data.totalStoreCredits
                            me.res = res.data.result
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
