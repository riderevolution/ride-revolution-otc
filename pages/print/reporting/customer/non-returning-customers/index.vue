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
                <h2>Non Returning Customers</h2>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Member ID</th>
                    <th>Last Package Used</th>
                    <th>Date Purchased/Date Activated</th>
                    <th>Last Class</th>
                    <th>Contact Number</th>
                    <th>Email Address</th>
                    <th>City</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ data.fullname }}</div>
                    </td>
                    <td>{{ data.member_id }}</td>
                    <td>{{ data.userPackageCounts[0].class_package.name }}</td>
                    <td>{{ $moment(data.userPackageCounts[0].last_avail_date).format('MMM DD, YYYY') }} / {{ (data.userPackageCounts[0].activation_date != 'NA') ? $moment(data.userPackageCounts[0].activation_date).format('MMM DD, YYYY') : 'Not Activated' }}</td>
                    <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].updated_at).format('MMM DD, YYYY') : 'No Class Yet' }}</td>
                    <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : 'No Class Yet' }}</td>
                    <td>{{ data.email }}</td>
                    <td>{{ (data.customer_details.pa_city != null) ? data.customer_details.pa_city : 'N/A' }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td :colspan="rowCount">No Result(s) Found.</td>
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
                total: 0
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()
                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date', me.$route.query.end_date)
                if (me.$route.query.class_package_id.length > 0) {
                    formData.append('class_package_id', me.$route.query.class_package_id)
                }
                me.$axios.post('api/reporting/customers/non-returning-customers?all=1', formData).then(res => {
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
