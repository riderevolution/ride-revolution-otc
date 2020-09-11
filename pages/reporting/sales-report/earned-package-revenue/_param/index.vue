<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/reporting/sales-report/earned-package-revenue" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Earned Class Package Revenue</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ class_package.name }}</h1>
                            </div>
                            <h2 class="header_subtitle">{{ $moment(form.start_date).format('MMM DD, YYYY') }} - {{ $moment(form.end_date).format('MMM DD, YYYY') }}</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/earned-package-revenue/${class_package.slug}?id=${form.id}&type=${form.type}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                                <div class="action_btn alternate" @click="getSales()" v-if="res.user_packages.data.length > 0">
                                    Export
                                </div>
                                <download-csv
                                    v-if="res.user_packages.data.length > 0"
                                    class="hidden me"
                                    :data="earnedPackageRevenueSlugAttributes"
                                    :name="`earned-package-revenue-${class_package.name}-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                    Export
                                </download-csv>

                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <input type="hidden" name="id" :value="form.id">
                            <input type="hidden" name="type" :value="form.type">
                            <input type="hidden" name="start_date" :value="form.start_date">
                            <input type="hidden" name="end_date" :value="form.end_date">
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total: Php {{ totalCount(res.total) }}</div>
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
                        <tbody v-if="res.user_packages.data.length > 0">
                            <tr v-for="(data, key) in res.user_packages.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.user.customer_details.images[0].path_resized" v-if="data.user.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.user.first_name.charAt(0) }}{{ data.user.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.user.id}/packages`)">{{ data.user.fullname }}</div>
                                    </div>
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
                    <pagination :apiRoute="res.user_packages.path" :current="res.user_packages.current_page" :last="res.user_packages.last_page" />
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
                name: 'Earned Package Revenue',
                access: true,
                filter: true,
                loaded: false,
                res: [],
                values: [],
                class_package: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    id: 0,
                    type: ''
                }
            }
        },
        computed: {
            earnedPackageRevenueSlugAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Class Package': me.class_package.name,
                        'Full Name': value.user.fullname,
                        'Activation Date': me.$moment((value.activation_date != 'NA') ? value.activation_date : value.created_at).format('MMM DD, YYYY'),
                        'Expiration Date': me.$moment((value.computed_expiration_date != null) ? value.computed_expiration_date : value.updated_at).format('MMM DD, YYYY'),
                        'Count': value.original_package_count,
                        'Remaining': value.count,
                        'Revenue': `Php ${me.totalCount(value.revenue)}`,
                        'Price': `Php ${me.totalCount(value.payment_item.price_per_item)}`
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
                me.$axios.post(`api/reporting/sales/earned-class-package-revenue/${me.$route.params.param}?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.user_packages.forEach((item, key) => {
                            me.values.push(item)
                        })
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
            fetchData () {
                const me = this
                me.loader(true)
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.type = me.$route.query.type
                me.form.id = me.$route.query.id

                let formData = new FormData()
                formData.append('id', me.form.id)
                formData.append('type', me.form.type)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post(`api/reporting/sales/earned-class-package-revenue/${me.$route.params.param}`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data

                            me.class_package = res.data.class_package
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
