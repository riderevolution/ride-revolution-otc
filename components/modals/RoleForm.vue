<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionAddSuccess()" enctype="multipart/form-data" v-if="type == 0">
            <div class="modal_wrapper">
                <h2 class="form_title">Add a New Role</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group alternate scrollable">
                    <div class="form_group">
                        <label for="display_name">Role Name <span>*</span></label>
                        <input type="text" name="display_name" autocomplete="off" autofocus class="default_text" v-validate="'required|max:100'">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('display_name')">{{ errors.first('display_name') | properFormat }}</span></transition>
                    </div>
                    <div class="form_flex select_all">
                        <label class="flex_label alternate">Select permissions under this role <span>*</span></label>
                        <div class="form_check select_all">
                            <div :class="`custom_action_check ${(checkPermissions) ? 'checked' : ''}`" @click.prevent="toggleSelectAllPermissions($event)">Select All</div>
                        </div>
                        <div class="form_check" v-for="(permission, key) in permissions" :key="key">
                            <input type="checkbox" :id="`permission_${key}`" name="permissions" :class="`action_check ${permission.class}`" v-model="permission.checked">
                            <label :for="`permission_${key}`">{{ permission.name }}</label>
                        </div>
                        <transition name="slide"><span class="validation_errors" v-if="hasPermissions">The Permissions field is required</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check default">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Add Role</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <form id="default_form" class="overlay" @submit.prevent="submissionUpdateSuccess()" enctype="multipart/form-data" v-else>
            <div class="modal_wrapper">
                <h2 class="form_title">Update {{ res.display_name }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group scrollable">
                    <div class="form_group">
                        <label for="display_name">Role Name <span>*</span></label>
                        <input type="text" name="display_name" autocomplete="off" class="default_text" v-validate="'required|max:100'" v-model="res.display_name">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('display_name')">{{ errors.first('display_name') | properFormat }}</span></transition>
                    </div>
                    <div class="form_flex select_all">
                        <label class="flex_label alternate">Select permissions under this role <span>*</span></label>
                        <div class="form_check select_all">
                            <div :class="`custom_action_check ${(checkPermissions) ? 'checked' : ''}`" @click.prevent="toggleSelectAllPermissions($event)">Select All</div>
                        </div>
                        <div class="form_check" v-for="(permission, key) in permissions" :key="key">
                            <input type="checkbox" :id="`permission_${key}`" name="permissions" :class="`action_check ${permission.class}`" v-model="permission.checked" :checked="permission.checked">
                            <label :for="`permission_${key}`">{{ permission.name }}</label>
                        </div>
                        <transition name="slide"><span class="validation_errors" v-if="hasPermissions">The Permissions field is required</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check default">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" :checked="res.enabled == 1">
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Update Role</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            type: {
                type: Number,
                default: 0
            },
            status: {
                type: Number,
                default: 0
            },
            id: {
                type: Number
            }
        },
        data () {
            return {
                hasPermissions: false,
                res: [],
                permissions: [
                    {
                        name: 'Dashboard (Front Desk)',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Studio Receiving',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Dashboard (Admin)',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Reporting',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Booker',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Customer Reports',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Scheduler',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Class Reports',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Customers',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Class Package Reports',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Instructors',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Sales Reports',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Inventory',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Inventory Value Report',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Purchase Orders',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Admin Configuration',
                        class: 'parent',
                        checked: false
                    }
                ]
            }
        },
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        let lastValue = ''
                        for (let i = 1; i < newValue.length; i++) {
                            lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
            }
        },
        computed: {
            checkPermissions () {
                const me = this
                let count = 0
                let result = false
                me.permissions.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.permissions.length) {
                    result = true
                } else {
                    result = false
                }
                return result
            }
        },
        methods: {
            toggleSelectAllPermissions (event) {
                const me = this
                if (me.checkPermissions) {
                    me.permissions.forEach((data, index) => {
                        data.checked = false
                        me.hasPermissions = true
                    })
                } else {
                    me.permissions.forEach((data, index) => {
                        data.checked = true
                        me.hasPermissions = false
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            toggleClose () {
                const me = this
                me.$store.state.roleForm = false
                document.body.classList.remove('no_scroll')
            },
            submissionAddSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.permissions.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.hasPermissions = (ctr > 0) ? false : true
                    if (valid && !me.hasPermissions) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('permissions', JSON.stringify(me.permissions))
                        me.loader(true)
                        me.$axios.post('api/roles', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Added')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 200)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                                if (!me.$store.state.errorStatus) {
                                    me.$parent.fetchData(me.status)
                                    me.$store.state.roleForm = false
                                }
                            }, 200)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            submissionUpdateSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.permissions.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.hasPermissions = (ctr > 0) ? false : true
                    if (valid && !me.hasPermissions) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('permissions', JSON.stringify(me.permissions))
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/roles/${me.id}`, formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Updated')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 200)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                                if (!me.$store.state.errorStatus) {
                                    me.$parent.fetchData(me.status)
                                    me.$store.state.roleForm = false
                                }
                            }, 200)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            }
        },
        async mounted () {
            const me = this
            if (me.id != 0) {
                me.$axios.get(`api/roles/${me.id}`).then(res => {
                    me.res = res.data.role
                    me.permissions = me.parser(me.res.permissions)
                })
            }
        }
    }
</script>
