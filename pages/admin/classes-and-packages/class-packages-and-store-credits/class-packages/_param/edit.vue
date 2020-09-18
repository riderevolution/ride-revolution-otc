<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Update {{ res.name }}</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Class Package Overview</h2>
                                <div class="form_check toggler" @click="isPromo ^= true">
                                    <input type="hidden" id="is_promo" name="is_promo" class="action_check" :value="(isPromo) ? 1 : 0">
                                    <div :class="`toggle ${(isPromo) ? 'active' : ''}`"></div>
                                    <label for="is_promo">Promo</label>
                                </div>
                            </div>
                            <transition name="fade">
                                <div class="form_main_group alternate" v-if="isPromo">
                                    <div class="form_group">
                                        <label for="discounted_package_price">Discounted Package Price <span>*</span></label>
                                        <div class="form_flex_input full">
                                            <input type="text" name="discounted_package_price" placeholder="Enter discounted package price" class="default_text number" autocomplete="off" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 999999}" v-model="res.discounted_price">
                                            <div class="placeholder">PHP</div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('discounted_package_price')">{{ properFormat(errors.first('discounted_package_price')) }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_flex">
                                        <div class="form_group">
                                            <label for="promo_start_date">Start Date <span>*</span></label>
                                            <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'promo_start_date'" :name="'promo_start_date'" :min-date="$moment().format('YYYY-MM-DD')" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_start_date')">{{ properFormat(errors.first('promo_start_date')) }}</span></transition>
                                        </div>
                                        <div class="form_group">
                                            <label for="promo_end_date">End Date <span>*</span></label>
                                            <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'promo_end_date'" :name="'promo_end_date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :label="'Select end date'" v-validate="'required'"></v-ctk>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_end_date')">{{ properFormat(errors.first('promo_end_date')) }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_flex check">
                                        <div class="form_group flex">
                                            <label>Purchase Limit <span>*</span></label>
                                            <div class="form_flex_input full">
                                                <input type="text" name="por_purchase_limit" class="default_text number" placeholder="Enter purchase limit" autocomplete="off" v-model="form.purchaseLimit" v-validate="'required|numeric|min_value:0|max_value:99999'">
                                                <div class="up" @click="addCount('purchaseLimit')"></div>
                                                <div class="down" @click="subtractCount('purchaseLimit')"></div>
                                                <transition name="slide"><span class="validation_errors" v-if="errors.has('por_purchase_limit')">{{ properFormat(errors.first('por_purchase_limit')) }}</span></transition>
                                            </div>
                                        </div>
                                        <div class="form_group flex check">
                                            <div class="form_check">
                                                <input type="checkbox" id="por_has_complimentary_package" name="por_has_complimentary_package" class="action_check" :checked="res.por_has_complimentary_package == 1" @change="isComplimentary ^= true">
                                                <label for="por_has_complimentary_package">Complimentary Package Mode</label>
                                            </div>
                                        </div>
                                    </div>
                                    <transition name="fade">
                                        <div class="form_group_disclaimer" v-if="isComplimentary">
                                            <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>Tie a free package to this package to do things like ‘Take 10 classes and get 1 free’. In Purchase Mode, the complimentary package is given immediately on purchase of this package. In Usage Mode, the complimentary package is given when this package is used up, and the activation date is set to the same date as the purchased package. It will not be given if the package expires before all classes have been used up.</span></div>
                                        </div>
                                    </transition>
                                    <transition name="fade">
                                        <div class="form_flex" v-if="isComplimentary">
                                            <div class="form_group new_alt">
                                                <label for="por_complimentary_package_mode">Mode</label>
                                                <select class="default_select alternate" name="por_complimentary_package_mode" key="por_complimentary_package_mode">
                                                    <option value="" disabled>Choose a Mode</option>
                                                    <option value="1" :selected="res.por_complimentary_package_mode == 1">Purchase Mode</option>
                                                    <option value="2" :selected="res.por_complimentary_package_mode == 2">Usage Mode</option>
                                                </select>
                                            </div>
                                            <div class="form_group new_alt">
                                                <label for="por_complimentary_id">Complimentary Package</label>
                                                <select class="default_select alternate" name="por_complimentary_id" key="por_complimentary_id" v-validate="'required'">
                                                    <option value="" selected disabled>Choose a Package</option>
                                                    <optgroup label="Packages">
                                                        <option :value="`${classPackage.id}|||package`" v-for="(classPackage, key) in classPackages" :key="key" :selected="res.por_complimentary_package_id == classPackage.id">{{ classPackage.name }}</option>
                                                    </optgroup>
                                                    <optgroup label="Store Credits">
                                                        <option :value="`${storeCredit.id}|||store_credit`" v-for="(storeCredit, key) in storeCredits" :key="key" :selected="res.por_complimentary_store_credit_id == storeCredit.id">{{ storeCredit.name }}</option>
                                                    </optgroup>
                                                </select>
                                                <transition name="slide"><span class="validation_errors" v-if="errors.has('por_complimentary_id')">{{ properFormat(errors.first('por_complimentary_id')) }}</span></transition>
                                            </div>
                                        </div>
                                    </transition>
                                </div>
                            </transition>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="name">Package Type <span>*</span></label>
                                        <select class="default_select alternate" name="package_type_id" v-validate="'required'">
                                            <option value="" selected disabled>Choose a Type</option>
                                            <option :value="type.id" v-for="(type, index) in types" :selected="res.package_type_id == type.id">{{ type.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('package_type_id')">{{ properFormat(errors.first('package_type_id')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="name">Package Name <span>*</span></label>
                                        <input type="text" name="name" autocomplete="off" class="default_text" placeholder="Enter package name" v-validate="'required|max:100'" v-model="res.name">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ properFormat(errors.first('name')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group">
                                    <label for="description">Description <span>*</span></label>
                                    <textarea name="description" rows="8" class="default_text" id="description" v-validate="'required|max:2000'"></textarea>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('description')">{{ properFormat(errors.first('description')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="summary">Summary <span>*</span></label>
                                    <textarea name="summary" rows="4" id="summary" class="default_text" v-validate="'required|max:500'"></textarea>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('summary')">{{ properFormat(errors.first('summary')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="gift_card_description">Gift Card Description <span>*</span></label>
                                    <textarea name="gift_card_description" rows="2" id="gift_card_description" class="default_text" v-validate="'required|max:200'"></textarea>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('gift_card_description')">{{ properFormat(errors.first('gift_card_description')) }}</span></transition>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Subscription</h2>
                                <div class="form_check toggler" @click="isRecurring ^= true">
                                    <input type="hidden" id="recurring" name="recurring" class="action_check" :value="(isRecurring) ? 1 : 0">
                                    <div :class="`toggle ${(isRecurring) ? 'active' : ''}`"></div>
                                    <label for="recurring">Recurring</label>
                                </div>
                            </div>
                            <div class="form_main_group" v-if="isRecurring">
                                <div class="form_group">
                                    <label for="plan_code">Plan Code <span>*</span></label>
                                    <input type="text" name="plan_code" autocomplete="off" placeholder="Enter plan code" class="default_text" v-model="res.plan_code" v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('plan_code')">{{ properFormat(errors.first('plan_code')) }}</span></transition>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Class Package Configuration</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Allow sharing of package? <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_sharing_yes" value="Yes" :checked="res.por_allow_sharing_of_package == 1" v-validate="'required'" name="por_allow_sharing_of_package" class="action_radio">
                                            <label for="por_allow_sharing_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_sharing_no" value="No" :checked="res.por_allow_sharing_of_package == 0" v-validate="'required'" name="por_allow_sharing_of_package" class="action_radio">
                                            <label for="por_allow_sharing_no">No</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('por_allow_sharing_of_package')">{{ properFormat(errors.first('por_allow_sharing_of_package')) }}</span></transition>
                                    </div>
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Allow transfer of package? <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_transfer_yes" value="Yes" :checked="res.por_allow_transferring_of_package == 1" v-validate="'required'" name="por_allow_transferring_of_package" class="action_radio">
                                            <label for="por_allow_transfer_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_transfer_no" value="No" :checked="res.por_allow_transferring_of_package == 0" v-validate="'required'" name="por_allow_transferring_of_package" class="action_radio">
                                            <label for="por_allow_transfer_no">No</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('por_allow_transferring_of_package')">{{ properFormat(errors.first('por_allow_transferring_of_package')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Allow freezing of package? <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_freezing_yes" value="Yes" :checked="res.por_allow_freezing_of_package == 1" v-validate="'required'" name="por_allow_freezing_of_package" class="action_radio">
                                            <label for="por_allow_freezing_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_freezing_no" value="No" :checked="res.por_allow_freezing_of_package == 0" v-validate="'required'" name="por_allow_freezing_of_package" class="action_radio">
                                            <label for="por_allow_freezing_no">No</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('por_allow_freezing_of_package')">{{ properFormat(errors.first('por_allow_freezing_of_package')) }}</span></transition>
                                    </div>
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Allow transferring if used? <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_used_yes" value="Yes" :checked="res.por_allow_transferring_if_used == 1" v-validate="'required'" name="por_allow_transferring_if_used" class="action_radio">
                                            <label for="por_allow_used_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_used_no" value="No" :checked="res.por_allow_transferring_if_used == 0" v-validate="'required'" name="por_allow_transferring_if_used" class="action_radio">
                                            <label for="por_allow_used_no">No</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('por_allow_transferring_if_used')">{{ properFormat(errors.first('por_allow_transferring_if_used')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Customer Remains New on Purchase <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="remains_new_yes" value="Yes" :checked="res.stay_as_first_timer == 1" v-validate="'required'" name="stay_as_first_timer" class="action_radio">
                                            <label for="remains_new_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="remains_new_no" value="No" :checked="res.stay_as_first_timer == 0" v-validate="'required'" name="stay_as_first_timer" class="action_radio">
                                            <label for="remains_new_no">No</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('stay_as_first_timer')">{{ properFormat(errors.first('stay_as_first_timer')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="max_per_class">Max Number of Bookings Per Class <span>*</span></label>
                                        <input type="text" name="max_per_class" class="default_text number" placeholder="Enter max number of bookings per class" v-model="res.max_per_class" autocomplete="off" v-validate="'required|numeric|min_value:1|max_value:5'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('max_per_class')">{{ properFormat(errors.first('max_per_class')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label>Class Count <span>*</span></label>
                                        <div :class="`form_flex_input ${(isUnlimited) ? 'not_active' : 'active'}`">
                                            <input type="text" name="class_count" class="default_text number" placeholder="Enter class count" autocomplete="off" v-model="form.classCount" v-validate="'required|numeric|min_value:0|max_value:99999'">
                                            <div class="up" @click="addCount('classCount')"></div>
                                            <div class="down" @click="subtractCount('classCount')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('class_count')">{{ properFormat(errors.first('class_count')) }}</span></transition>
                                        </div>
                                        <div class="form_flex_input">
                                            <div class="form_check">
                                                <input type="checkbox" id="class_count_unlimited" name="class_count_unlimited" class="action_check" :checked="res.class_count_unlimited == 1" @change="isUnlimited ^= true">
                                                <label for="class_count_unlimited">Unlimited</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form_group flex">
                                        <label for="package_price">Package Price <span>*</span></label>
                                        <div class="form_flex_input full">
                                            <input type="text" name="package_price" placeholder="Enter package price" class="default_text number" v-model="res.package_price" autocomplete="off" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 999999}">
                                            <div class="placeholder">PHP</div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('package_price')">{{ properFormat(errors.first('package_price')) }}</span></transition>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label for="purchase_limit_per_customer">Purchase Limit per Customer</label>
                                        <div class="form_flex_input full">
                                            <input type="text" name="purchase_limit_per_customer" placeholder="Enter purchase limit per customer" class="default_text number" v-model="res.purchase_limit_per_customer" autocomplete="off" v-validate="'numeric|max_value:99999'">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('purchase_limit_per_customer')">{{ properFormat(errors.first('purchase_limit_per_customer')) }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_group flex" v-if="!isRecurring">
                                        <label>Expire In <span>*</span></label>
                                        <div class="form_flex_input">
                                            <input type="text" name="expires_in" class="default_text number" placeholder="Enter expire in" autocomplete="off" v-model="form.expiryIn = res.expires_in" v-validate="'required|numeric|min_value:0|max_value:99999'">
                                            <div class="up" @click="addCount('expiryIn')"></div>
                                            <div class="down" @click="subtractCount('expiryIn')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('expires_in')">{{ properFormat(errors.first('expires_in')) }}</span></transition>
                                        </div>
                                        <div class="form_flex_input">
                                            <select class="default_select alternate" name="expiry_type">
                                                <option value="" disabled>Choose a Type</option>
                                                <option value="day" :selected="res.expiry_type == 'day'">Days</option>
                                                <option value="month" :selected="res.expiry_type == 'month'">Months</option>
                                            </select>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('expiry_type')">{{ properFormat(errors.first('expiry_type')) }}</span></transition>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Image Upload</h2>
                            </div>
                            <div class="form_main_group">
                                <image-handler-container ref="image_handler" :dimension="imageDimensions" :multiple="false" :data="res.images" :parent="res.id" />
                            </div>
                        </div>
                        <div class="form_wrapper" v-if="!isRecurring">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Activation Options</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex_radio_alternate">
                                    <label>Activation on First Class Booked</label>
                                    <div class="radio_wrapper">
                                        <div class="form_radio">
                                            <input type="radio" id="ao_yes" value="Yes" name="ao_activate_on_first_class_booked" :checked="res.ao_activate_on_first_class_booked == 1" class="action_radio" @change="toggleFirstClass(true)">
                                            <label for="ao_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="ao_no" value="No" name="ao_activate_on_first_class_booked" :checked="res.ao_activate_on_first_class_booked == 0" class="action_radio" @change="toggleFirstClass(false)">
                                            <label for="ao_no">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_group_disclaimer">
                                    <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>Sets the package activation date to the date of the first class the customer signs up for with this package. If set to No, package is immediately activated on purchase.</span></div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label>Days/months to expire if not activated:</label>
                                        <div :class="`form_flex_input ${(!isNotActivated) ? 'not_active' : 'active'}`">
                                            <input type="text" name="ao_expiry_if_not_activated" class="default_text number" autocomplete="off" v-model="form.notActivated" v-validate="'numeric|min_value:0|max_value:99999'">
                                            <div class="up" @click="addCount('notActivated')"></div>
                                            <div class="down" @click="subtractCount('notActivated')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ao_expiry_if_not_activated')">{{ properFormat(errors.first('ao_expiry_if_not_activated')) }}</span></transition>
                                        </div>
                                        <div :class="`form_flex_input ${(!isNotActivated) ? 'not_active' : 'active'}`">
                                            <select class="default_select alternate" name="ao_expiry_if_not_activated_type">
                                                <option value="" disabled>Choose a Type</option>
                                                <option value="day" :selected="res.ao_expiry_if_not_activated_type == 'day'">Days</option>
                                                <option value="month" :selected="res.ao_expiry_if_not_activated_type == 'month'">Months</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_check">
                                <input type="checkbox" id="featured" name="featured" class="action_check" :checked="res.featured == 1">
                                <label for="featured">Home Page</label>
                            </div>
                            <div class="form_check">
                                <input type="checkbox" id="refundable" name="refundable" class="action_check" :checked="res.refundable == 1">
                                <label for="refundable">Refundable</label>
                            </div>
                            <div class="form_check">
                                <input type="checkbox" id="show_on_web" name="show_on_web" class="action_check" :checked="res.show_on_web == 1">
                                <label for="show_on_web">Show on Web</label>
                            </div>
                            <div class="form_check">
                                <input type="checkbox" id="por_restrict_to_new_customers" name="por_restrict_to_new_customers" class="action_check" :checked="res.por_restrict_to_new_customers == 1">
                                <label for="por_restrict_to_new_customers">Restrict to New Customers</label>
                            </div>
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" :checked="res.enabled == 1">
                                    <label for="enabled">Activate</label>
                                </div>
                                <div class="button_group">
                                    <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../../../components/Foot'
    import ImageHandlerContainer from '../../../../../../components/ImageHandlerContainer'
    export default {
        components: {
            Foot,
            ImageHandlerContainer
        },
        data () {
            return {
                name: 'Classes and Packages',
                access: true,
                loaded: false,
                imageDimensions: {
                    imageWidth: 2814,
                    imageHeight: 1605
                },
                isUnlimited: false,
                isComplimentary: true,
                isNotActivated: false,
                isPromo: false,
                isRecurring: false,
                lastRoute: '',
                prevRoute: '',
                types: [],
                classPackages: [],
                storeCredits: [],
                res: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: '',
                    classCount: 0,
                    expiryIn: 0,
                    notActivated: 0,
                    purchaseLimit: 0
                }
            }
        },
        methods: {
            toggleFirstClass (status) {
                const me = this
                if (status) {
                    me.isNotActivated = true
                } else {
                    me.isNotActivated = false
                }
            },
            addCount (type) {
                const me = this
                let data
                switch (type) {
                    case 'classCount':
                        data = parseInt(me.form.classCount)
                        data != 0 && (me.form.classCount = 0)
                        me.form.classCount = (data += 1)
                        break
                    case 'expiryIn':
                        data = parseInt(me.form.expiryIn)
                        data != 0 && (me.form.expiryIn = 0)
                        me.form.expiryIn = (data += 1)
                        break
                    case 'notActivated':
                        data = parseInt(me.form.notActivated)
                        data != 0 && (me.form.notActivated = 0)
                        me.form.notActivated = (data += 1)
                        break
                    case 'purchaseLimit':
                        data = parseInt(me.form.purchaseLimit)
                        data != 0 && (me.form.purchaseLimit = 0)
                        me.form.purchaseLimit = (data += 1)
                        break
                }
            },
            subtractCount (type) {
                const me = this
                let data
                switch (type) {
                    case 'classCount':
                        data = parseInt(me.form.classCount)
                        data > 0 && (me.form.classCount = (data -= 1))
                        break
                    case 'expiryIn':
                        data = parseInt(me.form.expiryIn)
                        data > 0 && (me.form.expiryIn = (data -= 1))
                        break
                    case 'notActivated':
                        data = parseInt(me.form.notActivated)
                        data > 0 && (me.form.notActivated = (data -= 1))
                        break
                    case 'purchaseLimit':
                        data = parseInt(me.form.purchaseLimit)
                        data > 0 && (me.form.purchaseLimit = (data -= 1))
                        break
                }
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        if (me.isRecurring) {
                            formData.append('expires_in', 99999)
                            formData.append('expiry_type', 'month')
                            formData.append('ao_activate_on_first_class_booked', 'No')
                            formData.append('ao_expiry_if_not_activated', 99999)
                            formData.append('ao_expiry_if_not_activated_type', 'month')
                        }
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/packages/class-packages/${me.$route.params.param}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Updated')
                                    me.$router.push(`/admin/${me.prevRoute}/${me.lastRoute}`)
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
							offset: -250
						})
                    }
                })
            },
            fetchTypes () {
                const me = this
                me.$axios.get('api/packages/package-types').then(res => {
                    me.types = res.data.packageTypes.data
                })
                me.$axios.get(`api/extras/class-packages-except-me?id=${me.$route.params.param}`).then(res => {
                    me.classPackages = res.data.classPackages
                })
                me.$axios.get('api/packages/store-credits?enabled=1').then(res => {
                    me.storeCredits = res.data.storeCredits.data
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchTypes()
                me.$axios.get(`api/packages/class-packages/${me.$route.params.param}`).then(res => {
                    me.loaded = true
                    setTimeout( () => {
                        $('#description').summernote({
                            tabsize: 4,
                            height: 400,
                            followingToolbar: false,
                            toolbar: [
                                [ 'font', [ 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear'] ],
                                [ 'color', [ 'color' ] ],
                                [ 'para', [ 'ol', 'ul', 'paragraph', 'height' ] ],
                                [ 'view', [ 'undo', 'redo', 'fullscreen', 'codeview' ] ]
                            ],
                            codemirror: {
                                lineNumbers: true,
                                htmlMode: true,
                                mode: "text/html",
                                tabMode: 'indent',
                                lineWrapping: true
                            }
                        })
                        $('#summary').summernote({
                            tabsize: 4,
                            height: 200,
                            followingToolbar: false,
                            disableResizeEditor: true,
                            toolbar: [
                                [ 'font', [ 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear'] ],
                                [ 'color', [ 'color' ] ],
                                [ 'para', [ 'ol', 'ul', 'paragraph', 'height' ] ],
                                [ 'view', [ 'undo', 'redo', 'fullscreen', 'codeview' ] ]
                            ],
                            codemirror: {
                                lineNumbers: true,
                                htmlMode: true,
                                mode: "text/html",
                                tabMode: 'indent',
                                lineWrapping: true
                            }
                        })
                        $('#gift_card_description').summernote({
                            tabsize: 4,
                            height: 100,
                            followingToolbar: false,
                            disableResizeEditor: true,
                            toolbar: [
                                [ 'font', [ 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear'] ],
                                [ 'color', [ 'color' ] ],
                                [ 'para', [ 'ol', 'ul', 'paragraph', 'height' ] ],
                                [ 'view', [ 'undo', 'redo', 'fullscreen', 'codeview' ] ]
                            ],
                            codemirror: {
                                lineNumbers: true,
                                htmlMode: true,
                                mode: "text/html",
                                tabMode: 'indent',
                                lineWrapping: true
                            }
                        })
                        $('#description').summernote('code', me.res.description)
                        $('#summary').summernote('code', me.res.summary)
                        $('#gift_card_description').summernote('code', me.res.gift_card_description)
                    }, 100)
                    me.res = res.data.classPackage
                    me.form.purchaseLimit = me.res.por_purchase_limit
                    me.form.classCount = me.res.class_count
                    me.form.notActivated = me.res.ao_expiry_if_not_activated
                    me.isPromo = (me.res.is_promo == 1) ? true : false
                    me.isRecurring = (me.res.recurring == 1) ? true : false
                    me.isNotActivated = (me.res.ao_activate_on_first_class_booked == 1) ? true : false
                    me.isComplimentary = (me.res.por_has_complimentary_package == 1) ? true : false
                    me.isUnlimited = (me.res.class_count_unlimited == 1) ? true : false
                    me.form.start_date = (me.res.promo_start_date != null) ? me.res.promo_start_date : me.form.start_date
                    me.form.end_date = (me.res.promo_end_date != null) ? me.res.promo_end_date : me.form.end_date
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 5]
        }
    }
</script>
