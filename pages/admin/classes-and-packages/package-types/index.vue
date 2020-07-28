<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg" /><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Package Types</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems(res.packageTypes.total) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <nuxt-link :to="`${$route.path}/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add a Package Type</nuxt-link>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Package Type</th>
                                <th class="stick">Studio Access</th>
                                <th class="stick">Created At</th>
                                <th class="stick">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.packageTypes.data.length > 0">
                            <tr v-for="(data, key) in res.packageTypes.data" :key="key">
                                <td>{{ data.name }}</td>
                                <td>
                                    <div v-for="(studio, key) in data.studio_access" :key="key" v-if="data.studio_access.length != studios.length">
                                        {{ studio.studio.name }} <br />
                                    </div>
                                    <div v-if="data.studio_access.length == studios.length">
                                        All Studios
                                    </div>
                                </td>
                                <td>{{ formatDate(data.created_at) }}</td>
                                <td width="15%">
                                    <div class="table_actions">
                                        <nuxt-link class="table_action_edit" :to="`${$route.path}/${data.id}/edit`">Edit</nuxt-link>
                                        <div class="table_action_cancel link" @click.self="toggleStatus(data.id, 0, 'Deactivated')" v-if="status == 1">Deactivate</div>
                                        <div class="table_action_success link" @click.self="toggleStatus(data.id, 1, 'Activated')" v-if="status == 0">Activate</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.packageTypes.path" :current="res.packageTypes.current_page" :last="res.packageTypes.last_page" />
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
            <transition name="fade">
                <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import Pagination from '../../../../components/Pagination'
    import ConfirmStatus from '../../../../components/modals/ConfirmStatus'
    export default {
        components: {
            Foot,
            Pagination,
            ConfirmStatus,
        },
        data () {
            return {
                name: 'Classes and Packages',
                access: true,
                loaded: false,
                lastRoute: '',
                rowCount: 0,
                status: 1,
                studios: [],
                res: []
            }
        },
        methods: {
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'package_types'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'package type'
                }, 100)
                document.body.classList.remove('no_scroll')
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/packages/package-types?enabled=${value}`).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.$axios.get('api/studios').then(res => {
                            me.studios = res.data.studios
                        })
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                    }, 300)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
