<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Promotions Redeemed</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of promos used by customers</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                                <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="promo_id">Promo</label>
                                <select class="default_select alternate" name="promo_id">
                                    <option value="0" selected>All Promos</option>
                                    <option :value="promo.id" v-for="(promo, key) in promos" :key="key">{{ promo.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date</label>
                                <input type="date" name="start_date" v-model="form.start_date" class="default_text date" />
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date</label>
                                <input type="date" name="end_date" v-model="form.end_date"  class="default_text date" />
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
                                <th class="sticky">Date Redeemed</th>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Promo</th>
                                <th class="sticky">Promo Code</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Total Discount</th>
                                <th class="sticky">Remaining</th>
                                <th class="sticky">Status</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.user.id}/packages`" v-if="data.user != null">{{ `${data.user.first_name} ${data.user.last_name}` }}</nuxt-link>
                                    <div v-else>N/A</div>
                                </td>
                                <td>{{ data.promo.name }}</td>
                                <td>{{ data.promo.promo_code }}</td>
                                <td>{{ (data.promo.discount_type == 'percent') ? `${data.promo.discount_percent}%` : `Php ${data.promo.discount_flat_rate} off` }}</td>
                                <td>Php {{ totalCount(data.total_discount) }}</td>
                                <td>{{ data.remaining }}</td>
                                <td>{{ (parseInt($moment(data.promo.end_Date).diff($moment(), 'days')) < 0) ? 'Inactive' : 'Active' }}</td>
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
            return {
                loaded: false,
                rowCount: 0,
                res: [],
                total_count: 0,
                promos: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                formData.append('studio_id', me.$cookies.get('CSID'))
                me.$axios.post('api/reporting/sales/promotions-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.loaded = true
                            me.total_count = res.data.grand_total
                            me.res = res.data.result
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
                formData.append('start_date', me.$moment().format('YYYY-MM-DD'))
                formData.append('end_date', me.$moment().format('YYYY-MM-DD'))
                formData.append('studio_id', me.$cookies.get('CSID'))
                me.$axios.post('api/reporting/sales/promotions-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.loaded = true
                            me.total_count = res.data.grand_total
                            me.res = res.data.result
                            me.$axios.get('api/inventory/promos?enabled=1').then(res => {
                                if (res.data) {
                                    me.promos = res.data.promos.data
                                }
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
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
