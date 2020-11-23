<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table booker">
                    <div class="action_wrapper">
                        <h1 class="header_title">Booker</h1>
                        <div class="actions">
                            <form :class="`customer_filter_flex ${($store.state.disableBookerUI) ? 'disable_booker' : ''}`" id="filter" @submit.prevent>
                                <div class="form_group customer" v-if="!user.front_desk">
                                    <label for="studio_id">Studio</label>
                                    <select :class="`default_select alternate ${(!selectStudio) ? 'highlighted' : ''}`" name="studio_id" @change="getStudio($event)">
                                        <option value="" selected disabled>Select a Studio</option>
                                        <option :value="studio.id" v-for="(studio, key) in studios" :selected="studio.id == studioID" :key="key">{{ studio.name }}</option>
                                    </select>
                                    <!-- <transition name="slide"><span class="validation_errors alt" v-if="!selectStudio">Select Studio</span></transition> -->
                                </div>
                                <div class="form_group customer" v-else>
                                    <label for="studio_id">Studio</label>
                                    <div class="selected_studio">{{ user.studio.name }}</div>
                                </div>
                                <div class="form_group selection margin" v-click-outside="closeMe">
                                    <label for="q">Find a Customer</label>
                                    <input type="text" name="q" autocomplete="off" placeholder="Search for a customer" :class="`default_text search_alternate ${(selectCustomer) ? '' : 'disabled'} ${(!findCustomer && customer == '') ? 'highlighted' : ''}`" @click="toggleCustomers = true" @keyup="search($event)" v-model="form.search">
                                    <transition name="slide"><span class="validation_errors alt" v-if="!findCustomer && customer == ''">Select Customer</span></transition>
                                    <div :class="`customer_selection ${(customerLength > 6) ? 'scrollable' : ''}`" v-if="toggleCustomers">
                                        <div class="customer_selection_list">
                                            <div class="customer_wrapper" v-if="customerLength > 0 && customer.id != data.id" :id="`customer_${data.id}`" v-for="(data, key) in populateCustomers" :key="key" @click="getCustomer(data)">
                                                <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path_resized != null" />
                                                <div class="customer_image" v-else>
                                                    <div class="overlay">
                                                        {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                                    </div>
                                                </div>
                                                <div class="customer_name" v-line-clamp="1">
                                                    {{ data.first_name }} {{ data.last_name }}
                                                </div>
                                            </div>
                                            <div class="no_results" v-if="customerLength == 0" >
                                                No customer(s) found.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div :class="`customer_selected ${(customer != '') ? 'selected' : ''}`">
                                    <transition name="fade">
                                        <div class="customer_picked" v-if="customer != ''">
                                            <div class="customer_header">
                                                <img class="customer_image" :src="customer.customer_details.images[0].path_resized" v-if="customer.customer_details.images[0].path_resized != null" />
                                                <div class="customer_default_image" v-else>
                                                    <div class="overlay">
                                                        {{ customer.first_name.charAt(0) }}{{ customer.last_name.charAt(0) }}
                                                    </div>
                                                </div>
                                                <div class="customer_details">
                                                    <h2 class="customer_name">
                                                        <nuxt-link to="" class="name" @click.native.prevent="openWindow(`/customers/${customer.id}/packages`)">{{ customer.first_name }} {{ customer.last_name }}</nuxt-link>
                                                        <div class="types" v-if="customer.customer_details.customer_type.images.length > 0"><img :src="customer.customer_details.customer_type.images[0].path_resized" /></div>
                                                        <div class="types" v-if="customer.has_first_timer"><img src="/icons/first-timer-package-icon.png" /></div>
                                                        <a :href="`mailto:${customer.email}`" class="email">
                                                            <img src="/icons/email-icon.svg" />
                                                            <span>Email</span>
                                                        </a>
                                                    </h2>
                                                    <div class="customer_info">
                                                        <span>Birthday: {{ $moment(customer.customer_details.co_birthdate).format('M/D/YY') }}</span>
                                                        <span>{{ customer.customer_details.co_contact_number }}</span>
                                                        <span>Store Credit: {{ totalItems((customer.store_credits != null) ? customer.store_credits.amount : 0) }}</span>
                                                        <span>Shoe Size: <b>US - {{ customer.customer_details.co_shoe_size }}</b></span>
                                                    </div>
                                                    <div class="close_wrapper alternate" @click="removeCustomer()">
                                                        <div class="close_icon"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="customer_footer" v-if="customer != ''">
                                                <div class="item" @click="toggleLayout('attendance')">Attendance</div>
                                                <div class="item" @click="toggleLayout('package')">Packages</div>
                                                <div class="item" @click="toggleLayout('redeem')">Redeem</div>
                                                <div id="credits" class="item" @click="toggleQuickSale('credit')">
                                                    Buy Credits
                                                    <transition name="slide"><span class="validation_errors alt" v-if="buyCredits">Buy Here</span></transition>
                                                </div>
                                                <div class="item" @click="toggleQuickSale('product')">Buy Products</div>
                                            </div>
                                        </div>
                                    </transition>
                                    <transition name="fade">
                                        <div class="no_results" v-if="customer == ''">
                                            <div class="customer_label">No Customer Selected</div>
                                            <div class="customer_text">Find a Customer / Scan QR Code</div>
                                        </div>
                                    </transition>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                <section id="content">
                    <div class="booker_wrapper">
                        <div :class="`booker_classes ${($store.state.disableBookerUI) ? 'disable_booker' : ''}`" v-if="!hide_class">
                            <div class="header_wrapper">
                                <div class="booker_header">
                                    <div class="booker_prev" @click="generatePrevClasses()">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"> <g transform="translate(-248 -187)"> <g class="arrow_1" transform="translate(248 187)"> <circle class="arrow_3" cx="14" cy="14" r="14" /> <circle class="arrow_4" cx="14" cy="14" r="13.5" /> </g> <path class="arrow_2" d="M184.939,200.506l-3.981,3.981,3.981,3.981" transform="translate(445.438 405.969) rotate(180)" /> </g> </svg>
                                    </div>
                                    <h2 class="booker_title">Classes</h2>
                                    <div class="booker_next" @click="generateNextClasses()">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"> <g transform="translate(-248 -187)"> <g class="arrow_1" transform="translate(248 187)"> <circle class="arrow_3" cx="14" cy="14" r="14" /> <circle class="arrow_4" cx="14" cy="14" r="13.5" /> </g> <path class="arrow_2" d="M184.939,200.506l-3.981,3.981,3.981,3.981" transform="translate(445.438 405.969) rotate(180)" /> </g> </svg>
                                    </div>
                                </div>
                                <div>
                                    <div class="action_calendar_btn" @click="populateClasses()">Today</div>
                                    <div class="action_btn alternate" @click="hideClass('hide')">Hide Classes</div>
                                </div>
                            </div>
                            <div class="content_wrapper">
                                <div :id="`sched_${key}`" :class="[ 'class_accordion', (result.highlighted) ? 'highlighted' : '', (result.toggled) ? 'toggled' : '' ]" v-for="(result, key) in populateDates" :key="key">
                                    <div class="accordion_header" @click.self="toggleClass($event, $moment(result.date).format('M'), $moment(result.date).format('D'), $moment(result.date).format('YYYY'), result, key)">{{ result.abbr }} | {{ result.date }}</div>
                                    <div class="accordion_content">
                                        <div :id="`class_${dkey}_${key}`" :class="[ 'class_content', (data.schedule.studio.online_class) ? 'online' : '', (data.highlighted) ? 'highlighted' : '' ]" v-for="(data, dkey) in schedules" :key="dkey" @click="getBookings(data, dkey, key)">
                                            <div class="class_title">
                                                <span>
                                                    {{ data.schedule.start_time }},
                                                    {{ (data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name }}
                                                    {{ (!data.schedule.studio.online_class) ? '' : '(Online Class)' }}
                                                    <img src="/icons/private-class.svg" v-if="data.schedule.private_class == 1" />
                                                </span>
                                                <div :class="`class_status ${(data.isFull) ? 'full' : ''}`">
                                                    {{ (data.isFull) ? `Full (${data.schedule.studio.seats.length})` : `Enrolled: ${data.enrolled}` }}
                                                </div>
                                            </div>
                                            <div class="class_text">{{ data.schedule.instructor_schedules[0].user.first_name }} {{ data.schedule.instructor_schedules[0].user.last_name }}</div>
                                            <div class="class_text alternate">
                                                <span>Signed-in: {{ data.signedIn }}</span>
                                                <span>Available: {{ (data.schedule.studio.online_class) ? 'Unlimited' : data.availableSeatsCount }}</span>
                                                <span>No show: {{ data.noShow }}</span>
                                            </div>
                                        </div>
                                        <div class="no_class class_content" v-if="schedules.length <= 0">
                                            No Schedule(s) for this day.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="booker_button" v-if="hide_class">
                            <div class="action_btn alternate" @click="hideClass('show')">Show Classes</div>
                        </div>
                        <div class="booker_content">
                            <div class="booker_seats">
                                <div class="seat_controls">
                                    <div class="left_side">
                                        <div class="class_options">
                                        <select :class="`default_select alternate ${(schedule != '') ? '' : 'disable_booker'} ${($store.state.disableBookerUI) ? 'disable_booker' : ''}`" name="class_options" @change="getClassOptions($event)" v-if="!studio.online_class">
                                            <option value="" disabled selected>Class Options</option>
                                            <option :value="classOption" v-for="(classOption, key) in classOptions" :key="key">{{ classOption }}</option>
                                        </select>
                                        <select :class="`default_select alternate ${(schedule != '') ? '' : 'disable_booker'} ${($store.state.disableBookerUI) ? 'disable_booker' : ''}`" name="class_options" @change="getClassOptions($event)" v-else>
                                            <option value="" disabled selected>Class Options</option>
                                            <option :value="classOption" v-for="(classOption, key) in classOnlineOptions" :key="key">{{ classOption }}</option>
                                        </select>
                                        <div class="class_info" v-show="!studio.online_class">
                                            <div class="action_calendar_btn" id="legend_toggler" @click="toggleLegends($event)" src="/icons/info-icon.svg">Legends</div>
                                            <div class="overlay">
                                                <label>Customer Legend</label>
                                                <div class="type_content">
                                                    <div class="type" v-for="(data, key) in customerTypes" :key="key">
                                                        <img :src="data.images[0].path" />
                                                        <div class="type_title">{{ data.name }}</div>
                                                    </div>
                                                    <div class="type">
                                                        <img src="/icons/first-timer-package-icon.png" />
                                                        <div class="type_title">First Timer Package</div>
                                                    </div>
                                                    <div class="type">
                                                        <img src="/icons/guest-icon.svg" />
                                                        <div class="type_title">Guest</div>
                                                    </div>
                                                    <div class="type">
                                                        <img src="/icons/pending-payment-icon.svg" />
                                                        <div class="type_title">Pending Payment</div>
                                                    </div>
                                                    <!-- <div class="type">
                                                    <img src="/icons/broken-bike-icon.svg" />
                                                    <div class="type_title">Broken Bike</div>
                                                </div> -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <label class="booker_label" v-html="getInstructorsInSchedule(schedule)"></label>
                                <div :class="`controls ${(studio.online_class) ? 'nope' : '' }`">
                                    <button id="zoom_in">Zoom in</button>
                                    <button id="zoom_out" class="margin">Zoom out</button>
                                    <button id="reset" class="margin">Reset</button>
                                </div>
                            </div>
                            <div :class="`right_side ${(studio.online_class) ? 'nope' : '' } ${($store.state.disableBookerUI) ? 'disable_booker' : ''}`">
                                <button id="reload">Reload</button>
                            </div>
                            </div>
                                <panZoom v-if="!studio.online_class" @init="panZoomInit" :options="{
                                    bounds: true,
                                    boundsPadding: 0.2,
                                    minZoom: 0.25,
                                    maxZoom: 1,
                                    zoomDoubleClickSpeed: 1,
                                    beforeWheel: panZoomBeforeWheel,
                                    onDoubleClick: panZoomDoubleClick,
                                    smoothScroll: false,
                                    onTouch: panZoomTouch
                                }">
                                    <seat-plan ref="plan" :customer="customer" :onlineClass="(studio.online_class) ? true : false" />
                                </panZoom>

                                <online-attendance-layout ref="online" v-else-if="studio.online_class" :schedule="schedule" :studio="studio" />

                                <div class="seat_legends" v-if="!studio.online_class">
                                    <div class="legend_title gray"><span></span> Booked</div>
                                    <div class="legend_title margin green"><span></span> Signed In</div>
                                    <div class="legend_title margin white"><span></span> Available</div>
                                    <div class="legend_title margin gradient"><span></span> Blocked/Comp</div>
                                    <div class="action_cancel_btn" @click="toggleDisabled()" v-if="$store.state.disableBookerUI">Cancel</div>
                                </div>
                            </div>
                            <div :class="`booker_footer ${(schedule != '') ? '' : 'disable_booker' } ${($store.state.disableBookerUI) ? 'disable_booker' : ''}`">
                                <div class="booker_notepad">
                                    <h2 class="footer_title">Notepad</h2>
                                    <div class="notepad_text">
                                        <textarea name="notepad" rows="10" v-model="notePad" @focusout="updateNotes($event)"></textarea>
                                    </div>
                                </div>
                                <div :class="`booker_waitlist ${(studio.online_class) ? 'nope' : '' }`">
                                    <div class="footer_header">
                                        <h2 class="footer_title">Waitlist ({{ waitlistCount }})</h2>
                                        <a href="javascript:void(0)" :class="`action_success_btn ${(inWaitlist || $store.state.customerID == 0 || $store.state.scheduleID == 0 || (waitlists.length > 0 && waitlists[0].past == 1)) ? 'disabled' : ''}`" @click="addToWaitlist()">Add to Waitlist</a>
                                    </div>
                                    <table class="cms_waitlist">
                                        <thead>
                                            <tr>
                                                <th>Last Name</th>
                                                <th>First Name</th>
                                                <th class="action">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody v-if="waitlists.length > 0">
                                            <tr v-for="(waitlist, key) in waitlists" :key="key">
                                                <td>{{ waitlist.user.last_name }}</td>
                                                <td>{{ waitlist.user.first_name }}</td>
                                                <td class="action">
                                                    <a href="javascript:void(0)" @click="prioritizeWaitlist(waitlist)" :class="`${(waitlist.past == 1) ? 'disabled' : ''}`">Prioritize</a>
                                                    <a href="javascript:void(0)" :class="`margin ${(waitlist.past == 1) ? 'disabled' : 'cancel'}`" @click="removeToWaitlist(waitlist.id)">Remove</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tbody class="no_results" v-else>
                                            <tr>
                                                <td colspan="3">The Waitlist is empty.</td>
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
                <prompt v-if="$store.state.promptStatus" :message="($refs.plan.hasCancel) ? $refs.plan.message : message" :hasCancel="$refs.plan.hasCancel" />
            </transition>
            <transition name="fade">
                <prompt-broken-bike v-if="$store.state.promptBrokenBikeStatus" :message="brokenMessage" />
            </transition>
            <transition name="fade">
                <prompt-booker v-if="$store.state.promptBookerStatus" :message="($refs.plan) ? $refs.plan.message : plan.message" />
            </transition>
            <transition name="fade">
                <prompt-booker-action v-if="$store.state.promptBookerActionStatus" :message="actionMessage" />
            </transition>
            <transition name="fade">
                <prompt-sign-out v-if="$store.state.promptSignOutStatus" />
            </transition>
            <transition name="fade">
                <prompt-switch-seat v-if="$store.state.promptSwitchSeatStatus" />
            </transition>
            <transition name="fade">
                <prompt-cancel v-if="$store.state.promptCancelStatus" />
            </transition>
            <transition name="fade">
                <prompt-waitlist v-if="$store.state.promptWaitlistStatus" :value="waitlistID" />
            </transition>
            <transition name="fade">
                <assign v-if="$store.state.assignStatus" :type="$refs.plan.assignType" />
            </transition>
            <transition name="fade">
                <remove-assign v-if="$store.state.removeAssignStatus" />
            </transition>
            <transition name="fade">
                <customer-package v-if="$store.state.customerPackageStatus" :studioID="studioID" :type="packageMethod" />
            </transition>
            <transition name="fade">
                <pending-transactions v-if="$store.state.pendingTransactionsStatus" />
            </transition>
            <transition name="fade">
                <customer-pending-quick-sale :value="transaction" v-if="$store.state.customerPendingQuickSaleStatus" />
            </transition>
            <transition name="fade">
                <booker-menu-prompt v-if="$store.state.bookerMenuPromptStatus" />
            </transition>
            <transition name="fade">
                <booker-cancel-class v-if="cancel" :scheduled_date_id="scheduledDateID" />
            </transition>
            <transition name="fade">
                <attendance-layout v-if="$store.state.attendanceLayoutStatus" :customer="customer" />
            </transition>
            <transition name="fade">
                <package-layout v-if="$store.state.packageLayoutStatus" :customer="customer" />
            </transition>
            <transition name="fade">
                <online-attendance-customer v-if="$store.state.onlineAttendanceCustomer" :schedule="schedule" />
            </transition>
            <transition name="fade">
                <online-attendance-prompt v-if="$store.state.onlineAttendancePrompt" />
            </transition>
            <transition name="fade">
                <redeem-gift-card v-if="$store.state.redeemGiftCardStatus" :customer="customer" />
            </transition>
            <transition name="fade">
                <redeem-gift-card-success v-if="$store.state.redeemGiftCardSuccessStatus" />
            </transition>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../components/Foot'
    import SeatPlan from '../../components/SeatPlan'
    import Prompt from '../../components/modals/Prompt'
    import PromptBrokenBike from '../../components/modals/PromptBrokenBike'
    import PromptBooker from '../../components/modals/PromptBooker'
    import PromptBookerAction from '../../components/modals/PromptBookerAction'
    import PromptSignOut from '../../components/modals/PromptSignOut'
    import PromptSwitchSeat from '../../components/modals/PromptSwitchSeat'
    import PromptCancel from '../../components/modals/PromptCancel'
    import PromptWaitlist from '../../components/modals/PromptWaitlist'
    import CustomerPackage from '../../components/modals/CustomerPackage'
    import Assign from '../../components/modals/Assign'
    import RemoveAssign from '../../components/modals/RemoveAssign'
    import PendingTransactions from '../../components/modals/PendingTransactions'
    import CustomerPendingQuickSale from '../../components/modals/CustomerPendingQuickSale'
    import AttendanceLayout from '../../components/modals/AttendanceLayout'
    import PackageLayout from '../../components/modals/PackageLayout'
    import OnlineAttendanceLayout from '../../components/modals/OnlineAttendanceLayout'
    import OnlineAttendanceCustomer from '../../components/modals/OnlineAttendanceCustomer'
    import OnlineAttendancePrompt from '../../components/modals/OnlineAttendancePrompt'
    import RedeemGiftCard from '../../components/modals/RedeemGiftCard'
    import RedeemGiftCardSuccess from '../../components/modals/RedeemGiftCardSuccess'
    import BookerMenuPrompt from '../../components/modals/BookerMenuPrompt'
    import BookerCancelClass from '../../components/modals/BookerCancelClass'
    export default {
        components: {
            Foot,
            SeatPlan,
            Prompt,
            PromptBrokenBike,
            PromptBooker,
            PromptBookerAction,
            PromptSignOut,
            PromptSwitchSeat,
            PromptCancel,
            PromptWaitlist,
            CustomerPackage,
            Assign,
            RemoveAssign,
            PendingTransactions,
            CustomerPendingQuickSale,
            AttendanceLayout,
            PackageLayout,
            OnlineAttendanceLayout,
            OnlineAttendanceCustomer,
            OnlineAttendancePrompt,
            RedeemGiftCard,
            RedeemGiftCardSuccess,
            BookerMenuPrompt,
            BookerCancelClass
        },
        data () {
            return {
                name: 'Booker',
                access: true,
                loaded: false,
                hide_class: false,
                assignType: 0,
                brokenMessage: '',
                inWaitlist: false,
                past: false,
                scheduledDateID: 0,
                waitlistID: 0,
                studio: [],
                transaction: [],
                actionMessage: '',
                packageMethod: 'create',
                loaded: false,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 1,
                studios: [],
                results: [],
                customer: '',
                customers: [],
                customerLength: 0,
                schedules: [],
                customerTypes: [],
                classOptions: ['Cancel Class', 'Print Sign-in Sheet w/ Measurements', 'Print Room'],
                classOnlineOptions: ['Cancel Class', 'Print Sign-in Sheet w/ Measurements'],
                notePad: '',
                studioID: 0,
                current: 0,
                last: 0,
                currentMonth: 0,
                currentYear: 0,
                isPrev: false,
                selectCustomer: true,
                toggleCustomers: false,
                zoomCtr: 0.4,
                customInstance: [],
                customWidth: 0,
                customHeight: 0,
                message: '',
                selectStudio: false,
                buyCredits: false,
                findCustomer: true,
                cancel: false,
                hit: false,
                apply_to_all: false,
                schedule: '',
                waitlists: [],
                waitlistCount: 0,
                ctr: 0,
                user: [],
                plan: {
                    message: ''
                },
                form: {
                    search: ''
                },
                typing_timeout: ''
            }
        },
        computed: {
            populateDates () {
                const me = this
                let result = []
                for (let i = 0, i_len = me.results.length; i < i_len; i++) {
                    if (me.customer != '') {
                        if (me.customer.bookings.length > 0) {
                            for (let j = 0, j_len = me.customer.bookings.length; j < j_len; j++) {
                                if (me.$moment(me.results[i].date).format('YYYY-MM-DD') == me.customer.bookings[j].scheduled_date.date) {
                                    me.results[i].highlighted = true
                                }
                            }
                        }
                    }
                    result.push(me.results[i])
                }
                return result
            },
            populateCustomers () {
                const me = this
                let results = []
                results = me.customers
                return results
            }
        },
        methods: {
            getInstructorsInSchedule (data) {
                const me = this
                let result = ''
                if (data != '') {
                    let ins_ctr = 0
                    let instructor = []
                    data.schedule.instructor_schedules.forEach((ins, index) => {
                        if (ins.substitute == 0) {
                            ins_ctr += 1
                        }
                        if (ins.primary == 1) {
                            instructor = ins
                        }
                    })

                    if (ins_ctr == 2) {
                        result = `<b>${instructor.user.instructor_details.nickname} + ${data.schedule.instructor_schedules[1].user.instructor_details.nickname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                    } else {
                        result = `<b>${instructor.user.fullname}</b> <b class="g">(${data.schedule.class_type.name})</b>`
                    }

                } else {
                    result = 'Please Select a Class'
                }

                return result
            },
            getClassOptions (event) {
                const me = this
                let target = event.target.value
                switch (target) {
                    case 'Cancel Class':
                        me.cancel = true
                        break
                    case 'Print Room':
                        window.open(`${window.location.origin}/print/booker/room?scheduled_date_id=${me.scheduledDateID}&studio_id=${me.studio.id}`, '_blank')
                        break
                    case 'Print Sign-in Sheet w/ Measurements':
                        if (me.studio.online_class) {
                            window.open(`${window.location.origin}/print/booker/online-attendance?scheduled_date_id=${me.scheduledDateID}&studio_id=${me.studio.id}`, '_blank')
                        } else {
                            window.open(`${window.location.origin}/print/booker/attendance?scheduled_date_id=${me.scheduledDateID}&studio_id=${me.studio.id}`, '_blank')
                        }
                        break
                }
                event.target.value = ''
            },
            hideClass (type) {
                const me = this
                if (type == 'hide') {
                    me.hide_class = true
                } else {
                    me.hide_class = false
                }
            },
            openWindow (slug) {
                const me = this
                window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
            },
            toggleDisabled () {
                const me = this
                me.$store.state.disableBookerUI = false
            },
            prioritizeWaitlist (data) {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('_method', 'PATCH')
                me.$store.state.customerID = data.user_id
                me.$store.state.waitlistID = data.id
                me.customer = data.user
                me.loader(true)
                me.$axios.post(`api/waitlists/${data.id}/prioritize`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.actionMessage = `Successfully prioritized ${me.customer.first_name} ${me.customer.last_name}`
                            me.$store.state.promptBookerActionStatus = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.fetchWaitlist(me.$store.state.scheduleID)
                        me.$store.state.waitlistID = 0
                        me.loader(false)
                    }, 500)
                })
            },
            removeToWaitlist (id) {
                const me = this
                me.waitlistID = id
                me.$store.state.promptWaitlistStatus = true
                document.body.classList.add('no_scroll')
            },
            addToWaitlist () {
                const me = this
                if (me.$store.state.customerID != 0) {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    let formData = new FormData()
                    formData.append('scheduled_date_id', me.$store.state.scheduleID)
                    formData.append('user_id', me.$store.state.customerID)
                    me.$axios.post('api/extras/check-if-user-is-booked-already', formData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data.result == 0) {
                            me.$store.state.customerPackageStatus = true
                            me.packageMethod = 'waitlist'
                            document.body.classList.add('no_scroll')
                        } else {
                            setTimeout( () => {
                                if (me.$refs.plan) {
                                    me.$refs.plan.message = 'The customer has already been scheduled.'
                                }
                            }, 10)
                            me.$store.state.promptBookerStatus = true
                            document.body.classList.add('no_scroll')
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    })
                } else {
                    me.findCustomer = false
                    setTimeout( () => {
                        if (me.$refs.plan) {
                            me.$refs.plan.message = 'Please select a customer first.'
                        }
                    }, 10)
                    me.$store.state.promptBookerStatus = true
                    document.body.classList.add('no_scroll')
                }
            },
            changeSeat () {
                const me = this
                if (me.$store.state.seat != '') {
                    let formData = new FormData()
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    formData.append('seat_id', me.$store.state.seat.id)
                    formData.append('booking_id', me.$store.state.bookingID)
                    me.loader(true)
                    me.$axios.post('api/bookings/switch-seat', formData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.actionMessage = 'Successfully changed seat.'
                                me.$store.state.promptBookerActionStatus = true
                                document.body.classList.add('no_scroll')
                            }, 500)
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.getSeats()
                            if (me.$refs.plan) {
                                me.$refs.plan.hasCancel = false
                            }
                            me.$store.state.seatID = 0
                            me.$store.state.disableBookerUI = false
                        }, 500)
                    })
                }
            },
            noShow () {
                const me = this
                let formData = new FormData()
                let token = me.$cookies.get('70hokcotc3hhhn5')
                formData.append('_method', 'PATCH')
                formData.append('type', (me.$store.state.seat.status == 'comp') ? 'comp' : 'booking')
                formData.append('data_id', (me.$store.state.seat.comp.length > 0) ? me.$store.state.seat.comp[0].id : me.$store.state.seat.bookings[0].id)
                me.loader(true)
                me.$axios.post('api/bookings/no-show', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            document.body.classList.add('no_scroll')
                            me.$store.state.promptBookerStatus = true
                            if (me.$refs.plan) {
                                me.$refs.plan.message = 'No Show Confirmed.'
                            }
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.getSeats()
                    }, 500)
                })
            },
            removeAssign () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                if (me.$store.state.compID != 0) {
                    me.loader(true)
                    me.$axios.delete(`api/comp/${me.$store.state.compID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            me.actionMessage = 'Successfully removed a comp.'
                            me.$store.state.promptBookerActionStatus = true
                            setTimeout( () => {
                                me.getSeats()
                                me.$refs.plan.hasCancel = false
                            }, 500)
                        }
                    })
                }
            },
            blockBike () {
                const me = this
                if (me.$store.state.seat != '') {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    let formData = new FormData()
                    if (me.apply_to_all) {
                        formData.append('apply_to_all', 1)
                    }
                    formData.append('scheduled_date_id', me.scheduledDateID)
                    formData.append('_method', 'PATCH')
                    me.loader(true)
                    me.$axios.get(`api/seats/${me.$store.state.seat.id}?scheduled_date_id=${me.scheduledDateID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            if (res.data.seat.status == 'open') {
                                formData.append('status', 'blocked')
                            } else {
                                formData.append('status', 'open')
                            }
                            me.$axios.post(`api/seats/update-status/${me.$store.state.seat.id}`, formData, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    setTimeout( () => {
                                        if (res.data.seat.status == 'open') {
                                            me.actionMessage = 'Seat has been Opened.'
                                        } else {
                                            me.actionMessage = 'Seat has been Blocked.'
                                        }
                                        me.$store.state.promptBookerActionStatus = true
                                        me.apply_to_all = false
                                        document.body.classList.add('no_scroll')
                                    }, 500)
                                }
                            }).catch(err => {
                                me.$store.state.errorList = err.response.data.errors
                                me.$store.state.errorStatus = true
                            }).then(() => {
                                setTimeout( () => {
                                    me.getSeats()
                                    me.$refs.plan.hasCancel = false
                                    me.$store.state.seat = ''
                                }, 500)
                            })
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    })
                }
            },
            removeCustomer () {
                const me = this
                me.customer = ''
                me.$store.state.customerID = 0
                me.findCustomer = true
                setTimeout( () => {
                    if (me.$refs.plan) {
                        me.$refs.plan.hasCustomer = false
                    }
                }, 10)
                for (let i = 0, i_len = me.schedules.length; i < i_len; i++) {
                    me.schedules[i].highlighted = false
                }
                for (let i = 0, i_len = me.results.length; i < i_len; i++) {
                    me.results[i].highlighted = false
                }
            },
            getBookings (data, sunique, unique) {
                const me = this
                if (me.studioID) {
                    let element = document.getElementById(`class_${sunique}_${unique}`), parents = document.querySelectorAll('.booker_classes .content_wrapper .class_accordion')
                    parents.forEach((parent, pindex) => {
                        let children = parent.querySelectorAll('.accordion_content .class_content')
                        children.forEach((child, cindex) => {
                            child.classList.remove('active')
                        })
                    })
                    if (element) {
                        if (element.classList.contains('active')) {
                            element.classList.remove('active')
                        } else {
                            element.classList.add('active')
                        }
                    }
                    setTimeout(() => {
                        if (me.$refs.plan) {
                            me.$refs.plan.fetchSeats(data.id, me.studioID)
                            document.querySelector('.plan_wrapper').style.transform = `matrix(0.4, 0, 0, 0.4, ${me.customWidth}, ${me.customHeight})`
                        }
                    }, 10)
                } else {
                    me.selectStudio = false
                    me.$store.state.promptStatus = true
                    me.message = 'Please select a studio first.'
                    document.body.classList.add('no_scroll')
                    me.$scrollTo('.validation_errors', {
                        offset: -250
                    })
                }

                me.schedule = data

                let formData = new FormData(), token = me.$cookies.get('70hokcotc3hhhn5'), id = me.$store.state.user.id

                formData.append('scheduled_date_id', data.id)
                formData.append('user_id', id)
                me.$axios.post('api/schedule-notes', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    me.notePad = res.data.notes
                })

                if (!me.studio.online_class) {
                    me.selectCustomer = true
                    if (me.selectStudio) {
                        // let scheduleTime = me.$moment(`${me.schedule.date} ${me.schedule.schedule.start_time}`)
                        // let currentTime = me.$moment()
                        // if (scheduleTime.diff(currentTime) < 0) {
                        //     me.findCustomer = false
                        //     // me.past = true
                        //     me.removeCustomer()
                        // } else {
                        //     me.findCustomer = false
                        //     // me.past = false
                        // }
                    }
                } else {
                    // let scheduleTime = me.$moment(`${me.schedule.date} ${me.schedule.schedule.start_time}`)
                    // let currentTime = me.$moment()
                    setTimeout( () => {
                        // if (scheduleTime.diff(currentTime) < 0) {
                        //     me.removeCustomer()
                        // }
                        me.$refs.online.initial()
                    }, 10)
                }
                me.scheduledDateID = data.id
                me.$store.state.scheduleID = data.id
                me.fetchWaitlist(data.id)
            },
            fetchWaitlist (schedule_id) {
                const me = this
                let ctr = 0
                me.$axios.get(`api/waitlists?scheduled_date_id=${schedule_id}`).then(res => {
                    if (res.data) {
                        me.waitlists = res.data.waitlists
                        me.waitlists.forEach((element, index) => {
                            ctr++
                        })
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.waitlistCount = ctr
                })
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target, element = document.getElementById(`legend_toggler`)
                if (element !== target) {
                    if (element.nextElementSibling) {
                        if (element.nextElementSibling.classList.contains('active')) {
                            element.nextElementSibling.classList.remove('active')
                        }
                    }
                }
            },
            toggleLegends (event) {
                const me = this
                let element = event.target
                if (element) {
                    if (element.nextElementSibling) {
                        if (element.nextElementSibling.classList.contains('active')) {
                            element.nextElementSibling.classList.remove('active')
                        } else {
                            element.nextElementSibling.classList.add('active')
                        }
                    }
                }
            },
            toggleLayout (type) {
                const me = this
                switch (type) {
                    case 'attendance':
                        me.$store.state.attendanceLayoutStatus = true
                        break
                    case 'package':
                        me.$router.push(`/customers/${me.customer.id}/packages`)
                        break
                    case 'redeem':
                        me.$store.state.redeemGiftCardStatus = true
                        break
                }
                document.body.classList.add('no_scroll')
            },
            toggleQuickSale (type) {
                const me = this
                document.getElementById('credits').classList.remove('active')
                me.buyCredits = false
                switch (type) {
                    case 'credit':
                        me.$store.state.customerCreditQuickSaleStatus = true
                        break
                    case 'product':
                        me.$store.state.customerProductQuickSaleStatus = true
                        break
                }
                document.body.classList.add('no_scroll')
            },
            getCustomer (data) {
                const me = this
                me.toggleCustomers = false
                me.$store.state.customerID = data.id
                me.customer = data
                setTimeout( () => {
                    if (me.$refs.plan) {
                        me.$refs.plan.hasCustomer = true
                    }
                }, 10)
                if (me.customer != '') {
                    if (me.customer.bookings) {
                        for (let i = 0, i_len = me.schedules.length; i < i_len; i++) {
                            for (let j = 0, j_len = me.customer.bookings.length; j < j_len; j++) {
                                if (me.schedules[i].id == me.customer.bookings[j].scheduled_date_id) {
                                    me.schedules[i].highlighted = true
                                }
                            }
                        }
                    }
                }
            },
            search (event) {
                const me = this
                me.hit = false
                clearTimeout(me.typing_timeout)
                me.typing_timeout = setTimeout( () => {
                    if (event.keyCode == 13) {
                        me.hit = true
                    }
                    if (event.keyCode != 8) {
                        me.searchCustomer(event.target.value)
                    }
                }, 500)
            },
            searchCustomer (data) {
                const me = this
                let formData = new FormData()
                me.loader(true)
                formData.append('q', data)
                formData.append('forBooker', 1)
                formData.append('enabled', 1)
                me.$axios.post('api/customers/search', formData).then(res => {
                    if (res.data) {
                        me.customers = res.data.customers
                        me.customerLength = me.customers.length
                        if (me.hit) {
                            me.getCustomer(me.customers[0])
                        } else {
                            me.toggleCustomers = true
                        }
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
            getSeats () {
                const me = this
                me.$refs.plan.fetchSeats(me.$store.state.scheduleID, me.studioID)
                document.querySelector('.plan_wrapper').style.transform = `matrix(0.4, 0, 0, 0.4, ${me.customWidth}, ${me.customHeight})`
            },
            getStudio (event) {
                const me = this
                me.studioID = event.target.value
                document.querySelectorAll('.content_wrapper .class_accordion').forEach((value, index) => {
                    value.classList.remove('toggled')
                    value.querySelector('.accordion_content').style.height = 0
                })
                setTimeout(() => {
                    if (me.$refs.plan) {
                        me.$refs.plan.fetchSeats(null, me.studioID)
                        document.querySelector('.plan_wrapper').style.transform = `matrix(0.4, 0, 0, 0.4, ${me.customWidth}, ${me.customHeight})`
                    }
                }, 10)
                me.$axios.get(`api/studios/${me.studioID}`).then(res => {
                    me.studio = res.data.studio
                })
                me.$store.state.scheduleID = 0
                me.selectStudio = true
            },
            updateNotes (event) {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let id = me.$store.state.user.id
                let formData = new FormData()
                formData.append('_method', 'PATCH')
                formData.append('user_id', id)
                formData.append('scheduled_date_id', me.scheduledDateID)
                formData.append('note', event.target.value)
                me.$axios.post('api/extras/update-user-notepad', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        console.log(res.data.message)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
            },
            panZoomInit (instance, id) {
                const me = this
                if (me.studio.online_class) {
                    instance.pause()
                } else {
                    instance.resume()
                }
                me.customInstance = instance
                let planWidth = document.querySelector('.booker_wrapper .booker_content .booker_seats .vue-pan-zoom-scene').getBoundingClientRect().width
                let planHeight = document.querySelector('.plan_wrapper').getBoundingClientRect().height
                instance.zoomAbs(planWidth / 2, planHeight / 2, 0.4)
                me.customWidth = instance.getTransform().x
                me.customHeight = instance.getTransform().y
                planWidth = instance.getTransform().x
                planHeight = instance.getTransform().y
                document.getElementById('zoom_in').addEventListener('click', function(e) {
                    me.customZoom(instance, 'in')
                })
                document.getElementById('zoom_out').addEventListener('click', function(e) {
                    me.customZoom(instance, 'out')
                })
                document.getElementById('reset').addEventListener('click', function(e) {
                    if (me.zoomCtr >= 1) {
                        me.zoomCtr = 0.4
                    }
                    if (me.zoomCtr <= 0.99999) {
                        me.zoomCtr = 1.2
                    }
                    instance.getTransform().x = planWidth
                    instance.getTransform().y = planHeight
                    instance.getTransform().scale = 0.4
                    document.querySelector('.plan_wrapper').style.transform = `matrix(0.4, 0, 0, 0.4, ${planWidth}, ${planHeight})`
                })
                document.getElementById('reload').addEventListener('click', function(e) {
                    if (me.$store.state.scheduleID != 0) {
                        setTimeout( () => {
                            me.getSeats()
                            me.fetchWaitlist(me.$store.state.scheduleID)
                        }, 10)
                    }
                })
            },
            panZoomBeforeWheel (e) {
                let shouldIgnore = !e.altKey
                return shouldIgnore
            },
            panZoomDoubleClick (e) {
                return true
            },
            panZoomTouch (e) {
                return false
            },
            customZoom (instance, type) {
                const me = this
                let planWidth = document.querySelector('.plan_wrapper').offsetWidth
                let planHeight = document.querySelector('.plan_wrapper').offsetHeight
                switch (type) {
                    case 'in':
                        if (me.zoomCtr <= 0.99999) {
                            me.zoomCtr = 1.2
                        }
                        instance.smoothZoom((planWidth / 2) + me.zoomCtr, (planHeight / 2) + me.zoomCtr, me.zoomCtr)
                        me.zoomCtr += 0.4
                        break
                    case 'out':
                        if (me.zoomCtr >= 1.0) {
                            me.zoomCtr = 0.4
                        }
                        instance.smoothZoom((planWidth / 2) + me.zoomCtr, (planHeight / 2) + me.zoomCtr, me.zoomCtr)
                        me.zoomCtr -= 0.4
                        break
                }
            },
            closeMe () {
                const me = this
                me.toggleCustomers = false
            },
            parseSchedule (data) {
                const me = this
                let result = me.$moment(data).format('YYYY-MM-D')
                return result
            },
            generateNextClasses () {
                const me = this
                if (me.isPrev) {
                    me.isPrev = false
                    me.current = me.current + 8
                }
                me.results = []
                for (let i = 0; i < 7; i++) {
                    if (me.current > me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').daysInMonth()) {
                        me.current = me.current - me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').daysInMonth()
                        me.currentMonth = me.currentMonth + 1
                        if (me.currentMonth == 13) {
                            me.currentMonth = 1
                            me.currentYear = me.currentYear + 1
                        }
                    }
                    me.populateResults(me.current, 'next')
                    if (i == 0) {
                        me.last = me.current - 1
                    }
                    me.current++
                }
            },
            generatePrevClasses () {
                const me = this
                if (!me.isPrev) {
                    me.isPrev = true
                    me.current = me.current - 8
                }
                me.results = []
                for (let i = 0; i < 7; i++) {
                    if (me.current <= 0) {
                        me.currentMonth = me.currentMonth - 1
                        if (me.currentMonth == 0) {
                            me.currentMonth = 12
                            me.currentYear = me.currentYear - 1
                            if (me.current <= 0) {
                                if (me.last <= 0) {
                                    me.current = me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').daysInMonth()
                                } else {
                                    if (me.currentMonth == 12) {
                                        me.current = me.$moment(`${me.currentYear}-${me.currentMonth}-1`, 'YYYY-MM').daysInMonth()
                                    } else {
                                        me.current = me.last
                                    }
                                }
                            } else {
                                me.current = me.$moment(`${me.currentYear}-${me.currentMonth}-${me.last}`, 'YYYY-MM-D').daysInMonth()
                            }
                        } else {
                            if (me.current == 0) {
                                if (me.last == 0) {
                                    me.current = me.$moment(`${me.currentYear}-${me.currentMonth}-${1}`, 'YYYY-MM-D').daysInMonth()
                                } else {
                                    me.current = me.$moment(`${me.currentYear}-${me.currentMonth}-${me.last}`, 'YYYY-MM-D').daysInMonth()
                                }
                            } else {
                                me.current = me.last
                            }
                        }
                    }
                    me.populateResults(me.current, 'prev')
                    me.current--
                    if (i == 6) {
                        me.last = me.current
                    }
                }
            },
            populateClasses () {
                const me = this
                me.results = []
                me.loader(true)
                let currentDate = parseInt(me.$moment().format('D'))
                me.current = currentDate
                me.last = currentDate
                me.currentMonth = parseInt(me.$moment().format('M'))
                me.currentYear = parseInt(me.$moment().format('YYYY'))
                for (let i = 0; i < 7; i++) {
                    if (currentDate > me.$moment(`${me.currentYear}-${me.currentMonth}`, 'YYYY-MM').daysInMonth()) {
                        currentDate = 1
                        me.currentMonth = me.currentMonth + 1
                        if (me.currentMonth == 13) {
                            me.currentMonth = 1
                            me.currentYear = me.currentYear + 1
                        }
                    }
                    me.results.push({
                        abbr: (me.$moment(`${me.currentYear}-${me.currentMonth}-${currentDate}`, 'YYYY-MM-D').format('M-D') == me.$moment().format('M-D')) ? 'Today' : me.$moment(`${me.currentYear}-${me.currentMonth}-${currentDate}`, 'YYYY-MM-D').format('ddd'),
                        date: me.$moment(`${me.currentYear}-${me.currentMonth}-${currentDate}`, 'YYYY-MM-D').format('MMMM D, YYYY'),
                        value: currentDate,
                        toggled: false,
                        highlighted: false
                    })
                    currentDate++
                    me.current = currentDate
                    me.isPrev = false
                }

                setTimeout( () => {
                    me.loader(false)
                }, 500)
            },
            populateResults (data, type) {
                const me = this
                for (let i = 0, len = me.results.length; i < len; i++) {
                    me.results[i].highlighted = false
                    me.results[i].toggled = false
                    document.getElementById(`sched_${i}`).querySelector('.accordion_content').style.height = 0
                }
                // document.querySelectorAll('.content_wrapper .class_accordion').forEach((value, index) => {
                //     value.classList.remove('toggled')
                //     value.querySelector('.accordion_content').style.height = 0
                // })
                me.loader(true)
                switch (type) {
                    case 'next':
                        me.results.push({
                            abbr: (me.$moment(`${me.currentYear}-${me.currentMonth}-${data}`, 'YYYY-MM-D').format('M-D') == me.$moment().format('M-D')) ? 'Today' : me.$moment(`${me.currentYear}-${me.currentMonth}-${data}`, 'YYYY-MM-D').format('ddd'),
                            date: me.$moment(`${me.currentYear}-${me.currentMonth}-${data}`, 'YYYY-MM-D').format('MMMM D, YYYY'),
                            value: data,
                            toggled: false,
                            highlighted: false
                        })
                        break
                    case 'prev':
                        me.results.unshift({
                            abbr: (me.$moment(`${me.currentYear}-${me.currentMonth}-${data}`, 'YYYY-MM-D').format('M-D') == me.$moment().format('M-D')) ? 'Today' : me.$moment(`${me.currentYear}-${me.currentMonth}-${data}`, 'YYYY-MM-D').format('ddd'),
                            date: me.$moment(`${me.currentYear}-${me.currentMonth}-${data}`, 'YYYY-MM-D').format('MMMM D, YYYY'),
                            value: data,
                            toggled: false,
                            highlighted: false
                        })
                        break
                }
                setTimeout( () => {
                    me.loader(false)
                }, 500)
            },
            async toggleClass (event, month, day, year, data, unique) {
                const me = this
                const target = event.target

                for (let i = 0, len = me.results.length; i < len; i++) {
                    if (i != unique) {
                        me.results[i].toggled = false
                        document.getElementById(`sched_${i}`).querySelector('.accordion_content').style.height = 0
                    }
                }
                //
                // let accordions = document.querySelectorAll('.booker_classes .content_wrapper .class_accordion')
                // accordions.forEach((accordion, index) => {
                //     if (accordion !== target.parentNode) {
                //         accordion.classList.remove('toggled')
                //         accordion.querySelector('.accordion_content').style.height = 0
                //     }
                // })
                if (!data.toggled) {
                    me.loader(true)
                    await me.$axios.get(`api/schedules?month=${month}&year=${year}&day=${day}&studio_id=${me.studioID}&for_booker=1`).then(res => {
                        if (res.data) {
                            me.schedules = res.data.schedules
                            if (me.customer != '') {
                                if (me.customer.bookings) {
                                    for (let i = 0, i_len = me.schedules.length; i < i_len; i++) {
                                        for (let j = 0, j_len = me.customer.bookings.length; j < j_len; j++) {
                                            if (me.schedules[i].id == me.customer.bookings[j].scheduled_date_id) {
                                                me.schedules[i].highlighted = true
                                            }
                                        }
                                    }
                                }
                            }
                            setTimeout( () => {
                                data.toggled = true
                                document.getElementById(`sched_${unique}`).querySelector('.accordion_content').style.height = `${document.getElementById(`sched_${unique}`).querySelector('.accordion_content').scrollHeight}px`
                            }, 500)
                        }
                    }).catch(err => {
                        console.log(err);
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                } else {
                    data.toggled = false
                    document.getElementById(`sched_${unique}`).querySelector('.accordion_content').style.height = 0
                }
            },
            fetchData (value) {
                const me = this
                let formData = new FormData()
                formData.append('forBooker', 1)
                me.loader(true)
                me.$axios.post('api/customers/search', formData).then(res => {
                    if (res.data) {
                        if (me.$store.state.customer != null) {
                            me.customer = me.$store.state.customer
                        }
                        me.customers = res.data.customers
                        me.customerLength = me.customers.length
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        me.$axios.get('api/user', {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            if (res.data != 0) {
                                setTimeout( () => {
                                    setTimeout( () => {
                                        if (me.$refs.plan) {
                                            me.$refs.plan.hasCustomer = true
                                        }
                                    }, 10)
                                    me.user = res.data.user
                                    me.studio = res.data.user.studio
                                    me.studioID = res.data.user.current_studio_id
                                    me.loaded = true
                                    me.populateClasses()
                                }, 500)
                            }
                        })
                        me.$axios.get('api/studios?enabled=1').then(res => {
                            me.studios = res.data.studios
                        })
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.customerTypes = res.data.customerTypes
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
