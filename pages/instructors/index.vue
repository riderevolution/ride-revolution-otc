<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
                <div class="action_wrapper">
                    <h1 class="header_title">Instructors</h1>
                    <div class="actions">
                        <nuxt-link :to="`${$route.path}/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add New Instructor</nuxt-link>
                        <div class="total">Total: {{ totalCount(res.instructors.total) }}</div>
                        <div class="toggler">
                            <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                            <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                        </div>
                    </div>
                </div>
                <div class="filter_wrapper">
                    <div class="filter_flex">
                        <div class="form_group">
                            <label for="q">Find a Instructor</label>
                            <input type="text" name="q" autocomplete="off" class="default_text search_alternate" v-model="form_search.user" @change="search()">
                        </div>
                    </div>
                </div>
            </section>
            <section id="content" v-if="loaded">
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Nickname</th>
                            <th>Email Address</th>
                            <th>Contact No.</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.instructors.data.length > 0">
                        <tr v-for="(data, key) in res.instructors.data" :key="key">
                            <td class="thumb" width="10"><img :src="data.instructor_details.images[0].path_resized" /></td>
                            <td><a class="table_data_link" :href="`${$route.path}/${data.id}`" table_action_text>{{ data.last_name }}</a></td>
                            <td><a class="table_data_link" :href="`${$route.path}/${data.id}`" table_action_text>{{ data.first_name }}</a></td>
                            <td>{{ data.instructor_details.nickname }}</td>
                            <td>{{ data.email }}</td>
                            <td>{{ (data.instructor_details != null) ? data.instructor_details.io_contact_number : '-' }}</td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
                <pagination :apiRoute="res.instructors.path" :current="res.instructors.current_page" :last="res.instructors.total" />
            </section>
        </div>
        <transition name="fade">
            <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../components/Foot'
    import UserForm from '../../components/modals/UserForm'
    import RoleForm from '../../components/modals/RoleForm'
    import ConfirmStatus from '../../components/modals/ConfirmStatus'
    import Pagination from '../../components/Pagination'
    export default {
        components: {
            Foot,
            UserForm,
            RoleForm,
            ConfirmStatus,
            Pagination
        },
        data () {
            return {
                loaded: false,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0,
                types: [],
                form_search: {
                    user: '',
                    studio: 'All'
                }
            }
        },
        methods: {
            search () {
                const me = this
                console.log(me.form_search.user);
                console.log(me.form_search.studio);
            },
            /**
             * Toggle Confirm Status for Role
             * @param  {[int]}  id role.id
             * @param  {[boolean]}  enabled
             * @param  {[string]}  status
             * @return {boolean}
             */
            async toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'roles'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'role'
                }, 100)
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
                me.rowCount = document.getElementsByTagName('th').length
            },
            async fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/instructors?enabled=${value}`).then(res => {
                    me.res = res.data
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
        }
    }
</script>