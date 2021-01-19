<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Gift Cards Report</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of gift cards used by customers</h2>
                        </div>
                        <div class="actions">
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
                        </div>
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
                    <div class="cms_table_toggler">
                        <div class="total">Grand Total: Php {{ totalCount(total_count) }}</div>
                        <div :class="[ 'status', (tab_type == data.unique) ? 'active' : '' ]" v-for="(data, key) in tabs" :key="key" @click="toggleType(data)">
                            {{ data.name }}
                        </div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Card Code</th>
                                <th class="sticky">Class Package Value</th>
                                <th class="sticky">Studio</th>
                                <th class="sticky">Date Purchased</th>
                                <th class="sticky">Purchased By</th>
                                <th class="sticky">Redemption Date</th>
                                <th class="sticky">Redeemed By</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr v-for="(data, key) in res.result.data" :key="key">
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
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.result.path" :current="res.result.current_page" :last="res.result.last_page" />
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
                name: 'Gift Cards Report',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                studios: [],
                values: [],
                tab_type: 'all',
                tabs: [
                    {
                        name: 'All',
                        unique: 'all'
                    },
                    {
                        name: 'Redeemed',
                        unique: 'redeemed'
                    },
                    {
                        name: 'For Redemption',
                        unique: 'for-redemption'
                    }
                ],
                total_count: 0,
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: ''
                }
            }
        },
        computed: {
            giftCardsAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Card Code': value.card_code,
                        'Class Package': value.class_package.name,
                        'Price': `Php ${me.totalCount(value.price)}`,
                        'Studio': me.getDetails(value, 'studio'),
                        'Date Purchased': me.$moment(value.payment_item.payment.created_at).format('MMMM DD, YYYY'),
                        'Purchased By': me.getDetails(value, 'sender'),
                        'Purchaser Email': me.getDetails(value, 'sender_email'),
                        'Purchaser Contact Number': me.getDetails(value, 'sender_contact'),
                        'Redemption Date': me.getDetails(value, 'redemption_date'),
                        'Redeemed By': me.getDetails(value, 'redeemer'),
                        'Redeemer Email': me.getDetails(value, 'redeemer_email'),
                        'Redeemer Contact Number': me.getDetails(value, 'redeemer_contact')
                    }))
                ]
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
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('all', 1)
                me.values = []

                me.loader(true)
                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        res.data.result.forEach((item, key) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            toggleType (data) {
                const me = this
                me.tab_type = data.unique
                setTimeout( () => {
                    me.submitFilter()
                }, 10)
            },
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
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
                formData.append('type', me.tab_type)

                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
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
