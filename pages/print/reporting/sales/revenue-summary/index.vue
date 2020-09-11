<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Revenue Summary</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <div class="total">Grand Total: Php {{ form.total }}</div>
        <table class="cms_table_accordion">
            <thead>
                <tr>
                    <th>Revenue</th>
                    <th>Subtotal Revenue</th>
                </tr>
            </thead>
            <tbody class="toggled tbp" v-for="(data, key) in res" v-if="res.length > 0">
                <tr class="parent">
                    <td>{{ data.name }}</td>
                    <td>Php {{ totalCount(data.total) }}</td>
                </tr>
                <tr>
                    <td class="pads" colspan="8">
                        <div class="accordion_table">
                            <table class="cms_table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody v-if="data.groups.length > 0">
                                    <tr v-for="(value, key) in data.groups" :key="key">
                                        <td class="sign">
                                            {{ value.name }}
                                            <div class="circle add" v-if="value.negative != undefined && !value.negative"></div>
                                            <div class="circle sub" v-else-if="value.negative != undefined && value.negative"></div>
                                            <div class="circle sub" v-else-if="value.time != undefined && value.time"></div>
                                        </td>
                                        <td>Php {{ totalCount(value.total) }}</td>
                                    </tr>
                                </tbody>
                                <tbody class="no_results" v-else>
                                    <tr>
                                        <td colspan="2">No Result(s) Found.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="2">No Result(s) Found.</td>
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
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    total: 0
                }
            }
        },
        methods: {
            initial () {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/sales/revenue-summary', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.summary_revenues

                            me.form.total = me.totalCount(res.data.grand_total)
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
