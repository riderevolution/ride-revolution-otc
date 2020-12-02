<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Class Package Expiration</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Expiration details of each class package</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class-package/class-package-expiration?type=${type}&q=${form.q}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getPackages()" v-if="res.packages.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.packages.data.length > 0"
                                class="hidden me"
                                :data="classPackageExpirationAttributes"
                                :name="`class-package-expiration-${$moment(form.state_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group alternate">
                                <label for="q">Find a Customer</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate" v-model="form.q">
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
                            <input type="hidden" name="type" :value="type">
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(type == 'expiring') ? 'active' : ''}`" @click="toggleStatus('expiring')">Expiring</div>
                        <div :class="`status ${(type == 'expired') ? 'active' : ''}`" @click="toggleStatus('expired')">Expired</div>
                        <div :class="`status ${(type == 'classes-remaining') ? 'active' : ''}`" @click="toggleStatus('classes-remaining')">Classes Remaining</div>
                    </div>
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Class Package</th>
                                <th class="stick">Purchase Date</th>
                                <th class="stick">Activation Date</th>
                                <th class="stick">Expiration Date</th>
                                <th class="stick">Total Class Count</th>
                                <th class="stick">Remaining Class Count</th>
                                <th class="stick">Class Package Value</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.packages.data.length > 0">
                            <tr v-for="(data, key) in res.packages.data" :key="key">
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
                                <td>{{ data.class_package.name }}</td>
                                <td>{{ (data.payment_item) ? $moment(data.payment_item.payment.updated_at, 'YYYY-MM-DD').format('MMMM DD, YYYY') : '-' }}</td>
                                <td>{{ (data.activation_date != 'NA') ? $moment(data.activation_date).format('MMMM DD, YYYY') : 'N/A' }}</td>
                                <td>{{ $moment((data.expiryDate != null) ? data.expiryDate : data.expiry_date_if_not_activated).format('MMMM DD, YYYY') }}</td>
                                <td>{{ data.original_package_count }}</td>
                                <td>{{ data.count }}</td>
                                <td>Php {{ totalCount(data.class_package.package_price) }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="8">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.packages.path" :current="res.packages.current_page" :last="res.packages.last_page" />
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                form: {
                    start_date: this.$moment().subtract(1, 'months').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    q: ''
                },
                name: 'Class Package Expiration',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                type: 'expiring',
                res: [],
                values: []
            }
        },
        computed: {
            classPackageExpirationAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Full Name': value.user.fullname,
                        'Class Package': value.class_package.name,
                        'Purchase Date': (value.payment_item) ? me.$moment(value.payment_item.payment.updated_at, 'YYYY-MM-DD').format('MMMM DD, YYYY') : '-',
                        'Activation Date': me.$moment(value.activation_date).format('MMMM DD, YYYY'),
                        'Expiration Date': me.$moment(value.expiryDate).format('MMMM DD, YYYY'),
                        'Total Class Count': value.original_package_count,
                        'Remaining Class Count': value.count,
                        'Class Package Value': `Php ${me.totalCount(value.class_package.package_price)}`
                    }))
                ]
            }
        },
        methods: {
            getPackages () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []
                me.loader(true)
                me.$axios.post(`api/reporting/packages/class-package-expiration?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.packages.forEach((item, index) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            submissionSuccess () {
                const me = this
                me.fetchData(me.type)
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            toggleStatus (value) {
                const me = this
                me.type = value
                me.fetchData(value)
            },
            fetchData (value) {
                const me = this
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', value)
                formData.append('q', me.form.q)

                me.loader(true)
                me.$axios.post(`api/reporting/packages/class-package-expiration`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData('expiring')
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
