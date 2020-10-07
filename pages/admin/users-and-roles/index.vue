<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <h1 class="header_title">Users &amp; Roles</h1>
                    <div class="actions">
                        <div class="total">Total: {{ totalItems(total_count) }}</div>
                        <div class="toggler">
                            <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated Roles</div>
                            <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated Roles</div>
                            <div :class="`status ${(status == -1) ? 'active' : ''}`" @click="toggleOnOff(-1)">Deactivated Users</div>
                        </div>
                    </div>
                </div>
                <div class="action_buttons">
                    <a @click="toggleForm(0, 0, 'user')" href="javascript:void(0)" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add a User</a>
                    <nuxt-link to="/admin/users-and-roles/roles/create" class="action_btn margin"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add a Role</nuxt-link>
                </div>
                <div class="filter_wrapper" v-if="status != 0">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                        <div class="form_group">
                            <label for="q">Find a user</label>
                            <input type="text" name="q" placeholder="Search for a user" autocomplete="off" class="default_text search_alternate">
                        </div>
                        <div class="form_group margin">
                            <label for="studio_id">Studio</label>
                            <select class="default_select alternate" name="studio_id">
                                <option value="" selected>All Studios</option>
                                <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                            </select>
                        </div>
                        <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                    </form>
                </div>
            </section>
            <section id="content">
                <table class="cms_table_accordion" v-if="status == 1">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th>Users</th>
                            <th>Permissions</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody :class="`${(role.open) ? 'toggled' : ''} tbp`" v-for="(role, key) in res" v-if="res.length > 0">
                        <tr class="parent">
                            <td class="toggler" @click.self="toggleAccordion($event, key)">{{ role.display_name }}</td>
                            <td>{{ countActivatedUsers(role.staff_details) }}</td>
                            <td>{{ countPermissions(parser(role.permissions_pages), parser(role.permissions_reporting)) }}</td>
                            <td width="20%">
                                <div class="table_actions">
                                    <nuxt-link class="table_action_edit link" :to="`/admin/users-and-roles/roles/${role.id}/edit`">Edit Role</nuxt-link>
                                    <div class="table_action_cancel link" @click.self="toggleStatus(role.id, 0, 'Deactivated')" v-if="status == 1">Deactivate</div>
                                    <div class="table_action_success link"  @click.self="toggleStatus(role.id, 1, 'Activated')" v-if="status == 0">Activate</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="pads" colspan="4">
                                <div class="accordion_table">
                                    <table class="cms_table">
                                        <thead>
                                            <tr>
                                                <th>Email Address</th>
                                                <th>First Name</th>
                                                <th>Last Name</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody v-if="role.staff_details.length > 0">
                                            <tr v-for="(staff, key) in role.staff_details" :key="key" v-if="staff.user.enabled == 1">
                                                <td>{{ staff.user.email }}</td>
                                                <td>{{ staff.user.first_name }}</td>
                                                <td>{{ staff.user.last_name }}</td>
                                                <td width="20%">
                                                    <div class="table_actions">
                                                        <div class="table_action_edit link" @click="toggleForm(staff.user.id, 1, 'user')">Edit</div>
                                                        <div class="table_action_cancel link" @click.self="toggleUserStatus(staff.user.id, 0, 'Deactivated')" v-if="status == 1">Deactivate</div>
                                                        <div class="table_action_success link" @click.self="toggleUserStatus(staff.user.id, 1, 'Activated')" v-if="status == 0">Activate</div>
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
                <!-- Roles Table -->
                <table class="cms_table" v-else-if="status == 0">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th>Users</th>
                            <th>Permissions</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.length > 0">
                        <tr v-for="(role, key) in res" :key="key">
                            <td>{{ role.display_name }}</td>
                            <td>{{ role.staff_details.length }}</td>
                            <td>{{ countPermissions(parser(role.permissions_pages), parser(role.permissions_reporting)) }}</td>
                            <td>
                                <div class="table_actions">
                                    <nuxt-link class="table_action_edit link" :to="`/admin/users-and-roles/roles/${role.id}/edit`">Edit Role</nuxt-link>
                                    <div class="table_action_success link" @click.self="toggleStatus(role.id, 1, 'Activated')" v-if="key > 1">Activate Role</div>
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
                <!-- Users Table -->
                <table class="cms_table" v-else-if="status == -1">
                    <thead>
                        <tr>
                            <th>Email Address</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.length > 0">
                        <tr v-for="(staff, key) in res" :key="key">
                            <td>{{ staff.email }}</td>
                            <td>{{ staff.first_name }}</td>
                            <td>{{ staff.last_name }}</td>
                            <td>
                                <div class="table_actions">
                                    <a class="table_action_edit" href="javascript:void(0)" @click="toggleForm(staff.id, 1, 'user')">Edit User</a>
                                    <a class="table_action_success" @click.self="toggleUserStatus(staff.id, 1, 'Activated')" href="javascript:void(0)">Activate User</a>
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
            <user-form v-if="$store.state.userForm" :type="type" :id="id" :status="status" />
        </transition>
        <transition name="fade">
            <role-form v-if="$store.state.roleForm" :type="type" :id="id" :status="status" />
        </transition>
        <transition name="fade">
            <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" :isUser="isUser" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../components/Foot'
    import UserForm from '../../../components/modals/UserForm'
    import RoleForm from '../../../components/modals/RoleForm'
    import ConfirmStatus from '../../../components/modals/ConfirmStatus'
    export default {
        components: {
            Foot,
            UserForm,
            RoleForm,
            ConfirmStatus
        },
        data () {
            return {
                name: 'Users and Roles',
                access: true,
                isUser: 0,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0,
                studios: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(`api/staff/search`, formData).then(res => {
                    me.res = res.data.roles
                    me.rowCount = 4
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                    }, 500)
                })
            },
            /**
             * Count Permissions per role
             * @param  {[array]} pages
             * @param  {[array]} reportings
             * @return {[ctr]}
             */
            countPermissions (pages, reportings) {
                const me = this
                let pagesCtr = 0
                let reportingsCtr = 0
                pages.forEach((value, index) => {
                    if (value.checked) {
                        pagesCtr++
                    }
                })
                reportings.forEach((value, index) => {
                    if (value.checked) {
                        reportingsCtr++
                    }
                })
                if ((pagesCtr + reportingsCtr) == 46) {
                    return 'All'
                } else {
                    return pagesCtr + reportingsCtr
                }
            },
            /**
             * Count Activated Users
             * @param  {[array]} values
             * @return {[ctr]}
             */
            countActivatedUsers (values) {
                const me = this
                if (values.length > 0) {
                    if (values !== undefined) {
                        let ctr = 0
                        values.forEach((value, index) => {
                            if (value !== undefined) {
                                if (value.user.enabled) {
                                    ctr++
                                }
                            }
                        })
                        return ctr
                    }
                } else {
                    return 0
                }
            },
            /**
             * Custom toggler for accordion
             * @param  {[object]} event
             * @param  {[int]} key
             * @return {[css]}
             */
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res[key].open ^= true
                if (me.res[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            /**
             * Toggle User and Role Form
             * @param  {[int]} value id
             * @param  {[int]} type method
             * @param  {[string]} category
             * @return {[boolean]}
             */
            toggleForm (value, type, category) {
                const me = this
                switch (category) {
                    case 'role':
                        me.$store.state.roleForm = true
                        break
                    case 'user':
                        me.$store.state.userForm = true
                        break
                }
                me.type = type
                if (value != 0) {
                    me.id = value
                } else {
                    me.id = 0
                }
                document.body.classList.add('no_scroll')
            },
            /**
             * Toggle Confirm Status for Role
             * @param  {[int]}  id role.id
             * @param  {[boolean]}  enabled
             * @param  {[string]}  status
             * @return {boolean}
             */
            toggleStatus (id, enabled, status) {
                const me = this
                me.isUser = 1
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'roles'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'role'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleUserStatus (id, enabled, status) {
                const me = this
                me.isUser = 0
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'users'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'user'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
                setTimeout( () => {
                    me.rowCount = document.getElementsByTagName('th').length
                }, 10)
            },
            async fetchData (value) {
                const me = this
                me.loader(true)
                me.rowCount = 4
                if (value != -1) {
                    me.$axios.get(`api/roles?enabled=${value}`).then(res => {
                        setTimeout( () => {
                            me.res = res.data.roles
                            me.total_count = me.res.length
                        }, 500)
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                            const elements = document.querySelectorAll('.cms_table_accordion .tbp')
                            elements.forEach((element, index) => {
                                element.classList.remove('toggled')
                                element.querySelector('.accordion_table').style.height = 0
                            })
                        }, 500)
                    })
                } else {
                    me.$axios.get(`api/staff?enabled=0`).then(res => {
                        me.res = res.data.staff.data
                        me.total_count = me.res.length
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
            async fetchStudios () {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
                me.fetchStudios()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
