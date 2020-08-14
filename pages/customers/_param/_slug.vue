<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" :class="`cms_dashboard user ${($route.params.slug == 'transactions' || $route.params.slug == 'class-history' || $route.params.slug == 'upcoming-classes') ? 'alt' : ($route.params.slug == 'details' ? 'alt_2' : ($route.params.slug == 'packages' ? 'alt_3' : ($route.params.slug == 'badges') ? 'alt_4' : ''))}`" v-if="loaded">
                <section id="top_content">
                    <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="user_info">
                        <img class="main" :src="customer.customer_details.images[0].path_resized" v-if="customer.customer_details.images[0].path_resized != null" />
                        <div class="user_image_default" v-else>
                            <div class="overlay">
                                {{ customer.first_name.charAt(0) }}{{ customer.last_name.charAt(0) }}
                            </div>
                        </div>
                        <div class="user_details">
                            <h1 class="user_name">
                                {{ customer.first_name }} {{ customer.last_name }}
                                <span class="icon">
                                    <img src="/icons/first-timer-package-icon.png" v-if="customer.has_first_timer" />
                                    <img :src="customer.customer_details.customer_type.images[0].path_resized" v-if="customer.customer_details.customer_type.images[0].path_resized != null" />
                                </span>
                            </h1>
                            <div class="user_contact">
                                <a :href="`tel:${customer.customer_details.co_contact_number}`" class="number">{{ customer.customer_details.co_contact_number }}</a>
                                <a :href="`mailto:${customer.email}`" class="email">{{ customer.email }}</a>
                            </div>
                            <div class="user_summary">
                                <div class="summary">Completed Rides: {{ customer.completed_rides }}</div>
                                <div class="summary">Store Credits: {{ (customer.store_credits) ? totalItems(customer.store_credits.amount) : 0 }}</div>
                                <div class="summary pending">Pending Payment: Php {{ totalCount(pendingPayment) }}</div>
                            </div>
                            <div class="user_action">
                                <div class="action_user_btn" @click="toggleQuickSale('credit')">Buy Credits</div>
                                <div class="action_user_btn margin" @click="toggleQuickSale('product')">Buy Products</div>
                                <div class="action_success_btn alternate margin" @click="getCurrentCustomer()">Booker</div>
                            </div>
                        </div>
                    </div>
                    <div class="user_tabs">
                        <nuxt-link :to="tab.link" class="tab_title" v-for="(tab, key) in tabs" :key="key">{{ tab.name }}</nuxt-link>
                    </div>
                </section>
                <section id="content">
                    <customer-content :value="customer" :type="$route.params.slug" />
                </section>
                <transition name="fade">
                    <upcoming-classes-layout :studio="layout.studio" :schedule="layout.schedule" v-if="$store.state.upcomingClassesLayoutStatus" />
                </transition>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import CustomerContent from '../../../components/CustomerContent'
    import UpcomingClassesLayout from '../../../components/modals/UpcomingClassesLayout'
    import Foot from '../../../components/Foot'
    export default {
        components: {
            UpcomingClassesLayout,
            CustomerContent,
            Foot
        },
        data () {
            return {
                layout:{
                    studio: null,
                    schedule: null
                },
                name: 'Customers',
                access: true,
                loaded: false,
                lastRoute: '',
                customer: [],
                pendingPayment: 0,
                tabs: [
                    {
                        name: 'Packages',
                        link: `/customers/${this.$route.params.param}/packages`
                    },
                    {
                        name: 'Badges',
                        link: `/customers/${this.$route.params.param}/badges`
                    },
                    {
                        name: 'Upcoming Classes',
                        link: `/customers/${this.$route.params.param}/upcoming-classes`
                    },
                    {
                        name: 'Class History',
                        link: `/customers/${this.$route.params.param}/class-history`
                    },
                    {
                        name: 'Transactions',
                        link: `/customers/${this.$route.params.param}/transactions`
                    },
                    {
                        name: 'Details',
                        link: `/customers/${this.$route.params.param}/details`
                    },
                    {
                        name: 'Health Waiver',
                        link: `/customers/${this.$route.params.param}/health-waiver`
                    }
                ],
            }
        },
        methods: {
            getCurrentCustomer () {
                const me = this
                me.$axios.get(`api/customers/${me.$route.params.param}`).then(res => {
                    if (res.data) {
                        me.$store.state.customer = res.data.user
                        me.$store.state.customerID = res.data.user.id
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
                me.$router.push('/booker')
            },
            fetchData () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}${(me.$route.params.slug == 'class-history') ? '?classHistoryStatus=all' : ''}`).then(res => {
                    if (res.data) {
                        me.customer = res.data.customer
                        me.pendingPayment = me.customer.totalPendingPayments
                        me.loaded = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleQuickSale (type) {
                const me = this
                me.$store.state.customerID = me.$route.params.param
                switch (type) {
                    case 'credit':
                        me.$store.state.customerCreditQuickSaleStatus = true
                        break
                    case 'product':
                        me.$store.state.customerProductQuickSaleStatus = true
                        break
                }
                document.body.classList.add('no_scroll')
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
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        },
    }
</script>
