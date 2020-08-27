<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Gift Cards Redeemed - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }}</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <div class="total">Grand Total: Php {{ totalCount(total_count) }}</div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Card Code</th>
                    <th class="sticky">Class Package Value</th>
                    <th class="sticky">Date Purchased</th>
                    <th class="sticky">Purchased By</th>
                    <th class="sticky">Redemption Date</th>
                    <th class="sticky">Redeemed By</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ data.card_code }}</td>
                    <td>
                        <p>{{ data.class_package.name }}</p>
                        <p>Php {{ totalCount(data.class_package.package_price) }}</p>
                    </td>
                    <td>{{ $moment(data.payment_item.payment.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>{{ `${data.user.first_name} ${data.user.last_name}` }}</td>
                    <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY') }}</td>
                    <td>{{ `${data.redeemer.first_name} ${data.redeemer.last_name}` }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="6">No Result(s) Found.</td>
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
                total_count: 0,
                res: [],
                studio: []
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                if (me.$route.query.studio_id.length > 0) {
                    formData.append('studio_id', me.$route.query.studio_id)
                }

                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
                            me.res = res.data.result

                            if (me.$route.query.studio_id.length > 0) {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }

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
