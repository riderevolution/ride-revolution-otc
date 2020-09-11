<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Sales by Customer</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Full Name</th>
                    <th class="sticky">Type</th>
                    <th class="sticky">Class Package Total</th>
                    <th class="sticky">Merchandise Total</th>
                    <th class="sticky">Email</th>
                    <th class="sticky">Contact Number</th>
                    <th class="sticky">City</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ `${data.first_name} ${data.last_name}` }}</div>
                    </td>
                    <td>{{ data.customer_details.customer_type.name }}</td>
                    <td>Php {{ totalCount(data.total_class_package) }}</td>
                    <td>Php {{ totalCount(data.total_merchandise) }}</td>
                    <td>{{ data.email }}</td>
                    <td>{{ (data.customer_details.co_contact_number) ? data.customer_details.co_contact_number : '-' }}</td>
                    <td>{{ (data.customer_details.pa_city) ? data.customer_details.pa_city : '-' }}</td>
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
