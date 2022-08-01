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
                    <th>Package Used</th>
                    <th>Customer Type</th>
                    <th>Email Address</th>
                    <th>Contact</th>
                    <th>Dumbbell</th>
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
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0">
                          {{ data.bookings[0].user_package_count.class_package.name }}
                        </div>
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && (data.bookings[0].user && data.bookings[0].user.customer_details.customer_type)">
                            <img :src="data.bookings[0].user.customer_details.customer_type.image.path" />
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].user">
                            <img src="/icons/guest-icon.svg" width="37px" height="37px" />
                        </div>
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            {{ data.bookings[0].guest_email }}
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ data.bookings[0].user.email }}
                        </div>
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            <div v-if="data.bookings[0].user">{{ data.bookings[0].user.customer_details.co_contact_number }}</div>
                            <div v-else>----</div>
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ data.bookings[0].user.customer_details.co_contact_number }}
                        </div>
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            <div v-if="data.bookings[0].user">{{ (data.bookings[0].user.customer_details.dumbbells) ? data.bookings[0].user.customer_details.dumbbells : '----' }}</div>
                            <div v-else>----</div>
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ (data.bookings[0].user.customer_details.dumbbells) ? data.bookings[0].user.customer_details.dumbbells : '----' }}
                        </div>
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                    <td>
                        <div v-if="data.bookings.length > 0 && data.bookings[0].is_guest">
                            <div v-if="data.bookings[0].user">{{ (data.bookings[0].user.customer_details.co_shoe_size) ? `US - ${data.bookings[0].user.customer_details.co_shoe_size}` : '----' }}</div>
                            <div v-else>----</div>
                        </div>
                        <div v-if="data.bookings.length > 0 && !data.bookings[0].is_guest">
                            {{ (data.bookings[0].user.customer_details.co_shoe_size) ? `US - ${data.bookings[0].user.customer_details.co_shoe_size}` : '----' }}
                        </div>
                        <div v-if="data.bookings.length <= 0">----</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="signature">
            <div class="label">SIGNATURE OVER PRINTED NAME</div>
        </div>
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
            async initial () {
                const me = this

                if (me.$route.query.studio_id.length > 0) {
                    me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                        me.studio = res.data.studio
                    })
                }

                await me.$axios.get(`/api/seats?studio_id=${me.$route.query.studio_id}&scheduled_date_id=${me.$route.query.scheduled_date_id}`).then(res => {
                    if (res.data) {
                        me.scheduleDate = res.data.scheduled_date

                        res.data.seats.sort((a, b) => {
                            return parseInt(a.number) - parseInt(b.number)
                        })

                        me.seats = res.data.seats
                        console.log(me.seats);

                        me.loaded = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
                setTimeout( () => {
                    window.print()
                }, 1000)
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
