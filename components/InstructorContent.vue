<template>
    <div class="instructor_tab_content">
        <div v-if="type == 'class-schedule' && loaded">

        </div>
    </div>
</template>

<script>
    export default {
        props: {
            type: {
                type: String,
                default: 'packages'
            },
            value: {
                default: null
            }
        },
        data () {
            return {
                lastRoute: '',
                loaded: false,
                monthStatus: false,
                currentDate: 0,
                currentMonth: 0,
                currentYear: 0,
                value: 0,
                calendarType: 'day',
                monthName: '',
                yearName: '',
                studios: [],
                instructors: [],
                schedules: [],
                dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                form: {
                    studio_id: 0,
                    instructor_id: 0
                }
            }
        },
        mounted () {
            const me = this
            me.loaded = true
        }
    }
</script>
