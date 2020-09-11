<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Instructor Attendance Summary</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Instructor</th>
                    <th>Total Rides</th>
                    <th>Paying Riders</th>
                    <th>Comped Riders</th>
                    <th>First Timers</th>
                    <th>No Shows</th>
                    <th>Repeat</th>
                    <th>Avg Riders</th>
                    <th>Number Classes</th>
                    <th>Avg Spots</th>
                    <th>Capacity</th>
                    <th>Paying</th>
                    <th>Total Revenue</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
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
                    <td colspan="13">No Result(s) Found.</td>
                </tr>
            </tbody>
        </table>
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
                    class_type_id: '',
                    studio_id: ''
                }
            }
        },
        methods: {
            totalPercentage (type, data) {
                const me = this
                let percent = 0

                switch (type) {
                    case 'capacity':
                        if (data.avg_riders != 0) {
                            if (me.studio.length > 0) {
                                if (me.studio.online_class) {
                                    percent = me.totalItems(`${(data.avg_riders / data.total_riders) * 100}`)
                                } else {
                                    percent = me.totalItems(`${(data.avg_riders / me.studio.capacity) * 100}`)
                                }
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
            initial () {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.class_type_id = me.$route.query.class_type_id
                me.form.studio_id = me.$route.query.studio_id

                let formData = new FormData()
                formData.append('class_type_id', me.form.class_type_id)
                formData.append('studio_id', me.$route.query.studio_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post(`api/reporting/classes/instructor-attendance-summary?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.instructors

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
