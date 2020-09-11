<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>{{ variant.product.category.name }}:{{ variant.variant }} - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ $route.query.status }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Date of Purchase</th>
                    <th class="sticky">Full Name</th>
                    <th class="sticky">Qty.</th>
                    <th class="sticky">Payment</th>
                    <th class="sticky">Employee</th>
                    <th class="sticky">Total</th>
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
                </tr>
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>
                        <nuxt-link class="table_data_link" :to="`/customers/${data.payment.user.id}/packages`" v-if="data.payment.user != null">{{ `${data.payment.user.first_name} ${data.payment.user.last_name}` }}</nuxt-link>
                        <div v-else>N/A</div>
                    </td>
                    <td>{{ data.quantity }}</td>
                    <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                    <td>
                        <div v-if="data.employee != null">
                            {{ `${data.employee.first_name} ${data.employee.last_name}` }}
                        </div>
                        <div v-else>
                            N/A
                        </div>
                    </td>
                    <td>Php {{ (data.total) ? totalCount(data.total) : 0 }}</td>
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
                me.loader(true)
                let formData = new FormData()
                formData.append('slug', me.form.slug)
                formData.append('variant_id', me.form.variant_id)
                formData.append('status', me.$route.query.status)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                if (me.$route.query.studio_id.length > 0) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.slug}/product/${me.$route.params.param}?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.variant = res.data.variant

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
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
