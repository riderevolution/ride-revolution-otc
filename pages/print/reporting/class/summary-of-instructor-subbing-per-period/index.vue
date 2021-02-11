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
                <h2>Summary of Instructor Subbing per Period</h2>
                <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
            </div>
            <div class="total">Total Subbed Classes: {{ totalItems(res.length) }}</div>
        </div>
        <table class="cms_table print">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Class Type</th>
                    <th>Schedule Released</th>
                    <th>Studio</th>
                    <th>Primary Instructor</th>
                    <th>Substitute Instructor</th>
                    <th>Cancelled</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
                    <td>{{ $moment(data.date, 'YYYY-MM-DD').format('MMMM DD, YYYY') }}</td>
                    <td>{{ $moment(data.schedule.start_time, 'HH:mm A').format('h:mm A') }}</td>
                    <td>{{ data.schedule.class_type.name }}</td>
                    <td>{{ (data.schedule.enabled) ? 'Yes' : 'No' }}</td>
                    <td>{{ data.schedule.studio.name }}</td>
                    <td>{{ data.primary.user.first_name }} {{ data.primary.user.last_name }}</td>
                    <td>{{ (data.substitute) ? `${data.substitute.user.first_name} ${data.substitute.user.last_name}` : 'No Substitute' }}</td>
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
                res: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    instructor_id: '',
                    studio_id: ''
                }
            }
        },
        methods: {
            initial () {
                const me = this
                me.form.start_date = me.$route.query.start_date
                me.form.end_date = me.$route.query.end_date
                me.form.instructor_id = me.$route.query.instructor_id
                me.form.studio_id = me.$route.query.studio_id

                let formData = new FormData()
                formData.append('instructor_id', me.form.instructor_id)
                formData.append('studio_id', me.$route.query.studio_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post(`api/reporting/classes/summary-of-instructor-subbing-per-period?all=1`, formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.scheduledDates
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
