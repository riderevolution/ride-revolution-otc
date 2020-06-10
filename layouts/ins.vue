<template>
    <div id="admin_container" >
        <transition name="slide">
            <div id="success" class="cms_alert" v-if="$store.state.isNotify">
                {{ $store.state.notificationMessage }}!
            </div>
        </transition>
        <transition name="fade">
            <navbar-instructor v-if="$store.state.isAuth" />
        </transition>
        <div class="admin_flex">
            <transition name="fade">
                <header-nav-instructor v-if="$store.state.isAuth" />
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
            <password-sent v-if="$store.state.resetStatus" />
        </transition>
        <transition name="fade">
            <reset-successful v-if="$store.state.resetSuccessfulStatus" />
        </transition>
        <transition name="fade">
            <successful v-if="$store.state.successfulStatus" />
        </transition>
    </div>
</template>

<script>
    import NavbarInstructor from '../components/NavbarInstructor'
    import Loading from '../components/Loading'
    import HeaderNavInstructor from '../components/HeaderNavInstructor'
    import ErrorStatus from '../components/modals/Error'
    import PasswordSent from '../components/modals/PasswordSent'
    import ResetSuccessful from '../components/modals/ResetSuccessful'
    import Successful from '../components/modals/Successful'
    export default {
        components: {
            NavbarInstructor,
            Loading,
            HeaderNavInstructor,
            ErrorStatus,
            PasswordSent,
            ResetSuccessful,
            Successful
        },
        watch:{
            $route (to, from){
                const me = this
                me.$store.state.errorList = []
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
