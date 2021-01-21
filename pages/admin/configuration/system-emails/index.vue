<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">System Emails</h1>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter">
                            <div class="form_group alternate">
                                <label for="q">Find a email</label>
                                <input type="text" name="q" autocomplete="off" @input="submitFilter()" v-model="form.search" placeholder="Search for a email title" class="default_text search_alternate">
                            </div>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Link</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="!noSearchFound">
                            <tr v-for="(data, key) in populateEmails" :key="key" v-if="data.searched">
                                <td>{{ data.label }}</td>
                                <td>{{ data.slug }}</td>
                                <td width="20%">
                                    <div class="table_actions">
                                        <nuxt-link class="table_action_edit" :to="`${$route.path}/${data.slug}`">Edit Email</nuxt-link>
                                    </div>
                                </td>
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
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '~/components/Foot'
    export default {
        components: {
            Foot
        },
        computed: {
            populateEmails () {
                const me = this
                let result = []
                me.res.forEach((data, index) => {
                    result.push(data)
                })
                return result
            }
        },
        data () {
            return {
                name: 'Configuration',
                access: true,
                loaded: false,
                noSearchFound: false,
                form: {
                    search: ''
                },
                api_host: '',
                rowCount: 0,
                res: [
                    {
                        label: 'Update Old Account',
                        slug: 'update-old-account',
                        searched: true
                    },
                    {
                        label: 'First Timer Receiving a Gift card',
                        slug: 'first-timer-receiving-a-gift-card',
                        searched: true
                    },
                    {
                        label: 'Review class and Instructor',
                        slug: 'review-class-and-instructor',
                        searched: true
                    },
                    {
                        label: 'Refer a Friend',
                        slug: 'refer-a-friend',
                        searched: true
                    },
                    {
                        label: 'Receiving Transferred Package Confirmation',
                        slug: 'receiving-transferred-package-confirmation',
                        searched: true
                    },
                    {
                        label: 'Share Article',
                        slug: 'share-article',
                        searched: true
                    },
                    {
                        label: 'Series Expired',
                        slug: 'series-expired',
                        searched: true
                    },
                    {
                        label: 'Booking Confirmation Online',
                        slug: 'booking-confirmation-online',
                        searched: true
                    },
                    {
                        label: 'Waitlisted',
                        slug: 'waitlisted',
                        searched: true
                    },
                    {
                        label: 'Booking Confirmation',
                        slug: 'booking-confirmation',
                        searched: true
                    },
                    {
                        label: 'Series Expiring',
                        slug: 'series-expiring',
                        searched: true
                    },
                    {
                        label: 'Forgot Password',
                        slug: 'forgot-password',
                        searched: true
                    },
                    {
                        label: 'Password Changed',
                        slug: 'password-changed',
                        searched: true
                    },
                    {
                        label: 'Receiving a Gift Card',
                        slug: 'receiving-a-gift-card',
                        searched: true
                    },
                    {
                        label: 'Zoom Link',
                        slug: 'zoom-link',
                        searched: true
                    },
                    {
                        label: 'Attendance Reminder',
                        slug: 'attendance-reminder',
                        searched: true
                    },
                    {
                        label: 'Purchase of Store Credits',
                        slug: 'purchase-of-store-credits',
                        searched: true
                    },
                    {
                        label: 'Attendance Cancelled',
                        slug: 'attendance-cancelled',
                        searched: true
                    },
                    {
                        label: 'Complete Your Profile',
                        slug: 'complete-your-profile',
                        searched: true
                    },
                    {
                        label: 'Bike Switched',
                        slug: 'bike-switched',
                        searched: true
                    },
                    {
                        label: 'Thank you for Signing In',
                        slug: 'thank-for-signing',
                        searched: true
                    },
                    {
                        label: 'Bike Swapped',
                        slug: 'bike-swapped',
                        searched: true
                    },
                    {
                        label: 'Transferred Package Confirmation for Sender',
                        slug: 'transferred-package-confirmation-for-sender',
                        searched: true
                    },
                    {
                        label: 'Class Cancelled',
                        slug: 'class-cancelled',
                        searched: true
                    },
                    {
                        label: 'Shared Package Confirmation',
                        slug: 'shared-package-confirmation',
                        searched: true
                    },
                    {
                        label: 'Giest Invitation',
                        slug: 'guest-invitation',
                        searched: true
                    },
                    {
                        label: 'Gift Card Activated',
                        slug: 'gift-card-activated',
                        searched: true
                    },
                    {
                        label: 'Guest Booking Confirmation',
                        slug: 'guest-booking-confirmation',
                        searched: true
                    },
                    {
                        label: 'Booked from Waitlist',
                        slug: 'booked-from-waitlist',
                        searched: true
                    },
                    {
                        label: 'Sending a Gift Card',
                        slug: 'sending-a-gift-card',
                        searched: true
                    },
                    {
                        label: 'Sharing Package Confirmation',
                        slug: 'sharing-package-confirmation',
                        searched: true
                    },
                ]
            }
        },
        methods: {
            submitFilter () {
                const me = this
                let ctr = 0
                me.res.forEach((data, index) => {
                    let label = data.label.toLowerCase()
                    if (me.form.search != '') {
                        if (label.includes(me.form.search.toLowerCase())) {
                            data.searched = true
                        } else {
                            ctr++
                            data.searched = false
                        }
                    } else {
                        data.searched = true
                    }
                })
                if (ctr == me.res.length) {
                    me.noSearchFound = true
                } else {
                    me.noSearchFound = false
                }
                me.rowCount = document.getElementsByTagName('th').length
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.api_host = process.env.API_URL
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
