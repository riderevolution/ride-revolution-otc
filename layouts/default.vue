<template>
    <div id="admin_container" >
        <transition name="slide">
            <div id="success" class="cms_alert" v-if="$store.state.isNotify">
                {{ $store.state.notificationMessage }}!
            </div>
        </transition>
        <transition name="fade">
            <navbar v-if="$store.state.isAuth" />
        </transition>
        <div class="admin_flex">
            <transition name="fade">
                <headerNav v-if="$store.state.isAuth" />
            </transition>
            <nuxt />
        </div>
        <transition name="fade">
            <loading v-if="$store.state.isLoading" />
        </transition>
        <transition name="fade">
            <error-status v-if="$store.state.errorStatus" />
        </transition>
        <transition name="fade">
            <error-quick-sale v-if="$store.state.errorQuickSaleStatus" />
        </transition>
        <transition name="fade">
            <password-sent v-if="$store.state.resetStatus" />
        </transition>
        <transition name="fade">
            <reset-successful v-if="$store.state.resetSuccessfulStatus" />
        </transition>
        <transition name="fade">
            <quick-sale v-if="$store.state.quickSaleStatus" />
        </transition>
        <transition name="fade">
            <customer-credit-quick-sale v-if="$store.state.customerCreditQuickSaleStatus" />
        </transition>
        <transition name="fade">
            <customer-product-quick-sale v-if="$store.state.customerProductQuickSaleStatus" />
        </transition>
        <transition name="fade">
            <successful v-if="$store.state.successfulStatus" />
        </transition>
        <transition name="fade">
            <successful-later v-if="$store.state.successfulLaterStatus" />
        </transition>
        <transition name="fade">
            <studio-changer v-if="$store.state.changeStudioStatus" />
        </transition>
    </div>
</template>

<script>
    import Navbar from '../components/Navbar'
    import Loading from '../components/Loading'
    import HeaderNav from '../components/HeaderNav'
    import ErrorStatus from '../components/modals/Error'
    import ErrorQuickSale from '../components/modals/ErrorQuickSale'
    import PasswordSent from '../components/modals/PasswordSent'
    import ResetSuccessful from '../components/modals/ResetSuccessful'
    import QuickSale from '../components/modals/QuickSale'
    import CustomerCreditQuickSale from '../components/modals/CustomerCreditQuickSale'
    import CustomerProductQuickSale from '../components/modals/CustomerProductQuickSale'
    import Successful from '../components/modals/Successful'
    import SuccessfulLater from '../components/modals/SuccessfulLater'
    import StudioChanger from '../components/modals/StudioChanger'
    export default {
        components: {
            Navbar,
            Loading,
            HeaderNav,
            ErrorStatus,
            ErrorQuickSale,
            PasswordSent,
            ResetSuccessful,
            CustomerCreditQuickSale,
            CustomerProductQuickSale,
            QuickSale,
            Successful,
            SuccessfulLater,
            StudioChanger
        },
        watch:{
            $route (to, from){
                const me = this
                me.$store.state.upcomingClassesLayoutStatus = false
                me.$store.state.assignWaitlistBookerUI = false
                me.$store.state.disableBookerUI = false
                me.$store.state.classPackageID = 0
                me.$store.state.compID = 0
                me.$store.state.bookingID = 0
                me.$store.state.scheduleID = 0
                me.$store.state.seatID = 0
                me.$store.state.waitlistID = 0
                me.$store.state.pendingCustomerID = 0
                me.$store.state.errorList = []
                // if (me.$store.state.user.type != 0) {
                //     me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                // }
            }
        },
        data () {
            return {
                routes: [
                    '/login',
                    '/forgot-password',
                    '/reset-password'
                ]
            }
        },
        methods: {
            windowScroll() {
                const me = this
                let selector = document.querySelector('.cms_table')
                if (selector) {
                    let bounding = selector.getBoundingClientRect()
                    if (bounding.top < 0) {
                        selector.querySelector('thead').classList.add('sticky')
                    } else {
                        selector.querySelector('thead').classList.remove('sticky')
                    }
                }
            }
        },
        mounted () {
            const me = this
            let token = me.$cookies.get('token')
            me.$axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.user.type != 0) {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                }
            }).catch(err => {
                console.log(err);
            })
            if (!me.routes.includes(me.$route.path)) {
                me.validateToken()
            }
            document.addEventListener('contextmenu', event => event.preventDefault())
            document.body.classList.add('cms')
        },
        beforeMount () {
            window.addEventListener('scroll', this.windowScroll)
        },
        beforeDestroy () {
            window.removeEventListener('scroll', this.windowScroll)
        },
        head () {
            return {
                title: 'Ride Revolution | Admin Panel',
                script: [
                    { src: 'https://code.jquery.com/jquery-3.2.1.slim.min.js' },
                    { src: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/codemirror.js' },
                    { src: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/xml/xml.js' },
                    { src: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/2.36.0/formatting.js' },
                    { src: 'https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote-lite.js' }
                ],
                link: [
                    { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/codemirror.css' },
                    { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/theme/monokai.css' },
                    { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote-lite.css' }
                ]
            }
        }
    }
</script>
