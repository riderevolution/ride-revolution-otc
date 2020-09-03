<template>
    <div class="customer_tab_content">
        <div v-if="type == 'packages' && loaded">
            <div class="cms_table_toggler">
                <div :class="`status ${(packageStatus == 'all') ? 'active' : ''}`" @click="togglePackages('all')">Owned</div>
                <div :class="`status ${(packageStatus == 'shared') ? 'active' : ''}`" @click="togglePackages('shared')">Shared</div>
                <div :class="`status ${(packageStatus == 'frozen') ? 'active' : ''}`" @click="togglePackages('frozen')">Frozen</div>
                <div :class="`status ${(packageStatus == 'expired') ? 'active' : ''}`" @click="togglePackages('expired')">Expired</div>
            </div>
            <button type="button" class="hidden" id="packages" @click="togglePackages('all')"></button>
            <div class="cms_table_package">
                <div class="table_package" v-for="(data, key) in populatePackages" :key="key" v-if="packageCount > 0 && (data.count > 0 && !data.expired)">
                    <h2 class="package_title">
                        {{ data.class_package.name }}
                        <span class="warning" v-if="parseInt($moment(data.class_package.computed_expiration_date).diff($moment(), 'days')) <= 15 && packageStatus != 'expired'">{{ checkViolator(data, 'warning') }}</span>
                        <span class="shared" v-if="data.sharedto_user_id != null">{{ checkViolator(data, 'shared') }}</span>
                        <span class="frozen" v-if="data.frozen">Frozen</span>
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
                                <label>Expiry date <a href="javascript:void(0)" class="expiry_btn" @click="togglePackageAction(data, 'expiry')" v-if="packageStatus != 'expired'">Edit</a></label>
                            </div>
                        </div>
                        <div class="package_action" v-if="packageStatus != 'expired'">
                            <div v-if="!data.frozen" class="action_success_btn" @click="getCurrentCustomer()">Book a Class</div>
                            <div v-else class="action_success_btn disabled">Book a Class</div>
                            <div class="package_options" v-if=" (data.class_package.por_allow_transferring_of_package || data.class_package.por_allow_sharing_of_package || data.class_package.por_allow_freezing_of_package)">
                                <div class="option_btn" :id="`option_${key}`" @click.self="toggledOption($event)">Options</div>
                                <div class="option_selector">
                                    <div v-if="data.class_package.por_allow_transferring_of_package && !data.frozen && data.sharedto_user_id == null" class="option_link" @click="togglePackageAction(data, 'transfer')">Transfer Package</div>
                                    <div v-if="data.class_package.por_allow_sharing_of_package" class="option_link" @click="togglePackageAction(data, 'share')">{{ (data.sharedto_user_id != null) ? 'Unshare' : 'Share' }} Package</div>
                                    <div v-if="data.class_package.por_allow_freezing_of_package" class="option_link" @click="togglePackageAction(data, 'freeze')">{{ (data.frozen) ? 'Unfreeze' : 'Freeze' }} Package</div>
                                    <div v-if="data.class_package.refundable == 1 && (data.payment_item != null && data.payment_item.refunded == 0) && (data.count == data.original_package_count)" class="option_link red" @click="togglePackageAction(data, 'refund')">Refund Package</div>
                                    <!-- <div class="option_link">Print Receipt</div> -->
                                </div>
                            </div>
                        </div>
                        <div class="package_action" v-else>
                            <div class="action_cancel_btn none">Expired</div>
                        </div>
                    </div>
                </div>
                <div class="no_results" v-if="packageCount == 0">
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
            <button type="button" class="hidden" id="upcoming_classes" @click="populateUpcomingClasses()"></button>
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
                        <td>
                            <div class="table_data_link link" @click="toggleLayout(data.scheduled_date.schedule.studio.id, data.scheduled_date_id)" v-if="!data.scheduled_date.schedule.studio.online_class">{{ formatClassDate(`${data.scheduled_date.date} ${data.scheduled_date.schedule.start_time}`, true) }}
                            </div>
                            <div v-else>{{ formatClassDate(`${data.scheduled_date.date} ${data.scheduled_date.schedule.start_time}`, true) }}
                            </div>
                        </td>
                        <td>{{ (data.scheduled_date.schedule.studio.online_class) ? '-' : data.seat.number }}</td>
                        <td>{{ (data.scheduled_date.schedule.custom_name != null) ? data.scheduled_date.schedule.custom_name : data.scheduled_date.schedule.class_type.name }}</td>
                        <td>{{ data.scheduled_date.schedule.studio.name }}</td>
                        <td>
                            <div class="thumb">
                                <img :src="getInstructorsImageInSchedule(data.scheduled_date)" />
                                <div class="table_data_link" @click="openWindow(`/instructors/${getInstructorsInSchedule(data.scheduled_date, 'id')}/class-schedules`)">{{ getInstructorsInSchedule(data.scheduled_date, 'name') }}</div>
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
                                <div class="table_action_success link" @click="updateCustomerClass(data, data.id)">Sign In</div>
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
                <div class="total">Total: {{ res.classHistory.length }}</div>
                <div class="cms_table_toggler">
                    <div :class="`status ${(classesHistoryStatus == 'all') ? 'active' : ''}`" @click="toggleClassesHistory('all')">All</div>
                    <div :class="`status ${(classesHistoryStatus == 'completed') ? 'active' : ''}`" @click="toggleClassesHistory('completed')">Completed</div>
                    <div :class="`status ${(classesHistoryStatus == 'no-show') ? 'active' : ''}`" @click="toggleClassesHistory('no-show')">No Show</div>
                    <div :class="`status ${(classesHistoryStatus == 'cancelled') ? 'active' : ''}`" @click="toggleClassesHistory('cancelled')">Cancelled</div>
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
                        <td>{{ formatClassDate(`${data.scheduled_date.date} ${data.scheduled_date.schedule.start_time}`, true) }}</td>
                        <td>{{ (data.scheduled_date.schedule.studio.online_class) ? '-' : data.seat.number }}</td>
                        <td>{{ data.scheduled_date.schedule.class_type.name }}</td>
                        <td>{{ data.scheduled_date.schedule.studio.name }}</td>
                        <td>
                            <div class="thumb">
                                <img :src="getInstructorsImageInSchedule(data.scheduled_date)" />
                                <div class="table_data_link" @click="openWindow(`/instructors/${getInstructorsInSchedule(data.scheduled_date, 'id')}/class-schedules`)">{{ getInstructorsInSchedule(data.scheduled_date, 'name') }}</div>
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
            <table class="cms_table_accordion tbp">
                <thead>
                    <tr>
                        <th>Reference Number</th>
                        <th>Transaction Date</th>
                        <th>Branch</th>
                        <th>Total Qty.</th>
                        <th>Payment Method</th>
                        <th>Total Price</th>
                        <th>Employee</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody :class="`${(data.open) ? 'toggled' : ''} ${(data.status == 'paid') ? 'alt' : ''}`" v-for="(data, key) in res.data" v-if="res.data.length > 0">
                    <tr class="parent alt">
                        <td class="toggler" @click.self="toggleAccordion($event, key)">{{ (data.studio_id != null) ? data.payment_code : (data.payment_method.method == 'paypal') ? data.payment_method.paypal_transaction_id : (data.payment_method.method == 'store-credits') ? data.payment_code : data.payment_method.paymaya_transaction_id }}</td>
                        <td>{{ formatDate(data.created_at, true) }}</td>
                        <td>{{ (data.studio_id != null) ? data.studio.name : 'Website' }}</td>
                        <td>{{ countVariantQty(data.payment_items) }}</td>
                        <td class="capitalize">{{ replacer(data.payment_method.method) }}</td>
                        <td :class="`${(data.status == 'pending') ? 'red' : ''}`">Php {{ totalCount(data.total) }}</td>
                        <td>{{ (data.employee) ? data.employee.fullname : 'Online' }}</td>
                        <td>
                            <div class="table_actions">
                                <div :class="`action_status ${(data.status == 'paid') ? 'green' : 'red' }`">{{ data.status }}</div>
                                <div class="action_status ml gray" v-if="data.refund_status != 'none'">{{ (data.refund_status == 'fully-refunded') ? 'Fully Refunded' : 'Partially Refunded' }}</div>
                                <div class="table_action_edit link" @click="toggleForm(data.id)" v-if="data.status == 'pending'">Pay Now</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="pads" colspan="8">
                            <div class="accordion_table">
                                <table class="cms_table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th v-if="data.status == 'paid'">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody  v-if="data.payment_items.length > 0">
                                        <tr v-for="(item, key) in data.payment_items" :key="key">
                                            <td><b>{{ (item.type == 'custom-gift-card') ? 'Digital Gift Card - ' : (item.type == 'physical-gift-card' ? 'Physical Gift Card - ' : '') }}</b> {{ (item.product_variant) ? `${item.product_variant.product.name} ${item.product_variant.variant}` : (item.class_package ? item.class_package.name : (item.store_credit ? item.store_credit.name : item.gift_card.card_code )) }}</td>
                                            <td>{{ (item.product_variant) ? item.product_variant.product.category.name : 'N/A' }}</td>
                                            <td>{{ item.quantity }}</td>
                                            <td class="price">
                                                <p :class="`${(data.promo_code_used !== null) ? 'prev_price' : ''}`" v-if="data.promo_code_used !== null">PHP {{ totalCount(item.originalTotal) }}</p>
                                                <p>PHP {{ totalCount(item.total) }}</p>
                                            </td>
                                            <td v-if="data.status == 'paid'">
                                                <div class="table_actions" v-if="item.type != 'store-credit'">
                                                    <div class="table_action_cancel link" @click="toggleRefund(data, item)" v-if="checkRefund(data, item)">Refund</div>
                                                    <div class="table_action_cancel disabled link" v-else>{{ (data.payment_method.method != 'comp') ? 'Refunded' : 'Non-refundable' }}</div>
                                                </div>
                                                <div class="table_actions" v-else>
                                                    <div class="table_action_cancel disabled link">Non-refundable</div>
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
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tbody class="no_results" v-if="res.data.length == 0">
                    <tr>
                        <td :colspan="rowCount">No Result(s) Found.</td>
                    </tr>
                </tbody>
            </table>
            <pagination :apiRoute="`api/customers/${$route.params.param}/${$route.params.slug}`" :current="res.current_page" :last="res.last_page" :total="res.total" />
            <button type="button" class="hidden" id="transactions" @click="populateTransactions()"></button>
        </div>
        <div v-if="type == 'details' && loaded">
            <div id="default_form">
                <div class="cta" v-if="user.staff_details.role_id == 1">
                    <nuxt-link :to="`/customers/${value.id}/update`" class="action_btn alternate">Edit Details</nuxt-link>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Customer Overview</h2>
                        <div class="form_check toggler">
                            <input type="hidden" id="enabled" name="enabled" class="action_check" :value="(value.enabled) ? 1 : 0">
                            <div :class="`toggle alt ${(value.enabled) ? 'active' : ''}`" @click="toggledPrompt(value)"></div>
                            <label for="enabled">{{ (value.enabled) ? 'Activated' : 'Deactivated' }}</label>
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
                            <p class="alt">{{ (value.customer_details.co_sex == 'M') ? 'Male' : 'Female' }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Occupation</label>
                            <p>{{ value.customer_details.profession }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Shoe Size</label>
                            <p><b>US</b> - {{ value.customer_details.co_shoe_size }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Customer Type</label>
                            <p>{{ value.customer_details.customer_type.name }}</p>
                        </div>
                        <!-- <div class="wrapper">
                            <label>Rewards Membership</label>
                            <p>Black</p>
                        </div> -->
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Personal Address</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Address Line 1</label>
                            <p>{{ value.customer_details.pa_address }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Address Line 2</label>
                            <p>{{ value.customer_details.pa_address_2 }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Country</label>
                            <p>{{ value.customer_details.personal_country }}</p>
                        </div>
                        <div class="wrapper">
                            <label>State</label>
                            <p>{{ value.customer_details.personal_state }}</p>
                        </div>
                        <div class="wrapper">
                            <label>City</label>
                            <p>{{ value.customer_details.pa_city }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Zip Code</label>
                            <p>{{ value.customer_details.pa_zip_code }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Billing Address</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Address Line 1</label>
                            <p>{{ value.customer_details.ba_address }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Address Line 2</label>
                            <p>{{ value.customer_details.ba_address_2 }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Country</label>
                            <p>{{ value.customer_details.billing_country }}</p>
                        </div>
                        <div class="wrapper">
                            <label>State</label>
                            <p>{{ value.customer_details.billing_state }}</p>
                        </div>
                        <div class="wrapper">
                            <label>City</label>
                            <p>{{ value.customer_details.ba_city }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Zip Code</label>
                            <p>{{ value.customer_details.ba_zip_code }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Notes/Alerts</h2>
                        <button type="button" class="action_btn alternate" @click="saveNotes(value)">Update</button>
                    </div>
                    <div class="form_main_group">
                        <div class="form_group no_margin">
                            <textarea name="notes" rows="8" id="notes" class="default_text" placeholder="Enter notes/alerts" v-model="value.customer_details.notes"></textarea>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper" v-if="value.top5Instructors.length > 0">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Top 5 Instructors</h2>
                    </div>
                    <div class="form_overview_instructor">
                        <div class="left">
                            <div class="image">
                                <img class="instructor_image" :src="value.top5Instructors[0].instructor_details.images[0].path"/>
                                <div class="sequence"><span>1</span></div>
                            </div>
                            <h2>{{ value.top5Instructors[0].first_name }} {{ value.top5Instructors[0].last_name }}</h2>
                            <p>Total Rides: {{ value.top5Instructors[0].bookCount }}</p>
                        </div>
                        <div class="right">
                            <div class="wrapper" v-for="(data, key) in topInstructors" :key="key">
                                <div class="image">
                                    <img class="instructor_image" :src="data.instructor_details.images[0].path" v-if="data.instructor_details.images[0].path != null" />
                                    <div class="instructor_image" v-else></div>
                                    <div class="sequence"><span>{{ key + 2 }}</span></div>
                                </div>
                                <div class="info">
                                    <h2>{{ data.first_name }} {{ data.last_name }}</h2>
                                    <p>Total Rides: {{ data.bookCount }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type == 'health-waiver' && loaded">
            <div id="default_form">
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Emergency Information</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Full Name</label>
                            <p>{{ value.customer_details.ec_full_name }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Contact Number</label>
                            <p>{{ value.customer_details.ec_contact_number }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Relationship</label>
                            <p>{{ value.customer_details.ec_relationship }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Medical History</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper" v-for="(data, key) in value.medical_history" :key="key">
                            <label>{{ data.question }}</label>
                            <p :class="`highlight ${(data.answer == 'Yes') ? 'r' : 'g'}`">{{ data.answer }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">If you have marked YES to any of the above, please elaborate</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>{{ (value.health_waiver_text_answer) ? value.health_waiver_text_answer.body : 'N/A' }}</label>
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
        <transition name="fade">
            <package-action-prompt :message="packagePromptMessage" :type="packagePromptType" v-if="$store.state.packageActionPromptStatus" />
        </transition>
        <transition name="fade">
            <package-action :userPackageCountId="userPackageCountId" :type="packageActionType" v-if="$store.state.packageActionStatus" />
        </transition>
        <transition name="fade">
            <package-action-validate :userPackageCountId="userPackageCountId" v-if="$store.state.packageActionValidateStatus" />
        </transition>
        <transition name="fade">
            <package-edit-expiry-prompt :data="expiryData" v-if="$store.state.editPackageExpiryStatus" />
        </transition>
        <transition name="fade">
            <refund :payment="payment" :paymentItemId="paymentItemId" v-if="$store.state.refundStatus" />
        </transition>
    </div>
</template>

<script>
    import CustomerPrompt from '../components/modals/CustomerPrompt'
    import CustomerPendingQuickSale from '../components/modals/CustomerPendingQuickSale'
    import PackageAction from '../components/modals/PackageAction'
    import PackageActionPrompt from '../components/modals/PackageActionPrompt'
    import PackageActionValidate from '../components/modals/PackageActionValidate'
    import PackageEditExpiryPrompt from '../components/modals/PackageEditExpiryPrompt'
    import Refund from '../components/modals/Refund'
    import Pagination from '../components/Pagination'
    export default {
        components: {
            CustomerPrompt,
            CustomerPendingQuickSale,
            PackageAction,
            PackageActionPrompt,
            PackageActionValidate,
            PackageEditExpiryPrompt,
            Refund,
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
                payment: [],
                paymentItemId: 0,
                expiryData: [],
                packageCount: 0,
                tempData: null,
                methodType: '',
                packageActionType: '',
                packagePromptType: '',
                packagePromptMessage: '',
                userPackageCountId: 0,
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
                packageStatus: 'all',
                classesHistoryStatus: 'all',
                user: {
                    staff_details: {
                        role_id: 0
                    }
                },
                form: {
                    notes: ''
                },
                res: [],
                transaction: []
            }
        },
        computed: {
            topInstructors () {
                const me = this
                let results = []
                let ctr = 0
                me.value.top5Instructors.forEach((data, index) => {
                    if (index != 0) {
                        if (ctr < 4) {
                            results.push(data)
                            ctr++
                        }
                    }
                })
                if (ctr <= 4) {
                    for (let i = 0; i < 4 - ctr; i++) {
                        results.push(
                            {
                                bookCount: 0,
                                first_name: '-',
                                last_name: '-',
                                instructor_details: {
                                    images: [
                                        {
                                            path: null
                                        }
                                    ]
                                }
                            }
                        )
                    }
                }
                return results
            },
            populatePackages () {
                const me = this
                let result = []
                me.packageCount = 0
                if (me.$route.params.slug == 'packages') {
                    let current = me.$moment()
                    if (me.packageStatus != 'expired') {
                        me.res.user_package_counts.forEach((element, index) => {
                            let expiry = me.$moment(element.class_package.computed_expiration_date)
                            if (parseInt(expiry.diff(current, 'days')) > 0) {
                                element.expired = false
                                if (element.count > 0) {
                                    me.packageCount++
                                }
                            } else {
                                element.expired = true
                            }
                            result.push(element)
                        })
                    } else {
                        me.res.user_package_counts.forEach((element, index) => {
                            let expiry = me.$moment(element.class_package.computed_expiration_date)
                            if (parseInt(expiry.diff(current, 'days')) <= 0) {
                                element.expired = false
                                me.packageCount++
                            }
                            result.push(element)
                        })
                    }
                }
                return result
            }
        },
        methods: {
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            getInstructorsImageInSchedule (data) {
                const me = this
                let result = ''
                if (data != '') {
                    let instructor = []
                    data.schedule.instructor_schedules.forEach((ins, index) => {
                        if (ins.primary == 1) {
                            instructor = ins
                        }
                    })
                    result = instructor.user.instructor_details.images[0].path
                }

                return result
            },
            getInstructorsInSchedule (data, type) {
                const me = this
                let result = ''
                if (type == 'name') {
                    if (data != '') {
                        let instructor = []
                        data.schedule.instructor_schedules.forEach((ins, index) => {
                            if (ins.primary == 1) {
                                instructor = ins
                            }
                        })
                        result = `${instructor.user.fullname}`
                    }
                } else {
                    if (data != '') {
                        let instructor = []
                        data.schedule.instructor_schedules.forEach((ins, index) => {
                            if (ins.primary == 1) {
                                instructor = ins
                            }
                        })
                        result = `${instructor.user.id}`
                    }
                }
                return result
            },
            saveNotes (data) {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('notes', data.customer_details.notes)
                formData.append('customer_id', data.id)
                me.$axios.post('api/extras/update-customer-notes', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    me.loader(true)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            checkRefund (data, item) {
                const me = this
                if (data.payment_method.method != 'comp') {
                    switch (item.type) {
                        case 'class-package':
                            if (item.refunded == 0) {
                                if (item.user_package_count) {
                                    if (item.user_package_count.count == item.user_package_count.original_package_count) {
                                        return true
                                    } else {
                                        return false
                                    }
                                } else {
                                    return false
                                }
                            } else {
                                return false
                            }
                        break
                        default:
                            if (item.refunded == 0) {
                                return true
                            } else {
                                return false
                            }
                    }
                } else {
                    return false
                }
            },
            toggleRefund (data, item) {
                const me = this
                me.payment = data
                me.paymentItemId = item.id
                me.$store.state.refundStatus = true
                document.body.classList.add('no_scroll')
            },
            togglePackageAction (data, type) {
                const me = this
                switch (type) {
                    case 'transfer':
                        me.packageActionType = 'Transfer'
                        me.$store.state.packageActionStatus = true
                        document.body.classList.add('no_scroll')
                        break
                    case 'share':
                        if (data.sharedto_user_id != null) {
                            me.methodType = 'unshare'
                            me.tempData = data
                            me.$store.state.packageActionValidateStatus = true
                        } else {
                            me.methodType = 'share'
                            me.$store.state.packageActionStatus = true
                        }
                        document.body.classList.add('no_scroll')
                        me.packageActionType = 'Share'
                        break
                    case 'freeze':
                        if (data.frozen) {
                            me.methodType = 'unfreeze'
                        } else {
                            me.methodType = 'freeze'
                        }
                        me.$store.state.packageActionValidateStatus = true
                        document.body.classList.add('no_scroll')
                        break
                    case 'expiry':
                        me.expiryData = data
                        me.$store.state.editPackageExpiryStatus = true
                        document.body.classList.add('no_scroll')
                        break
                    case 'refund':
                        me.payment = data.payment_item.payment
                        me.paymentItemId = data.payment_item.id
                        me.$store.state.refundStatus = true
                        document.body.classList.add('no_scroll')
                        break
                }
                me.userPackageCountId = data.id
            },
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
                        break
                    case 'reserved':
                        result = 'Reserved'
                        break
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
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.$parent.customer = res.data.customer
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
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        const elements = document.querySelectorAll('.cms_table_accordion .tbp')
                        elements.forEach((element, index) => {
                            element.classList.remove('toggled')
                            element.querySelector('.accordion_table').style.height = 0
                        })
                        me.loader(false)
                    }, 500)
                })
            },
            populateUpcomingClasses () {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.$parent.customer = res.data.customer
                        me.res = res.data.customer
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
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
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            updateCustomerClass (data, id) {
                const me = this
                let formData = new FormData()
                if ((data.status == 'reserved-guest' || data.status == 'reserved') && id != null) {
                    me.$axios.post(`api/bookings/sign-in/${id}`, formData).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                document.getElementById('upcoming_classes').click()
                            }, 500)
                        }
                    })
                } else if (data.status == 'signed-in' && id != null) {
                    me.$store.state.bookingID = id
                    me.$store.state.promptSignOutStatus = true
                    document.body.classList.add('no_scroll')
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
            checkViolator (data, type) {
                const me = this
                let result = ''
                let expiry = me.$moment(data.class_package.computed_expiration_date)
                let current = me.$moment()
                switch (type) {
                    case 'warning':
                        result = expiry.diff(current, 'days') + ' Days Left'
                        break
                    case 'shared':
                        if (me.$route.params.param == data.user_id) {
                            result = `Shared with ${data.sharedto_user.first_name} ${data.sharedto_user.last_name}`
                        } else {
                            result = `Shared by ${data.sharedby_user.first_name} ${data.sharedby_user.last_name}`
                        }
                        break;
                }
                return result
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
                    for (let i = 0; i <= me.res.classHistory.length; i++) {
                        let element = document.getElementById(`table_select_${i}`)
                        if (element !== target) {
                            if (element) {
                                if (element.nextElementSibling) {
                                    if (element.nextElementSibling.classList.contains('active')) {
                                        element.nextElementSibling.classList.remove('active')
                                    }
                                }
                            }
                        }
                    }
                }
            },
            togglePackages (status) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}?packageStatus=${(status != 'expired') ? status : 'all'}`).then(res => {
                    if (res.data) {
                        me.packageCount = 0
                        me.$parent.customer = res.data.customer
                        me.res = res.data.customer
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.packageStatus = status
                        me.loader(false)
                    }, 500)
                })
            },
            toggleClassesHistory (status) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}?classHistoryStatus=${status}`).then(res => {
                    if (res.data) {
                        me.res = res.data.customer
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.classesHistoryStatus = status
                        me.loader(false)
                    }, 500)
                })
            },
        },
        mounted () {
            const me = this
            me.res = []
            let token = me.$cookies.get('70hokcotc3hhhn5')
            me.$axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data != 0) {
                    me.user = res.data.user
                }
            })
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
