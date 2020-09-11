<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Customer Retention</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Sign Up</th>
                    <th>First Class</th>
                    <th>Last Class</th>
                    <th>City</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link" >{{ data.fullname }}</div>
                    </td>
                    <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : '-' }}</td>
                    <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[data.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : '-' }}</td>
                    <td>{{ data.customer_details.pa_city }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="5">No Result(s) Found.</td>
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
                form: {
                    studio_id: '',
                    class_type_id: '',
                    timeslot: '',
                    instructor_id: '',
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date', me.$route.query.end_date)
                if (me.$route.query.status.length > 0) {
                    formData.append('type', me.$route.query.status)
                } else {
                    formData.append('type', 'first')
                }
                me.$axios.post(`api/reporting/customers/customer-retention?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.customers
                            me.loaded = true
                            setTimeout( () => {
                                window.print()
                            }, 1000)
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
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
