<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance Summary</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of rider count and revenue per class schedule</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class/attendance-summary?studio_id=${form.studio_id}&class_package_id=${form.class_package_id}&customer_type_id=${form.customer_type_id}&instructor_id=${form.instructor_id}&class_type_id=${form.class_type_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getClasses()" v-if="res.schedules.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.schedules.data.length > 0"
                                class="hidden me"
                                :data="attendanceSummaryAttributes"
                                :name="`attendance-summary-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id" v-model="form.class_type_id">
                                    <option value="" selected>All Class Types</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_package_id">Class Package</label>
                                <select class="default_select alternate" name="class_package_id" v-model="form.class_package_id">
                                    <option value="" selected>All Class Packages</option>
                                    <option :value="classPackage.id" v-for="(classPackage, key) in classPackages" :key="key">{{ classPackage.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="instructor_id">Instructor</label>
                                <select class="default_select alternate" name="instructor_id" v-model="form.instructor_id">
                                    <option value="" selected>All Instructors</option>
                                    <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="customer_type_id">Customer Type</label>
                                <select class="default_select alternate" name="customer_type_id" v-model="form.customer_type_id">
                                    <option value="" selected>All Customer Type</option>
                                    <option :value="type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :max-date="$moment().subtract(1, 'days').format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
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
                                <th class="stick">Date</th>
                                <th class="stick">Total Rides</th>
                                <th class="stick">Paying Riders</th>
                                <th class="stick">Comped Riders</th>
                                <th class="stick">First Timers</th>
                                <th class="stick">No Shows</th>
                                <th class="stick">Cancel</th>
                                <th class="stick">Waitlist</th>
                                <th class="stick">Repeat</th>
                                <th class="stick">Avg Riders</th>
                                <th class="stick">Number Classes</th>
                                <th class="stick">Avg Spots</th>
                                <th class="stick">Capacity</th>
                                <th class="stick">Paying</th>
                                <th class="stick">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.schedules.data.length > 0">
                            <tr v-for="(data, key) in res.schedules.data" :key="key">
                                <td>{{ $moment(data.date, 'YYYY-MM-DD').format('MMM DD, YYYY') }}</td>
                                <td>{{ countValues(data, 'total_riders') }}</td>
                                <td>{{ countValues(data, 'paying_riders') }}</td>
                                <td>{{ countValues(data, 'comped_riders') }}</td>
                                <td>{{ countValues(data, 'first_timers') }}</td>
                                <td>{{ countValues(data, 'no_shows') }}</td>
                                <td>{{ countValues(data, 'cancel') }}</td>
                                <td>{{ countValues(data, 'waitlist') }}</td>
                                <td>{{ countValues(data, 'repeats') }}</td>
                                <td>{{ totalPercentage('average', data) }}</td>
                                <td>{{ totalItems(data.number_of_classes) }}</td>
                                <td>{{ (studio.online_class) ? 'Unlimited' : studio.capacity }}</td>
                                <td>{{ totalPercentage('capacity', data) }}</td>
                                <td>{{ totalPercentage('paying', data) }}</td>
                                <td>Php {{ totalCount(countValues(data, 'revenue')) }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.schedules.path" :current="res.schedules.current_page" :last="res.schedules.last_page" />
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
                    studio_id: '',
                    instructor_id: '',
                    class_type_id: '',
                    class_package_id: '',
                    customer_type_id: '',
                    start_date: this.$moment().subtract(1, 'days').format('YYYY-MM-DD'),
                    end_date: this.$moment().subtract(1, 'days').format('YYYY-MM-DD')
                },
                name: 'Attendance Summary',
                access: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                studios: [],
                studio: [],
                types: [],
                classTypes: [],
                classPackages: [],
                instructors: [],
            }
        },
        computed: {
            attendanceSummaryAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Date': me.$moment(value.date, 'YYYY-MM-DD').format('MMM DD, YYYY'),
                        'Total Rides': me.countValues(value, 'total_riders'),
                        'Paying Riders': me.countValues(value, 'paying_riders'),
                        'Comped Riders': me.countValues(value, 'comped_riders'),
                        'First Timers': me.countValues(value, 'first_timers'),
                        'No Shows': me.countValues(value, 'no_shows'),
                        'Cancel': me.countValues(value, 'cancel'),
                        'Waitlist': me.countValues(value, 'waitlist'),
                        'Repeat': me.countValues(value, 'repeats'),
                        'Avg Riders': me.totalPercentage('average', value),
                        'Number Classes': me.totalItems(value.values.length),
                        'Classes to Charge': me.totalItems(value.values.length),
                        'Avg Spots': (me.studio.online_class) ? 'Unlimited' : me.studio.capacity,
                        'Capacity': me.totalPercentage('capacity', value),
                        'Paying': me.totalPercentage('paying', value),
                        'Total Revenue': me.countValues(value, 'revenue')
                    }))
                ]
            }
        },
        methods: {
            countValues (data, type) {
                const me = this
                let result = 0

                switch (type) {
                    case 'total_riders':
                        result += data.total_riders
                        break
                    case 'paying_riders':
                        result += data.paying_riders
                        break
                    case 'comped_riders':
                        result += data.comped_riders
                        break
                    case 'first_timers':
                        result += data.first_timers
                        break
                    case 'no_shows':
                        result += data.no_shows
                        break
                    case 'cancel':
                        result += data.cancel
                        break
                    case 'waitlist':
                        result += data.waitlist
                        break
                    case 'repeats':
                        result += data.repeats
                        break
                    case 'revenue':
                        result += data.revenue
                        break
                }

                return result
            },
            getClasses () {
                const me = this
                me.values = []
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.$axios.post(`api/reporting/classes/attendance-summary?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.schedules.forEach((item, index) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            totalPercentage (type, data) {
                const me = this
                let percent = 0
                let total_riders = 0
                let avg_riders = 0
                let paying_riders = 0
                let comped_riders = 0
                let no_shows = 0
                let to_less = 0

                switch (type) {
                    case 'capacity':
                        if (data.temp_avg_riders != 0) {
                            if (me.studio.online_class) {
                                total_riders += data.total_riders
                                avg_riders += data.temp_avg_riders
                            } else {
                                avg_riders += data.temp_avg_riders
                            }
                        }
                        break
                    case 'paying':
                        if (data.paying_riders != 0) {
                            paying_riders += data.paying_riders
                            comped_riders += data.comped_riders
                        }
                        break
                    case 'average':
                        if (data.temp_avg_riders != 0) {
                            avg_riders += data.temp_avg_riders
                            no_shows += data.no_shows
                            comped_riders += data.comped_riders
                        }
                        break
                }
                switch (type) {
                    case 'capacity':
                        if (avg_riders != 0) {
                            if (me.studio.online_class) {
                                percent = me.totalItems(`${(avg_riders / total_riders) * 100}`)
                            } else {
                                percent = me.totalItems(`${(avg_riders / me.studio.capacity) * 100}`)
                            }
                        }
                        break
                    case 'paying':
                        percent = me.totalItems(`${(paying_riders / (paying_riders - comped_riders)) * 100}`)
                        break
                    case 'average':
                        to_less = no_shows + comped_riders
                        percent = me.totalItems(avg_riders / data.number_of_classes)
                        break
                }

                return (type == 'average') ? percent : `${percent}%`
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.filter = true

                me.$axios.post(`api/reporting/classes/attendance-summary`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
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
            },
            fetchData () {
                const me = this
                let formData = new FormData()
                let studio_id = me.$cookies.get('CSID')

                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', studio_id)

                me.$axios.post(`api/reporting/classes/attendance-summary`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
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
            },
            fetchExtraAPI () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let studio_id = me.$cookies.get('CSID')
                me.$axios.get('api/studios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                        me.form.studio_id = studio_id
                        me.$axios.get(`api/studios/${studio_id}`).then(res => {
                            me.studio = res.data.studio
                        })
                    }
                })
                me.$axios.get(`api/instructors?enabled=1&all=1`).then(res => {
                    me.instructors = res.data.instructors
                })
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.types = res.data.customerTypes
                })
                me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
                    me.classTypes = res.data.classTypes
                })
                me.$axios.get(`api/packages/class-packages?enabled=1&get=1`).then(res => {
                    me.classPackages = res.data.classPackages
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData()
                me.fetchExtraAPI()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        },
        beforeMount () {
            const me = this
            me.loader(true)
        }
    }
</script>
