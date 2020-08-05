<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/earned-package-revenue" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Earned Class Package Revenue</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ res.name }}</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total: Php {{ computeTotal() }}</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Activation Date</th>
                                <th class="sticky">Expiration Date</th>
                                <th class="sticky">Count</th>
                                <th class="sticky">Remaining</th>
                                <th class="sticky">Revenue</th>
                                <th class="sticky">Price</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.user_package_counts.length > 0">
                            <tr v-for="(data, key) in res.user_package_counts" :key="key">
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.user.id}/packages`" v-if="data.user != null">{{ `${data.user.first_name} ${data.user.last_name}` }}</nuxt-link>
                                    <div v-else>N/A</div>
                                </td>
                                <td>{{ $moment((data.activation_date != 'NA') ? data.activation_date : data.created_at).format('MMM DD, YYYY') }}</td>
                                <td>{{ $moment((data.computed_expiration_date != null) ? data.computed_expiration_date : data.updated_at).format('MMM DD, YYYY') }}</td>
                                <td>{{ data.original_package_count }}</td>
                                <td>{{ data.count }}</td>
                                <td>Php {{ totalCount(data.revenue) }}</td>
                                <td>Php {{ totalCount(data.payment_item.price_per_item) }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="7">No Result(s) Found.</td>
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
    import Foot from '../../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Earned Package Revenue',
                access: true,
                loaded: false,
                res: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    id: 0
                }
            }
        },
        methods: {
            computeTotal () {
                const me = this
                let total = 0
                me.res.user_package_counts.forEach((value, index) => {
                    total += parseFloat(value.revenue)
                })

                return me.totalCount(total)
            },
            fetchData () {
                const me = this
                me.loader(true)
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.id = me.$route.query.id
                let formData = new FormData()
                formData.append('id', me.form.id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post(`api/reporting/sales/earned-class-package-revenue/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.class_package
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
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
