<template>
    <div class="content">
        <div id="admin" class="cms_dashboard user" v-if="loaded">
            <section id="top_content">
                <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                <div class="user_info">
                    <img :src="instructor.instructor_details.images[0].path_resized" v-if="instructor.instructor_details.images.length > 0" />
                    <div class="user_image_default" v-else>
                        {{ instructor.first_name.charAt(0) }}{{ instructor.last_name.charAt(0) }}
                    </div>
                    <div class="user_details">
                        <h1 class="user_name">{{ instructor.first_name }} {{ instructor.last_name }}</h1>
                        <div class="user_contact">
                            <a :href="`tel:${instructor.instructor_details.io_contact_number}`" class="number">{{ instructor.instructor_details.io_contact_number }}</a>
                            <a :href="`mailto:${instructor.email}`" class="email">{{ instructor.email }}</a>
                        </div>
                        <div class="user_summary">
                            <div class="summary">Classes Taught: 89</div>
                        </div>
                    </div>
                </div>
                <div class="user_tabs">
                    <nuxt-link :to="tab.link" class="tab_title" v-for="(tab, key) in tabs" :key="key">{{ tab.name }}</nuxt-link>
                </div>
            </section>
            <section id="content">
                asdasdasdasd
                <!-- <customer-content :value="customer" :type="$route.params.slug" /> -->
                <!-- <button type="button" class="hidden" id="packages" @click="fetchData()"></button> -->
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                loaded: false,
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
            fetchData () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/instructors/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.instructor = res.data.instructor
                        me.loaded = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            me.fetchData()
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        },
    }
</script>
