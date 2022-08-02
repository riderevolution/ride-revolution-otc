<template>
    <div class="print_table" v-if="loaded">
        <div class="inline">
            <div class="logo">
                <img src="/logo.png" width="65px" />
                <div class="logo_title">
                    Ride <br/>
                    Revolution
                </div>
            </div>
            <div class="text">
                <h2>Attendance Summary</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
        </div>
        <table class="cms_table_accordion">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Total Riders</th>
                    <th>Paying Riders</th>
                    <th>Comped Riders</th>
                    <th>First Timers</th>
                    <th>No Shows</th>
                    <th>Cancel</th>
                    <th>Waitlist</th>
                    <th>Repeat</th>
                    <th>Avg Riders</th>
                    <th>Number Classes</th>
                    <th>Avg Spots</th>
                    <th>Capacity</th>
                    <th>Paying</th>
                    <th>Total Revenue</th>
                </tr>
            </thead>
            <tbody v-for="(data, key) in res" v-if="res.length > 0">
                <tr class="parent">
                    <td>{{ $moment(data.date, 'YYYY-MM-DD').format('MMM DD, YYYY') }}</td>
                    <td>{{ countValues(data, 'total_riders') }}</td>
                    <td>{{ countValues(data, 'paying_riders') }}</td>
                    <td>{{ countValues(data, 'comped_riders') }}</td>
                    <td>{{ countValues(data, 'first_timers') }}</td>
                    <td>{{ countValues(data, 'no_shows') }}</td>
                    <td>{{ countValues(data, 'cancel') }}</td>
                    <td>{{ countValues(data, 'waitlist') }}</td>
                    <td>{{ countValues(data, 'total_riders') - (countValues(data, 'first_timers') + countValues(data, 'no_shows')) }}</td>
                    <td>{{ totalPercentage('average', data) }}</td>
                    <td>{{ totalItems(data.number_of_classes) }}</td>
                    <td>{{ (studio.online_class) ? 'N/A' : studio.capacity }}</td>
                    <td>{{ totalPercentage('capacity', data) }}</td>
                    <td>{{ totalPercentage('paying', data) }}</td>
                    <td>Php {{ totalCount(countValues(data, 'revenue')) }}</td>
                </tr>
                <tr>
                    <td class="pads" colspan="15">
                        <div class="accordion_table show">
                            <table class="cms_table alt">
                                <thead>
                                    <tr>
                                        <th>Start Time</th>
                                        <th>Total Riders</th>
                                        <th>Paying Riders</th>
                                        <th>Comped Riders</th>
                                        <th>First Timers</th>
                                        <th>No Shows</th>
                                        <th>Cancel</th>
                                        <th>Waitlist</th>
                                        <th>Repeat</th>
                                        <th>Avg Riders</th>
                                        <th>Number Classes</th>
                                        <th>Avg Spots</th>
                                        <th>Capacity</th>
                                        <th>Paying</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody v-if="data.classes.length > 0">
                                    <tr v-for="(item, key) in data.classes" :key="key">
                                        <td>{{ item.start_time }}</td>
                                        <td>{{ countValues(item, 'total_riders') }}</td>
                                        <td>{{ countValues(item, 'paying_riders') }}</td>
                                        <td>{{ countValues(item, 'comped_riders') }}</td>
                                        <td>{{ countValues(item, 'first_timers') }}</td>
                                        <td>{{ countValues(item, 'no_shows') }}</td>
                                        <td>{{ countValues(item, 'cancel') }}</td>
                                        <td>{{ countValues(item, 'waitlist') }}</td>
                                        <td>{{ countValues(item, 'total_riders') - (countValues(item, 'first_timers') + countValues(item, 'no_shows')) }}</td>
                                        <td>{{ totalPercentage('average', item) }}</td>
                                        <td>{{ item.number_of_classes }}</td>
                                        <td>{{ (studio.online_class) ? 'N/A' : studio.capacity }}</td>
                                        <td>{{ totalPercentage('capacity', item) }}</td>
                                        <td>{{ totalPercentage('paying', item) }}</td>
                                        <td>Php {{ totalCount(countValues(item, 'revenue')) }}</td>
                                    </tr>
                                </tbody>
                                <tbody class="no_results" v-else>
                                    <tr>
                                        <td colspan="15">No Result(s) Found.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tbody class="no_results" v-if="res.length == 0">
                <tr>
                    <td colspan="15">No Result(s) Found.</td>
                </tr>
            </tbody>
        </table>
        <div class="signature">
            <div class="label">SIGNATURE OVER PRINTED NAME</div>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'print',
        data () {
            return {
                loaded: false,
                studio: [],
                res: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    customer_type_id: '',
                    class_package_id: '',
                    instructor_id: '',
                    class_type_id: '',
                    studio_id: ''
                }
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
                        percent = me.totalItems(`${(paying_riders / data.total_riders) * 100}`)
                        break
                    case 'average':
                        to_less = no_shows + comped_riders
                        percent = me.totalItems(avg_riders / data.number_of_classes)
                        break
                }

                return (type == 'average') ? percent : `${percent}%`
            },
            initial () {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.class_type_id = me.$route.query.class_type_id
                me.form.customer_type_id = me.$route.query.customer_type_id
                me.form.instructor_id = me.$route.query.instructor_id
                me.form.class_package_id = me.$route.query.class_package_id
                me.form.studio_id = me.$route.query.studio_id

                let formData = new FormData()
                for (const identifier in this.form) {
                    if (this.form[identifier]) formData.append(identifier, this.form[identifier])
                }
                me.$axios.post(`api/reporting/classes/attendance-summary?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.schedules
                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }
                            me.loaded = true
                            setTimeout( () => {
                                window.print()
                            }, 1000)
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                })
            }
        },
        mounted () {
			const me = this
            me.initial()
            window.onafterprint = function(){
                window.close()
            }
		}
    }
</script>
