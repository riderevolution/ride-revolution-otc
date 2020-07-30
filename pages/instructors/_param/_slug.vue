<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" :class="`cms_dashboard user ${($route.params.slug == 'class-schedules') ? 'alt' : ''}`" v-if="loaded">
                <section id="top_content">
                    <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="user_info">
                        <img class="main" :src="instructor.instructor_details.images[0].path_resized" v-if="instructor.instructor_details.images.length > 0" />
                        <div class="user_image_default" v-else>
                            <div class="overlay">
                                {{ instructor.first_name.charAt(0) }}{{ instructor.last_name.charAt(0) }}
                            </div>
                        </div>
                        <div class="user_details">
                            <h1 class="user_name">
                                {{ instructor.first_name }} {{ instructor.last_name }}
                                <span class="violator">{{ checkOrdinal(instructor.nthRide) }} Classes Taught</span>
                            </h1>
                            <div class="user_contact">
                                <a :href="`tel:${instructor.instructor_details.io_contact_number}`" class="number">{{ instructor.instructor_details.io_contact_number }}</a>
                                <a :href="`mailto:${instructor.email}`" class="email">{{ instructor.email }}</a>
                            </div>
                            <div class="user_summary">
                                <div class="summary">Classes Taught: {{ instructor.upcomingClassesCount }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="user_tabs">
                        <nuxt-link :to="tab.link" class="tab_title" v-for="(tab, key) in tabs" :key="key">{{ tab.name }}</nuxt-link>
                    </div>
                </section>
                <section id="content">
                    <instructor-content :value="instructor" :type="$route.params.slug" :admin="true" />
                    <button type="button" class="hidden" id="packages" @click="fetchData()"></button>
                </section>
            </div>
            <transition name="fade">
                <class-schedule-layout :layout="layout" v-if="$store.state.classScheduleLayoutStatus" />
            </transition>
            <transition name="fade">
                <online-attendance-layout v-if="$store.state.onlineAttendanceLayoutStatus" :schedule="schedule" :instructorDashboard="true" />
            </transition>
            <transition name="fade">
                <online-attendance-prompt v-if="$store.state.onlineAttendancePrompt" />
            </transition>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import InstructorContent from '../../../components/InstructorContent'
    import ClassScheduleLayout from '../../../components/modals/ClassScheduleLayout'
    import OnlineAttendanceLayout from '../../../components/modals/OnlineAttendanceLayout'
    import OnlineAttendancePrompt from '../../../components/modals/OnlineAttendancePrompt'
    import Foot from '../../../components/Foot'
    export default {
        components: {
            InstructorContent,
            OnlineAttendanceLayout,
            OnlineAttendancePrompt,
            ClassScheduleLayout,
            Foot
        },
        data () {
            return {
                name: 'Instructors',
                access: true,
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
                lastRoute: '',
                instructor: [],
                tabs: [
                    {
                        name: 'Class Schedules',
                        link: `/instructors/${this.$route.params.param}/class-schedules`
                    },
                    {
                        name: 'Class History',
                        link: `/instructors/${this.$route.params.param}/class-history`
                    },
                    {
                        name: 'Class Statistics',
                        link: `/instructors/${this.$route.params.param}/class-statistics`
                    },
                    {
                        name: 'Calendar of Availability',
                        link: `/instructors/${this.$route.params.param}/calendar-of-availability`
                    },
                    {
                        name: 'Details',
                        link: `/instructors/${this.$route.params.param}/details`
                    }
                ],
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
            fetchData () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/instructors/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.instructor = res.data.instructor
                        me.loaded = true
                        me.layout.instructor_id = me.instructor.id
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
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
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        },
    }
</script>
