<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Store Credits Report</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of store credits per customers</h2>
                        </div>
                        <!-- <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/gift-card?studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}&type=${tab_type}`" target="_blank" class="action_btn alternate">Print</a>

                                <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                    Export
                                </div>
                                <download-csv
                                    v-if="res.result.data.length > 0"
                                    class="hidden me"
                                    :data="giftCardsAttributes"
                                    :name="`gift-cards-report-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                    Export
                                </download-csv>

                            </div>
                        </div> -->
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" v-model="form.studio_id" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                    <option value="os">Website/Online Sales</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <input type="text" name="type" class="hidden none" v-model="tab_type">
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Transaction Date</th>
                                <th class="sticky">Customer</th>
                                <th class="sticky">Reference No.</th>
                                <th class="sticky">Method</th>
                                <th class="sticky">Amount</th>
                                <th class="sticky">Remarks</th>
                                <th class="sticky">Action</th>
                                <th class="sticky">Last Action Taken By</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.results.data.length > 0">
                            <tr v-for="(data, key) in res.results.data" :key="key">
                                <td>{{ $moment(data.payment.created_at).format('MMMM DD, YYYY hh:mm A') }}</td>
                                <td>
                                    <div class="thumb">
                                        <img :src="data.payment.user.customer_details.images[0].path_resized" v-if="data.payment.user.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.payment.user.first_name.charAt(0) }}{{ data.payment.user.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.payment.user.id}/packages`)">{{ data.payment.user.fullname }}</div>
                                    </div>
                                </td>
                                <td>{{ getPaymentCode(data.payment) }}</td>
                                <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                                <td>{{ getPaymentDetails(data.payment, 'price') }}</td>
                                <td>{{ (data.payment.payment_method.remarks) ? data.payment.payment_method.remarks : '-' }}</td>
                                <td>
                                    <div class="table_actions">
                                        <div class="table_action_cancel disabled link">Non-refundable</div>
                                    </div>
                                </td>
                                <td>{{ getPaymentDetails(data.payment, 'employee') }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.results.path" :current="res.results.current_page" :last="res.results.last_page" />
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '~/components/Foot'
    import Pagination from '~/components/Pagination'

    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Store Credits Report',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                studios: [],
                values: [],
                total_count: 0,
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: ''
                }
            }
        },
        computed: {
            // giftCardsAttributes () {
            //     const me = this
            //     return [
            //         ...me.values.map(value => ({
            //             'Card Code': value.card_code,
            //             'Class Package': value.class_package.name,
            //             'Price': `Php ${me.totalCount(value.price)}`,
            //             'Studio': me.getDetails(value, 'studio'),
            //             'Date Purchased': me.$moment(value.payment_item.payment.created_at).format('MMMM DD, YYYY'),
            //             'Purchased By': me.getDetails(value, 'sender'),
            //             'Purchaser Email': me.getDetails(value, 'sender_email'),
            //             'Purchaser Contact Number': me.getDetails(value, 'sender_contact'),
            //             'Redemption Date': me.getDetails(value, 'redemption_date'),
            //             'Redeemed By': me.getDetails(value, 'redeemer'),
            //             'Redeemer Email': me.getDetails(value, 'redeemer_email'),
            //             'Redeemer Contact Number': me.getDetails(value, 'redeemer_contact')
            //         }))
            //     ]
            // }
        },
        methods: {
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            getPaymentDetails (payment, type) {
                const me = this
                let result = 0

                switch (type) {
                    case 'price':
                        result = `Php ${me.totalCount(payment.total)}`
                        break
                    case 'employee':
                        if (payment.employee != null) {
                            result = `${payment.employee.first_name} ${payment.employee.last_name}`
                        } else {
                            result = 'Customer'
                        }
                        break
                }

                return result
            },
            getPaymentCode (payment) {
                const me = this
                let result = ''

                switch (payment.payment_method.method) {
                    case 'paypal':
                        result = payment.payment_method.paypal_transaction_id
                        break
                    case 'paymaya':
                        result = payment.payment_method.paymaya_transaction_id
                        break
                    case 'paymongo':
                        result = payment.payment_method.paymongo_transaction_id
                        break
                    default:
                        result = payment.payment_code
                }

                return result
            },
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('export', 1)
                me.values = []

                me.loader(true)
                me.$axios.post('api/reporting/sales/store-credits-report', formData).then(res => {
                    if (res.data) {
                        res.data.results.forEach((item, key) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/store-credits-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                let token = me.$cookies.get('70hokcotc3hhhn5')

                formData.append('studio_id', me.form.studio_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)

                me.$axios.post('api/reporting/sales/store-credits-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data

                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
                                }
                            })

                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                let studio_id = me.$cookies.get('CSID')
                me.form.studio_id = studio_id
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
