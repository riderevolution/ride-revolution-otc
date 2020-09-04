<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Sales &amp; Transactions - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ $route.query.status }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th class="cms_table_title">Items</th>
                    <th colspan="3" class="cms_table_title">Income</th>
                    <th colspan="8" class="cms_table_title">Mode of Payment</th>
                </tr>
                <tr>
                    <th>Items</th>
                    <th>Qty</th>
                    <th>ITY</th>
                    <th>ITD</th>
                    <th>CA</th>
                    <th>GC</th>
                    <th>CC</th>
                    <th>DC/EPS</th>
                    <th>CQ</th>
                    <th>PP</th>
                    <th>PM</th>
                    <th>SC</th>
                </tr>
            </thead>
            <tbody v-if="!filtered">
                <tr>
                    <td class="green">Total</td>
                    <td class="green">{{ res.item_total.totalQty }}</td>
                    <td class="green">Php {{ totalCount(res.item_total.totalITY) }}</td>
                    <td class="green">Php {{ totalCount(res.item_total.totalITD) }}</td>
                    <td class="green">{{ res.item_payment_mode_total.cash }}</td>
                    <td class="green">{{ res.item_payment_mode_total.gcash }}</td>
                    <td class="green">{{ res.item_payment_mode_total.creditCard }}</td>
                    <td class="green">{{ res.item_payment_mode_total.debitCard }}</td>
                    <td class="green">{{ res.item_payment_mode_total.check }}</td>
                    <td class="green">{{ res.item_payment_mode_total.paypal }}</td>
                    <td class="green">{{ res.item_payment_mode_total.paymaya }}</td>
                    <td class="green">{{ res.item_payment_mode_total.storeCredit }}</td>
                </tr>
                <tr v-for="(data, key) in res.items" :key="key">
                    <td>{{ (data.card_code) ? data.card_code : (data.variant ? data.variant : data.name) }}</td>
                    <td>{{ (data.qty) ? data.qty : 0 }}</td>
                    <td>Php {{ totalCount(data.ITY) }}</td>
                    <td>Php {{ totalCount(data.ITD) }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.cash : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.gcash : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.creditCard : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.debitCard : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.check : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.paypal : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.paymaya : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.storeCredit : 0 }}</td>
                </tr>
            </tbody>
            <tbody v-else-if="filtered">
                <tr>
                    <td class="green">Total</td>
                    <td class="green">{{ res.item_total.totalQty }}</td>
                    <td class="green">Php {{ totalCount(res.item_total.totalITY) }}</td>
                    <td class="green">Php {{ totalCount(res.item_total.totalITD) }}</td>
                    <td class="green">{{ res.item_payment_mode_total.cash }}</td>
                    <td class="green">{{ res.item_payment_mode_total.gcash }}</td>
                    <td class="green">{{ res.item_payment_mode_total.creditCard }}</td>
                    <td class="green">{{ res.item_payment_mode_total.debitCard }}</td>
                    <td class="green">{{ res.item_payment_mode_total.check }}</td>
                    <td class="green">{{ res.item_payment_mode_total.paypal }}</td>
                    <td class="green">{{ res.item_payment_mode_total.paymaya }}</td>
                    <td class="green">{{ res.item_payment_mode_total.storeCredit }}</td>
                </tr>
                <tr v-for="(data, key) in res.items" :key="key" v-if="data.qty > 0">
                    <td>{{ (data.card_code) ? data.card_code : (data.variant ? data.variant : data.name) }}</td>
                    <td>{{ (data.qty) ? data.qty : 0 }}</td>
                    <td>Php {{ totalCount(data.ITY) }}</td>
                    <td>Php {{ totalCount(data.ITD) }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.cash : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.gcash : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.creditCard : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.debitCard : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.check : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.paypal : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.paymaya : 0 }}</td>
                    <td>{{ (data.paymentModes) ? data.paymentModes.storeCredit : 0 }}</td>
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
                res: {
                    items: [],
                    item_total: [],
                    item_payment_mode_total: []
                },
                filtered: false,
                studio: []
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                if (me.$route.query.studio_id.length > 0) {
                    formData.append('studio_id', me.$route.query.studio_id)
                }

                let route = me.$route.path.split('/')
                route.splice(0, 2)
                route = route.join('/')

                if (me.$route.query.filtered) {
                    me.filtered = JSON.parse(me.$route.query.filtered)
                }

                me.$axios.post(`api/${route}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.items = res.data.items
                            me.res.item_total = res.data.total
                            me.res.item_payment_mode_total = res.data.paymentModesTotal

                            if (me.$route.query.studio_id.length > 0) {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }
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
