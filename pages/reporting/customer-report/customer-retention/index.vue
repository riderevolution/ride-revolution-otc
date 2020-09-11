<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Customer Retention</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Returning Customers</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/customer/customer-retention?start_date=${form.start_date}&end_date=${form.end_date}&status=${type}`" target="_blank" class="action_btn alternate">Print</a>
                            <div class="action_btn alternate" @click="getCustomers()" v-if="res.customers.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.customers.data.length > 0"
                                class="hidden me"
                                :data="customerRetentionAttributes"
                                :name="`customer-retention-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
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
                        <div class="total">Total: {{ totalItems(total) }}</div>
                        <div :class="`status ${(type == 'first') ? 'active' : ''}`" @click="toggleStatus('first')">First time</div>
                        <div :class="`status ${(type == 'second') ? 'active' : ''}`" @click="toggleStatus('second')">Second Time</div>
                        <div :class="`status ${(type == 'third') ? 'active' : ''}`" @click="toggleStatus('third')">Third Time</div>
                        <div :class="`status ${(type == 'fourth') ? 'active' : ''}`" @click="toggleStatus('fourth')">Fourth Time &amp; Above</div>
                    </div>
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Sign Up</th>
                                <th class="stick">First Class</th>
                                <th class="stick">Last Class</th>
                                <th class="stick">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.customers.data.length > 0">
                            <tr v-for="(data, key) in res.customers.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                                    </div>
                                </td>
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : '-' }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[data.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : '-' }}</td>
                                <td>{{ data.customer_details.pa_city }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" />
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
                name: 'Customer Retention',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                total: 0,
                type: 'first',
                res: [],
                values: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                totalRiders: 0,
                totalRetained: 0
            }
        },
        computed: {
            customerRetentionAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Customer': value.fullname,
                        'Sign Up': me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'First Class': (value.bookings.length > 0) ? me.$moment(value.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : '-',
                        'Last Class': (value.bookings.length > 0) ? me.$moment(value.bookings[value.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : '-',
                        'City': value.customer_details.pa_city
                    }))
                ]
            }
        },
        methods: {
            getCustomers () {
                const me = this
                me.values = []
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.$axios.post(`api/reporting/customers/customer-retention?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.customers.forEach((item, key) => {
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
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.filter = true
                me.$axios.post(`api/reporting/customers/customer-retention`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.total = res.data.total_count
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleStatus (status) {
                const me = this
                me.type = status
                me.fetchData(status)
            },
            fetchData (status) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', me.type)
                me.$axios.post(`api/reporting/customers/customer-retention`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.total = res.data.total_count
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(me.type)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
