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
                <h2>Outstanding Store Credits</h2>
                <div class="total">Total Store Credits: Php {{ totalCount(total) }}</div>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Member ID</th>
                    <th>Customer</th>
                    <th>Customer Type</th>
                    <th>Cumulative Store Credits</th>
                    <th>Total Spent</th>
                    <th>Remaining Store Credits</th>
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
                    <td>Php {{ totalCount(data.total_store_credits_bought) }}</td>
                    <td>Php {{ totalCount(data.store_credits.amount) }}</td>
                    <td>Php {{ -totalCount(data.store_credits.amount - data.total_store_credits_bought) }}</td>
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
            initial () {
                const me = this
                let formData = new FormData()
                me.$axios.post('api/reporting/customers/outstanding-store-credits?all=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total = res.data.total_store_credits
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
