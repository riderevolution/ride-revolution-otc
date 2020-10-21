<template>
    <transition name="fade">
        <div class="booker_table" v-if="loaded">
            <form id="action" class="table_layout" @submit.prevent="submitAttendance()">
                <div class="info">
                    <div class="text">
                    </div>
                    <div class="action_buttons" v-if="res.length > 0">
                        <div class="action_btn" @click="toggleCustomer()"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg><span>Add Customer</span></div>
                    </div>
                </div>
                <div class="action_wrapper" v-if="res.length > 0">
                    <div class="form_group">
                        <label for="q">Find a Customer</label>
                        <input type="text" name="q" @input="submitFilter()" v-model="form.search" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate">
                    </div>
                    <div class="actions">
                        <div class="total">Total: {{ totalItems(res.length) }}</div>
                        <download-csv
                            class="action_btn alternate"
                            :data="attributes"
                            :name="`online-class-attendance-${$moment().format('MM-DD-YY-hh-mm')}.csv`" v-if="res.length > 0">
                            Export
                        </download-csv>
                    </div>
                </div>
                <div class="scroll">
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
                        <tbody v-if="res.length > 0 && !noSearchFound">
                            <tr v-for="(data, key) in populateUsers" :key="key" v-show="data.searched">
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
                </div>

                <div class="cta" v-if="res.length > 0">
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
            },
            studio: {
                type: Object/Array,
                default: function () {
                    return {}
                }
            }
        },
        data () {
            const values = []
            return {
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                form: {
                    search: ''
                },
                noSearchFound: false
            }
        },
        computed: {
            attributes () {
                const me = this
                return [
                    ...this.values.map(value => ({
                        'Booking ID': value.id,
                        'Booking Status': value.status,
                        'Booking Timestamp': me.$moment(value.updated_at).format('MMM DD, YYYY hh:mm A'),
                        'Studio': me.studio.name,
                        'Schedule Name': (me.schedule.schedule.custom_name != null) ? me.schedule.schedule.custom_name : me.schedule.schedule.class_type.name,
                        'Schedule Date': me.$moment(me.schedule.date).format('MMMM DD, YYYY'),
                        'Start Time': me.schedule.schedule.start_time,
                        'Instructor': me.getInstructorsInSchedule(me.schedule, 1),
                        'Customer ID': value.user.id,
                        'Full Name': `${value.user.first_name} ${value.user.last_name}`,
                        'Customer Type': value.user.customer_details.customer_type.name,
                        'Email Address': value.user.email,
                        'Contact Number': value.user.customer_details.co_contact_number,
                        'Class Package': (value.user_package_count) ? value.user_package_count.class_package.name : 'N/A',
                        'Revenue': me.computeRevenue(value)
                    }))
                ]
            },
            populateUsers () {
                const me = this
                let result = []
                me.res.forEach((data, index) => {
                    result.push(data)
                })
                return result
            }
        },
        methods: {
            computeRevenue (data) {
                const me = this
                let result = ''
                let base_value = 0
                if (data.user_package_count.payment_item) {
                    base_value = me.totalCount(data.user_package_count.estimated_price_per_class)
                    result = `Php ${me.totalCount(base_value * parseInt(me.schedule.schedule.class_credits))}`
                } else {
                    result = 'From Import'
                }

                return result
            },
            getInstructorsInSchedule (data, export_status = null) {
                const me = this
                let result = ''
                if (data != '') {
                    let ins_ctr = 0, instructor = []
                    data.schedule.instructor_schedules.forEach((ins, index) => {
                        if (ins.substitute == 0) {
                            ins_ctr += 1
                        }
                        if (ins.primary == 1) {
                            instructor = ins
                        }
                    })

                    if (ins_ctr == 2) {
                        if (export_status != null) {
                            result = `${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}`
                        } else {
                            result = `<b>${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                        }
                    } else {
                        if (export_status != null) {
                            result = `${instructor.user.fullname}`
                        } else {
                            result = `<b>${instructor.user.fullname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                        }
                    }
                }

                return result
            },
            submitFilter () {
                const me = this
                let ctr = 0
                me.res.forEach((data, index) => {
                    let name = `${data.user.first_name} ${data.user.last_name}`
                    name = name.toLowerCase()
                    if (me.form.search != '') {
                        if (name.includes(me.form.search.toLowerCase())) {
                            data.searched = true
                        } else {
                            ctr++
                            data.searched = false
                        }
                    } else {
                        data.searched = true
                    }
                })
                if (ctr == me.res.length) {
                    me.noSearchFound = true
                } else {
                    me.noSearchFound = false
                }
            },
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
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData(document.getElementById('action'))
                me.loader(true)
                me.$axios.post('api/online-class-bookings/bulk-update', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
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
                                data.searched = true
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
