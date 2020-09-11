<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Class Package Expiration ({{ form.type }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Class Package</th>
                    <th>Purchase Date</th>
                    <th>Activation Date</th>
                    <th>Expiration Date</th>
                    <th>Total Class Count</th>
                    <th>Remaining Class Count</th>
                    <th>Class Package Value</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>
                        <div class="table_data_link">{{ data.user.fullname }}</div>
                    </td>
                    <td>{{ data.class_package.name }}</td>
                    <td>{{ (data.payment_item) ? $moment(data.payment_item.payment.updated_at, 'YYYY-MM-DD').format('MMMM DD, YYYY') : '-' }}</td>
                    <td>{{ $moment(data.activation_date).format('MMMM DD, YYYY') }}</td>
                    <td>{{ $moment(data.expiryDate).format('MMMM DD, YYYY') }}</td>
                    <td>{{ data.original_package_count }}</td>
                    <td>{{ data.count }}</td>
                    <td>Php {{ totalCount(data.class_package.package_price) }}</td>
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
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    q: '',
                    type: ''
                },
                res: []
            }
        },
        methods: {
            initial () {
                const me = this

                if (me.$route.query.start_date.length > 0) {
                    me.form.start_date = me.$route.query.start_date
                }
                if (me.$route.query.end_date.length > 0) {
                    me.form.end_date = me.$route.query.end_date
                }
                if (me.$route.query.type.length > 0) {
                    me.form.type = me.$route.query.type
                }
                if (me.$route.query.q.length > 0) {
                    me.form.q = me.$route.query.q
                }

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('q', me.form.q)
                formData.append('type', me.form.type)
                me.$axios.post(`api/reporting/packages/class-package-expiration?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.packages
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
