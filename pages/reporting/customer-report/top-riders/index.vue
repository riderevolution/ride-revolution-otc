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
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter"@submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id">
                                    <option value="" selected>All Class Types</option>
                                    <option :value="class_type.id" v-for="(class_type, key) in class_types" :key="key">{{ class_type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="timeslot">By Time Slot</label>
                                <select class="default_select alternate" name="timeslot">
                                    <option value="" selected>All Timeslots</option>
                                    <option :value="timeslot" v-for="(timeslot, key) in timeslots" :key="key">{{ timeslot }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="instructor_id">By Instructor</label>
                                <select class="default_select alternate" name="instructor_id">
                                    <option value="" selected>All Instructors</option>
                                    <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
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
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Rank</th>
                                <th class="stick">Customer</th>
                                <th class="stick">No. of Rides</th>
                                <th class="stick">Customer Type</th>
                                <th class="stick">Rewards</th>
                                <th class="stick">Age</th>
                                <th class="stick">Profession</th>
                                <th class="stick">Gender</th>
                                <th class="stick">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>{{ key + 1 }}</td>
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
                                <td>{{ data.numberOfRides }}</td>
                                <td>{{ data.customer_details.customer_type.name }}</td>
                                <td>Black</td>
                                <td>{{ -($moment(data.customer_details.co_birthdate).diff($moment(), 'years')) }}</td>
                                <td>{{ data.customer_details.profession }}</td>
                                <td>{{ (data.customer_details.co_sex == 'male' || data.customer_details.co_sex == 'M') ? 'Male' : 'Female' }}</td>
                                <td>{{ data.customer_details.pa_city }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
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
    export default {
        components: {
            Foot
        },
        data () {
            return {
                loaded: false,
                rowCount: 0,
                res: [],
                instructors: [],
                timeslots: [],
                types: [],
                class_types: [],
                studios: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/customers/top-riders', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.topRiders
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
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/customers/top-riders', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.topRiders
                            me.$axios.get('api/packages/class-types?enabled=1').then(res => {
                                if (res.data) {
                                    me.class_types = res.data.classTypes.data
                                }
                            })
                            me.$axios.get('api/studios?enabled=1').then(res => {
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
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
