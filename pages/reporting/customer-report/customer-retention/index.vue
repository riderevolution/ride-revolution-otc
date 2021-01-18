<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Customer Retention</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Returning Customers</h2>
                        </div>
                        <div class="actions"></div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content" class="alternate_2">
                    <div class="cms_taxonomy">
                        <div class="taxonomy_wrapper" v-for="(data, key) in res" :key="key">
                            <div class="taxonomy_body">
                                <div class="taxonomy_header">
                                    <h2 class="header_title">{{ data.name }}</h2>
                                    <div class="taxonomy_actions">
                                        <div class="action_btn alternate" @click="getCustomers(data)" v-if="data.count > 0">
                                            Export
                                        </div>
                                        <download-csv
                                            v-if="data.count > 0"
                                            class="hidden me"
                                            :data="customerRetentionAttributes"
                                            :name="`customer-retention-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                            Export
                                        </download-csv>
                                    </div>
                                </div>
                                <div class="taxonomy_content">
                                    <table class="cms_table_taxonomy">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Sign Up Date</th>
                                                <th>Last Package Used</th>
                                                <th>Last Class</th>
                                            </tr>
                                        </thead>
                                        <tbody v-if="data.values.length > 0">
                                            <tr v-for="(data, key) in data.values" :key="key">
                                                <td>
                                                    <div class="thumb">
                                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path != null" />
                                                        <div class="table_image_default" v-else>
                                                            <div class="overlay">
                                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                                            </div>
                                                        </div>
                                                        <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                                                    </div>
                                                </td>
                                                <td>{{ $moment(data.created_at).format('MMM DD, YYYY') }}</td>
                                                <td>{{ data.latest_user_package_count.class_package.name }}</td>
                                                <td>{{ (data.latest_user_package_count.latest_booking) ? $moment(data.latest_user_package_count.latest_booking.scheduled_date.date).format('MMM DD, YYYY') : 'No Class Yet' }}</td>
                                            </tr>
                                        </tbody>
                                        <tbody class="no_results" v-else>
                                            <tr>
                                                <td :colspan="rowCount">No Result(s) Found.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '~/components/Foot'
    import Pagination from '~/components/Pagination'

    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Customer Retention',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                total: 0,
                res: [],
                values: [],
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            customerRetentionAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Member ID': value.member_id,
                        'Customer': value.fullname,
                        'Customer Type': value.customer_details.customer_type.name,
                        'Gender': me.getCustomerDetails(value, 'gender'),
                        'Birthdate': me.$moment(value.customer_details.co_birthdate).format('MMM DD, YYYY'),
                        'Contact Number': me.getCustomerDetails(value, 'contact_number'),
                        'Email Address': value.email,
                        'Weight': me.getCustomerDetails(value, 'weight'),
                        'Shoe Size': me.getCustomerDetails(value, 'shoe_size'),
                        'Dumbbell': me.getCustomerDetails(value, 'dumbbell'),
                        'Personal Address': me.getCustomerDetails(value, 'personal'),
                        'Billing Address': me.getCustomerDetails(value, 'billing'),
                        'Sign Up Date': me.$moment(value.created_at).format('MMMM DD, YYYY'),
                        'Last Package Used': value.latest_user_package_count.class_package.name,
                        'Last Class': (value.latest_user_package_count.latest_booking) ? me.$moment(value.latest_user_package_count.latest_booking.scheduled_date.date).format('MMM DD, YYYY') : 'No Class Yet',
                        'Date Purchased': me.$moment(value.latest_user_package_count.created_at).format('MMM DD, YYYY'),
                        'Date Activated': (value.latest_user_package_count.activation_date != 'NA') ? me.$moment(value.latest_user_package_count.activation_date).format('MMM DD, YYYY') : 'Not Activated',
                        'Date of Completion': me.getCustomerDetails(value, 'completion'),
                        'Date of Expiration': me.getCustomerDetails(value, 'expired')
                    }))
                ]
            }
        },
        methods: {
            getCustomerDetails (data, type) {
                const me = this
                let result = ''

                switch (type) {
                    case 'gender':
                        result = (data.customer_details.co_sex) ? (data.customer_details.co_sex == 'F' ? 'Female' : 'Male') : 'N/A'
                        break
                    case 'contact_number':
                        result = (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A'
                        break
                    case 'weight':
                        result = (data.customer_details.co_weight) ? data.customer_details.co_weight : 'N/A'
                        break
                    case 'shoe_size':
                        result = (data.customer_details.co_shoe_size) ? data.customer_details.co_shoe_size : 'N/A'
                        break
                    case 'dumbbell':
                        result = (data.customer_details.dumbbell) ? data.customer_details.dumbbell : 'N/A'
                        break
                    case 'personal':
                        if (data.customer_details.pa_address) {
                            result += data.customer_details.pa_address
                            if (data.customer_details.pa_address_2) {
                                result += `, ${data.customer_details.pa_address_2}`
                            }
                            if (data.customer_details.pa_zip_code) {
                                result += `, ${data.customer_details.pa_zip_code}`
                            }
                            if (data.customer_details.personal_state) {
                                result += `, ${data.customer_details.personal_state}`
                            }
                            if (data.customer_details.personal_country) {
                                result += `, ${data.customer_details.personal_country}`
                            }
                        } else {
                            result = 'N/A'
                        }
                        break
                    case 'billing':
                        if (data.customer_details.ba_address) {
                            result += data.customer_details.ba_address
                            if (data.customer_details.ba_address_2) {
                                result += `, ${data.customer_details.ba_address_2}`
                            }
                            if (data.customer_details.ba_zip_code) {
                                result += `, ${data.customer_details.ba_zip_code}`
                            }
                            if (data.customer_details.billing_state) {
                                result += `, ${data.customer_details.billing_state}`
                            }
                            if (data.customer_details.billing_country) {
                                result += `, ${data.customer_details.billing_country}`
                            }
                        } else {
                            result = 'N/A'
                        }
                        break
                    case 'completion':
                        result = me.$moment(data.latest_user_package_count.updated_at).format('MMM DD, YYYY')
                        break
                    case 'expired':
                        if (data.latest_user_package_count.computed_expiration_date != null) {
                            result = me.$moment(data.latest_user_package_count.computed_expiration_date, 'YYYY-MM-DD hh:mm:ss').format('MMM DD, YYYY')
                        } else {
                            result = me.$moment(data.latest_user_package_count.expiry_date_if_not_activated, 'YYYY-MM-DD hh:mm:ss').format('MMM DD, YYYY')
                        }
                        break
                }

                return result
            },
            getCustomers (data) {
                const me = this
                me.values = []
                let formData = new FormData(document.getElementById('filter'))
                formData.append('retention_type', data.unique)

                me.loader(true)
                me.$axios.post('api/reporting/customers/customer-retention', formData).then(res => {
                    if (res.data) {
                        me.values = res.data.export
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.loader(true)
                me.filter = true
                me.$axios.post(`api/reporting/customers/customer-retention`, formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data.retentions
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)

                me.$axios.post('api/reporting/customers/customer-retention', formData).then(res => {
                    setTimeout( () => {
                        me.res = res.data.retentions
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
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
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
