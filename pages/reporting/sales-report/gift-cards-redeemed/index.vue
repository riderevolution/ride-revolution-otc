<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Gift Cards Redeemed</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of gift cards used by customers</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/gift-card?studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                                <download-csv
                                    v-if="res.length > 0"
                                    class="action_btn alternate margin"
                                    :data="giftCardsAttributes"
                                    :name="`gift-cards-redeemed-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
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
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Grand Total: Php {{ totalCount(total_count) }}</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Card Code</th>
                                <th class="sticky">Class Package Value</th>
                                <th class="sticky">Date Purchased</th>
                                <th class="sticky">Purchased By</th>
                                <th class="sticky">Redemption Date</th>
                                <th class="sticky">Redeemed By</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>{{ data.card_code }}</td>
                                <td>
                                    <p>{{ data.class_package.name }}</p>
                                    <p>Php {{ totalCount(data.class_package.package_price) }}</p>
                                </td>
                                <td>{{ $moment(data.payment_item.payment.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ `${data.user.first_name} ${data.user.last_name}` }}</td>
                                <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ `${data.redeemer.first_name} ${data.redeemer.last_name}` }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../.././../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Gift Cards Redeemed',
                access: true,
                loaded: false,
                rowCount: 0,
                res: [],
                studios: [],
                values: [],
                total_count: 0,
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: ''
                }
            }
        },
        computed: {
            giftCardsAttributess () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': me.getStudio(),
                        'Card Code': value.card_code,
                        'Class Package': value.class_package.name,
                        'Price': `Php ${me.totalCount(value.class_package.package_price)}`,
                        'Date Purchased': me.$moment(value.payment_item.payment.created_at).format('MMMM DD, YYYY'),
                        'Purchased By': `${value.user.first_name} ${value.user.last_name}`,
                        'Redemption Date': me.$moment(value.updated_at).format('MMMM DD, YYYY'),
                        'Redeemed By': `${value.redeemer.first_name} ${value.redeemer.last_name}`
                    }))
                ]
            }
        },
        methods: {
            submitFilter () {
                const me = this
                me.values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
                            me.res = res.data.result

                            res.data.result.forEach((item, i) => {
                                me.values.push(item)
                            })

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
                formData.append('start_date', me.$moment().format('YYYY-MM-DD'))
                formData.append('end_date', me.$moment().format('YYYY-MM-DD'))
                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.grand_total
                            me.res = res.data.result

                            res.data.result.forEach((item, i) => {
                                me.values.push(item)
                            })

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
