<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/reporting/sales-report/sales-by-class-package?payment_status=${payment_status}&start_date=${form.start_date}&end_date=${form.end_date}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Sales by Class Package</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ package.name }} - ({{ payment_status }})</h1>
                                <span>{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from {{ package.name }}.</h2>
                        </div>
                        <div class="actions">
                            <!-- <a :href="`/print/reporting/sales/class-package/${$route.params.param}?payment_status=${payment_status}&slug=class-package&id=${$route.query.id}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a> -->
                            <a :href="`/print/reporting/sales/class-package/${$route.params.param}?payment_status=${payment_status}&slug=class-package&id=${$route.query.id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="classPackageParamAttributes"
                                :name="`sales-by-class-package-${$route.params.param}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>

                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="slug" :value="form.slug">
                            <input type="hidden" name="id" :value="form.id">
                            <input type="hidden" name="payment_status" :value="payment_status">
                            <input type="hidden" name="start_date" :value="form.start_date">
                            <input type="hidden" name="end_date" :value="form.end_date">
                            <!-- <input type="hidden" name="studio_id" :value="form.studio_id"> -->
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Date of Purchase</th>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Qty.</th>
                                <th class="sticky">Payment</th>
                                <th class="sticky">Comp Reason</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.result.data.length > 0">
                            <tr>
                                <td colspan="2"><b>{{ total.name }}</b></td>
                                <td colspan="3"><b>{{ total.qty }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.result.data" :key="key" v-if="res.result.data.length > 0">
                                <td>{{ $moment(data.updated_at).format('MMMM DD, YYYY hh:mm A') }}</td>
                                <td>
                                    <div class="thumb">
                                        <img :src="data.payment.user.customer_details.images[0].path_resized" v-if="data.payment.user.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.payment.user.first_name.charAt(0) }}{{ data.payment.user.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.payment.user.id}/packages`)" v-if="data.payment.user != null">{{ data.payment.user.fullname }}</div>
                                        <div v-else>N/A</div>
                                    </div>
                                </td>
                                <td>{{ data.quantity }}</td>
                                <td class="alt_2">{{ replacer(data.payment.payment_method.method) }}</td>
                                <td>{{ (data.payment.payment_method.method == 'comp') ? data.payment.payment_method.comp_reason : 'N/A' }}</td>
                                <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
    import Foot from '../../../../../components/Foot'
    import Pagination from '../../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Sales by Class Package',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                payment_status: 'all',
                studio: [],
                res: [],
                values: [],
                package: [],
                total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    slug: '',
                    studio_id: '',
                    id: 0
                }
            }
        },
        computed: {
            classPackageParamAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Class Package': me.package.name,
                        'Date of Purchase': me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'Full Name': (value.payment != null) ? `${value.payment.user.fullname}` : '-',
                        'Qty': value.quantity,
                        'Payment': (value.payment) ? value.payment.payment_method.method : '-',
                        'Comp Reason': (value.payment) ? (value.payment.payment_method.method == 'comp' ? value.payment.payment_method.comp_reason : 'N/A') : '-',
                        'Comp Value': `Php ${(value.total_comp) ? value.total_comp : 0}`,
                        'Discount': `Php ${(value.total_discount) ? value.total_discount : 0}`,
                        'Total Income': `Php ${(value.total_income) ? value.total_income : 0}`
                    }))
                ]
            }
        },
        methods: {
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-class-package/${me.$route.params.param}?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.result.forEach((item, key) => {
                            me.values.push(item)
                        })
                        me.values.push(res.data.total)
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let formData = new FormData()

                if (me.$route.query.start_date) {
                    me.form.start_date = me.$route.query.start_date
                }
                if (me.$route.query.end_date) {
                    me.form.end_date = me.$route.query.end_date
                }
                if (me.$route.query.slug) {
                    me.form.slug = me.$route.query.slug
                }
                if (me.$route.query.id) {
                    me.form.id = me.$route.query.id
                }
                // if (me.$route.query.studio_id) {
                //     me.form.studio_id = me.$route.query.studio_id
                // }

                formData.append('slug', me.form.slug)
                formData.append('id', me.form.id)
                formData.append('payment_status', value)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                // formData.append('studio_id', me.form.studio_id)

                me.$axios.post(`api/reporting/sales/sales-by-class-package/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total
                            me.package = res.data.package

                            // if (me.form.studio_id != '') {
                            //     me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
                            //         me.studio = res.data.studio
                            //     })
                            // }

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

                if (me.$route.query.payment_status) {
                    me.payment_status = me.$route.query.payment_status
                }

                me.fetchData(me.payment_status)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
