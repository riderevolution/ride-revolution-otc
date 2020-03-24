<template>
    <div class="customer_tab_content">
        <div v-if="type == 'packages' && loaded">
            <div class="cms_table_toggler">
                <div :class="`status ${(packageStatus == 1) ? 'active' : ''}`" @click="togglePackages(1)">Owned</div>
                <div :class="`status ${(packageStatus == 2) ? 'active' : ''}`" @click="togglePackages(2)">Transferred</div>
                <div :class="`status ${(packageStatus == 3) ? 'active' : ''}`" @click="togglePackages(3)">Shared</div>
                <div :class="`status ${(packageStatus == 4) ? 'active' : ''}`" @click="togglePackages(4)">Frozen</div>
                <div :class="`status ${(packageStatus == 5) ? 'active' : ''}`" @click="togglePackages(5)">Expired</div>
            </div>
            <div class="cms_table_package" v-if="value.user_package_counts.length > 0">
                <div class="table_package" v-for="(data, key) in value.user_package_counts" :key="key" v-if="data.count > 0">
                    <h2 class="package_title">
                        {{ data.class_package.name }}
                        <span :class="`${addViolatorClass(data)}`">{{ checkWarning(data) }}</span>
                    </h2>
                    <div class="package_details">
                        <div class="package_status">
                            <div class="box">
                                <div class="overlay">
                                    <p>{{ parseInt(data.original_package_count) - parseInt(data.count) }}</p>
                                    <label>Used</label>
                                </div>
                            </div>
                            <div class="box margin">
                                <div class="overlay">
                                    <p>{{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : (parseInt(data.count) == data.original_package_count) ? parseInt(data.original_package_count) : parseInt(data.count) }}</p>
                                    <label>Available</label>
                                </div>
                            </div>
                        </div>
                        <div class="package_date">
                            <div class="date">
                                <p>{{ formatDate(data.created_at, false) }} / {{ (data.activation_date != 'NA') ? formatDate(data.activation_date, false) : 'N/A' }}</p>
                                <label>Purchase Date / Activation Date</label>
                            </div>
                            <div class="date margin">
                                <p>{{ (data.class_package.computed_expiration_date) ? formatDate(data.class_package.computed_expiration_date, false) : 'N/A' }}</p>
                                <label>Expiry date <a href="javascript:void(0)" class="expiry_btn">Edit</a></label>
                            </div>
                        </div>
                        <div class="package_action">
                            <a href="/booker" class="action_success_btn" @click.prevent="getCurrentCustomer()">Book a Class</a>
                            <div class="package_options">
                                <div class="option_btn" :id="`option_${key}`" @click.self="toggledOption($event)">Options</div>
                                <div class="option_selector">
                                    <a href="javascript:void(0)" class="option_link">Transfer Package</a>
                                    <a href="javascript:void(0)" class="option_link">Share Package</a>
                                    <a href="javascript:void(0)" class="option_link">Freeze Package</a>
                                    <a href="javascript:void(0)" class="option_link">Print Receipt</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="no_results" v-if="value.user_package_counts.length == 0">
                    No Package(s) Found.
                </div>
            </div>
        </div>
        <div v-if="type == 'badges' && loaded">
            <div class="cms_col_five">
                <div :class="`cms_col ${(badge.earned_on != null) ? '' : 'not'}`" v-for="(badge, key) in value.badges" :key="key">
                    <div class="badge"><img :src="badge.badge_image" /></div>
                    <div class="info">
                        <h2>{{ badge.description }}</h2>
                        <p v-if="badge.earned_on != null">Earned on: {{ formatClassDate(badge.earned_on, false) }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type == 'upcoming-classes' && loaded">
            <table class="cms_table">
                <thead>
                    <tr>
                        <th>Date &amp; Time</th>
                        <th>Bike No.</th>
                        <th>Class</th>
                        <th>Studio</th>
                        <th>Instructor</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Series ID</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody v-if="value.upcomingClasses.length > 0">
                    <tr v-for="(data, key) in value.upcomingClasses" :key="key">
                        <td><div class="table_data_link link" @click="toggleLayout(data.scheduled_date.schedule.studio.id, data.scheduled_date_id)">{{ formatClassDate(data.created_at, true) }}</div></td>
                        <td>{{ data.seat.number }}</td>
                        <td>{{ data.scheduled_date.schedule.class_type.name }}</td>
                        <td>{{ data.scheduled_date.schedule.studio.name }}</td>
                        <td>
                            <div class="thumb">
                                <img :src="data.instructor.user.instructor_details.images[0].path_resized" />
                                <nuxt-link class="table_data_link" to="/">{{ data.instructor.user.first_name }} {{ data.instructor.user.last_name }}</nuxt-link>
                            </div>
                        </td>
                        <td>
                            <div class="table_select" v-if="data.guestBookings && data.guestBookings.length > 0">
                                <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">{{ data.guestBookings.length }} Guests</div>
                                <div class="overlay">
                                    <ul>
                                        <li v-for="(subData, key) in data.guestBookings" :key="key" v-line-clamp="1">{{ subData.seat.number }} - {{ subData.guest_first_name }} {{ subData.guest_last_name }}</li>
                                    </ul>
                                </div>
                            </div>
                            <p v-else>N/A</p>
                        </td>
                        <td class="alt">{{ data.status }}</td>
                        <td>
                            <p>{{ data.class_package.name }}</p>
                            <p class="id">{{ data.class_package.sku_id }}</p>
                        </td>
                        <td>
                            <div class="full table_actions" v-if="data.status == 'reserved'">
                                <div class="table_action_success link" @click="getCurrentCustomer()">Sign In</div>
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
            <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
        </div>
        <div v-if="type == 'class-history' && loaded">
            <div class="actions">
                <div class="total">Total: 4</div>
                <div class="cms_table_toggler">
                    <div :class="`status ${(classesHistoryStatus == 1) ? 'active' : ''}`" @click="toggleClassesHistory('all')">All</div>
                    <div :class="`status ${(classesHistoryStatus == 2) ? 'active' : ''}`" @click="toggleClassesHistory('completed')">Completed</div>
                    <div :class="`status ${(classesHistoryStatus == 3) ? 'active' : ''}`" @click="toggleClassesHistory('no-show')">No Show</div>
                    <div :class="`status ${(classesHistoryStatus == 4) ? 'active' : ''}`" @click="toggleClassesHistory('cancelled')">Cancelled</div>
                </div>
            </div>
            <table class="cms_table">
                <thead>
                    <tr>
                        <th>Date &amp; Time</th>
                        <th>Bike No.</th>
                        <th>Class</th>
                        <th>Studio</th>
                        <th>Instructor</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Series ID</th>
                    </tr>
                </thead>
                <tbody v-if="value.classHistory.length > 0">
                    <tr v-for="(data, key) in res.classHistory" :key="key">
                        <td>{{ formatClassDate(data.created_at, true) }}</td>
                        <td>{{ data.seat.number }}</td>
                        <td>{{ data.scheduled_date.schedule.class_type.name }}</td>
                        <td>{{ data.scheduled_date.schedule.studio.name }}</td>
                        <td>
                            <div class="thumb">
                                <img :src="data.instructor.user.instructor_details.images[0].path_resized" />
                                <nuxt-link class="table_data_link" to="/">{{ data.instructor.user.first_name }} {{ data.instructor.user.last_name }}</nuxt-link>
                            </div>
                        </td>
                        <td>
                            <div class="table_select" v-if="data.guestBookings && data.guestBookings.length > 0">
                                <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">{{ data.guestBookings.length }} Guests</div>
                                <div class="overlay">
                                    <ul>
                                        <li v-for="(subData, key) in data.guestBookings" :key="key" v-line-clamp="1">{{ subData.seat.number }} - {{ subData.guest_first_name }} {{ subData.guest_last_name }}</li>
                                    </ul>
                                </div>
                            </div>
                            <p v-else>N/A</p>
                        </td>
                        <td class="alt">{{ checkStatus(data) }}</td>
                        <td>
                            <p>{{ data.class_package.name }}</p>
                            <p class="id">{{ data.class_package.sku_id }}</p>
                        </td>
                    </tr>
                </tbody>
                <tbody class="no_results" v-else>
                    <tr>
                        <td :colspan="rowCount">No Result(s) Found.</td>
                    </tr>
                </tbody>
            </table>
            <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
        </div>
        <div v-if="type == 'transactions' && loaded">
            <div class="cms_table_accordion alt">
                <div class="header_wrapper">
                    <div class="accordion_header">Transanction Date</div>
                    <div class="accordion_header">Branch</div>
                    <div class="accordion_header">Total Qty.</div>
                    <div class="accordion_header">Payment Method</div>
                    <div class="accordion_header">Total Price</div>
                    <div class="accordion_header action">Status</div>
                </div>
                <div :class="`content_wrapper ${(data.open) ? 'toggled' : ''} ${(data.status == 'paid') ? 'alt' : ''}`" v-for="(data, key) in res.data" v-if="res.data.length > 0">
                    <div class="toggler" @click="toggleAccordion($event, key)"></div>
                    <div class="content_headers">
                        <div class="accordion_content">{{ formatDate(data.created_at, true) }}</div>
                        <div class="accordion_content">{{ (data.studio_id != null) ? data.studio.name : 'Website' }}</div>
                        <div class="accordion_content">{{ countVariantQty(data.payment_items) }}</div>
                        <div class="accordion_content capital">{{ replacer(data.payment_method.method) }}</div>
                        <div :class="`accordion_content ${(data.status == 'pending') ? 'red' : ''}`">Php {{ totalCount(data.total) }}</div>
                        <div class="accordion_actions action">
                            <div :class="`action_status ${(data.status == 'paid') ? 'green' : 'red' }`">{{ data.status }}</div>
                            <a class="accordion_action_edit" href="javascript:void(0)" @click="toggleForm(data.id)" v-if="data.status == 'pending'">Pay Now</a>
                        </div>
                    </div>
                    <div class="accordion_table">
                        <table class="cms_table">
                            <thead>
                                <tr>
                                    <th class="padding_left">Product</th>
                                    <th>Category</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody v-if="data.payment_items.length > 0">
                                <tr v-for="(item, key) in data.payment_items" :key="key">
                                    <td class="padding_left"><b>{{ (item.type == 'custom-gift-card') ? 'Digital Gift Card - ' : (item.type == 'physical-gift-card' ? 'Physical Gift Card - ' : '') }}</b> {{ (item.product_variant) ? `${item.product_variant.product.name} ${item.product_variant.variant}` : (item.class_package ? item.class_package.name : (item.store_credit ? item.store_credit.name : item.gift_card.card_code )) }}</td>
                                    <td>{{ (item.product_variant) ? item.product_variant.product.category.name : 'N/A' }}</td>
                                    <td>{{ item.quantity }}</td>
                                    <td class="price">
                                        <p :class="`${(data.promo_code_used !== null) ? 'prev_price' : ''}`" >PHP {{ totalCount(item.total) }}</p>
                                        <p v-if="data.promo_code_used !== null">PHP {{ totalCount(item.originalTotal) }}</p>
                                    </td>
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
                <div class="no_results" v-if="res.data.length == 0">
                    No Result(s) Found.
                </div>
            </div>
            <pagination :apiRoute="`api/customers/${$route.params.param}/${$route.params.slug}`" :current="res.current_page" :last="res.last_page" :total="res.total" />
            <button type="button" class="hidden" id="transactions" @click="populateTransactions()"></button>
        </div>
        <div v-if="type == 'details' && loaded">
            <div id="default_form">
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Customer Overview</h2>
                        <div class="form_check toggler">
                            <input type="hidden" id="is_promo" name="is_promo" class="action_check" :value="(value.enabled) ? 1 : 0">
                            <div :class="`toggle alt ${(value.enabled) ? 'active' : ''}`" @click="toggledPrompt(value)"></div>
                            <label for="is_promo">{{ (value.enabled) ? 'Activated' : 'Deactivated' }}</label>
                        </div>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Name</label>
                            <p>{{ value.first_name }} {{ value.last_name }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Email</label>
                            <p>{{ value.email }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Phone Number</label>
                            <p>{{ value.customer_details.co_contact_number }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Birthdate</label>
                            <p>{{ formatClassDate(value.customer_details.co_birthdate, false) }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Gender</label>
                            <p class="alt">{{ value.customer_details.co_sex }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Occupation</label>
                            <p>{{ value.customer_details.profession }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Customer Type</label>
                            <p>{{ value.customer_details.customer_type.name }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Rewards Membership</label>
                            <p>Black</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Personal Address</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Address</label>
                            <p>{{ value.customer_details.pa_address_1 }}, {{ value.customer_details.pa_address_2 }}</p>
                        </div>
                        <div class="wrapper">
                            <label>City</label>
                            <p>{{ value.customer_details.pa_city }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Billing Address</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Address</label>
                            <p>{{ value.customer_details.ba_address_1 }}, {{ value.customer_details.ba_address_2 }}</p>
                        </div>
                        <div class="wrapper">
                            <label>City</label>
                            <p>{{ value.customer_details.ba_city }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Top 5 Instructors</h2>
                    </div>
                    <div class="form_overview_instructor">
                        <div class="left">
                            <div class="image">
                                <div class="instructor_image"></div>
                                <div class="sequence"><span>1</span></div>
                            </div>
                            <h2>Bruce Lee</h2>
                            <p>Total Rides: 10</p>
                        </div>
                        <div class="right">
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>2</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>3</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>4</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>5</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <transition name="fade">
            <customer-pending-quick-sale :value="transaction" v-if="$store.state.customerPendingQuickSaleStatus" />
        </transition>
        <transition name="fade">
            <customer-prompt :status="promptMessage" ref="enabled" v-if="$store.state.customerPromptStatus" />
        </transition>
    </div>
</template>

<script>
    import CustomerPrompt from '../components/modals/CustomerPrompt'
    import CustomerPendingQuickSale from '../components/modals/CustomerPendingQuickSale'
    import Pagination from '../components/Pagination'
    export default {
        components: {
            CustomerPrompt,
            CustomerPendingQuickSale,
            Pagination
        },
        props: {
            type: {
                type: String,
                default: 'packages'
            },
            value: {
                default: null
            }
        },
        data () {
            return {
                rowCount: 0,
                promptMessage: '',
                isActivated: true,
                loaded: false,
                violatorClass: '',
                violator: {
                    warning: 0,
                    shared: 0,
                    transferred: 0,
                    freeze: 0,
                },
                packageStatus: 1,
                classesHistoryStatus: 1,
                res: [],
                transaction: []
            }
        },
        methods: {
            checkStatus (data) {
                const me = this
                let result = ''
                if (data.deleted_at != null) {
                    result = 'Cancelled'
                }
                switch (data.status) {
                    case 'signed-in':
                        result = 'Completed'
                        break
                    case 'no-show':
                        result = 'No Show'
                        break;
                }
                 return result
            },
            toggleLayout (studioId, scheduledDateID) {
                const me = this
                me.loader(true)
                me.$parent.layout.studio = studioId
                me.$parent.layout.schedule = scheduledDateID
                me.$store.state.upcomingClassesLayoutStatus = true
            },
            toggledPrompt (data) {
                const me = this
                if (data.enabled) {
                    me.promptMessage = 'Deactivate'
                } else {
                    me.promptMessage = 'Activate'
                }
                data.enabled ^= 1
                me.$store.state.customerPromptStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'users'
                    me.$refs.enabled.confirm.id = data.id
                    me.$refs.enabled.confirm.enabled = data.enabled
                    me.$refs.enabled.confirm.status = (data.enabled) ? 'activated' : 'deactivated'
                    me.$refs.enabled.confirm.type = 'user'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleGuest (event) {
                const me = this
                let element = event.target
                if (element.nextElementSibling.classList.contains('active')) {
                    element.nextElementSibling.classList.remove('active')
                } else {
                    element.nextElementSibling.classList.add('active')
                }
            },
            populateTransactions () {
                const me = this
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.res = res.data.customer.payments
                        if (me.res) {
                            me.$parent.pendingPayment = 0
                            me.res.data.forEach((payment, index) => {
                                if (payment.status == 'pending') {
                                    me.$parent.pendingPayment += parseFloat(payment.total)
                                }
                            })
                        }
                    }
                })
            },
            toggleForm (id) {
                const me = this
                me.$axios.get(`api/show-payment/${id}`).then(res => {
                    if (res.data) {
                        me.transaction = res.data.payment
                        me.$store.state.customerID = me.$route.params.param
                        me.$store.state.customerPendingQuickSaleStatus = true
                        document.body.classList.add('no_scroll')
                    }
                })
            },
            countVariantQty (items) {
                const me = this
                let ctr = 0
                items.forEach((item, index) => {
                    ctr += parseInt(item.quantity)
                })
                return ctr
            },
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.data[key].open ^= true
                if (me.res.data[key].open) {
                    target.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            getCurrentCustomer () {
                const me = this
                me.$axios.get(`api/customers/${me.$route.params.param}`).then(res => {
                    if (res.data) {
                        me.$store.state.customer = res.data.user
                        me.$store.state.customerID = res.data.user.id
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
                me.$router.push('/booker')
            },
            formatDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('MMM DD, YYYY hh:mm A')
                    } else {
                        return this.$moment(value).format('MMM DD, YYYY')
                    }
                }
            },
            formatClassDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('M/D/YY (ddd) h:mm A')
                    } else {
                        return this.$moment(value).format('MMMM DD, YYYY')
                    }
                }
            },
            checkWarning (data) {
                const me = this
                let sample = ''
                let expiry = me.$moment(data.class_package.computed_expiration_date)
                let current = me.$moment()
                if (parseInt(expiry.diff(current, 'days')) <= 15) {
                    sample = expiry.diff(current, 'days') + ' Days Left'
                    me.addViolatorClass(data)
                }
                return sample
            },
            addViolatorClass (data) {
                const me = this
                let expiry = me.$moment(data.class_package.computed_expiration_date)
                let current = me.$moment()
                if (parseInt(expiry.diff(current, 'days')) <= 15) {
                    return 'warning'
                }
            },
            toggledOption (event) {
                const me = this
                let element = event.target
                if (element.parentNode.classList.contains('toggled')) {
                    element.parentNode.classList.remove('toggled')
                } else {
                    element.parentNode.classList.add('toggled')
                }
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target
                if (me.value.user_package_counts) {
                    me.value.user_package_counts.forEach((result, index) => {
                        let option = document.getElementById(`option_${index}`)
                        if (option != null) {
                            if (option !== target && option !== target.parentNode.previousElementSibling) {
                                if (option.parentNode.classList.contains('toggled')) {
                                    option.parentNode.classList.remove('toggled')
                                }
                            }
                        }
                    })
                }
                if (me.$route.params.slug == 'class-history') {
                    for (let i = 0; i <= 2; i++) {
                        let element = document.getElementById(`table_select_${i}`)
                        if (element !== target) {
                            if (element.nextElementSibling.classList.contains('active')) {
                                element.nextElementSibling.classList.remove('active')
                            }
                        }
                    }
                }
            },
            togglePackages (status) {
                const me = this
                me.packageStatus = status
            },
            toggleClassesHistory (status) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}?classHistoryStatus=${status}`).then(res => {
                    console.log(res.data);
                //     if (res.data) {
                //         me.res = res.data.customers
                //     }
                // }).catch(err => {
                //     me.$store.state.errorList = err.response.data.errors
                //     me.$store.state.errorStatus = true
                // }).then(() => {
                //     me.rowCount = document.getElementsByTagName('th').length
                //     setTimeout( () => {
                //         me.classesHistoryStatus = status
                //         me.loader(false)
                //     }, 500)
                })
            },
        },
        mounted () {
            const me = this
            if (me.$route.params.slug == 'transactions') {
                me.res = me.value.payments
            } else {
                me.res = me.value
            }
            me.loaded = true
            setTimeout( () => {
                me.rowCount = document.getElementsByTagName('th').length
            }, 250)
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
