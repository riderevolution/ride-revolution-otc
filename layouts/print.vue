<template>
    <div id="print" >
        <nuxt />
        <transition name="fade">
            <loading v-if="$store.state.isLoading" />
        </transition>
        <transition name="fade">
            <error-status v-if="$store.state.errorStatus" />
        </transition>
    </div>
</template>

<script>
    import Loading from '../components/Loading'
    import ErrorStatus from '../components/modals/Error'
    export default {
        components: {
            Loading,
            ErrorStatus,
        },
        watch:{
            $route (to, from){
                const me = this
                me.$store.state.onlineAttendanceLayoutStatus = false
                me.$store.state.attendanceLayoutStatus = false
                me.$store.state.upcomingClassesLayoutStatus = false
                me.$store.state.assignWaitlistBookerUI = false
                me.$store.state.disableBookerUI = false
                me.$store.state.userPackageCountId = 0
                me.$store.state.compID = 0
                me.$store.state.bookingID = 0
                me.$store.state.scheduleID = 0
                me.$store.state.seatID = 0
                me.$store.state.waitlistID = 0
                me.$store.state.pendingCustomerID = 0
                me.$store.state.errorList = []
                if (!me.routes.includes(me.$route.path)) {
                    me.validateToken()
                }
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
        mounted () {
            const me = this
            let token = me.$cookies.get('70hokcotc3hhhn5')
            if (token != null || token != undefined) {
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
            }
            if (!me.routes.includes(me.$route.path)) {
                me.validateToken()
            }
            document.addEventListener('contextmenu', event => event.preventDefault())
        },
        head () {
            return {
                title: 'Ride Revolution | Admin Panel'
            }
        }
    }
</script>
