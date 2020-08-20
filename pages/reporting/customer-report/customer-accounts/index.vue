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
                            
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="action_buttons alt">
                        <div class="actions">
                            <div class="toggler">
                                <div :class="`status ${(status == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                                <div :class="`status ${(status == 'active') ? 'active' : ''}`" @click="toggleTab('active')">Active</div>
                                <div :class="`status ${(status == 'inactive') ? 'active' : ''}`" @click="toggleTab('inactive')">Inactive</div>
                                <div :class="`status ${(status == 'unused') ? 'active' : ''}`" @click="toggleTab('unused')">Unused</div>
                                <div :class="`status ${(status == 'deactivated') ? 'active' : ''}`" @click="toggleTab('deactivated')">Deactivated</div>
                            </div>
                            <div class="total">Total: {{ totalItems(total) }}</div>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Rewards</th>
                                <th class="stick">Sign Up Date</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <nuxt-link class="table_data_link" :to="`/customers/${data.id}/packages`">{{ data.last_name }} {{ data.last_name }}</nuxt-link>
                                    </div>
                                </td>
                                <td>Black</td>
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ (data.customer_details != null) ? data.customer_details.co_contact_number : '-' }}</td>
                                <td>Sample</td>
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
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Customer Accounts',
                access: true,
                loaded: false,
                rowCount: 0,
                status: 'all',
                res: [],
                total: 0
            }
        },
        methods: {
            toggleTab (value) {
                const me = this
                me.status = value
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
                            me.res = res.data.customers
                            me.total = me.res.length
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
                me.fetchData('all')
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
