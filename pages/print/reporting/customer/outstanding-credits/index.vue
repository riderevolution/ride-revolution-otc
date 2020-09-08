<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Outstanding Store Credits</h2>
        </div>
        <div class="total">Total Store Credits: Php {{ totalCount(total) }}</div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Rewards</th>
                    <th>Store Credits Bought</th>
                    <th>Store Credits Remaining</th>
                    <th>Spent</th>
                    <th>Contact Number</th>
                    <th>Email Address</th>
                    <th>City</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="thumb">
                            <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                            <div class="table_image_default" v-else>
                                <div class="overlay">
                                    {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                </div>
                            </div>
                            <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                        </div>
                    </td>
                    <td>Black</td>
                    <td>Php {{ totalCount(data.totalBroughtStoreCredits) }}</td>
                    <td>Php {{ totalCount(data.store_credits.amount) }}</td>
                    <td>Php {{ totalCount(data.totalBroughtStoreCredits - data.store_credits.amount) }}</td>
                    <td>{{ (data.customer_details != null) ? data.customer_details.co_contact_number : '-' }}</td>
                    <td>{{ data.email }}</td>
                    <td>{{ (data.customer_details != null) ? data.customer_details.pa_city : '-' }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="8">No Result(s) Found.</td>
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
                me.$axios.post('api/reporting/customers/outstanding-store-credits', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total = res.data.totalStoreCredits
                            me.res = res.data.result

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
