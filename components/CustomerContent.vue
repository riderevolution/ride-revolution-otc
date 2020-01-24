<template>
    <div class="customer_tab_content">
        <div v-if="type == 'packages' && loaded">
            <div class="cms_table_toggler">
                <div :class="`status ${(packageStatus == 1) ? 'active' : ''}`" @click="togglePackages(1)">Owned</div>
                <div :class="`status ${(packageStatus == 2) ? 'active' : ''}`" @click="togglePackages(2)">Shared</div>
            </div>
            <div class="cms_table_package">
                <div class="table_package" v-for="(data, key) in value.user_package_counts" :key="key" v-if="value.user_package_counts.length > 0">
                    <h2 class="package_title">
                        {{ data.class_package.name }}
                        <span class="warning" v-if="checkWarning(data)">{{ violator.warning }} Days Left</span>
                        <span class="shared">Shared with Sheena Villeta</span>
                    </h2>
                    <div class="package_details">
                        <div class="package_status">
                            <div class="box">
                                <div class="overlay">
                                    <p>{{ parseInt(data.class_package.class_count) - parseInt(data.count) }}</p>
                                    <label>Used</label>
                                </div>
                            </div>
                            <div class="box margin">
                                <div class="overlay">
                                    <p>{{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : (parseInt(data.count) == data.class_package.class_count) ? parseInt(data.class_package.class_count) : parseInt(data.count) }}</p>
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
                                <p>{{ formatDate(data.class_package.computed_expiration_date, false) }}</p>
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
        <div v-if="type == 'badges'">
            <div class="cms_col_five">
                <div class="cms_col" v-for="n in 10">
                    <div class="wrapper">
                        <div class="badge"><img src="/sample-badge.svg" /></div>
                        <div class="info">
                            <h2>Ride to Batangas</h2>
                            <p>Earned on: Apr 23, 2020</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type == 'upcoming-classes' && loaded">
            <table class="cms_table">
                <thead>
                    <tr>
                        <th>Date &amp; time</th>
                        <th>Bike No.</th>
                        <th>Class</th>
                        <th>Studio</th>
                        <th>instructor</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Series ID</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(n, key) in 3" :key="key">
                        <td><div class="table_data_link link" @click="toggleLayout(n, 21550)">{{ formatClassDate('January 01, 2020 12:00', true) }}</div></td>
                        <td>5</td>
                        <td>Ride Rev</td>
                        <td>Greenbelt 5</td>
                        <td class="thumb">
                            <!-- <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images.length > 0" /> -->
                            <div class="table_image_default">
                                CR
                            </div>
                            <nuxt-link class="table_data_link" to="/">Billie Capistrano</nuxt-link>
                        </td>
                        <td>
                            <div class="table_select" v-if="key != 1">
                                <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">3 Guests</div>
                                <div class="overlay">
                                    <ul>
                                        <li v-line-clamp="1">16 - Sample Name</li>
                                        <li v-line-clamp="1">4 - Jennifer Castillo</li>
                                        <li v-line-clamp="1">1 - Edcel Games</li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                        <td>Completed</td>
                        <td>
                            <p>Singe Class Package</p>
                            <p class="id">854585961462367501</p>
                        </td>
                        <td class="table_actions full">
                            <div class="table_action_success link" @click="getCurrentCustomer()">Sign In</div>
                        </td>
                    </tr>

                </tbody>
                <!-- <tbody class="no_results" v-else>
                    <tr>
                        <td :colspan="rowCount">No Result(s) Found.</td>
                    </tr>
                </tbody> -->
            </table>
            <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
        </div>
        <div v-if="type == 'class-history' && loaded">
            <div class="actions">
                <div class="total">Total: 4</div>
                <div class="cms_table_toggler">
                    <div :class="`status ${(classesHistoryStatus == 1) ? 'active' : ''}`" @click="toggleClassesHistory(1)">All</div>
                    <div :class="`status ${(classesHistoryStatus == 2) ? 'active' : ''}`" @click="toggleClassesHistory(2)">Completed</div>
                    <div :class="`status ${(classesHistoryStatus == 3) ? 'active' : ''}`" @click="toggleClassesHistory(3)">No Show</div>
                    <div :class="`status ${(classesHistoryStatus == 4) ? 'active' : ''}`" @click="toggleClassesHistory(4)">Cancelled</div>
                </div>
            </div>
            <table class="cms_table">
                <thead>
                    <tr>
                        <th>Date &amp; time</th>
                        <th>Bike No.</th>
                        <th>Class</th>
                        <th>Studio</th>
                        <th>instructor</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Series ID</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(n, key) in 3"  :key="key">
                        <td>{{ formatClassDate('January 01, 2020 12:00', true) }}</td>
                        <td>5</td>
                        <td>Ride Rev</td>
                        <td>Greenbelt 5</td>
                        <td class="thumb">
                            <!-- <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images.length > 0" /> -->
                            <div class="table_image_default">
                                CR
                            </div>
                            <nuxt-link class="table_data_link" to="/">Billie Capistrano</nuxt-link>
                        </td>
                        <td>
                            <div class="table_select" v-if="key != 1">
                                <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">3 Guests</div>
                                <div class="overlay">
                                    <ul>
                                        <li v-line-clamp="1">16 - Sample Name</li>
                                        <li v-line-clamp="1">4 - Jennifer Castillo</li>
                                        <li v-line-clamp="1">1 - Edcel Games</li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                        <td>Completed</td>
                        <td>
                            <p>Singe Class Package</p>
                            <p class="id">854585961462367501</p>
                        </td>
                    </tr>

                </tbody>
                <!-- <tbody class="no_results" v-else>
                    <tr>
                        <td :colspan="rowCount">No Result(s) Found.</td>
                    </tr>
                </tbody> -->
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
                        <div class="accordion_content">{{ data.studio.name }}</div>
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
                        <div class="form_check toggler" @click="toggledPrompt()">
                            <input type="hidden" id="is_promo" name="is_promo" class="action_check" :value="(isActivated) ? 1 : 0">
                            <div :class="`toggle ${(isActivated) ? 'active' : ''}`"></div>
                            <label for="is_promo">{{ (isActivated) ? 'Activated' : 'Deactivated' }}</label>
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
                            <label>Password</label>
                            <p>*******</p>
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
                            <p>{{ value.customer_details.co_sex }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Occupation</label>
                            <p>{{ value.customer_details.occupation_id }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Customer Type</label>
                            <p>{{ value.type }}</p>
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
            <customer-prompt :status="promptMessage" v-if="$store.state.customerPromptStatus" />
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
                promptMessage: '',
                isActivated: true,
                loaded: false,
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
            toggleLayout (studioId, scheduledDateID) {
                const me = this
                me.loader(true)
                me.$parent.layout.studio = studioId
                me.$parent.layout.schedule = scheduledDateID
                me.$store.state.upcomingClassesLayoutStatus = true
            },
            toggledPrompt () {
                const me = this
                let status = 0
                me.isActivated ^= true
                if (me.isActivated) {
                    status = 1
                    me.promptMessage = 'Activate'
                } else {
                    me.promptMessage = 'Deactivate'
                }
                me.$store.state.customerPromptStatus = true
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
                let expiry = me.$moment(data.class_package.computed_expiration_date)
                let current = me.$moment()
                if (parseInt(expiry.diff(current, 'days')) <= 15) {
                    me.violator.warning = expiry.diff(current, 'days')
                    return true
                } else {
                    return false
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
                return me.packageStatus = status
            },
            toggleClassesHistory (status) {
                const me = this
                return me.classesHistoryStatus = status
            },
        },
        mounted () {
            const me = this
            if (me.$route.params.slug == 'transactions') {
                me.res = me.value.payments
            }
            me.loaded = true
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
