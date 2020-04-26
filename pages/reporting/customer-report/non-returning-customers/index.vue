<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Non Returning Customers</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Customers who only made 1 package purchase.</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="class_package_id">Class Package</label>
                                <select class="default_select alternate" name="class_package_id">
                                    <option value="" selected>All Class Package</option>
                                    <option :value="class_package.id" v-for="(class_package, key) in class_packages" :key="key">{{ class_package.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date</label>
                                <input type="date" name="start_date" v-model="form.start_date" class="default_text date" />
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date</label>
                                <input type="date" name="end_date" v-model="form.end_date"  class="default_text date" />
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Last Package Used</th>
                                <th class="stick">Date Purchased/Date Activated</th>
                                <th class="stick">Last Class</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <div class="thumb">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                        <div class="table_image_default" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <nuxt-link class="table_data_link" :to="`/customers/${data.id}/packages`" table_action_text>{{ data.first_name }} {{ data.last_name }}</nuxt-link>
                                    </div>
                                </td>
                                <td>{{ data.userPackageCounts[0].class_package.name }}</td>
                                <td>{{ $moment(data.userPackageCounts[0].last_avail_date).format('MMMM DD, YYYY') }} / {{ (data.userPackageCounts[0].activation_date != 'NA') ? $moment().format('MMMM DD, YYYY') : 'N/A' }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].updated_at).format('MMMM DD, YYYY') : 'N/A' }}</td>
                                <td>{{ (data.customer_details != null) ? data.customer_details.co_contact_number : 'N/A' }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ (data.customer_details != null) ? data.customer_details.pa_city : 'N/A' }}</td>
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
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                loaded: false,
                rowCount: 0,
                res: [],
                class_packages: [],
                form: {
                    start_date: this.$moment('2020-01-01').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.customers
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.customers
                            me.$axios.get('api/packages/class-packages?enabled=1').then(res => {
                                if (res.data) {
                                    me.class_packages = res.data.classPackages.data
                                }
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
