<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>{{ studio.name }} - Online Class Attendance ({{ (schedule.custom_name != null) ? schedule.custom_name : schedule.class_type.name }})</h2>
            <h3><span>{{ $moment(schedule.scheduled_dates[0].date).format('ddd, MMM DD, YYYY') }} at {{ schedule.start_time }} - {{ schedule.instructor_schedules[0].user.first_name }} {{ schedule.instructor_schedules[0].user.last_name }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Seat Number</th>
                    <th>Signed In</th>
                    <th>Full Name</th>
                    <th>Package Used</th>
                    <th>Customer Type</th>
                    <th>Email Address</th>
                    <th>Contact/Emergency Contact Number</th>
                    <th>Dumbbell</th>
                    <th>Shoe size</th>
                </tr>
            </thead>
            <tbody class="no_shadow">
                <tr v-for="(data, key) in res" :key="key">
                    <td>-</td>
                    <td>
                        <img :src="(data.status == 'signed-in') ? '/icons/check-icon.svg' : '/icons/uncheck-icon.svg'" />
                    </td>
                    <td>
                        {{ data.user.fullname }}
                    </td>
                    <td>
                        {{ data.user_package_count.class_package.name }}
                    </td>
                    <td>
                        {{ data.user.customer_details.customer_type.name }}
                    </td>
                    <td>
                        {{ data.user.email }}
                    </td>
                    <td>
                        {{ (data.user.customer_details.co_contact_number != null) ? data.user.customer_details.co_contact_number : (data.user.customer_details.ec_contact_number ? data.user.customer_details.ec_contact_number : 'N/A') }}
                    </td>
                    <td>
                        {{ (data.user.customer_details.dumbbells != null) ? data.user.customer_details.dumbbells : 'N/A' }}
                    </td>
                    <td>
                        {{ (data.user.customer_details.co_shoe_size != null) ? data.user.customer_details.co_shoe_size : 'N/A' }}
                    </td>
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
                schedule: [],
                studio: [],
                res: []
            }
        },
        methods: {
            initial () {
                const me = this

                if (me.$route.query.studio_id.length > 0) {
                    me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                        me.studio = res.data.studio
                    })
                }
                me.$axios.get(`api/schedules/${me.$route.query.scheduled_date_id}`).then(res => {
                    me.schedule = res.data.schedule
                })

                me.$axios.get(`api/online-class-bookings?scheduled_date_id=${me.$route.query.scheduled_date_id}&studio_id=${me.$route.query.studio_id}`).then(res => {
                    if (res.data) {
                        me.res = res.data.bookings
                        me.loaded = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        window.print()
                    }, 2000)
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
