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
                                <th class="stick">Main Instructor</th>
                                <th class="stick">Primary Instructor</th>
                                <th class="stick">Substitute Instructor</th>
                                <th class="stick">Additional Instructor</th>
                                <th class="stick">Cancelled</th>
                                <th class="stick">Remarks</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.scheduledDates.data.length > 0">
                            <tr v-for="(data, key) in res.scheduledDates.data" :key="key">
                                <td>{{ $moment(data.date, 'YYYY-MM-DD').format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment(data.schedule.start_time, 'HH:mm A').format('h:mm A') }}</td>
                                <td>{{ (data.schedule.set_custom_name) ? data.schedule.custom_name : data.schedule.class_type.name }}</td>
                                <td>{{ (data.schedule.enabled) ? 'Yes' : 'No' }}</td>
                                <td>{{ data.schedule.studio.name }}</td>
                                <td>{{ data.main.user.fullname }}</td>
                                <td>{{ data.primary.user.fullname }}</td>
                                <td>{{ (data.substitute) ? `${data.substitute.user.fullname}` : 'No Substitute' }}</td>
                                <td>{{ (data.additional) ? `${data.additional.user.fullname}` : 'No Additional' }}</td>
                                <td>{{ totalItems(data.cancelled) }}</td>
                                <td>{{ (data.substitute) ? data.substitute.remarks : 'No Remarks' }}</td>
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
    export default {
        components: {
            Foot: () => import('~/components/Foot'),
            Pagination: () => import('~/components/Pagination')
        },
        data: ({ $moment }) => ({
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
                start_date: $moment().subtract(1, 'month').format('YYYY-MM-DD'),
                end_date: $moment().format('YYYY-MM-DD'),
                studio_id: '',
                instructor_id: ''
            }
        }),
        computed: {
            summaryInstructorSubbingPerPeriodAttributes () {
                return [
                    ...this.values.map((value, key) => ({
                        'Studio': value.schedule.studio.name,
                        'Date': this.$moment(value.date, 'YYYY-MM-DD').format('MMMM DD, YYYY'),
                        'Start Time': this.$moment(value.schedule.start_time, 'HH:mm A').format('h:mm A'),
                        'End Time': this.$moment(value.schedule.end_time, 'HH:mm A').format('h:mm A'),
                        'Class Type': (value.schedule.set_custom_name) ? value.schedule.custom_name : value.schedule.class_type.name,
                        'Class Credits': value.schedule.class_credits,
                        'Class Length': value.schedule.class_length_formatted,
                        'Peak Type': value.schedule.peak_type,
                        'Private Class': (!value.schedule.private_class) ? 'No' : 'Yes',
                        'Schedule Released': (value.schedule.enabled) ? 'Yes' : 'No',
                        'Main Instructor': `${value.main.user.fullname}`,
                        'Primary Instructor': `${value.primary.user.fullname}`,
                        'Substitute Instructor': (value.substitute) ? `${value.substitute.user.fullname}` : 'No Substitute',
                        'Additional Instructor': (value.additional) ? `${value.additional.user.fullname}` : 'No Additional',
                        'Total Bookings': value.bookings.length,
                        'Total Cancelled': value.cancelled,
                        'Remarks': (value.substitute) ? value.substitute.remarks : 'No Remarks'
                    }))
                ]
            }
        },
        methods: {
            getClasses () {
                this.values = []
                let formData = new FormData(document.getElementById('filter'))
                this.loader(true)
                this.$axios.post(`api/exports/class-report/summary-of-instructor-subbing-per-period`, formData).then(res => {
                    if (res.data) {
                        this.values = res.data.scheduledDates
                    }
                }).catch((err) => {

                }).then(() => {
                    this.loader(false)
                    document.querySelector('.me').click()
                })
            },
            submissionSuccess () {
                this.filter = true
                this.fetchData()
            },
            fetchData () {
                this.loader(true)

                let formData = new FormData()
                formData.append('start_date', this.form.start_date)
                formData.append('end_date', this.form.end_date)
                formData.append('studio_id', this.form.studio_id)
                formData.append('instructor_id', this.form.instructor_id)

                this.$axios.post(`api/reporting/classes/summary-of-instructor-subbing-per-period`, formData).then(res => {
                    setTimeout( () => {
                        this.res = res.data
                        this.loaded = true
                    }, 500)
                }).catch(err => {
                    this.$store.state.errorList = err.response.data.errors
                    this.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        this.loader(false)
                    }, 500)
                    this.rowCount = document.getElementsByTagName('th').length
                })
            },
            async fetchExtraAPI () {
                let token = this.$cookies.get('70hokcotc3hhhn5'),
                    studio_id = this.$cookies.get('CSID')

                await this.$axios.get('api/studios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        this.studios = res.data.studios
                        this.form.studio_id = studio_id
                        this.$axios.get(`api/studios/${studio_id}`).then(res => {
                            this.studio = res.data.studio
                        })
                    }
                })
                await this.$axios.get(`api/instructors?enabled=1&all=1`).then(res => {
                    this.instructors = res.data.instructors
                })
                await this.fetchData()
            }
        },
        async mounted () {
            await this.checkPagePermission(this)
            if (this.access) {
                this.fetchExtraAPI()
            } else {
                this.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
