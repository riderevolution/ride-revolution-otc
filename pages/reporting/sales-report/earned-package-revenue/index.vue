<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Earned Class Package Revenue</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income for each payment type</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a href="javascript:void(0)" class="action_btn">Print</a>
                                <a href="javascript:void(0)" class="action_btn margin">Export</a>
                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Date</label>
                                <input type="date" name="start_date" class="default_text date" />
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date</label>
                                <input type="date" name="end_date" class="default_text date" />
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Grand Total: {{ totalItems(total_count) }}</div>
                    </div>
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Revenu</th>
                                <th>Subtotal Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`${(role.open) ? 'toggled' : ''}`" v-for="(role, key) in res" v-if="res.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">Revenue from Enrollment</td>
                                <td>Php 3,000</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table">
                                            <thead>
                                                <tr>
                                                    <th>Branch  </th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(n, key) in 5" :key="key">
                                                    <td>Greenbelt 5</td>
                                                    <td>Php 1,100</td>
                                                </tr>
                                            </tbody>
                                            <!-- <tbody class="no_results" v-else>
                                                <tr>
                                                    <td :colspan="rowCount">No Result(s) Found.</td>
                                                </tr>
                                            </tbody> -->
                                        </table>
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
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../.././../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                range: {
                    start: new Date(),
                    end: new Date()
                },
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0,
                loaded: false
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(`api/staff/search`, formData).then(res => {
                    me.res = res.data.roles
                    me.rowCount = 4
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                    }, 500)
                })
            },
            /**
             * Custom toggler for accordion
             * @param  {[object]} event
             * @param  {[int]} key
             * @return {[css]}
             */
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res[key].open ^= true
                if (me.res[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.rowCount = 4
                if (value != -1) {
                    me.$axios.get(`api/roles?enabled=${value}`).then(res => {
                        me.res = res.data.roles
                        me.total_count = me.res.length
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                            const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                            elements.forEach((element, index) => {
                                element.querySelector('.accordion_table').style.height = 0
                            })
                        }, 500)
                    })
                } else {
                    me.$axios.get(`api/staff?enabled=0`).then(res => {
                        me.res = res.data.staff.data
                        me.total_count = me.res.length
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                }
            }
        },
        mounted () {
            const me = this
            me.loaded = true
            me.fetchData(1)
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
