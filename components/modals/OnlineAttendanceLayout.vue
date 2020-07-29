<template>
    <transition name="fade">
        <div class="upcoming_classes_layout table" v-if="loaded">
            <div class="background"></div>
            <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>Booker</span></div>
            <form id="action" class="table_layout" @submit.prevent="submitAttendance()">
                <h2>Online Class Attendance ({{ (schedule.schedule.custom_name != null) ? schedule.schedule.custom_name : schedule.schedule.class_type.name }})</h2>
                <div class="actions">
                    <div class="total">Total: {{ totalItems(res.length) }}</div>
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
                    <tbody>
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
                            <td>{{ data.user.email }}</td>
                            <td>{{ data.user.customer_details.co_contact_number }}</td>
                            <td>{{ data.user_package_count.class_package.name }}</td>
                            <td>
                                <div class="form_flex select_all no_m">
                                    <div class="form_flex_radio no_m">
                                        <div class="form_radio">
                                            <input type="radio" :id="`status_si_${key}`" value="signed-in" @change="toggleStatus(data)" :name="`status[${key}]`" class="action_radio">
                                            <label :for="`status_si_${key}`">Signed-in</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" :id="`status_ns_${key}`" value="no-show" @change="toggleStatus(data)" :name="`status[${key}]`" class="action_radio">
                                            <label :for="`status_ns_${key}`">No Show</label>
                                        </div>
                                    </div>
                                    <input type="hidden" name="booking_id[]" :value="data.id">
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="cta">
                    <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                    <button type="submit" name="submit" :class="`action_btn alternate ${(ctr == res.length) ? '' : 'disabled'}`">Submit</button>
                </div>
            </form>
        </div>
    </transition>
</template>

<script>
    export default {
        props: {
            schedule: {
                default: null
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
            toggleStatus (data) {
                const me = this
                if (!data.checked) {
                    me.ctr++
                    data.checked = true
                }
            },
            submitAttendance () {
                const me = this
                if (me.ctr == me.res.length) {
                    let formData = new FormData(document.getElementById('action'))
                    // me.loader(true)
                    me.$axios.post('api/online-class-bookings/bulk-update', formData).then(res => {
                        setTimeout( () => {
                            if (res.data) {
                                console.log(res.data);
                                // me.$store.state.onlineAttendanceLayoutStatus = false
                            }
                        }, 500)
                    }).catch(err => {
                        me.$store.state.errorOverlayStatus = true
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                } else {
                    me.$store.state.errorOverlayStatus = true
                    me.$store.state.errorList = ['Please fill the status for each customer']
                    me.$store.state.errorStatus = true
                }
            },
            initial () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/online-class-bookings?scheduled_date_id=${me.schedule.id}`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            res.data.bookings.forEach((data, index) => {
                                data.checked = false
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
