<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Instructor Attendance Summary</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of instructor attendance and revenue per class schedule</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class/instructor-attendance-summary?studio_id=${form.studio_id}&class_type_id=${form.class_type_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getClasses()" v-if="res.instructors.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.instructors.data.length > 0"
                                class="hidden me"
                                :data="instructorAttendanceSummaryAttributes"
                                :name="`instructor-attendance-summary-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
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
                                <select class="default_select alternate" name="class_type_id">
                                    <option value="" selected>All Class Types</option>
                                    <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                </select>
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
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Instructor</th>
                                <th class="stick">Total Rides</th>
                                <th class="stick">Paying Riders</th>
                                <th class="stick">Comped Riders</th>
                                <th class="stick">First Timers</th>
                                <th class="stick">No Shows</th>
                                <th class="stick">Repeat</th>
                                <th class="stick">Avg Riders</th>
                                <th class="stick">Number Classes</th>
                                <th class="stick">Avg Spots</th>
                                <th class="stick">Capacity</th>
                                <th class="stick">Paying</th>
                                <th class="stick">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.instructors.data.length > 0">
                            <tr v-for="(data, key) in res.instructors.data" :key="key">
                                <td>{{ data.first_name }} {{ data.last_name }}</td>
                                <td>{{ data.total_riders }}</td>
                                <td>{{ data.paying_riders }}</td>
                                <td>{{ data.comped_riders }}</td>
                                <td>{{ data.first_timers }}</td>
                                <td>{{ data.no_shows }}</td>
                                <td>{{ data.repeats }}</td>
                                <td>{{ totalPercentage('average', data) }}</td>
                                <td>{{ data.number_of_classes }}</td>
                                <td>{{ (studio.online_class) ? 'Unlimited' : studio.capacity }}</td>
                                <td>{{ totalPercentage('capacity', data) }}</td>
                                <td>{{ totalPercentage('paying', data) }}</td>
                                <td>Php {{ totalCount(data.revenue) }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.instructors.path" :current="res.instructors.current_page" :last="res.instructors.last_page" />
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
                    class_type_id: '',
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Instructor Attendance Summary',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                studio: [],
                studios: [],
                classTypes: []
            }
        },
        computed: {
            instructorAttendanceSummaryAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Instructor': `${ value.first_name } ${ value.last_name }`,
                        'Total Rides': value.total_riders,
                        'Paying Riders': value.paying_riders,
                        'Comped Riders': value.comped_riders,
                        'First Timers': value.first_timers,
                        'No Shows': value.no_shows,
                        'Repeat': value.repeats,
                        'Avg Riders': me.totalPercentage('average', value),
                        'Number Classes': value.number_of_classes,
                        'Avg Spots': (me.studio.online_class) ? 'Unlimited' : me.studio.capacity,
                        'Capacity': me.totalPercentage('capacity', value),
                        'Paying': me.totalPercentage('paying', value),
                        'Total Revenue': `Php ${me.totalCount(value.revenue)}`
                    }))
                ]
            }
        },
        methods: {
            getClasses () {
                const me = this
                me.values = []
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.$axios.post(`api/reporting/classes/instructor-attendance-summary?all=1`, formData).then(res => {
                    if (res.data) {

                        res.data.instructors.forEach((item, index) => {
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

                switch (type) {
                    case 'capacity':
                        if (data.avg_riders != 0) {
                            if (me.studio.online_class) {
                                percent = me.totalItems(`${(data.avg_riders / data.total_riders) * 100}`)
                            } else {
                                percent = me.totalItems(`${(data.avg_riders / me.studio.capacity) * 100}`)
                            }
                        }
                        break
                    case 'paying':
                        if (data.paying_riders != 0) {
                            percent = me.totalItems(`${(data.paying_riders / (data.paying_riders - data.comped_riders)) * 100}`)
                        }
                        break
                    case 'average':
                        if (data.avg_riders != 0) {
                            percent = me.totalItems(data.avg_riders / data.number_of_classes)
                        }
                        break
                }

                return (type == 'average') ? percent : `${percent}%`
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.filter = true

                me.$axios.post(`api/reporting/classes/instructor-attendance-summary`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data
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
            },
            fetchData () {
                const me = this
                me.loader(true)

                let formData = new FormData()
                let studio_id = me.$cookies.get('CSID')

                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', studio_id)

                me.$axios.post(`api/reporting/classes/instructor-attendance-summary`, formData).then(res => {
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
                me.$axios.get(`api/packages/class-types?enabled=1&get=1`).then(res => {
                    me.classTypes = res.data.classTypes
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
        }
    }
</script>
