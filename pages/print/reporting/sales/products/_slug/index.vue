<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>{{ category.name }} - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ $route.query.payment_status }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Product Name</th>
                    <th class="sticky">Item Price</th>
                    <th class="sticky">Sold</th>
                    <th class="sticky">Comp Value</th>
                    <th class="sticky">Discount</th>
                    <th class="sticky">Taxes</th>
                    <th class="sticky">Profit</th>
                    <th class="sticky">Cost</th>
                    <th class="sticky">Total Income</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr>
                    <td><b>{{ total.name }}</b></td>
                    <td><b>-</b></td>
                    <td><b>{{ total.sold }}</b></td>
                    <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                    <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                    <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                </tr>
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link" v-if="form.slug == 'product-variant'">{{ data.variant }}</div>
                        <div v-else>{{ data.card_code }}</div>
                    </td>
                    <td>
                        <div v-if="form.slug == 'product-variant'">
                            Php {{ totalCount(data.sale_price) }}
                        </div>
                        <div v-else>
                            Php {{ totalCount(data.class_package.price) }}
                        </div>
                    </td>
                    <td>{{ (data.sold) ? data.sold : 0 }}</td>
                    <td>Php {{ (totalCount(data.total_comp)) ? totalCount(data.total_comp) : 0 }}</td>
                    <td>Php {{ (totalCount(data.total_discount)) ? totalCount(data.total_discount) : 0 }}</td>
                    <td>Php {{ (totalCount(data.total_tax)) ? totalCount(data.total_tax) : 0 }}</td>
                    <td :class="`${(data.total_profit) ? (data.total_profit <= 0 ? 'red' : 'green') : ''}`">Php {{ (totalCount(data.total_profit)) ? totalCount(data.total_profit) : 0 }}</td>
                    <td>Php {{ (totalCount(data.total_cost)) ? totalCount(data.total_cost) : 0 }}</td>
                    <td>Php {{ (totalCount(data.total_income)) ? totalCount(data.total_income) : 0 }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="9">No Result(s) Found.</td>
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
                category: [],
                total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    slug: '',
                    studio_id: '',
                    id: 0
                }
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.slug = me.$route.query.slug
                me.form.id = me.$route.query.id
                formData.append('slug', me.form.slug)
                formData.append('id', me.form.id)
                formData.append('payment_status', me.$route.query.payment_status)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post(`api/reporting/sales/sales-by-product/${me.$route.params.slug}?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total
                            me.category = res.data.category

                            if (me.form.studio_id != '') {
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
