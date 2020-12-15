<template>
    <div class="print_table" v-if="loaded">
        <div class="inline">
            <div class="logo">
                <img src="/logo.png" width="65px" />
                <div class="logo_title">
                    Ride <br/>
                    Revolution
                </div>
            </div>
            <div class="text">
                <h2>Top Riders</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Customer</th>
                    <th>No. of Rides</th>
                    <th>Customer Type</th>
                    <th>Rewards</th>
                    <th>Age</th>
                    <th>Profession</th>
                    <th>Gender</th>
                    <th>City</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ key + 1 }}</td>
                    <td>
                        <div class="table_data_link">{{ data.fullname }}</div>
                    </td>
                    <td>{{ data.numberOfRides }}</td>
                    <td>{{ data.customer_details.customer_type.name }}</td>
                    <td>-</td>
                    <td>{{ -($moment(data.customer_details.co_birthdate).diff($moment(), 'years')) }}</td>
                    <td>{{ (data.customer_details.profession) ? data.customer_details.profession : 'N/A' }}</td>
                    <td>{{ (data.customer_details.co_sex == 'male' || data.customer_details.co_sex == 'M') ? 'Male' : 'Female' }}</td>
                    <td>{{ data.customer_details.pa_city }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="8">No Result(s) Found.</td>
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

                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date

                if (me.$route.query.studio_id.length > 0) {
                    formData.append('studio_id', me.$route.query.studio_id)
                }

                if (me.$route.query.class_type_id.length > 0) {
                    formData.append('class_type_id', me.$route.query.class_type_id)
                }

                if (me.$route.query.timeslot.length > 0) {
                    formData.append('timeslot', me.$route.query.timeslot)
                }

                if (me.$route.query.instructor_id.length > 0) {
                    formData.append('instructor_id', me.$route.query.instructor_id)
                }

                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/customers/top-riders?all=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.topRiders
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
