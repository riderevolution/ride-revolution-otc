<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Summary of Instructor Subbing per Period</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Instructor Subbing per class schedule.</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/class/summary-of-instructor-subbing-per-period?studio_id=${form.studio_id}&instructor_id=${form.instructor_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getClasses()" v-if="res.scheduledDates.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.scheduledDates.data.length > 0"
                                class="hidden me"
                                :data="summaryInstructorSubbingPerPeriodAttributes"
                                :name="`summary-instructor-subbing-per-period-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="0" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
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
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total Subbed Classes: {{ totalItems(res.scheduledDates.data.length) }}</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Date</th>
                                <th class="stick">Time</th>
                                <th class="stick">Class Type</th>
                                <th class="stick">Schedule Released</th>
                                <th class="stick">Studio</th>
                                <th class="stick">Primary Instructor</th>
                                <th class="stick">Substitute Instructor</th>
                                <th class="stick">Remarks</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.scheduledDates.data.length > 0">
                            <tr v-for="(data, key) in res.scheduledDates.data" :key="key">
                                <td>{{ $moment(data.date, 'YYYY-MM-DD').format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment(data.schedule.start_time, 'HH:mm A').format('h:mm A') }}</td>
                                <td>{{ data.schedule.class_type.name }}</td>
                                <td>{{ (data.schedule.enabled) ? 'Yes' : 'No' }}</td>
                                <td>{{ data.schedule.studio.name }}</td>
                                <td>{{ data.primary.user.first_name }} {{ data.primary.user.last_name }}</td>
                                <td>{{ data.substitute.user.first_name }} {{ data.substitute.user.last_name }}</td>
                                <td>{{ data.substitute.remarks }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="8">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.scheduledDates.path" :current="res.scheduledDates.current_page" :last="res.scheduledDates.last_page" />
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
                name: 'Summary of Instructor Subbing per Period',
                access: true,
                loaded: false,
                filter: true,
                rowCount: 0,
                values: [],
                res: [],
                studios: [],
                studio: [],
                instructors: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: '',
                    instructor_id: ''
                }
            }
        },
        computed: {
            summaryInstructorSubbingPerPeriodAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Studio': value.schedule.studio.name,
                        'Date': me.$moment(value.date, 'YYYY-MM-DD').format('MMMM DD, YYYY'),
                        'Start Time': me.$moment(value.schedule.start_time, 'HH:mm A').format('h:mm A'),
                        'End Time': me.$moment(value.schedule.end_time, 'HH:mm A').format('h:mm A'),
                        'Class Type': (value.schedule.set_custom_name) ? value.schedule.custom_name : value.schedule.class_type.name,
                        'Class Credits': value.schedule.class_credits,
                        'Class Length': value.schedule.class_length_formatted,
                        'Peak Type': value.schedule.peak_type,
                        'Private Class': (!value.schedule.private_class) ? 'No' : 'Yes',
                        'Schedule Released': (value.schedule.enabled) ? 'Yes' : 'No',
                        'Primary Instructor': `${value.primary.user.first_name } ${ value.primary.user.last_name}`,
                        'Substitute Instructor': `${value.substitute.user.first_name } ${ value.substitute.user.last_name}`,
                        'Total Bookings': value.bookings.length,
                        'Remarks': value.substitute.remarks
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
                me.$axios.post(`api/reporting/classes/summary-of-instructor-subbing-per-period?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.scheduledDates.forEach((item, index) => {
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
                me.filter = true
                me.fetchData()
            },
            fetchData () {
                const me = this
                me.loader(true)

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('studio_id', me.form.studio_id)
                formData.append('instructor_id', me.form.instructor_id)

                me.$axios.post(`api/reporting/classes/summary-of-instructor-subbing-per-period`, formData).then(res => {
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
                me.$axios.get(`api/instructors?enabled=1&all=1`).then(res => {
                    me.instructors = res.data.instructors
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchExtraAPI()
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
