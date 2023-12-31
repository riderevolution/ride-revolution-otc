<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard user instructor" v-if="loaded">
                <div id="ins_header">
                    <div class="left">
                        <div class="info">
                            <div class="image">
                                <img :src="instructor.instructor_details.images[0].path_resized" v-if="instructor.instructor_details.images[0].path != null" />
                                <div class="default" v-else>
                                    <div class="overlay">
                                        {{ instructor.first_name.charAt(0) }}{{ instructor.last_name.charAt(0) }}
                                    </div>
                                </div>
                                <div class="title">Hi, {{ instructor.first_name }}</div>
                            </div>
                            <div class="text">You have <b>{{ instructor.upcomingClassesCount }}</b> upcoming classes this month!</div>
                            <div class="text">Congratulations! You have taught your <span class="highlight">{{ checkOrdinal(instructor.nthRide) }} class.</span></div>
                            <div class="text violator">Please settle your schedule for this month. Thank you!</div>
                        </div>
                    </div>
                    <div class="right">
                        <ul>
                            <li v-for="(data, key) in tabs" :key="key" class="list_item">
                                <nuxt-link :to="data.link" class="link">{{ data.name }}</nuxt-link>
                            </li>
                        </ul>
                    </div>
                </div>
                <section id="content" class="ins">
                    <instructor-content :value="instructor" :type="$route.params.slug" :isDashboard="true" />
                    <button type="button" class="hidden" id="packages" @click="fetchData()"></button>
                </section>
            </div>
        </transition>
        <transition name="fade">
            <class-schedule-layout :layout="layout" v-if="$store.state.classScheduleLayoutStatus" />
        </transition>
        <transition name="fade">
            <online-attendance-ins-layout v-if="$store.state.onlineAttendanceInsLayoutStatus" :schedule="schedule" :instructorDashboard="true" />
        </transition>
        <transition name="fade">
            <online-attendance-prompt v-if="$store.state.onlineAttendancePrompt" />
        </transition>
    </div>
</template>

<script>
    import InstructorContent from '../../../components/InstructorContent'
    import ClassScheduleLayout from '../../../components/modals/ClassScheduleLayout'
    import OnlineAttendanceInsLayout from '../../../components/modals/OnlineAttendanceInsLayout'
    import OnlineAttendancePrompt from '../../../components/modals/OnlineAttendancePrompt'
    export default {
        layout: 'ins',
        components: {
            InstructorContent,
            ClassScheduleLayout,
            OnlineAttendanceInsLayout,
            OnlineAttendancePrompt
        },
        data () {
            return {
                loaded: false,
                layout: {
                    studio: null,
                    schedule: null,
                    instructor_id: null
                },
                schedule: {
                    id: 0,
                    schedule: []
                },
                instructor: [],
                tabs: [
                    {
                        name: 'Class Schedules',
                        link: `/instructor/class-schedules`
                    },
                    {
                        name: 'Class History',
                        link: `/instructor/class-history`
                    },
                    {
                        name: 'Class Statistics',
                        link: `/instructor/class-statistics`
                    },
                    {
                        name: 'Calendar of Availability',
                        link: `/instructor/calendar-of-availability`
                    },
                    {
                        name: 'Details',
                        link: `/instructor/details`
                    }
                ]
            }
        },
        methods: {
            checkOrdinal (count) {
                const me = this
                let value = count.toString()
                let lastDigit = value[value.length - 1]
                switch (lastDigit) {
                    case '1':
                        value += 'st'
                        break
                    case '2':
                        value += 'nd'
                        break
                    case '3':
                        value += 'rd'
                        break
                    default:
                        value += 'th'
                }
                return value
            },
            initial () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                if (me.$route.params.slug == undefined) {
                    me.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })
                } else {
                    me.loader(true)
                    me.$axios.get('api/user', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        me.$axios.get(`api/instructors/${res.data.user.id}/${me.$route.params.slug}`).then(res => {
                            setTimeout( () => {
                                me.instructor = res.data.instructor
                                me.loaded = true
                                me.layout.instructor_id = me.instructor.id
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        })
                    }).catch(err => {
                        me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                        me.loader(false)
                    })
                }
            }
        },
        mounted () {
            const me = this
            me.initial()
        }
    }
</script>
