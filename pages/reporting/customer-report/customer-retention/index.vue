<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Customer Retention</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Returning Customers</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn">Print</a>
                            <a href="javascript:void(0)" class="action_btn margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
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
                        <div class="total">Total: {{ totalItems(res.total) }}</div>
                        <div class="total">Total Riders: {{ totalItems(totalRiders) }}</div>
                        <div class="total">Retained: {{ totalItems(totalRetained) }}</div>
                        <div :class="`status ${(status == 'first') ? 'active' : ''}`" @click="toggleStatus('first')">First time</div>
                        <div :class="`status ${(status == 'second') ? 'active' : ''}`" @click="toggleStatus('second')">Second Time</div>
                        <div :class="`status ${(status == 'third') ? 'active' : ''}`" @click="toggleStatus('third')">Third Time</div>
                        <div :class="`status ${(status == 'fourth') ? 'active' : ''}`" @click="toggleStatus('fourth')">Fourth Time &amp; Above</div>
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
                        <tbody v-if="res.data.length > 0">
                            <tr v-for="(data, key) in res.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <nuxt-link class="table_data_link" :to="`/customers/${data.id}/packages`">{{ data.last_name }} {{ data.last_name }}</nuxt-link>
                                    </div>
                                </td>
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : 'N/A' }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[data.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : 'N/A' }}</td>
                                <td>{{ data.customer_details.pa_city }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.path" :current="res.current_page" :last="res.last_page" />
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
            return {
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Customer Retention',
                access: true,
                filter: false,
                loaded: false,
                rowCount: 0,
                status: 'first',
                res: [],
                totalRiders: 0,
                totalRetained: 0
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('type', me.status)
                me.loader(true)
                me.filter = true
                me.$axios.post(`api/reporting/customers/customer-retention`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data.customers
                        me.totalRiders = res.data.totalRiders
                        me.totalRetained = res.data.totalRetained
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
                me.status = status
                me.fetchData(status)
            },
            fetchData (status) {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', me.status)
                me.$axios.post(`api/reporting/customers/customer-retention`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data.customers
                        me.totalRiders = res.data.totalRiders
                        me.totalRetained = res.data.totalRetained
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
                me.fetchData(me.status)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
