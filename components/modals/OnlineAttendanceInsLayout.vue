<template>
    <transition name="fade">
        <div class="upcoming_classes_layout table" v-if="loaded">
            <div class="background"></div>
            <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>{{ (instructorDashboard) ? 'Class Schedules' : 'Booker' }}</span></div>
            <form id="action" class="table_layout">
                <div class="info">
                    <div class="text">
                        <h2>Online Class Attendance</h2>
                        <h3><span>{{ (schedule.schedule.custom_name != null) ? schedule.schedule.custom_name : schedule.schedule.class_type.name }} ({{ schedule.schedule.start_time }})</span></h3>
                    </div>
                </div>
                <div class="actions">
                    <div class="total">Total: {{ totalItems(res.length) }}</div>
                    <a href="javascript:void(0)" v-if="res.length > 0" class="action_btn alternate">Print</a>
                    <a href="javascript:void(0)" v-if="res.length > 0" class="action_btn alternate margin">Export</a>
                </div>
                <table class="cms_table alt">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Email Address</th>
                            <th>Contact No.</th>
                            <th>Class Package</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.length > 0">
                        <tr v-for="(data, key) in res" :key="key">
                            <td>
                                <div class="thumb">
                                    <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                    <div class="table_image_default" v-else>
                                        <div class="overlay">
                                            {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                        </div>
                                    </div>
                                    <div class="table_data_link">{{ data.user.first_name }} {{ data.user.last_name }}</div>
                                </div>
                            </td>
                            <td>{{ data.user.email }}</td>
                            <td>{{ data.user.customer_details.co_contact_number }}</td>
                            <td>{{ (data.user_package_count) ? data.user_package_count.class_package.name : 'N/A' }}</td>
                            <td class="alt_2">
                                {{ data.status }}
                            </td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td colspan="5">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
                <div class="cta" v-if="res.length > 0">
                    <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                </div>
                <button type="button" class="hidden" id="online" @click="initial()"></button>
            </form>
        </div>
    </transition>
</template>

<script>
    export default {
        props: {
            schedule: {
                default: null
            },
            instructorDashboard: {
                default: false
            }
        },
        data () {
            return {
                loaded: false,
                ctr: 0,
                rowCount: 0,
                res: []
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.onlineAttendanceInsLayoutStatus = false
                document.body.classList.remove('no_scroll')
            },
            formatClassDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('M/D/YY (ddd) h:mm A')
                    } else {
                        return this.$moment(value).format('MMMM DD, YYYY')
                    }
                }
            },
            toggleStatus (data) {
                const me = this
                if (!data.checked) {
                    me.ctr++
                    data.checked = true
                }
            },
            initial () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/online-class-bookings?scheduled_date_id=${me.schedule.id}`).then(res => {
                    if (res.data) {
                        me.res = []
                        setTimeout( () => {
                            res.data.bookings.forEach((data, index) => {
                                if (data.status == 'signed-in' || data.status == 'no-show') {
                                    me.ctr++
                                    data.checked = true
                                } else {
                                    data.checked = false
                                }
                                me.res.push(data)
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            me.initial()
        }
    }
</script>
