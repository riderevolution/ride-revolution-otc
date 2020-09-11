<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Remaining Package Value</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Package Type</th>
                    <th>Class Package</th>
                    <th>Starting Class Count</th>
                    <th>Starting Value</th>
                    <th>Remaining Class Count</th>
                    <th>Remaining Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><b>Summary</b></td>
                    <td><b>-</b></td>
                    <td><b>{{ totalItems(res.summary.starting_class_count) }}</b></td>
                    <td><b>Php {{ totalCount(res.summary.starting_value) }}</b></td>
                    <td><b>{{ totalItems(res.summary.remaining_class_count) }}</b></td>
                    <td><b>Php {{ totalCount(res.summary.remaining_value) }}</b></td>
                </tr>
                <tr v-for="(data, key) in res.classPackages" :key="key">
                    <td>{{ data.package_type.name }}</td>
                    <td>{{ data.name }}</td>
                    <td>{{ (data.starting_class_count == 'Unlimited') ? data.starting_class_count : totalItems(data.starting_class_count) }}</td>
                    <td>Php {{ totalCount(data.starting_value) }}</td>
                    <td>{{ (data.remaining_class_count == 'Unlimited') ? data.remaining_class_count : totalItems(data.remaining_class_count) }}</td>
                    <td>Php {{ totalCount(data.remaining_value) }}</td>
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
                    end_date: this.$moment().format('YYYY-MM-DD')
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

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post(`api/reporting/packages/remaining-class-package-value?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
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
