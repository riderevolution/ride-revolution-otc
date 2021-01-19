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
                <h2>Gift Cards Report - {{ ($route.query.studio_id == 'os') ? 'Website/Online Sales' : ($route.query.studio_id.length > 0 ? studio.name : 'All Studios') }}</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Card Code</th>
                    <th>Class Package Value</th>
                    <th>Studio</th>
                    <th>Date Purchased</th>
                    <th>Purchased By</th>
                    <th>Redemption Date</th>
                    <th>Redeemed By</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ data.card_code }}</td>
                    <td>
                        <p>{{ data.class_package.name }}</p>
                        <p>Php {{ totalCount(data.price) }}</p>
                    </td>
                    <td>{{ getDetails(data, 'studio') }}</td>
                    <td>{{ $moment(data.payment_item.payment.created_at).format('MMMM DD, YYYY') }}</td>
                    <td>{{ getDetails(data, 'sender') }}</td>
                    <td>{{ getDetails(data, 'redemption_date') }}</td>
                    <td>{{ getDetails(data, 'redeemer') }}</td>
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
                    studio_id: '',
                    type: 'all'
                }
            }
        },
        methods: {
            getDetails (data, type) {
                const me = this
                let result = ''

                switch (type) {
                    case 'studio':
                        if (data.payment_item.payment.studio) {
                            result = data.payment_item.payment.studio.name
                        } else {
                            result = 'Website/Online'
                        }
                        break
                    case 'sender':
                        if (data.sender) {
                            result = data.sender.fullname
                        } else {
                            result = 'No Sender'
                        }
                        break
                    case 'sender_email':
                        if (data.sender) {
                            result = data.sender.email
                        } else {
                            result = 'No Email'
                        }
                        break
                    case 'sender_contact':
                        if (data.sender) {
                            result = data.sender.customer_details.co_contact_number
                        } else {
                            result = 'No Contact Number'
                        }
                        break
                    case 'redemption_date':
                        if (data.redeemer) {
                            result = me.$moment(data.updated_at).format('MMMM DD, YYYY')
                        } else {
                            result = 'No Redemption Date'
                        }
                        break
                    case 'redeemer':
                        if (data.redeemer) {
                            result = data.redeemer.fullname
                        } else {
                            result = 'No Redeemer'
                        }
                        break
                    case 'redeemer_email':
                        if (data.redeemer) {
                            result = data.redeemer.email
                        } else {
                            result = 'No Email'
                        }
                        break
                    case 'redeemer_contact':
                        if (data.redeemer) {
                            result = data.redeemer.customer_details.co_contact_number
                        } else {
                            result = 'No Contact Number'
                        }
                        break
                }

                return result
            },
            initial () {
                const me = this
                let formData = new FormData()

                formData.append('start_date', me.$route.query.start_date)
                formData.append('end_date',  me.$route.query.end_date)
                if (me.$route.query.studio_id) {
                    me.form.studio = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                if (me.$route.query.type) {
                    me.form.studio = me.$route.query.type
                    formData.append('type', me.$route.query.type)
                }

                formData.append('all', 1)

                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
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
