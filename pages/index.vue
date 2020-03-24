<template>
    <div class="content" v-if="$store.state.isAuth">
        <div id="admin" class="cms_dashboard">
            <section id="top_content">
                <h1 class="header_title">Dashboard</h1>
            </section>
            <section id="content" class="main">
                <nuxt-link to="/branch/greenbelt" class="cms_summary wrapper">
                    <div class="summary_header">
                        <h2 class="header_title">Greenbelt</h2>
                        <h2 class="action_highlight"><span>&#9679;</span> Juan Dela Cruz</h2>
                    </div>
                    <div class="summary_body">
                        <div class="column">
                            <div class="total_label">Today</div>
                            <div class="total" v-for="(data, key) in res.today">
                                <div class="total_image">
                                    <img class="front" :src="data.imgSrc" />
                                    <img class="back" :src="data.imgSrc" />
                                </div>
                                <div class="total_label">{{ data.label }}</div>
                                <div class="total_count">{{ data.count }}</div>
                            </div>
                        </div>
                        <div class="column">
                            <div class="total_label">Month Running (May 1 - Today)</div>
                            <div class="total" v-for="(data, key) in res.month">
                                <div class="total_image">
                                    <img class="front" :src="data.imgSrc" />
                                    <img class="back" :src="data.imgSrc" />
                                </div>
                                <div class="total_label">{{ data.label }}</div>
                                <div class="total_count">{{ data.count }}</div>
                            </div>
                        </div>
                    </div>
                </nuxt-link>
                <nuxt-link to="/branch/shangri-la-plaza" class="cms_summary wrapper">
                    <div class="summary_header">
                        <h2 class="header_title">Shangri-la Plaza</h2>
                        <h2 class="action_highlight"><span>&#9679;</span> Juan Dela Cruz</h2>
                    </div>
                    <div class="summary_body">
                        <div class="column">
                            <div class="total_label">Today</div>
                            <div class="total" v-for="(data, key) in res.today">
                                <div class="total_image">
                                    <img class="front" :src="data.imgSrc" />
                                    <img class="back" :src="data.imgSrc" />
                                </div>
                                <div class="total_label">{{ data.label }}</div>
                                <div class="total_count">{{ data.count }}</div>
                            </div>
                        </div>
                        <div class="column">
                            <div class="total_label">Month Running (May 1 - Today)</div>
                            <div class="total" v-for="(data, key) in res.month">
                                <div class="total_image">
                                    <img class="front" :src="data.imgSrc" />
                                    <img class="back" :src="data.imgSrc" />
                                </div>
                                <div class="total_label">{{ data.label }}</div>
                                <div class="total_count">{{ data.count }}</div>
                            </div>
                        </div>
                    </div>
                </nuxt-link>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                res: {
                    today: [
                        {
                            label: 'Total Customers',
                            count: 235,
                            imgSrc: '/icons/total-customer-icon.svg'
                        },
                        {
                            label: 'Total Package Sales',
                            count: '₱150,000',
                            imgSrc: '/icons/total-package-sales-icon.svg'
                        },
                        {
                            label: 'Total Product Sales',
                            count: '₱47,830',
                            imgSrc: '/icons/total-product-sales-icon.svg'
                        },
                        {
                            label: 'Total Revenue from Packages',
                            count: '₱47,830',
                            imgSrc: '/icons/total-revenue-icon.svg'
                        }
                    ],
                    month: [
                        {
                            label: 'Total Customers',
                            count: 235,
                            imgSrc: '/icons/total-customer-icon.svg'
                        },
                        {
                            label: 'Total Package Sales',
                            count: '₱150,000',
                            imgSrc: '/icons/total-package-sales-icon.svg'
                        },
                        {
                            label: 'Total Product Sales',
                            count: '₱47,830',
                            imgSrc: '/icons/total-product-sales-icon.svg'
                        },
                        {
                            label: 'Total Revenue from Packages',
                            count: '₱47,830',
                            imgSrc: '/icons/total-revenue-icon.svg'
                        }
                    ]
                }
            }
        }
    }
</script>
