<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
                <nuxt-link :to="`/admin/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg" /><span>{{ lastRoute }}</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Customer Types</h1>
                    <div class="actions">
                        <div class="total">Total: {{ totalItems(count) }}</div>
                    </div>
                </div>
                <div class="action_buttons">
                    <nuxt-link :to="`${$route.path}/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add Type</nuxt-link>
                </div>
            </section>
            <section id="content">
                <table class="cms_table" v-if="loaded">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Icon</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.length > 0">
                        <tr v-for="(data, key) in res" :key="key">
                            <td>{{ data.name }}</td>
                            <td><img :src="data.images[0].path" /></td>
                            <td>
                                <div class="table_actions">
                                    <nuxt-link class="table_action_edit" :to="`${$route.path}/${data.id}/edit`">Edit</nuxt-link>
                                    <a class="table_action_cancel" href="javascript:void(0)" @click="toggleDelete(data.id)">Delete</a>
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
            </section>
        </div>
        <transition name="fade">
            <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="`api/extras/customer-types`" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import ConfirmDelete from '../../../../components/modals/ConfirmDelete'
    export default {
        components: {
            Foot,
            ConfirmDelete
        },
        data () {
            return {
                loaded: false,
                lastRoute: '',
                rowCount: 0,
                res: [],
                count: 0
            }
        },
        methods: {
            toggleDelete (id) {
                const me = this
                me.$store.state.deleteStatus = true
                document.body.classList.add('no_scroll')
                setTimeout( () => {
                    me.$refs.delete.contentID = id
                }, 100)
            },
            async fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.res = res.data.customerTypes
                    me.count = me.res.length
                    me.loaded = true
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.rowCount = document.getElementsByTagName('th').length
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
