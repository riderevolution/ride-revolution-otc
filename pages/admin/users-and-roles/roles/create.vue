<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/${prevRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(prevRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Add a Role</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()">
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Role Details</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="display_name">Role Name <span>*</span></label>
                                    <input type="text" name="display_name" autocomplete="off" class="default_text" v-validate="'required|max:100'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('display_name')">{{ errors.first('display_name') | properFormat }}</span></transition>
                                </div>
                                <div class="form_flex select_all">
                                    <label class="flex_label alternate">Select permissions under this role <span>*</span></label>
                                    <div class="form_flex_radio">
                                        <div class="form_radio">
                                            <input type="radio" id="admin_access" value="1" name="permission_admin" v-validate="'required'" class="action_radio">
                                            <label for="admin_access">Dashboard (Admin)</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="front_desk" value="0" name="permission_admin" v-validate="'required'" class="action_radio">
                                            <label for="front_desk">Dashboard (Front Desk)</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('permission_admin')">{{ errors.first('permission_admin') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex start">
                                    <div class="form_check select_all">
                                        <div :class="`custom_action_check ${(checkPermissions) ? 'checked' : ''}`" @click.prevent="toggleSelectAllPermissions($event)">Select All</div>
                                    </div>
                                    <div class="form_group">
                                        <div class="form_check" v-for="(permission, key) in permissionsPages" :key="key">
                                            <input type="checkbox" :id="`permission_page_${key}`" name="permissions[]" :class="`action_check ${permission.class}`" v-model="permission.checked" :checked="permission.checked" v-if="!permission.parent">
                                            <label :for="`permission_page_${key}`" :class="`${(permission.parent) ? 'parent' : ''}`">{{ permission.name }}</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="hasPermissions">The Permissions field is required</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <div class="form_check" v-for="(permission, key) in permissionsReporting" :key="key">
                                            <input type="checkbox" :id="`permission_reporting_${key}`" name="permissions[]" :class="`action_check ${permission.class}`" v-model="permission.checked" :checked="permission.checked" v-if="!permission.parent">
                                            <label :for="`permission_reporting_${key}`" :class="`${(permission.parent) ? 'parent' : ''}`">{{ permission.name }}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                    <label for="enabled">Activate</label>
                                </div>
                                <div class="button_group">
                                    <nuxt-link :to="`/admin/${prevRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Users and Roles',
                loaded: false,
                access: true,
                hasPermissions: false,
                permissionsPages: [
                    {
                        name: 'Booker',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Scheduler',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Customers',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Instructors',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Retail',
                        class: 'parent',
                        checked: false,
                        parent: true
                    },
                    {
                        name: 'Suppliers',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Inventory',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Physical Count',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Purchase Order',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Products',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Product Categories',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Promotions',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Physical Gift Cards',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Studio Receiving',
                        class: 'parent',
                        checked: false
                    },
                    {
                        name: 'Admin Configuration',
                        class: 'parent',
                        checked: false,
                        parent: true
                    },
                    {
                        name: 'Users and Roles',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Classes and Packages',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Configuration',
                        class: 'child',
                        checked: false
                    }
                ],
                permissionsReporting: [
                    {
                        name: 'Customer Report',
                        class: 'parent',
                        checked: false,
                        parent: true
                    },
                    {
                        name: 'Customer Accounts',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Non Returning Customers',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Outstanding Credits',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Customer Retention',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Top Riders',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Class Report',
                        class: 'parent',
                        checked: false,
                        parent: true
                    },
                    {
                        name: 'Attendance Summary',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Attendance with Revenue',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Attendance by Timeslot',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Attendance by Month',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Summary of Instructor Subbing per Period',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Instructor Attendance Summary',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Class Package Report',
                        class: 'parent',
                        checked: false,
                        parent: true
                    },
                    {
                        name: 'Remaining Class Package Value',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Class Package Expiration',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Average Time to Utilize Package',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Sales Report',
                        class: 'parent',
                        checked: false,
                        parent: true
                    },
                    {
                        name: 'Sales & Transactions',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Sales by Payment Type',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Sales by Class Package',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Sales by Products',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Earned Package Revenue',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Revenue Summary',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Promotions Redeemed',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Gift Cards Redeemed',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Sales by Customer',
                        class: 'child',
                        checked: false
                    },
                    {
                        name: 'Inventory Value Report',
                        class: 'parent',
                        checked: false,
                    }
                ],
                res: [],
                lastRoute: '',
                prevRoute: '',
            }
        },
        filters: {
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('.')
                if (newValue.length > 1) {
                    newValue = newValue[1].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].split('_')
                        if (newValue.length > 1) {
                            let firstValue = ''
                            let lastValue = ''
                            if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                                firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                            }
                            for (let i = 1; i < newValue.length; i++) {
                                if (newValue[i] != 'id') {
                                    lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                                }
                            }
                            newValue = firstValue + ' ' + lastValue
                        } else {
                            newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                        }
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
                    if (message[0].split('file').length > 1) {
                        message = message[0].split('file')[1]
                        return `The ${newValue} field${message}`
                    } else {
                        return `The ${newValue}`
                    }
                }
            }
        },
        computed: {
            checkPermissions () {
                const me = this
                let count = 0
                let result = false
                me.permissionsPages.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                me.permissionsReporting.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.permissionsPages.length + me.permissionsReporting.length) {
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
                    me.permissionsPages.forEach((data, index) => {
                        data.checked = false
                    })
                    me.permissionsReporting.forEach((data, index) => {
                        data.checked = false
                    })
                } else {
                    me.permissionsPages.forEach((data, index) => {
                        data.checked = true
                    })
                    me.permissionsReporting.forEach((data, index) => {
                        data.checked = true
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            submissionSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.permissionsPages.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.permissionsReporting.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.hasPermissions = (ctr > 0) ? false : true
                    if (valid && !me.hasPermissions) {
                        let formData = new FormData(document.getElementById('default_form'))
                        let permissions = []
                        me.permissionsPages.forEach((data, index) => {
                            permissions.push(data)
                        })
                        me.permissionsReporting.forEach((data, index) => {
                            permissions.push(data)
                        })
                        formData.append('permissions_pages', JSON.stringify(me.permissionsPages))
                        formData.append('permissions_reporting', JSON.stringify(me.permissionsReporting))
                        me.loader(true)
                        me.$axios.post('api/roles', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been created')
                                    me.$router.push(`/admin/${me.prevRoute}`)
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            offset: -250
                        })
                    }
                })
            },
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
