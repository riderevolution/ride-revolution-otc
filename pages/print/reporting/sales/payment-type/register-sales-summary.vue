<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Register Sales Summary</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Branch</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Refund Subtotal</th>
                    <th>Refund Tax</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><b>{{ studio_total.name }}</b></td>
                    <td><b>Php {{ totalCount(studio_total.subtotal) }}</b></td>
                    <td><b>Php {{ totalCount(studio_total.total_tax) }}</b></td>
                    <td><b>Php {{ totalCount(studio_total.subtotal_refund) }}</b></td>
                    <td><b>Php {{ totalCount(studio_total.total_tax) }}</b></td>
                    <td><b>Php {{ totalCount(studio_total.total_income) }}</b></td>
                </tr>
                <tr v-for="(data, key) in studio_res" :key="key">
                    <td>{{ data.name }}</td>
                    <td>Php {{ (data.subtotal) ? totalCount(data.subtotal) : 0 }}</td>
                    <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                    <td>Php {{ (data.subtotal_refund) ? totalCount(data.subtotal_refund) : 0 }}</td>
                    <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                    <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
                studio_res: [],
                studio_total: []
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
                            me.studio_res = res.data.studio_sales_summary
                            me.studio_total = res.data.studio_grand_total
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
