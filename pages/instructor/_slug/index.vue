<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard user instructor" v-if="loaded">
                <div id="ins_header">
                    <div class="left">
                        <div class="info">
                            <div class="image">
                                <img :src="user.instructor_details.images[0].path_resized" v-if="user.instructor_details.images[0].path != null" />
                                <div class="default" v-else>
                                    <div class="overlay">
                                        {{ user.first_name.charAt(0) }}{{ user.last_name.charAt(0) }}
                                    </div>
                                </div>
                                <div class="title">Hi, {{ user.first_name }}</div>
                            </div>
                            <div class="text">You have <b>3</b> upcoming classes this month!</div>
                            <div class="text">Congratulations! You have taught your <span class="highlight">100th class.</span></div>
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
                    <instructor-content :value="user" :type="$route.params.slug" />
                    <button type="button" class="hidden" id="packages" @click="fetchData()"></button>
                </section>
            </div>
        </transition>
        <transition name="fade">
            <class-schedule-layout :studio="layout.studio" :schedule="layout.schedule" v-if="$store.state.classScheduleLayoutStatus" />
        </transition>
    </div>
</template>

<script>
    import InstructorContent from '../../../components/InstructorContent'
    import ClassScheduleLayout from '../../../components/modals/ClassScheduleLayout'
    export default {
        layout: 'ins',
        components: {
            InstructorContent,
            ClassScheduleLayout
        },
        data () {
            return {
                loaded: false,
                layout: {
                    studio: null,
                    schedule: null
                },
                user: [],
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
            initial () {
                const me = this
                let token = me.$cookies.get('token')
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
                                me.user = res.data.instructor
                                me.loaded = true
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
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
