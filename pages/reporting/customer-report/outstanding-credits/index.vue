<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Outstanding Store Credits</h1>
                            </div>
                            <h2 class="header_subtitle">Store credits owned by Ride Revolution members</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/customer/outstanding-credits`" target="_blank" class="action_btn alternate">Print</a>
                            <div class="action_btn alternate" @click="getCustomers()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="outstadingCreditsAttributes"
                                :name="`outstanding-credits-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
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
                        <tbody v-if="res.result.data.length > 0">
                            <tr v-for="(data, key) in res.result.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                                    </div>
                                </td>
                                <td>-</td>
                                <td>Php {{ totalCount(data.totalBroughtStoreCredits) }}</td>
                                <td>Php {{ totalCount(data.store_credits.amount) }}</td>
                                <td>Php {{ -totalCount(data.store_credits.amount - data.totalBroughtStoreCredits) }}</td>
                                <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : '-' }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ (data.customer_details.pa_city != null) ? data.customer_details.pa_city : '-' }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.result.path" :current="res.result.current_page" :last="res.result.last_page" />
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
                name: 'Outstanding Credits',
                access: true,
                loaded: false,
                filter: true,
                rowCount: 0,
                status: 'all',
                total: 0,
                res: [],
                values: []
            }
        },
        computed: {
            outstadingCreditsAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Customer': value.fullname,
                        'Rewards': '-',
                        'Store Credits Bought': me.totalCount(value.totalBroughtStoreCredits),
                        'Store Credits Remaining': me.totalCount(value.store_credits.amount),
                        'Spent': me.totalCount(value.totalBroughtStoreCredits - value.store_credits.amount),
                        'Contact Number': (value.customer_details != null) ? value.customer_details.co_contact_number : '-',
                        'Email Address': value.email,
                        'City': (value.customer_details != null) ? value.customer_details.pa_city : '-'
                    }))
                ]
            }
        },
        methods: {
            getCustomers () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []
                me.loader(true)
                me.$axios.post(`api/reporting/customers/outstanding-store-credits?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.customers.forEach((item, key) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                me.$axios.post('api/reporting/customers/outstanding-store-credits', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total = res.data.totalStoreCredits
                            me.res = res.data

                            me.loaded = true
                        }, 500)
                    }
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
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
