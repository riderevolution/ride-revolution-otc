<template>
    <transition name="fade">
        <div class="upcoming_classes_layout table" v-if="loaded">
            <div class="background"></div>
            <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>{{ (instructorDashboard) ? 'Class Schedules' : 'Booker' }}</span></div>
            <form id="action" class="table_layout" @submit.prevent="submitAttendance()">
                <div class="info">
                    <div class="text">
                        <h2>Online Class Attendance</h2>
                        <h3><span>{{ (schedule.schedule.custom_name != null) ? schedule.schedule.custom_name : schedule.schedule.class_type.name }} ({{ schedule.schedule.start_time }})</span></h3>
                    </div>
                    <div class="action_buttons">
                        <div class="action_btn" @click="toggleCustomer()"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg><span>Add Customer</span></div>
                    </div>
                </div>
                <div class="actions">
                    <div class="total">Total: {{ totalItems(res.length) }}</div>
                    <a :href="`/print/online-class/${schedule.id}`" target="_blank" v-if="res.length > 0" class="action_btn alternate">Print</a>
                    <download-csv
                        class="action_btn alternate"
                        :data="attributes"
                        :name="`online-class-attendance-${$moment().format('MM-DD-YY-hh-mm')}.csv`" v-if="res.length > 0">
                        Export
                    </download-csv>
                </div>
                <table class="cms_table alt">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Type</th>
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
                                    <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)">{{ data.user.first_name }} {{ data.user.last_name }}</div>
                                </div>
                            </td>
                            <td>{{ data.user.customer_details.customer_type.name }}</td>
                            <td>{{ data.user.email }}</td>
                            <td>{{ data.user.customer_details.co_contact_number }}</td>
                            <td>{{ (data.user_package_count) ? data.user_package_count.class_package.name : 'N/A' }}</td>
                            <td>
                                <div class="form_group no_margin">
                                    <select class="default_select alternate" :name="`status[${key}]`" v-model="data.status">
                                        <option value="reserved" selected>Reserved</option>
                                        <option value="signed-in">Signed In</option>
                                        <option value="no-show">No Show</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <input type="hidden" name="booking_id[]" :value="data.id">
                            </td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td colspan="6">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
                <div class="cta" v-if="res.length > 0">
                    <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                    <button type="submit" name="submit" class="action_btn alternate">Submit</button>
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
            const values = []
            return {
                loaded: false,
                rowCount: 0,
                res: [],
                values: []
            }
        },
        computed: {
            attributes () {
                const me = this
                return [
                    ...this.values.map(value => ({
                        'Customer ID': value.user.id,
                        'Full Name': `${value.user.first_name} ${value.user.last_name}`,
                        'Customer Type': value.user.customer_details.customer_type.name,
                        'Email Address': value.user.email,
                        'Contact Number': value.user.customer_details.co_contact_number,
                        'Schedule': (this.schedule.schedule.custom_name != null) ? this.schedule.schedule.custom_name : this.schedule.schedule.class_type.name,
                        'Start Time': this.schedule.schedule.start_time,
                        'Booking ID': value.id,
                        'Booking Status': value.status,
                        'Class Package': value.user_package_count.class_package.name
                    }))
                ]
            }
        },
        methods: {
            toggleCustomer () {
                const me = this
                me.$store.state.onlineAttendanceCustomer = true
                document.body.classList.add('no_scroll')
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            toggleClose () {
                const me = this
                me.$store.state.onlineAttendanceLayoutStatus = false
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
            submitAttendance () {
                const me = this
                let formData = new FormData(document.getElementById('action'))
                me.loader(true)
                me.$axios.post('api/online-class-bookings/bulk-update', formData).then(res => {
                    setTimeout( () => {
                        if (res.data) {
                            me.$store.state.onlineAttendancePrompt = true
                            document.body.classList.add('no_scroll')
                        }
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            initial () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/online-class-bookings?scheduled_date_id=${me.schedule.id}`).then(res => {
                    if (res.data) {
                        me.res = []
                        setTimeout( () => {
                            res.data.bookings.forEach((data, index) => {
                                me.res.push(data)
                            })
                            me.values = me.res
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
