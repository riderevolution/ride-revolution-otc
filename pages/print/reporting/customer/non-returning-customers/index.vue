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
                    <th>Last Package Used</th>
                    <th>Purchase/Activation Date</th>
                    <th>Status</th>
                    <th>Completion/Expiration Date</th>
                    <th>Last Class</th>
                    <th>Preferred Studio</th>
                    <th>Preferred Instructor</th>
                    <th>Total Rides</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ data.fullname }}</div>
                    </td>
                    <td>{{ data.latest_user_package_count.class_package.name }}</td>
                    <td>{{ $moment(data.latest_user_package_count.created_at).format('MMM DD, YYYY') }} / {{ (data.latest_user_package_count.activation_date != 'NA') ? $moment(data.latest_user_package_count.activation_date).format('MMM DD, YYYY') : 'Not Activated' }}</td>
                    <td class="alt_2">{{ replacer(data.latest_user_package_count.how_it_died) }}</td>
                    <td>{{ getCustomerDetails(data, 'completion') }} / {{ getCustomerDetails(data, 'expired') }}</td>
                    <td>{{ (data.latest_user_package_count.latest_booking) ? $moment(data.latest_user_package_count.latest_booking.scheduled_date.date).format('MMM DD, YYYY') : 'No Class Yet' }}</td>
                    <td>{{ (data.preferred_studio) ? data.preferred_studio : 'No Preferred Studio' }}</td>
                    <td>{{ (data.preferred_instructor) ? data.preferred_instructor : 'No Preferred Instructor' }}</td>
                    <td>{{ totalItems(data.ridesCount) }}</td>
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
            getCustomerDetails (data, type) {
                const me = this
                let result = ''

                switch (type) {
                    case 'gender':
                        result = (data.customer_details.co_sex) ? (data.customer_details.co_sex == 'F' ? 'Female' : 'Male') : 'N/A'
                        break
                    case 'contact_number':
                        result = (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A'
                        break
                    case 'weight':
                        result = (data.customer_details.co_weight) ? data.customer_details.co_weight : 'N/A'
                        break
                    case 'shoe_size':
                        result = (data.customer_details.co_shoe_size) ? data.customer_details.co_shoe_size : 'N/A'
                        break
                    case 'dumbbell':
                        result = (data.customer_details.dumbbell) ? data.customer_details.dumbbell : 'N/A'
                        break
                    case 'personal':
                        if (data.customer_details.pa_address) {
                            result += data.customer_details.pa_address
                            if (data.customer_details.pa_address_2) {
                                result += `, ${data.customer_details.pa_address_2}`
                            }
                            if (data.customer_details.pa_zip_code) {
                                result += `, ${data.customer_details.pa_zip_code}`
                            }
                            if (data.customer_details.personal_state) {
                                result += `, ${data.customer_details.personal_state}`
                            }
                            if (data.customer_details.personal_country) {
                                result += `, ${data.customer_details.personal_country}`
                            }
                        } else {
                            result = 'N/A'
                        }
                        break
                    case 'billing':
                        if (data.customer_details.ba_address) {
                            result += data.customer_details.ba_address
                            if (data.customer_details.ba_address_2) {
                                result += `, ${data.customer_details.ba_address_2}`
                            }
                            if (data.customer_details.ba_zip_code) {
                                result += `, ${data.customer_details.ba_zip_code}`
                            }
                            if (data.customer_details.billing_state) {
                                result += `, ${data.customer_details.billing_state}`
                            }
                            if (data.customer_details.billing_country) {
                                result += `, ${data.customer_details.billing_country}`
                            }
                        } else {
                            result = 'N/A'
                        }
                        break
                    case 'completion':
                        result = me.$moment(data.latest_user_package_count.updated_at).format('MMM DD, YYYY')
                        break
                    case 'expired':
                        if (data.latest_user_package_count.computed_expiration_date != null) {
                            result = me.$moment(data.latest_user_package_count.computed_expiration_date, 'YYYY-MM-DD hh:mm:ss').format('MMM DD, YYYY')
                        } else {
                            result = me.$moment(data.latest_user_package_count.expiry_date_if_not_activated, 'YYYY-MM-DD hh:mm:ss').format('MMM DD, YYYY')
                        }
                        break
                }

                return result
            },
            initial () {
                const me = this
                let formData = new FormData()
                formData.append('date', me.$route.query.date)
                if (me.$route.query.class_package_id.length > 0) {
                    formData.append('class_package_id', me.$route.query.class_package_id)
                }
                formData.append('all', 1)
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
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
