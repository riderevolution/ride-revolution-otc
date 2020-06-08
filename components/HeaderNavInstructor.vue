<template>
    <div class="header">
        <div class="header_icons">
            <div :class="`notification ${(res.length > 0) ? 'active' : ''}`" @click="toggleNotification()" v-click-outside="closeNotif">
                <svg :class="`notification_icon ${(isToggledNotif) ? 'active' : ''}`" xmlns="http://www.w3.org/2000/svg" width="18.021" height="16.75" viewBox="0 0 18.021 16.75"> <g transform="translate(-1075.213 -38.25)"> <path class="notif_icon" d="M14.965,12.855c.116.149,1.211.371,1.03.371H.9c-.181,0-1.474-.222-1.362-.371l1.5-.394c.448-.566,1.55-1.28,1.55-2.018V6.019A5.4,5.4,0,0,1,7.854.49h0a5.4,5.4,0,0,1,5.26,5.529v4.443c0,.746,1.115,1.475,1.571,2.045Z" transform="translate(1076.466 38.51)" /> <g class="notif_icon_no_fill" transform="translate(1082.4 52.867)"> <path class="notif_icon_no_fill" d="M2.133,2.133A2.136,2.136,0,0,1,0,0H4.267A2.136,2.136,0,0,1,2.133,2.133Z" /> <path class="notif_icon_alt" d="M 2.133241415023804 2.133480310440063 C 0.9569713473320007 2.133480310440063 1.339569053016021e-06 1.176410317420959 1.339569053016021e-06 2.744293112755258e-07 L 4.266721248626709 2.744293112755258e-07 C 4.266721248626709 1.176520228385925 3.309531450271606 2.133480310440063 2.133241415023804 2.133480310440063 Z" /> </g> </g> </svg>
                <div :class="`notification_box ${(isToggledNotif) ? 'active' : ''}`">
                    <div class="wrapper">
                        <div class="notification_wrapper" v-for="(notification, key) in notifications" v-if="(key + 1) <= 20">
                            <span>&#9679;</span>
                            <div class="notification_desc">
                                <div class="notification_title">{{ notification.message }}</div>
                                <div class="notification_time">{{ getFromNow(notification.created_at) }}</div>
                            </div>
                        </div>
                    </div>
                    <nuxt-link class="notification_action" to="/notifications">See All</nuxt-link>
                </div>
            </div>
        </div>
        <div :class="`header_select ${(isToggled) ? 'active' : ''}`" v-click-outside="closeMe">
            <div class="header_user" @click="showSelect()">
                <div class="user_picture">
                    <div class="overlay">
                        {{ user.first_name.charAt(0) }}{{ user.last_name.charAt(0) }}
                    </div>
                </div>
                <div class="user_name">Hello, {{ user.first_name }}!</div>
            </div>
            <div class="user_select">
                <div class="select_header">
                    <div class="select_info">
                        <div class="header_name">{{ user.first_name }}</div>
                        <div class="header_role">{{ user.staff_details.role.display_name }}</div>
                    </div>
                    <div class="header_studio"></div>
                </div>
                <div class="select_footer">
                    <nuxt-link to="/my-account" class="select_item account" @click.native.self="isToggled = false">My Account</nuxt-link>
                    <a href="javascript:void(0)" class="select_item logout" @click="logout()">Sign Out</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                isToggled: false,
                isToggledNotif: false,
                res: [0],
                notifications: [],
                user: {
                    first_name: '',
                    last_name: '',
                    staff_details: {
                        role: {
                            display_name: ''
                        }
                    }
                }
            }
        },
        methods: {
            showSelect () {
                this.isToggled ^= true
            },
            toggleNotification () {
                const me = this
                me.isToggledNotif ^= true
            },
            closeMe () {
                this.isToggled = false
            },
            closeNotif () {
                this.isToggledNotif = false
            },
            getFromNow (value) {
                const me = this
                if (value) {
                    return me.$moment(value).fromNow()
                }
            }
        },
        mounted () {
            const me = this
            let token = me.$cookies.get('token')
            me.$axios.get('api/logs').then(res => {
                if (res.data) {
                    me.notifications = res.data.logs.data
                }
            })
            me.$axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data) {
                    me.user = res.data.user
                }
            })
        }
    }
</script>
