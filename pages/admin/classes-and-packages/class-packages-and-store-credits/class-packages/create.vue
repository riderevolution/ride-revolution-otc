<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Add New Class Package</h1>
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
                                <div class="form_flex_radio_alternate">
                                    <label>Restrict to New Customers</label>
                                    <div class="radio_wrapper">
                                        <div class="form_radio">
                                            <input type="radio" id="por_restrict_yes" value="Yes" name="por_restrict_to_new_customers" class="action_radio">
                                            <label for="por_restrict_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_restrict_no" value="No" name="por_restrict_to_new_customers" class="action_radio">
                                            <label for="por_restrict_no">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex_radio_alternate">
                                    <label>Allow sharing of package?</label>
                                    <div class="radio_wrapper">
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_yes" value="Yes" name="por_allow_sharing_of_package" class="action_radio">
                                            <label for="por_allow_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_no" value="No" name="por_allow_sharing_of_package" class="action_radio">
                                            <label for="por_allow_no">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="promo_start_date">Start Date <span>*</span></label>
                                        <input type="date" name="promo_start_date" class="default_text date" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_start_date')">{{ errors.first('promo_start_date') }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="promo_end_date">End Date <span>*</span></label>
                                        <input type="date" name="promo_end_date" class="default_text date" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_end_date')">{{ errors.first('promo_end_date') }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label>Purchase Limit <span>*</span></label>
                                        <div class="form_flex_input full">
                                            <input type="text" name="por_purchase_limit" class="default_text number" autocomplete="off" v-model="form.purchaseLimit" v-validate="'required|numeric|min_value:0'">
                                            <div class="up" @click="addCount('purchaseLimit')"></div>
                                            <div class="down" @click="subtractCount('purchaseLimit')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('por_purchase_limit')">{{ errors.first('por_purchase_limit') }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_group flex check">
                                        <div class="form_check">
                                            <input type="checkbox" id="por_has_complimentary_package" name="por_has_complimentary_package" class="action_check" checked @change="isComplimentary ^= true">
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
                                        <div class="form_group">
                                            <label for="por_complimentary_package_mode">Mode</label>
                                            <select class="default_select alternate" name="por_complimentary_package_mode">
                                                <option value="" selected disabled>Choose a Mode</option>
                                                <option value="1" selected>Purchase Mode</option>
                                                <option value="2">Usage Mode</option>
                                            </select>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('por_complimentary_package_mode')">{{ errors.first('por_complimentary_package_mode') }}</span></transition>
                                        </div>
                                        <div class="form_group">
                                            <label for="por_complimentary_id">Complimentary Package</label>
                                            <select class="default_select alternate" name="por_complimentary_id">
                                                <option value="" selected disabled>Choose a Package</option>
                                                <optgroup label="Packages">
                                                    <option :value="`${classPackage.id}|||package`" v-for="(classPackage, key) in classPackages" :key="key">{{ classPackage.name }}</option>
                                                </optgroup>
                                                <optgroup label="Store Credits">
                                                    <option :value="`${storeCredit.id}|||store_credit`" v-for="(storeCredit, key) in storeCredits" :key="key">{{ storeCredit.name }}</option>
                                                </optgroup>
                                            </select>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('por_complimentary_id')">{{ errors.first('por_complimentary_id') }}</span></transition>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </transition>
                        <div class="form_main_group">
                            <div class="form_group">
                                <label for="name">Package Type <span>*</span></label>
                                <select class="default_select alternate" name="package_type_id" v-validate="'required'">
                                    <option value="" selected disabled>Choose a Type</option>
                                    <option :value="type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('package_type_id')">{{ errors.first('package_type_id') }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="name">Package Name <span>*</span></label>
                                <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="description">Description <span>*</span></label>
                                <textarea name="description" rows="8" class="default_text" v-validate="'required'"></textarea>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('description')">{{ errors.first('description') }}</span></transition>
                            </div>
                            <div class="form_flex">
                                <div class="form_group flex">
                                    <label for="class_count">Class Count <span>*</span></label>
                                    <div :class="`form_flex_input ${(isUnlimited) ? 'not_active' : 'active'}`">
                                        <input type="text" name="class_count" class="default_text number" autocomplete="off" v-model="form.classCount" v-validate="'required|numeric|max_value:9999999999|min_value:0'">
                                        <div class="up" @click="addCount('classCount')"></div>
                                        <div class="down" @click="subtractCount('classCount')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('class_count')">{{ errors.first('class_count') }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <div class="form_check">
                                            <input type="checkbox" id="class_count_unlimited" name="class_count_unlimited" class="action_check" @change="isUnlimited ^= true">
                                            <label for="class_count_unlimited">Unlimited</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_group flex">
                                    <label for="package_price">Package Price <span>*</span></label>
                                    <div class="form_flex_input full">
                                        <input type="text" name="package_price" class="default_text number" autocomplete="off"v-validate="'required|numeric|decimal:2'">
                                        <div class="placeholder">PHP</div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('package_price')">{{ errors.first('package_price') }}</span></transition>
                                    </div>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group flex">
                                    <label for="purchase_limit_per_customer">Purchase Limit per Customer <span>*</span></label>
                                    <div class="form_flex_input full">
                                        <input type="text" name="purchase_limit_per_customer" class="default_text number" autocomplete="off"v-validate="'required|numeric'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('purchase_limit_per_customer')">{{ errors.first('purchase_limit_per_customer') }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group flex">
                                    <label>Expire In <span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="expires_in" class="default_text number" autocomplete="off" v-model="form.expiryIn" v-validate="'required|numeric|max_value:9999999999|min_value:0'">
                                        <div class="up" @click="addCount('expiryIn')"></div>
                                        <div class="down" @click="subtractCount('expiryIn')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('expires_in')">{{ errors.first('expires_in') }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <select class="default_select alternate" name="expiry_type">
                                            <option value="" disabled>Choose a Type</option>
                                            <option value="day" :selected="(!isUnlimited) ? true : false" :disabled="(isUnlimited) ? true : false">Days</option>
                                            <option value="month" :selected="(isUnlimited) ? true : false">Months</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('expiry_type')">{{ errors.first('expiry_type') }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Activation Options</h2>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex_radio_alternate">
                                <label>Activation on First Class Booked</label>
                                <div class="radio_wrapper">
                                    <div class="form_radio">
                                        <input type="radio" id="ao_yes" value="Yes" name="ao_activate_on_first_class_booked" class="action_radio" @change="toggleFirstClass(true)">
                                        <label for="ao_yes">Yes</label>
                                    </div>
                                    <div class="form_radio">
                                        <input type="radio" id="ao_no" value="No" name="ao_activate_on_first_class_booked" checked class="action_radio" @change="toggleFirstClass(false)">
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
                                        <input type="text" name="ao_expiry_if_not_activated" class="default_text number" autocomplete="off" v-model="form.notActivated" v-validate="'required|numeric|max_value:9999999999|min_value:0'">
                                        <div class="up" @click="addCount('notActivated')"></div>
                                        <div class="down" @click="subtractCount('notActivated')"></div>
                                    </div>
                                    <div :class="`form_flex_input ${(!isNotActivated) ? 'not_active' : 'active'}`">
                                        <select class="default_select alternate" name="ao_expiry_if_not_activated_type">
                                            <option value="" selected disabled>Choose a Type</option>
                                            <option value="day" selected>Days</option>
                                            <option value="month">Months</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ao_expiry_if_not_activated_type')">{{ errors.first('ao_expiry_if_not_activated_type') }}</span></transition>
                                    </div>
                                </div>
                                <div :class="`form_group flex ${(isNotActivated) ? 'not_active' : 'active'}`">
                                    <label for="ao_fixed_activation_date">Fixed Activation Date</label>
                                    <input type="date" name="ao_fixed_activation_date" autocomplete="off" class="default_text date" v-model="form.ao_fixed_activation_date">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
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
</template>

<script>
    import Foot from '../../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                isUnlimited: false,
                isComplimentary: true,
                isNotActivated: false,
                isPromo: false,
                lastRoute: '',
                prevRoute: '',
                types: [],
                classPackages: [],
                storeCredits: [],
                form: {
                    classCount: 0,
                    expiryIn: 0,
                    notActivated: 0,
                    purchaseLimit: 0,
                    ao_fixed_activation_date: '1999-01-01'
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
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('ao_fixed_activation_date', me.form.ao_fixed_activation_date)
                        me.loader(true)
                        me.$axios.post('api/packages/class-packages', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$router.push(`/admin/${me.prevRoute}/${me.lastRoute}`)
                                }
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
                me.$axios.get('api/extras/class-packages-except-me').then(res => {
                    me.classPackages = res.data.classPackages
                })
                me.$axios.get('api/packages/store-credits?enabled=1').then(res => {
                    me.storeCredits = res.data.storeCredits.data
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchTypes()
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
