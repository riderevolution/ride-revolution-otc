<template>
    <div class="content" v-if="loaded">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link to="/" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Back</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Notifications</h1>
                </div>
            </section>
            <section id="content">
                <div class="notification">
                    <div class="notification_box_alternate active">
                        <div class="wrapper">
                            <div class="notification_wrapper" v-for="(data, key) in res.logs.data" v-if="(key + 1) <= 20">
                                <span>&#9679;</span>
                                <div class="notification_desc">
                                    <div class="notification_title">{{ data.body }}</div>
                                    <div class="notification_time"><b>{{ data.ip_address }}</b> ({{ getFromNow(data.created_at) }})</div>
                                    <!-- <div class="notification_time"><b>{{ $moment(data.created_at).format('MMM DD, YYYY hh:mm A') }})</div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <pagination :apiRoute="res.logs.path" :current="res.logs.current_page" :last="res.logs.last_page" />
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Pagination from '../../components/Pagination'
    import Foot from '../../components/Foot'
    export default {
        components: {
            Pagination,
            Foot
        },
        data () {
            return {
                loaded: false,
                res: []
            }
        },
        methods: {
            getFromNow (value) {
                const me = this
                if (value) {
                    return me.$moment(value).fromNow()
                }
            },
            fetchData () {
                const me = this
                me.$axios.get('api/logs').then(res => {
                    if (res.data) {
                        me.res = res.data
                        me.loaded = true
                    }
                })
            }
        },
        mounted () {
            const me = this
            me.fetchData()
        }
    }
</script>
