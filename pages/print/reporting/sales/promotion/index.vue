<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Promotions Redeemed - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ ($route.query.promo_id != 0) ? promo.name : 'All Promotions' }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <div class="total">Grand Total: Php {{ totalCount(total_count) }}</div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Date Redeemed</th>
                    <th class="sticky">Full Name</th>
                    <th class="sticky">Promo</th>
                    <th class="sticky">Promo Code</th>
                    <th class="sticky">Discount</th>
                    <th class="sticky">Total Discount</th>
                    <th class="sticky">Remaining</th>
                    <th class="sticky">Status</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>
                        <div class="table_data_link" v-if="data.user != null">{{ `${data.user.first_name} ${data.user.last_name}` }}</div>
                        <div v-else>N/A</div>
                    </td>
                    <td>{{ data.promo.name }}</td>
                    <td>{{ data.promo.promo_code }}</td>
                    <td>{{ (data.promo.discount_type == 'percent') ? `${data.promo.discount_percent}%` : `Php ${data.promo.discount_flat_rate} off` }}</td>
                    <td>Php {{ totalCount(data.total_discount) }}</td>
                    <td>{{ data.remaining }}</td>
                    <td>{{ (parseInt($moment(data.promo.end_Date).diff($moment(), 'days')) < 0) ? 'Inactive' : 'Active' }}</td>
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
                total_count: 0,
                res: [],
                promo: [],
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
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                if (me.$route.query.promo_id) {
                    formData.append('promo_id', me.$route.query.promo_id)
                }

                me.$axios.post('api/reporting/sales/promotions-redeemed?all=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
                            me.res = res.data.result

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }

                            if (me.$route.query.promo_id != 0) {
                                me.$axios.get(`api/inventory/promos/${me.$route.query.promo_id}`).then(res => {
                                    me.promo = res.data.promo
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
