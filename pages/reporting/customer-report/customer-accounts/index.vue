<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Customer Accounts</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Accounts of Ride Revolution members</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getCustomers()">
                                Export
                            </div>
                            <download-csv
                                v-if="res.customers.data.length > 0"
                                class="hidden me"
                                :data="customerAccountsAttributes"
                                :name="`customer-accounts-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="action_buttons alt">
                        <div class="actions">
                            <div class="toggler">
                                <div :class="`status ${(type == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                                <div :class="`status ${(type == 'active') ? 'active' : ''}`" @click="toggleTab('active')">Active</div>
                                <div :class="`status ${(type == 'inactive') ? 'active' : ''}`" @click="toggleTab('inactive')">Inactive</div>
                                <div :class="`status ${(type == 'unused') ? 'active' : ''}`" @click="toggleTab('unused')">Unused</div>
                                <div :class="`status ${(type == 'deactivated') ? 'active' : ''}`" @click="toggleTab('deactivated')">Deactivated</div>
                            </div>
                            <div class="total">Total: {{ totalItems(total) }}</div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="status" :value="type">
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Rewards</th>
                                <th class="stick">Sign Up Date</th>
                                <th class="stick">First Class</th>
                                <th class="stick">Last Class</th>
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
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                                    </div>
                                </td>
                                <td>-</td>
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : '-' }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[data.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : '-' }}</td>
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
    import Pagination from '../../../../components/Pagination'
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Pagination,
            Foot
        },
        data () {
            return {
                name: 'Customer Accounts',
                access: true,
                loaded: false,
                filter: true,
                rowCount: 0,
                type: 'all',
                res: [],
                users: [],
                total: 0
            }
        },
        computed: {
            customerAccountsAttributes () {
                const me = this
                return [
                    ...me.users.map((value, key) => ({
                        'Customer': value.fullname,
                        'Rewards': '-',
                        'Sign Up Date': me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'First Class': (value.bookings.length > 0) ? me.$moment(value.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : '-',
                        'Last Class': (value.bookings.length > 0) ? me.$moment(value.bookings[value.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : '-',
                        'Contact Number': (value.customer_details.co_contact_number != null) ? value.customer_details.co_contact_number : '-',
                        'Email Address': value.email,
                        'City': (value.customer_details.pa_city != null) ? value.customer_details.pa_city : '-'
                    }))
                ]
            }
        },
        methods: {
            getCustomers () {
                const me = this
                let formData = new FormData()
                me.values = []
                me.loader(true)

                formData.append('status', me.type)
                me.$axios.post('api/reporting/customers/customer-accounts?all=1', formData).then(res => {
                    if (res.data) {

                        res.data.customers.forEach((item, key) => {
                            me.users.push(item)
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
            toggleTab (value) {
                const me = this
                me.type = value
                me.fetchData(value)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('status', value)
                me.$axios.post('api/reporting/customers/customer-accounts', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.count
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
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                await me.fetchData('all')
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
