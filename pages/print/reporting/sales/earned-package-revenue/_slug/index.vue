<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Earned Class Package Revenue - {{ class_package.name }}</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <div class="total">Grand Total: Php {{ computeTotal() }}</div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Activation Date</th>
                    <th>Expiration Date</th>
                    <th>Count</th>
                    <th>Remaining</th>
                    <th>Revenue</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link" v-if="data.user != null">{{ data.user.fullname }}</div>
                        <div v-else>N/A</div>
                    </td>
                    <td>{{ $moment((data.activation_date != 'NA') ? data.activation_date : data.created_at).format('MMM DD, YYYY') }}</td>
                    <td>{{ $moment((data.computed_expiration_date != null) ? data.computed_expiration_date : data.expiry_date_if_not_activated).format('MMM DD, YYYY') }}</td>
                    <td>{{ data.original_package_count }}</td>
                    <td>{{ data.count }}</td>
                    <td>Php {{ totalCount(data.revenue) }}</td>
                    <td>Php {{ totalCount(data.payment_item.price_per_item) }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="7">No Result(s) Found.</td>
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
                class_package: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    id: 0,
                    type: ''
                }
            }
        },
        methods: {
            computeTotal () {
                const me = this
                let total = 0
                me.res.forEach((value, index) => {
                    total += parseFloat(value.revenue)
                })

                return me.totalCount(total)
            },
            initial () {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.type = me.$route.query.type
                me.form.id = me.$route.query.id

                let formData = new FormData()
                formData.append('id', me.form.id)
                formData.append('type', me.$route.query.type)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post(`api/reporting/sales/earned-class-package-revenue/${me.$route.params.slug}?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.user_packages

                            me.class_package = res.data.class_package
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
