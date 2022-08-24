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
                <h2>Sales by Products - {{ ($route.query.studio_id && $route.query.studio_id != 0) ? studio.name : 'All Studios' }}</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Sold</th>
                    <th>Returned</th>
                    <th>Comp</th>
                    <th>Discount</th>
                    <th>Taxes</th>
                    <th>Gross</th>
                    <th>Comp Value</th>
                    <th>Profit</th>
                    <th>Cost</th>
                    <th>Total Income</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><b>{{ total.name }}</b></td>
                    <td><b>{{ total.sold }}</b></td>
                    <td><b>{{ total.returned }}</b></td>
                    <td><b>{{ total.comp }}</b></td>
                    <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                    <td><b>Php {{ totalCount(total.gross) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                    <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                </tr>
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ data.name }}</div>
                    </td>
                    <td>{{ (data.sold) ? data.sold : 0 }}</td>
                    <td>{{ (data.returned) ? data.returned : 0 }}</td>
                    <td>{{ (data.comp) ? data.comp : 0 }}</td>
                    <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                    <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                    <td>Php {{ (data.gross) ? totalCount(data.gross) : 0 }}</td>
                    <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                    <td :class="`${(data.total_profit) ? (data.total_profit <= 0 ? 'red' : 'green') : ''}`">Php {{ (data.total_profit) ? totalCount(data.total_profit) : 0 }}</td>
                    <td>Php {{ (data.total_cost) ? totalCount(data.total_cost) : 0 }}</td>
                    <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
                total: [],
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
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total

                            if (me.form.studio_id != 0) {
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
