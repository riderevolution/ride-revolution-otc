<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Customer Accounts</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">{{ getSubtitle() }}</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getCustomers()">
                                Export
                            </div>
                            <download-csv
                                v-if="res.customers.data.length > 0"
                                class="hidden me"
                                :data="customerAccountsAttributes"
                                :name="`customer-accounts-${$moment(form.start_date).format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <input type="hidden" name="status" v-model="type">
                            <div class="form_group alternate">
                                <label for="q">Find a Customer</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate" v-model="form.query">
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'" :max-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select start date'" v-validate="'required'" :max-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total: {{ totalItems(total) }}</div>
                        <div :class="`status ${(type == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                        <div :class="`status ${(type == 'active') ? 'active' : ''}`" @click="toggleTab('active')">Active</div>
                        <div :class="`status ${(type == 'inactive') ? 'active' : ''}`" @click="toggleTab('inactive')">Inactive</div>
                        <div :class="`status ${(type == 'unused') ? 'active' : ''}`" @click="toggleTab('unused')">Unused</div>
                        <div :class="`status ${(type == 'deactivated') ? 'active' : ''}`" @click="toggleTab('deactivated')">Deactivated</div>
                    </div>
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">Customer</th>
                                <th class="stick">Member ID</th>
                                <th class="stick">Sign Up Date</th>
                                <th class="stick">Preferred Studio</th>
                                <th class="stick">First Class</th>
                                <th class="stick">Last Class</th>
                                <th class="stick">Contact Number</th>
                                <th class="stick">Email Address</th>
                                <th class="stick">City</th>
                                <th class="stick">Action</th>
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
                                <td>{{ data.member_id }}</td>
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY') }}</td>
                                <td>{{ (data.preferred_studio.length > 0) ? data.preferred_studio[0].name  : 'No Preferred' }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : 'No Class Yet' }}</td>
                                <td>{{ (data.bookings.length > 0) ? $moment(data.bookings[data.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : 'No Class Yet' }}</td>
                                <td>{{ (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A' }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ (data.customer_details.pa_city != null) ? data.customer_details.pa_city : 'N/A' }}</td>
                                <td>
                                    <div class="table_actions">
                                        <a class="table_action_cancel" @click.self="customerStatus(data, 'deactivate')" href="javascript:void(0)" v-if="data.enabled">Deactivate</a>
                                        <a class="table_action_success" @click.self="customerStatus(data, 'activate')" href="javascript:void(0)"  v-else>Activate</a>
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
                    <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" />
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
            <transition name="fade">
                <customer-prompt :status="promptMessage" ref="enabled" v-if="$store.state.customerPromptStatus" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import CustomerPrompt from '~/components/modals/CustomerPrompt'
    import Pagination from '~/components/Pagination'
    import Foot from '~/components/Foot'

    export default {
        components: {
            CustomerPrompt,
            Pagination,
            Foot
        },
        data () {
            return {
                name: 'Customer Accounts',
                access: true,
                loaded: false,
                filter: true,
                rowCount: 0,
                type: 'all',
                promptMessage: '',
                res: [],
                users: [],
                total: 0,
                form: {
                    query: '',
                    enabled: 1,
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            customerAccountsAttributes () {
                const me = this
                return [
                    ...me.users.map((value, key) => ({
                        'Member ID': value.member_id,
                        'Customer': value.fullname,
                        'Preferred Studio': (value.preferred_studio.length > 0) ? value.preferred_studio[0].name : 'No Preferred Studio',
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
                        'First Class': (value.bookings.length > 0) ? me.$moment(value.bookings[0].scheduled_date.date).format('MMMM DD, YYYY') : 'No Class Yet',
                        'Last Class': (value.bookings.length > 0) ? me.$moment(value.bookings[value.bookings.length - 1].scheduled_date.date).format('MMMM DD, YYYY') : 'No Class Yet'
                    }))
                ]
            }
        },
        methods: {
            customerStatus (data, type) {
                const me = this
                if (data.enabled) {
                    me.promptMessage = 'Deactivate'
                } else {
                    me.promptMessage = 'Activate'
                }
                me.$store.state.customerPromptStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'users'
                    me.$refs.enabled.confirm.id = data.id
                    me.$refs.enabled.confirm.enabled = (type == 'deactivate') ? 0 : 1
                    me.$refs.enabled.confirm.status = (type == 'deactivate') ? 'deactivated' : 'activated'
                    me.$refs.enabled.confirm.type = 'user'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            submissionSuccess () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))

                me.$axios.post('api/reporting/customers/customer-accounts', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.count
                            if (!me.loaded) {
                                me.loaded = true
                            }
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                    }, 500)
                })
            },
            getSubtitle () {
                const me = this
                let subtitle = ''

                switch (me.type) {
                    case 'inactive':
                        subtitle = 'No Activity (Purchase or Booking) 1 Month before the start date'
                        break
                    case 'unused':
                        subtitle = 'No Activity since the beginning'
                        break
                    default:
                        subtitle = 'Accounts of Ride Revolution members'
                }

                return subtitle
            },
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
                }

                return result
            },
            getCustomers () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []
                me.loader(true)

                me.$axios.post('api/reporting/customers/customer-accounts?all=1', formData).then(res => {
                    if (res.data) {

                        res.data.customers.forEach((item, key) => {
                            me.users.push(item)
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
            toggleTab (value) {
                const me = this
                me.type = value
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))

                me.$axios.post('api/reporting/customers/customer-accounts', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.count
                            if (!me.loaded) {
                                me.loaded = true
                            }
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.loader(false)
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()

                formData.append('status', me.type)
                formData.append('q', me.form.query)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)

                me.$axios.post('api/reporting/customers/customer-accounts', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.count
                            if (!me.loaded) {
                                me.loaded = true
                            }
                        }, 500)
                    }
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
        mounted () {
            const me = this
            me.checkPagePermission(me)
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
