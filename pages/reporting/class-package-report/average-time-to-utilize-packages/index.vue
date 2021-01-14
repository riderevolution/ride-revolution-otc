<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Average Time to Utilize Packages</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <div class="actions">
                            <!-- <a href="/print/reporting/class-package/average-time-to-utilize-packages" target="_blank" class="action_btn alternate">Print</a> -->

                            <div class="action_btn alternate" @click="getPackages()" v-if="res.packages.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.packages.data.length > 0"
                                class="hidden me"
                                :data="averageTimeToUtilizePackagesAttributes"
                                :name="`average-time-to-utilize-packages-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Month <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'" :max-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Month <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :max-date="$moment().format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Class Package</th>
                                <th class="sticky">Validity Period</th>
                                <th class="sticky">Avg Booking Per Week</th>
                                <th class="sticky">Avg Booking Per Month</th>
                                <th class="sticky">Avg Revenue Per Week</th>
                                <th class="sticky">Avg Revenue Per Month</th>
                                <th class="sticky">Total Package Count</th>
                                <th class="sticky">Utilization Rate</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.packages.data.length > 0">
                            <tr v-for="(data, key) in res.packages.data" :key="key">
                                <td>{{ data.name }}</td>
                                <td>{{ data.expires_in }}</td>
                                <td>{{ totalItems(data.averageBookings.weeklyAverageBookings) }}</td>
                                <td>{{ totalItems(data.averageBookings.monthlyAverageBookings) }}</td>
                                <td>Php {{ totalCount(data.averageRevenue.weeklyAverageRevenue) }}</td>
                                <td>Php {{ totalCount(data.averageRevenue.monthlyAverageRevenue) }}</td>
                                <td>{{ (data.class_count_unlimited == 1) ? 'Unlimited' : data.class_count }}</td>
                                <td>{{ data.utilizationRate }} Days</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
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
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Average Time to Utilize Packages',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: []
            }
        },
        computed: {
            averageTimeToUtilizePackagesAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Class Package': value.name,
                        'Validity Period': value.name,
                        'Avg Booking Per Week': me.totalItems(value.weeklyAverageBookings),
                        'Avg Booking Per Month': me.totalItems(value.monthlyAverageBookings),
                        'Avg Revenue Per Week': `Php ${me.totalCount(value.weeklyAverageRevenue)}`,
                        'Avg Revenue Per Month': `Php ${me.totalCount(value.monthlyAverageRevenue)}`,
                        'Total Package Count': (value.class_count_unlimited == 1) ? 'Unlimited' : value.class_count,
                        'Utilization Rate': value.utilizationRate
                    }))
                ]
            }
        },
        methods: {
            getPackages () {
                const me = this
                let formData = new FormData()
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/packages/average-time-to-utilize-packages?all=1`, formData).then(res => {
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
                let formData = new FormData(document.getElementById('filter'))

                me.loader(true)
                me.$axios.post('api/reporting/packages/average-time-to-utilize-packages', formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)

                me.loader(true)
                me.$axios.post('api/reporting/packages/average-time-to-utilize-packages', formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
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
            }, 300)
        }
    }
</script>
