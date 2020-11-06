<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>{{ studio.name }} - Class Attendance ({{ (scheduleDate.schedule.custom_name != null) ? scheduleDate.schedule.custom_name : scheduleDate.schedule.class_type.name }})</h2>
            <h3><span>{{ $moment(scheduleDate.date).format('ddd, MMM DD, YYYY') }} at {{ scheduleDate.schedule.start_time }} - {{ scheduleDate.schedule.instructor_schedules[0].user.first_name }} {{ scheduleDate.schedule.instructor_schedules[0].user.last_name }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Seat Number</th>
                    <th>Signed In</th>
                    <th>Full Name</th>
                    <th>Customer Type</th>
                    <th>Email Address</th>
                    <th>Contact Number</th>
                    <th>Shoe size</th>
                </tr>
            </thead>
            <tbody class="no_shadow">
                <tr v-for="(data, key) in seats" :key="key">
                    <td>{{ data.number }}</td>
                    <td>
                        <img :src="(data.status == 'signed-in') ? '/icons/check-icon.svg' : '/icons/uncheck-icon.svg'" />
                    </td>
                    <td>
                        <div class="table_data_link" v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            {{ data.bookings[0].guest_first_name }} {{ data.bookings[0].guest_last_name }}
                        </div>
                        <div class="table_data_link" v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ data.bookings[0].user.first_name }} {{ data.bookings[0].user.last_name }}
                        </div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && (data.bookings[0].user && data.bookings[0].user.customer_details.customer_type)">
                            <img :src="data.bookings[0].user.customer_details.customer_type.image.path" />
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].user">
                            <img src="/icons/guest-icon.svg" />
                        </div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            {{ data.bookings[0].guest_email }}
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ data.bookings[0].user.email }}
                        </div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            <span v-if="data.bookings[0].user">{{ data.bookings[0].user.customer_details.co_contact_number }}</span>
                            <span v-else>N/A</span>
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ data.bookings[0].user.customer_details.co_contact_number }}
                        </div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            <span v-if="data.bookings[0].user">US - {{ data.bookings[0].user.customer_details.co_dumbbells }}</span>
                            <span v-else>N/A</span>
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            US - {{ data.bookings[0].user.customer_details.co_dumbbells }}
                        </div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            <span v-if="data.bookings[0].user">US - {{ data.bookings[0].user.customer_details.co_shoe_size }}</span>
                            <span v-else>N/A</span>
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            US - {{ data.bookings[0].user.customer_details.co_shoe_size }}
                        </div>
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
                studio: [],
                scheduleDate: [],
                seats: []
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

                me.$axios.get(`/api/seats?studio_id=${me.$route.query.studio_id}&scheduled_date_id=${me.$route.query.scheduled_date_id}`).then(res => {
                    if (res.data) {
                        me.scheduleDate = res.data.scheduled_date

                        res.data.seats.sort((a, b) => {
                            return parseInt(a.number) - parseInt(b.number)
                        })

                        me.seats = res.data.seats

                        me.loaded = true
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
