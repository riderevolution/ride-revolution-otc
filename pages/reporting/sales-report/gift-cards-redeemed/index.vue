<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
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
                                <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                                <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
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
                    <table class="cms_table">
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
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
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
                formData.append('studio_id', me.$store.state.user.current_studio_id)
                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
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
                formData.append('studio_id', me.$store.state.user.current_studio_id)
                me.$axios.post('api/reporting/sales/gift-cards-redeemed', formData).then(res => {
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
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 750)
        }
    }
</script>
