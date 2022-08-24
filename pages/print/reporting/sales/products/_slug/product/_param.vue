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
                <h2>{{ variant.product.category.name }}:{{ variant.variant }} - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ $route.query.payment_status }})</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Date of Purchase</th>
                    <th>Full Name</th>
                    <th>Qty.</th>
                    <th>Payment</th>
                    <th>Transaction By</th>
                    <th>Total</th>
                    <th>Comp Reason</th>
                    <th>Note</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr>
                    <td><b>{{ total.name }}</b></td>
                    <td><b>-</b></td>
                    <td><b>{{ total.qty }}</b></td>
                    <td><b>-</b></td>
                    <td><b>-</b></td>
                    <td><b>Php {{ totalCount(total.total_price) }}</b></td>
                    <td><b>-</b></td>
                    <td><b>-</b></td>
                    <td><b>-</b></td>
                </tr>
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>
                        <div class="thumb" v-if="data.payment.user != null">
                            <div class="table_data_link">{{ data.payment.user.fullname }}</div>
                        </div>
                        <div v-else>
                            No Customer
                        </div>
                    </td>
                    <td>{{ data.quantity }}</td>
                    <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                    <td>
                        <div v-if="data.employee != null">
                            {{ `${data.employee.first_name} ${data.employee.last_name}` }}
                        </div>
                        <div v-else>
                            No User
                        </div>
                    </td>
                    <td>Php {{ (data.total) ? totalCount(data.total) : 0 }}</td>
                    <td>{{ (data.payment.comp_reason) ? data.payment.comp_reason : 'N/A' }}</td>
                    <td>{{ (data.payment.note) ? data.payment.note : 'N/A' }}</td>
                    <td>{{ (data.payment.remarks) ? data.payment.remarks : 'N/A' }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="6">No Result(s) Found.</td>
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
                variant: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    slug: '',
                    id: 0,
                    studio_id: 0,
                    variant_id: 0
                }
            }
        },
        methods: {
            initial () {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.slug = me.$route.query.slug
                me.form.id = me.$route.query.id
                me.form.variant_id = me.$route.query.variant_id
                let formData = new FormData()
                formData.append('slug', me.form.slug)
                formData.append('variant_id', me.form.variant_id)
                formData.append('payment_status', me.$route.query.payment_status)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.slug}/product/${me.$route.params.param}?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.variant = res.data.variant

                            if (me.form.studio_id != 0) {
                                me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
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
