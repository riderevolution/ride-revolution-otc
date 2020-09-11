<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Average Time to Utilize Packages</h2>
            <h3><span>{{ $moment().format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Class Package</th>
                    <th>Total Package Count</th>
                    <th>Total Sales Amount</th>
                    <th>Utilization Rate</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ data.name }}</td>
                    <td>{{ (data.class_count_unlimited == 1) ? 'Unlimited' : data.class_count }}</td>
                    <td>Php {{ totalCount(data.totalSalesAmount) }}</td>
                    <td>{{ data.utilizationRate }} Days</td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td :colspan="rowCount">No Result(s) Found.</td>
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
                res: []
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()
                me.$axios.post(`api/reporting/packages/average-time-to-utilize-packages?all=1`, formData).then(res => {
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
