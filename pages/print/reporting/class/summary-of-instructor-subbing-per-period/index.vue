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
                    <th>Main Instructor</th>
                    <th>Primary Instructor</th>
                    <th>Substitute Instructor</th>
                    <th>Additional Instructor</th>
                    <th>Cancelled</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody v-if="res.length > 0">
                <tr v-for="(data, key) in res" :key="key">
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
                    <td colspan="10">No Result(s) Found.</td>
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
        data: ({ $moment }) => ({
            loaded: false,
            res: [],
            form: {
                start_date: $moment().format('YYYY-MM-DD'),
                end_date: $moment().format('YYYY-MM-DD'),
                instructor_id: '',
                studio_id: ''
            }
        }),
        methods: {
            async initial () {
                this.form.start_date = this.$route.query.start_date
                this.form.end_date = this.$route.query.end_date
                this.form.instructor_id = this.$route.query.instructor_id
                this.form.studio_id = this.$route.query.studio_id

                let formData = new FormData()
                for (const identifier in this.form) {
                    if (this.form[identifier]) formData.append(identifier, this.form[identifier])
                }
                await this.$axios.$post(`api/reporting/classes/summary-of-instructor-subbing-per-period?all=1`, formData).then(({ scheduledDates }) => {
                    this.res = scheduledDates
                    this.loaded = true
                }).catch(err => {
                    this.$store.state.errorList = err.response.data
                    this.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        window.print()
                    }, 2000)
                })
            }
        },
        mounted () {
            this.initial()
            window.onafterprint = () => {
                window.close()
            }
		}
    }
</script>
