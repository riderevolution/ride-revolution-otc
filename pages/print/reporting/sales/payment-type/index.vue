<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Sales by Payment Type ({{ $route.query.status }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Payment</th>
                    <th>Transaction Count</th>
                    <th>Gross Receipts</th>
                    <th>Gross Refunds</th>
                    <th>Sales Tax</th>
                    <th>Refund Tax</th>
                    <th>Net of Receipts</th>
                    <th>Net of Refunds</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><b>{{ payment_total.name }}</b></td>
                    <td><b>{{ payment_total.transaction_count }}</b></td>
                    <td><b>Php {{ totalCount(payment_total.gross_receipts) }}</b></td>
                    <td><b>Php {{ totalCount(payment_total.gross_refunds) }}</b></td>
                    <td><b>Php {{ totalCount(payment_total.sales_tax) }}</b></td>
                    <td><b>Php {{ totalCount(payment_total.sales_tax) }}</b></td>
                    <td><b>Php {{ totalCount(payment_total.net_receipts) }}</b></td>
                    <td><b>Php {{ totalCount(payment_total.net_refunds) }}</b></td>
                </tr>
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ data.name }}</td>
                    <td>{{ data.transaction_count }}</td>
                    <td>Php {{ totalCount(data.gross_receipts) }}</td>
                    <td>Php {{ totalCount(data.gross_refunds) }}</td>
                    <td>Php {{ totalCount(data.sales_tax) }}</td>
                    <td>Php {{ totalCount(data.sales_tax) }}</td>
                    <td>Php {{ totalCount(data.net_receipts) }}</td>
                    <td>Php {{ totalCount(data.net_refunds) }}</td>
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
                payment_total: []
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                formData.append('status', me.$route.query.status)
                if (me.$route.query.studio_id.length > 0) {
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-by-payment-type', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.payment_total = res.data.payment_grand_total
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
