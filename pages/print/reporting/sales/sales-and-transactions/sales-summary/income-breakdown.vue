<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Sales &amp; Transactions - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} (Income Breakdown)</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Payment Type</th>
                    <th>ITY</th>
                    <th>ITD</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="green">Total</td>
                    <td class="green">Php {{ totalCount(res.income_breakdown_total.incomeBreakdownITYTotal) }}</td>
                    <td class="green">Php {{ totalCount(res.income_breakdown_total.incomeBreakdownITDTotal) }}</td>
                </tr>
                <tr v-for="(data, key) in res.income_breakdown" :key="key">
                    <td>{{ data.name }}</td>
                    <td>Php {{ totalCount(data.ITY) }}</td>
                    <td>Php {{ totalCount(data.ITD) }}</td>
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
                res: {
                    income_breakdown: [],
                    income_breakdown_total: []
                },
                studio: [],
                form: {
                    studio_id: ''
                }
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                if (me.$route.query.studio_id) {
                    me.form.studio = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }

                me.$axios.post('api/reporting/sales/sales-and-transactions/sales-summary', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.income_breakdown = res.data.incomeBreakdown
                            me.res.income_breakdown_total = res.data.incomeBreakdownTotal

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
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
