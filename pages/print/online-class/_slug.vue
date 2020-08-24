<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Online Class Attendance</h2>
            <h3><span>{{ (schedule.custom_name != null) ? schedule.custom_name : schedule.class_type.name }} ({{ schedule.start_time }})</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Full Name</th>
                    <th>Customer Type</th>
                    <th>Email Address</th>
                    <th>Contact Number</th>
                    <th>Schedule</th>
                    <th>Start Time</th>
                    <th>Booking ID</th>
                    <th>Booking Status</th>
                    <th>Class Package</th>
                </tr>
            </thead>
            <tbody class="no_shadow">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ data.user.id }}</td>
                    <td>{{ `${data.user.first_name} ${data.user.last_name}` }}</td>
                    <td>{{ data.user.customer_details.customer_type.name }}</td>
                    <td>{{ data.user.email }}</td>
                    <td>{{ (data.user.customer_details.co_contact_number != null) ? data.user.customer_details.co_contact_number : 'N/A' }}</td>
                    <td>{{ (schedule.custom_name != null) ? schedule.custom_name : schedule.class_type.name }}</td>
                    <td>{{ schedule.start_time }}</td>
                    <td>{{ data.id }}</td>
                    <td>{{ data.status }}</td>
                    <td>{{ data.user_package_count.class_package.name }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        layout: 'print',
        data () {
            return {
                loaded: false,
                res: [],
                schedule: []
            }
        },
        methods: {
            initial () {
                const me = this
                me.$axios.get(`api/online-class-bookings?scheduled_date_id=${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.res = []
                        setTimeout( () => {
                            me.$axios.get(`api/schedules/${me.$route.params.slug}`).then(resc => {
                                if (res.data) {
                                    me.res = res.data.bookings
                                    me.schedule = resc.data.schedule
                                    me.loaded = true
                                }
                            })
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        window.print()
                    }, 1000)
                })
            }
        },
        mounted () {
			const me = this
            me.initial()
            window.onafterprint = function(){
                window.close()
            }
		}
    }
</script>
