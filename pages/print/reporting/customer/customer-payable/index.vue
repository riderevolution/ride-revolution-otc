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
                <h2>Customer Payable</h2>
                <div class="total">Total Pending Amount: Php {{ totalCount(total) }}</div>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Member ID</th>
                    <th>Customer</th>
                    <th>Customer Type</th>
                    <th>Total Pending Amount</th>
                    <th>Total Pending Transactions</th>
                    <th>Days Outstanding</th>
                    <th>Contact Number</th>
                    <th>Email Address</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ data.member_id }}</td>
                    <td>
                        <div class="table_data_link">{{ data.fullname }}</div>
                    </td>
                    <td>{{ data.customer_details.customer_type.name }}</td>
                    <td>Php {{ totalCount(data.total_customer_pending) }}</td>
                    <td>{{ data.payments.length }}</td>
                    <td>{{ getDaysOutstanding(data.payments[0]) }}</td>
                    <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A' }}</td>
                    <td>{{ data.email }}</td>
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
                total: 0
            }
        },
        methods: {
            getDaysOutstanding (payment) {
                const me = this
                let result = me.$moment(payment.created_at).toNow()
                result = result.split('in ')[1]
                return result
            },
            initial () {
                const me = this
                let formData = new FormData()
                me.$axios.post('api/reporting/customers/customer-payable?all=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total = res.data.total_pending
                            me.res = res.data.results

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
