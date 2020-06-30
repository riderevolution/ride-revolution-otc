<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Suppliers</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems(res.suppliers.total) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <nuxt-link :to="`${$route.path}/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add New Supplier</nuxt-link>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="q">Find a supplier</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a supplier" class="default_text search_alternate">
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content" v-if="loaded">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Supplier Name</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.suppliers.data.length > 0">
                            <tr v-for="(data, key) in res.suppliers.data" :key="key">
                                <td>{{ data.name }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ data.contact_number }}</td>
                                <td width="20%">
                                    <div class="table_actions">
                                        <nuxt-link class="table_action_success" :to="`/${prevRoute}/products/create?s=${data.id}`">Add a Product</nuxt-link>
                                        <nuxt-link class="table_action_edit" :to="`${$route.path}/${data.id}/edit`">Edit</nuxt-link>
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
                    <pagination :apiRoute="res.suppliers.path" :current="res.suppliers.current_page" :last="res.suppliers.last_page" />
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../components/Foot'
    import Pagination from '../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            return {
                name: 'Suppliers',
                access: true,
                loaded: false,
                prevRoute: '',
                rowCount: 0,
                status: 1,
                res: [],
                form_search: {
                    user: ''
                }
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(`api/suppliers/search`, formData).then(res => {
                    me.res = res.data
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/suppliers?enabled=${value}`).then(res => {
                    me.res = res.data
                    me.loaded = true
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
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
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
