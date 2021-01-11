<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
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
                            <a :href="`/print/reporting/customer/non-returning-customers?class_package_id=${form.class_package_id}&date=${form.date}`" target="_blank" class="action_btn alternate">Print</a>
                            <div class="action_btn alternate" @click="getCustomers()" v-if="res.customers.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.customers.data.length > 0"
                                class="hidden me"
                                :data="nonReturningCustomersAttributes"
                                :name="`non-returning-customers-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="class_package_id">Class Package</label>
                                <select class="default_select alternate" name="class_package_id" v-model="form.class_package_id">
                                    <option value="" selected>All Class Package</option>
                                    <option :value="class_package.id" v-for="(class_package, key) in class_packages" :key="key">{{ class_package.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="date">Date <span>*</span></label>
                                <v-ctk v-model="form.date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'date'" :name="'date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('date')">{{ properFormat(errors.first('date')) }}</span></transition>
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
                                <th class="stick">Purchase/Activation Date</th>
                                <th class="stick">Status</th>
                                <th class="stick">Completion/Expiration Date</th>
                                <th class="stick">Last Class</th>
                                <th class="stick">Preferred Studio</th>
                                <th class="stick">Preferred Instructor</th>
                                <th class="stick">Total Rides</th>
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
                                        <div class="table_data_link" @click="openWindow(`/customers/${data.id}/packages`)">{{ data.fullname }}</div>
                                    </div>
                                </td>
                                <td>{{ data.latest_user_package_count.class_package.name }}</td>
                                <td>{{ $moment(data.latest_user_package_count.created_at).format('MMM DD, YYYY') }} / {{ (data.latest_user_package_count.activation_date != 'NA') ? $moment(data.latest_user_package_count.activation_date).format('MMM DD, YYYY') : 'Not Activated' }}</td>
                                <td class="alt_2">{{ replacer(data.latest_user_package_count.how_it_died) }}</td>
                                <td>{{ getCustomerDetails(data, 'completion') }} / {{ getCustomerDetails(data, 'expired') }}</td>
                                <td>{{ (data.latest_user_package_count.latest_booking) ? $moment(data.latest_user_package_count.latest_booking.scheduled_date.date).format('MMM DD, YYYY') : 'No Class Yet' }}</td>
                                <td>{{ (data.preferred_studio) ? data.preferred_studio : 'No Preferred Studio' }}</td>
                                <td>{{ (data.preferred_instructor) ? data.preferred_instructor : 'No Preferred Instructor' }}</td>
                                <td>{{ totalItems(data.ridesCount) }}</td>
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
            const value = []
            return {
                name: 'Non Returning Customers',
                access: true,
                filter: true,
                loaded: false,
                rowCount: 0,
                res: [],
                values: [],
                class_packages: [],
                form: {
                    class_package_id: '',
                    date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            nonReturningCustomersAttributes () {
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
                        'Package Status': me.replacer(value.latest_user_package_count.how_it_died),
                        'Last Class': (value.latest_user_package_count.latest_booking) ? $moment(value.latest_user_package_count.latest_booking.scheduled_date.date).format('MMM DD, YYYY') : 'No Class Yet',
                        'Date Purchased': me.$moment(value.latest_user_package_count.created_at).format('MMM DD, YYYY'),
                        'Date Activated': (value.latest_user_package_count.activation_date != 'NA') ? $moment(value.latest_user_package_count.activation_date).format('MMM DD, YYYY') : 'Not Activated',
                        'Date of Completion': me.getCustomerDetails(value, 'completion'),
                        'Date of Expiration': me.getCustomerDetails(value, 'expired'),
                        'Preferred Studio': (value.preferred_studio) ? value.preferred_studio : 'No Preferred Studio',
                        'Preferred Instructor': (value.preferred_instructor) ? value.preferred_instructor : 'No Preferred Instructor',
                        'Total Rides': me.totalItems(value.ridesCount)
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
            getCustomers () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('all', 1)
                me.values = []
                me.loader(true)
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
                    if (res.data) {
                        res.data.customers.forEach((item, key) => {
                            me.values.push(item)
                        })
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
            submitFilter () {
                const me = this
                me.filter = true
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
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
                formData.append('date', me.form.date)
                me.$axios.post('api/reporting/customers/non-returning-customers', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
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
            }, 500)
        }
    }
</script>
