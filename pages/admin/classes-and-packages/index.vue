<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content">
                    <h1 class="header_title">Scheduling</h1>
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
    </transition>
</template>

<script>
    import Foot from '../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Classes and Packages',
                access: true,
                loaded: false,
                res: {
                    today: [
                        {
                            label: 'Package Types',
                            imgSrc: '/icons/package-icon.svg',
                            link: '/admin/classes-and-packages/package-types'
                        },
                        {
                            label: 'Class Packages and Store Credits',
                            imgSrc: '/icons/stores-icon.svg',
                            link: '/admin/classes-and-packages/class-packages-and-store-credits'
                        },
                        {
                            label: 'Class Types',
                            imgSrc: '/icons/class-types-icon.svg',
                            link: '/admin/classes-and-packages/class-types'
                        }
                    ]
                }
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
        }
    }
</script>
