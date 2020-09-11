<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Remaining Package Value</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">
                                Summary of rider count and revenue per class schedule
                                <ul>
                                    <li>Classes which are after the cutoff date are excluded</li>
                                    <li>Comps are excluded</li>
                                    <li>The value of unlimiteds is calculated as a ratio of days that the series has been active over the total days to expire of the series</li>
                                </ul>
                            </h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class-package/remaining-package-value?start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getPackages()" v-if="res.classPackages.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.classPackages.data.length > 0"
                                class="hidden me"
                                :data="remainingPackageValueAttributes"
                                :name="`remaining-package-value-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
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
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Package Type</th>
                                <th class="sticky">Class Package</th>
                                <th class="sticky">Starting Class Count</th>
                                <th class="sticky">Starting Value</th>
                                <th class="sticky">Remaining Class Count</th>
                                <th class="sticky">Remaining Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="2"><b>Summary</b></td>
                                <td><b>{{ totalItems(res.summary.starting_class_count) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.starting_value) }}</b></td>
                                <td><b>{{ totalItems(res.summary.remaining_class_count) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.remaining_value) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.classPackages.data" :key="key">
                                <td>{{ data.package_type.name }}</td>
                                <td>{{ data.name }}</td>
                                <td>{{ (data.starting_class_count == 'Unlimited') ? data.starting_class_count : totalItems(data.starting_class_count) }}</td>
                                <td>Php {{ totalCount(data.starting_value) }}</td>
                                <td>{{ (data.remaining_class_count == 'Unlimited') ? data.remaining_class_count : totalItems(data.remaining_class_count) }}</td>
                                <td>Php {{ totalCount(data.remaining_value) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.classPackages.path" :current="res.classPackages.current_page" :last="res.classPackages.last_page" />
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
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Remaining Class Package Value',
                access: true,
                filter: true,
                loaded: false,
                res: [],
                values: []
            }
        },
        computed: {
            remainingPackageValueAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Package Type': value.package_type.name,
                        'Class Package': value.name,
                        'Starting Class Count': (value.starting_class_count == 'Unlimited') ? value.starting_class_count : me.totalItems(value.starting_class_count),
                        'Starting Value': `Php ${me.totalCount(value.starting_value)}`,
                        'Remaining Class Count': (value.remaining_class_count == 'Unlimited') ? value.remaining_class_count : me.totalItems(value.remaining_class_count),
                        'Remaining Value': `Php ${me.totalCount(value.remaining_value)}`
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
                me.$axios.post(`api/reporting/packages/remaining-class-package-value?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.classPackages.forEach((item, index) => {
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
                me.fetchData()
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/packages/remaining-class-package-value', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
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
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data != 0) {
                        setTimeout( () => {
                            me.form.studio_id = res.data.user.current_studio_id
                            me.fetchData()
                        }, 500)
                    }
                }).catch(err => {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
