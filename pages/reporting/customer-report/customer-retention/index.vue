<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Customer Retention</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Returning Customers</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn">Print</a>
                            <a href="javascript:void(0)" class="action_btn margin">Export</a>
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
                        <div class="total">Total: {{ totalItems(res.customers.total) }}</div>
                        <div class="total">Total Riders: {{ totalItems(res.customers.total) }}</div>
                        <div class="total">Retained: {{ totalItems(res.customers.total) }}</div>
                        <div :class="`status ${(status == 'first') ? 'active' : ''}`" @click="toggleStatus('first')">First time</div>
                        <div :class="`status ${(status == 'second') ? 'active' : ''}`" @click="toggleStatus('second')">Second Time</div>
                        <div :class="`status ${(status == 'third') ? 'active' : ''}`" @click="toggleStatus('third')">Third Time</div>
                        <div :class="`status ${(status == 'fourth') ? 'active' : ''}`" @click="toggleStatus('fourth')">Fourth Time &amp; Above</div>
                    </div>
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Sign Up</th>
                                <th class="stick">First Class</th>
                                <th class="stick">Last Class</th>
                                <th class="stick">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.customers.data.length > 0">
                            <tr v-for="(data, key) in res.customers.data" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <nuxt-link class="table_data_link" :to="`/customers/${data.id}/packages`">{{ data.last_name }} {{ data.last_name }}</nuxt-link>
                                    </div>
                                </td>
                                <td>{{ $moment().format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment().format('MMMM DD, YYYY') }}</td>
                                <td>{{ $moment().format('MMMM DD, YYYY') }}</td>
                                <td>Sample</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" />
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            return {
                range: {
                    start: new Date(),
                    end: new Date()
                },
                loaded: false,
                rowCount: 0,
                status: 'first',
                res: [],
                types: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(`api/customers/search`, formData).then(res => {
                    me.res = res.data
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'roles'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'role'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleStatus (value) {
                const me = this
                me.status = value
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers?enabled=${value}`).then(res => {
                    me.res = res.data
                    me.loaded = true
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            fetchTypes () {
                const me = this
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.types = res.data.customerTypes
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            me.fetchTypes()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
