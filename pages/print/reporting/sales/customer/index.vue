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
                <h2>Sales by Customer</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Class Package Total</th>
                    <th>Gift Card Total</th>
                    <th>Store Credits Total</th>
                    <th>Merchandise Total</th>
                    <th>Total Comp</th>
                    <th>Total Gross</th>
                    <th>Total Discount</th>
                    <th>Total Net</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ data.fullname }}</div>
                    </td>
                    <td>{{ data.customer_details.customer_type.name }}</td>
                    <td>{{ data.email }}</td>
                    <td>Php {{ totalCount(data.total_class_package) }}</td>
                    <td>Php {{ totalCount(data.total_gift_card) }}</td>
                    <td>Php {{ totalCount(data.total_store_credit) }}</td>
                    <td>Php {{ totalCount(data.total_merchandise) }}</td>
                    <td>Php {{ totalCount(data.total_comp) }}</td>
                    <td>Php {{ totalCount(data.total_income) }}</td>
                    <td>Php {{ totalCount(data.total_discount) }}</td>
                    <td>Php {{ totalCount(data.total_net) }}</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="11">No Result(s) Found.</td>
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
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    gender: '',
                    customer_type_id: ''
                }
            }
        },
        methods: {
            initial () {
                const me = this

                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.gender = me.$route.query.gender
                me.form.customer_type_id = me.$route.query.customer_type_id

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('gender', me.form.gender)
                formData.append('customer_type_id', me.form.customer_type_id)
                me.$axios.post('api/reporting/sales/sales-by-customer?all=1', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
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
