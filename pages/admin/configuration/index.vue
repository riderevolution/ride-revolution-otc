<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content">
                <h1 class="header_title">Configuration</h1>
            </section>
            <section id="content">
                <div class="cms_col_four">
                    <div class="cms_col" v-for="(data, key) in res.today" :key="key">
                        <nuxt-link :to="data.link" class="wrapper">
                            <div class="total_image">
                                <img class="front" :src="data.imgSrc" />
                                <img class="back" :src="data.imgSrc" />
                            </div>
                            <div class="total_title">{{ data.label }}</div>
                        </nuxt-link>
                    </div>
                </div>
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
                res: {
                    today: [
                        {
                            label: 'Studios',
                            imgSrc: '/icons/studio-icon.svg',
                            link: '/admin/configuration/studios'
                        },
                        {
                            label: 'Booking Restrictions',
                            imgSrc: '/icons/studio-icon.svg',
                            link: '/admin/configuration/booking-restrictions'
                        },
                        {
                            label: 'Customer Types',
                            imgSrc: '/icons/types-icon.svg',
                            link: '/admin/configuration/customer-types'
                        },
                        // {
                        //     label: 'Occupations',
                        //     imgSrc: '/icons/occupation-icon.svg',
                        //     link: '/admin/configuration/occupations'
                        // },
                        {
                            label: 'Gift Card Titles',
                            imgSrc: '/icons/gift-card-title-icon.svg',
                            link: '/admin/configuration/gift-card-titles'
                        },
                        {
                            label: 'Medical History',
                            imgSrc: '/icons/medical-history-icon.svg',
                            link: '/admin/configuration/medical-history'
                        },
                        {
                            label: 'System Emails',
                            imgSrc: '/icons/system-emails-icon.svg',
                            link: '/admin/configuration/system-emails'
                        },
                        {
                            label: 'MailChimp',
                            imgSrc: '/icons/mailchimp-icon.svg',
                            link: '/admin/configuration/mailchimp'
                        }
                    ]
                }
            }
        }
    }
</script>
