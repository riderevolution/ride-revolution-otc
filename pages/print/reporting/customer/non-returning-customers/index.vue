<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Outstanding Store Credits</h2>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="stick">Customer</th>
                    <th class="stick">Last Package Used</th>
                    <th class="stick">Date Purchased/Date Activated</th>
                    <th class="stick">Last Class</th>
                    <th class="stick">Contact Number</th>
                    <th class="stick">Email Address</th>
                    <th class="stick">City</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ data.fullname }}</div>
                    </td>
                    <td>{{ data.userPackageCounts[0].class_package.name }}</td>
                    <td>{{ $moment(data.userPackageCounts[0].last_avail_date).format('MMMM DD, YYYY') }} / {{ (data.userPackageCounts[0].activation_date != 'NA') ? $moment().format('MMMM DD, YYYY') : 'N/A' }}</td>
                    <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].updated_at).format('MMMM DD, YYYY') : 'N/A' }}</td>
                    <td>{{ (data.customer_details != null) ? data.customer_details.co_contact_number : 'N/A' }}</td>
                    <td>{{ data.email }}</td>
                    <td>{{ (data.customer_details != null) ? data.customer_details.pa_city : 'N/A' }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td :colspan="rowCount">No Result(s) Found.</td>
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
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => { 
                            me.res = res.data.customers

                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
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
