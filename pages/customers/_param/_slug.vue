<template>
    <div class="content">
        <div id="admin" class="cms_dashboard user" v-if="loaded">
            <section id="top_content">
                <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                <div class="user_info">
                    <img :src="customer.customer_details.images[0].path_resized" v-if="customer.customer_details.images.length > 0" />
                    <div class="user_image_default" v-else>
                        {{ customer.first_name.charAt(0) }}{{ customer.last_name.charAt(0) }}
                    </div>
                    <div class="user_details">
                        <h1 class="user_name">{{ customer.first_name }} {{ customer.last_name }}</h1>
                        <div class="user_contact">
                            <a :href="`tel:${customer.customer_details.co_contact_number}`" class="number">{{ customer.customer_details.co_contact_number }}</a>
                            <a :href="`mailto:${customer.email}`" class="email">{{ customer.email }}</a>
                        </div>
                        <div class="user_summary">
                            <div class="summary">Completed Rides: 89</div>
                            <div class="summary">Store Credits: 2,000</div>
                            <div class="summary pending">Pending Payment: Php 500.00</div>
                        </div>
                        <div class="user_action">
                            <a href="javascript:void(0)" class="action_user_btn" @click="toggleQuickSale('credit')">Buy Credits</a>
                            <a href="javascript:void(0)" class="action_user_btn margin" @click="toggleQuickSale('product')">Buy Products</a>
                        </div>
                    </div>
                </div>
                <div class="user_tabs">
                    <nuxt-link :to="tab.link" class="tab_title" v-for="(tab, key) in tabs" :key="key">{{ tab.name }}</nuxt-link>
                </div>
            </section>
            <section id="content">
                <customer-content :type="$route.params.slug" />
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import CustomerContent from '../../../components/CustomerContent'
    import Foot from '../../../components/Foot'
    export default {
        components: {
            CustomerContent,
            Foot
        },
        data () {
            return {
                loaded: false,
                lastRoute: '',
                customer: [],
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
                    }
                ],
            }
        },
        methods: {
            fetchData () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.customer = res.data.customer
                        me.loaded = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 300)
                })
            },
            toggleQuickSale (type) {
                const me = this
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
        mounted () {
            const me = this
            me.fetchData()
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        },
    }
</script>