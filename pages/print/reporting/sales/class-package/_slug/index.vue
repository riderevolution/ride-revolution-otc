<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>{{ package.name }} - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ $route.query.status }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Date of Purchase</th>
                    <th class="sticky">Full Name</th>
                    <th class="sticky">Qty.</th>
                    <th class="sticky">Payment</th>
                    <th class="sticky">Comp Reason</th>
                    <th class="sticky">Comp Value</th>
                    <th class="sticky">Discount</th>
                    <th class="sticky">Total Income</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr>
                    <td><b>{{ total.name }}</b></td>
                    <td><b>-</b></td>
                    <td><b>{{ total.qty }}</b></td>
                    <td><b>-</b></td>
                    <td><b>-</b></td>
                    <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                </tr>
                <tr v-for="(data, key) in res" :key="key" v-if="res.length > 0">
                    <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>
                        <div class="table_data_link" v-if="data.payment.user != null">{{ `${data.payment.user.first_name} ${data.payment.user.last_name}` }}</div>
                        <div v-else>N/A</div>
                    </td>
                    <td>{{ data.quantity }}</td>
                    <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                    <td>{{ (data.payment.payment_method.method == 'comp') ? data.payment.payment_method.comp_reason : 'N/A' }}</td>
                    <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                    <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                    <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
                total: [],
                studio: [],
                package: []
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                if (me.$route.query.studio_id.length > 0) {
                    formData.append('studio_id', me.$route.query.studio_id)
                }

                formData.append('slug', me.$route.query.slug)
                formData.append('id', me.$route.query.id)
                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                formData.append('status', me.$route.query.status)
                me.$axios.post(`api/reporting/sales/sales-by-class-package/${me.$route.params.slug}?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.package = res.data.package

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
