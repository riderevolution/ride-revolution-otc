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
                <h2>{{ replacer($route.params.slug) }} - {{ studio.name }} ({{ $route.query.payment_status }})</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="sticky">Date</th>
                    <th class="sticky">Time</th>
                    <th class="sticky">Order ID</th>
                    <th class="sticky">Customer</th>
                    <th class="sticky">Status</th>
                    <th class="sticky">Total</th>
                    <th class="sticky">Employee</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY') }}</td>
                    <td>{{ $moment(data.updated_at).format('h:mm A') }}</td>
                    <td>{{ data.payment_code }}</td>
                    <td>
                        <div class="table_data_link" v-if="data.user != null">{{ `${data.user.first_name} ${data.user.last_name}` }}</div>
                        <div v-else>N/A</div>
                    </td>
                    <td :class="`${(data.status == 'paid') ? 'green' : 'red'}`">{{ (data.status == 'paid') ? 'Paid' : 'Pending' }}</td>
                    <td>Php {{ (data.total) ? totalCount(data.total) : 0 }}</td>
                    <td>
                        <div v-if="data.employee != null">
                            {{ `${data.employee.first_name} ${data.employee.last_name}` }}
                        </div>
                        <div v-else>
                            N/A
                        </div>
                    </td>
                </tr>
            </tbody>
            <tbody class="no_results" v-else>
                <tr>
                    <td colspan="7">No Result(s) Found.</td>
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
                total: [],
                form: {
                    studio_id: ''
                }
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                if (me.$route.query.studio_id) {
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                formData.append('payment_method', me.$route.params.slug)
                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                formData.append('payment_status', me.$route.query.payment_status)
                me.$axios.post(`api/reporting/sales/sales-by-payment-type/${me.$route.params.slug}?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                            me.total = res.data.total

                            if (me.form.studio_id != 0 && me.form.studio_id != 'os') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            } else {
                                me.studio = {
                                    name: (me.form.studio_id == 'os' ? 'Online Sales' : 'All Studios')
                                }
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
