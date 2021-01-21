<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/admin/configuration/system-emails" class="action_back_btn"><img src="/icons/back-icon.svg"><span>System Emails</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">{{ replacer($route.params.slug) }}</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent>
                        <div class="form_group_disclaimer">
                            <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>DO NOT edit the texts that are enclosed on square brackets (e.g. [[ name ]]) including the spaces and the square brackets themselves.</span></div>
                        </div>
                        <div class="form_wrapper">
                            <iframe :src="`${api_host}/mail-editor/${$route.params.slug}`" style="border:none;" width="100%" height="700px"></iframe>
                        </div>
                    </form>
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '~/components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Configuration',
                access: true,
                loaded: false,
                api_host: ''
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.api_host = process.env.API_URL
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
