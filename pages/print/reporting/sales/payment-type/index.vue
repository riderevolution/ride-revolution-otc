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
                <h2>Sales by Payment Type - {{ studio.name }} ({{ $route.query.payment_status }})</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
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
                studio: [],
                payment_total: [],
                form: {
                    studio_id: 0
                }
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                formData.append('payment_status', me.$route.query.payment_status)
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-by-payment-type', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.payment_total = res.data.payment_grand_total

                            if (me.form.studio_id != 0 && me.form.studio_id != 'os') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            } else {
                                me.studio = {
                                    name: (me.form.studio_id == 'os' ? 'Online Sales' : 'All Studios')
                                }
                            }

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
