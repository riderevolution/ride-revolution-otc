<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Top Riders</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">List of riders with the most ride count</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/customer/top-riders?studio_id=${form.studio_id}&class_type_id=${form.class_type_id}&timeslot=${form.timeslot}&instructor_id=${form.instructor_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getCustomers()" v-if="res.topRiders.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.topRiders.data.length > 0"
                                class="hidden me"
                                :data="topRidersAttributes"
                                :name="`top-riders-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id" v-model="form.class_type_id">
                                    <option value="" selected>All Class Types</option>
                                    <option :value="class_type.id" v-for="(class_type, key) in class_types" :key="key">{{ class_type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="day">By Day</label>
                                <select class="default_select alternate" name="day" v-model="form.day">
                                    <option value="" selected>All Days</option>
                                    <option :value="day.value" v-for="(day, key) in days" :key="key">{{ day.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="timeslot">By Time Slot</label>
                                <select class="default_select alternate" name="timeslot" v-model="form.timeslot">
                                    <option value="" selected>All Timeslots</option>
                                    <option :value="timeslot" v-for="(timeslot, key) in timeslots" :key="key">{{ timeslot }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="instructor_id">By Instructor</label>
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
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Rank</th>
                                <th class="stick">Customer</th>
                                <th class="stick">No. of Rides</th>
                                <th class="stick">Customer Type</th>
                                <th class="stick">Preferred Studio</th>
                                <th class="stick">Preferred Instructor</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Age</th>
                                <th class="stick">Profession</th>
                                <th class="stick">Gender</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.topRiders.data.length > 0">
                            <tr v-for="(data, key) in res.topRiders.data" :key="key">
                                <td>{{ key + 1 }}</td>
                                <td>
                                    <div class="thumb" @click="openWindow(`/customers/${data.id}/packages`)">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="table_data_link">{{ data.fullname }}</div>
                                    </div>
                                </td>
                                <td>{{ data.numberOfRides }}</td>
                                <td>{{ data.customer_details.customer_type.name }}</td>
                                <td>{{ (data.preferred_studio.length > 0) ? data.preferred_studio[0].name : 'No Preferred Studio' }}</td>
                                <td>{{ (data.preferred_instructor.length > 0) ? data.preferred_instructor[0].name : 'No Preferred Instructor' }}</td>
                                <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A' }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ -($moment(data.customer_details.co_birthdate).diff($moment(), 'years')) }}</td>
                                <td>{{ (data.customer_details.profession) ? data.customer_details.profession : 'N/A' }}</td>
                                <td>{{ (data.customer_details.co_sex == 'male' || data.customer_details.co_sex == 'M') ? 'Male' : 'Female' }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.topRiders.path" :current="res.topRiders.current_page" :last="res.topRiders.last_page" />
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
                name: 'Top Riders',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                instructors: [],
                timeslots: [],
                types: [],
                class_types: [],
                studios: [],
                days: [
                    {
                        name: 'Monday',
                        value: 'Mon'
                    },
                    {
                        name: 'Tuesday',
                        value: 'Tue'
                    },
                    {
                        name: 'Wednesday',
                        value: 'Wed'
                    },
                    {
                        name: 'Thursday',
                        value: 'Thu'
                    },
                    {
                        name: 'Friday',
                        value: 'Fri'
                    },
                    {
                        name: 'Saturday',
                        value: 'Sat'
                    },
                    {
                        name: 'Sunday',
                        value: 'Sun'
                    }
                ],
                form: {
                    studio_id: '',
                    class_type_id: '',
                    timeslot: '',
                    instructor_id: '',
                    day: '',
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            topRidersAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Rank': key + 1,
                        'Member ID': value.member_id,
                        'Customer': value.fullname,
                        'Number Of Rides': value.numberOfRides,
                        'Preferred Studio': (value.preferred_studio.length > 0) ? value.preferred_studio[0].name : 'No Preferred Studio',
                        'Preferred Instructor': (value.preferred_instructor.length > 0) ? value.preferred_instructor[0].name : 'No Preferred Instructor',
                        'Customer Type': value.customer_details.customer_type.name,
                        'Contact Number': me.getCustomerDetails(value, 'contact_number'),
                        'Email Address': value.email,
                        'Birthdate': me.$moment(value.customer_details.co_birthdate).format('MMM DD, YYYY'),
                        'Gender': me.getCustomerDetails(value, 'gender'),
                        'Weight': me.getCustomerDetails(value, 'weight'),
                        'Shoe Size': me.getCustomerDetails(value, 'shoe_size'),
                        'Dumbbell': me.getCustomerDetails(value, 'dumbbell'),
                        'Personal Address': me.getCustomerDetails(value, 'personal'),
                        'Billing Address': me.getCustomerDetails(value, 'billing'),
                        'Sign Up Date': me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'First Class': (value.bookings.length > 0) ? me.$moment(value.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : 'No Class Yet',
                        'Last Class': (value.bookings.length > 0) ? me.$moment(value.bookings[value.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : 'No Class Yet'
                    }))
                ]
            }
        },
        methods: {
            getCustomerDetails (data, type) {
                const me = this
                let result = ''

                switch (type) {
                    case 'gender':
                        result = (data.customer_details.co_sex) ? (data.customer_details.co_sex == 'F' ? 'Female' : 'Male') : 'N/A'
                        break
                    case 'contact_number':
                        result = (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A'
                        break
                    case 'weight':
                        result = (data.customer_details.co_weight) ? data.customer_details.co_weight : 'N/A'
                        break
                    case 'shoe_size':
                        result = (data.customer_details.co_shoe_size) ? data.customer_details.co_shoe_size : 'N/A'
                        break
                    case 'dumbbell':
                        result = (data.customer_details.dumbbell) ? data.customer_details.dumbbell : 'N/A'
                        break
                    case 'personal':
                        if (data.customer_details.pa_address) {
                            result += data.customer_details.pa_address
                            if (data.customer_details.pa_address_2) {
                                result += `, ${data.customer_details.pa_address_2}`
                            }
                            if (data.customer_details.pa_zip_code) {
                                result += `, ${data.customer_details.pa_zip_code}`
                            }
                            if (data.customer_details.personal_state) {
                                result += `, ${data.customer_details.personal_state}`
                            }
                            if (data.customer_details.personal_country) {
                                result += `, ${data.customer_details.personal_country}`
                            }
                        } else {
                            result = 'N/A'
                        }
                        break
                    case 'billing':
                        if (data.customer_details.ba_address) {
                            result += data.customer_details.ba_address
                            if (data.customer_details.ba_address_2) {
                                result += `, ${data.customer_details.ba_address_2}`
                            }
                            if (data.customer_details.ba_zip_code) {
                                result += `, ${data.customer_details.ba_zip_code}`
                            }
                            if (data.customer_details.billing_state) {
                                result += `, ${data.customer_details.billing_state}`
                            }
                            if (data.customer_details.billing_country) {
                                result += `, ${data.customer_details.billing_country}`
                            }
                        } else {
                            result = 'N/A'
                        }
                        break
                }

                return result
            },
            getCustomers () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('all', 1)
                me.values = []

                me.loader(true)
                me.$axios.post('api/reporting/customers/top-riders?all=1', formData).then(res => {
                    if (res.data) {
                        res.data.topRiders.forEach((item, key) => {
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
            submitFilter () {
                const me = this
                me.filter = true
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/customers/top-riders', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/customers/top-riders', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data

                            me.res.topRiders.data.forEach((item, key) => {
                                item.preferred_studio.sort((a, b) => {
                                    return parseInt(a.count) + parseInt(b.count)
                                })
                                item.preferred_instructor.sort((a, b) => {
                                    return parseInt(a.count) + parseInt(b.count)
                                })
                            })

                            me.$axios.get('api/packages/class-types?enabled=1').then(res => {
                                if (res.data) {
                                    me.class_types = res.data.classTypes.data
                                }
                            })
                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
                                }
                            })
                            me.$axios.get('api/instructors?enabled=1').then(res => {
                                if (res.data) {
                                    me.instructors = res.data.instructors.data
                                }
                            })
                            me.$axios.get('api/extras/timeslots').then(res => {
                                if (res.data) {
                                    let current_date = me.$moment().format('MM-DD-YY')
                                    me.timeslots = res.data.timeslots
                                    me.timeslots.sort((a,b) => (me.$moment(`${current_date} ${a}`) > me.$moment(`${current_date} ${b}`)) ? 1 : ((me.$moment(`${current_date} ${b}`) > me.$moment(`${current_date} ${a}`)) ? -1 : 0))
                                }
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
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
