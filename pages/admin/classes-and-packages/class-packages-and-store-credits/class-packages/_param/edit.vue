<template>
    <div class="content">
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
                                <div class="form_flex_radio_alternate">
                                    <label>Restrict to New Customers</label>
                                    <div class="radio_wrapper">
                                        <div class="form_radio">
                                            <input type="radio" id="por_restrict_yes" :checked="res.por_restrict_to_new_customers == 1" value="Yes" name="por_restrict_to_new_customers" class="action_radio">
                                            <label for="por_restrict_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_restrict_no" value="No" :checked="res.por_restrict_to_new_customers == 0" name="por_restrict_to_new_customers" class="action_radio">
                                            <label for="por_restrict_no">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex_radio_alternate">
                                    <label>Allow sharing of package?</label>
                                    <div class="radio_wrapper">
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_yes" value="Yes" :checked="res.por_allow_sharing_of_package == 1" name="por_allow_sharing_of_package" class="action_radio">
                                            <label for="por_allow_yes">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="por_allow_no" value="No" :checked="res.por_allow_sharing_of_package == 0" name="por_allow_sharing_of_package" class="action_radio">
                                            <label for="por_allow_no">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="promo_start_date">Start Date <span>*</span></label>
                                        <input type="date" name="promo_start_date" autocomplete="off" class="default_text date" v-validate="'required'" v-model="res.promo_start_date">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_start_date')">{{ errors.first('promo_start_date') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="promo_end_date">End Date <span>*</span></label>
                                        <input type="date" name="promo_end_date" autocomplete="off" class="default_text date" v-validate="'required'" v-model="res.promo_end_date">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_end_date')">{{ errors.first('promo_end_date') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label>Purchase Limit <span>*</span></label>
                                        <div class="form_flex_input full">
                                            <input type="text" name="por_purchase_limit" class="default_text number" autocomplete="off" v-model="form.purchaseLimit" v-validate="'numeric|min_value:0|max_value:99999'">
                                            <div class="up" @click="addCount('purchaseLimit')"></div>
                                            <div class="down" @click="subtractCount('purchaseLimit')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('por_purchase_limit')">{{ errors.first('por_purchase_limit') | properFormat }}</span></transition>
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
                                        <div class="form_group">
                                            <label for="por_complimentary_package_mode">Mode</label>
                                            <select class="default_select alternate" name="por_complimentary_package_mode">
                                                <option value="" disabled>Choose a Mode</option>
                                                <option value="1" :selected="res.por_complimentary_package_mode == 1">Purchase Mode</option>
                                                <option value="2" :selected="res.por_complimentary_package_mode == 2">Usage Mode</option>
                                            </select>
                                        </div>
                                        <div class="form_group">
                                            <label for="por_complimentary_id">Complimentary Package</label>
                                            <select class="default_select alternate" name="por_complimentary_id">
                                                <option value="" selected disabled>Choose a Package</option>
                                                <optgroup label="Packages">
                                                    <option :value="`${classPackage.id}|||package`" v-for="(classPackage, key) in classPackages" :key="key" :selected="res.por_complimentary_package_id == classPackage.id">{{ classPackage.name }}</option>
                                                </optgroup>
                                                <optgroup label="Store Credits">
                                                    <option :value="`${storeCredit.id}|||store_credit`" v-for="(storeCredit, key) in storeCredits" :key="key" :selected="res.por_complimentary_store_credit_id == storeCredit.id">{{ storeCredit.name }}</option>
                                                </optgroup>
                                            </select>
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
                                    <option :value="type.id" v-for="(type, index) in types" :selected="res.package_type_id == type.id">{{ type.name }}</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('package_type_id')">{{ errors.first('package_type_id') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="name">Package Name <span>*</span></label>
                                <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required|max:100'" v-model="res.name">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="description">Description <span>*</span></label>
                                <textarea name="description" rows="8" class="default_text" v-validate="'required|max:500'" v-model="res.description"></textarea>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('description')">{{ errors.first('description') | properFormat }}</span></transition>
                            </div>
                            <div class="form_flex">
                                <div class="form_group flex">
                                    <label>Class Count <span>*</span></label>
                                    <div :class="`form_flex_input ${(isUnlimited) ? 'not_active' : 'active'}`">
                                        <input type="text" name="class_count" class="default_text number" autocomplete="off" v-model="form.classCount" v-validate="'required|numeric|min_value:0|max_value:99999'">
                                        <div class="up" @click="addCount('classCount')"></div>
                                        <div class="down" @click="subtractCount('classCount')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('class_count')">{{ errors.first('class_count') | properFormat }}</span></transition>
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
                                        <input type="text" name="package_price" class="default_text number" v-model="res.package_price" autocomplete="off" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}">
                                        <div class="placeholder">PHP</div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('package_price')">{{ errors.first('package_price') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group flex">
                                    <label for="purchase_limit_per_customer">Purchase Limit per Customer <span>*</span></label>
                                    <div class="form_flex_input full">
                                        <input type="text" name="purchase_limit_per_customer" class="default_text number" v-model="res.purchase_limit_per_customer" autocomplete="off" v-validate="'required|numeric|min_value:1|max_value:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('purchase_limit_per_customer')">{{ errors.first('purchase_limit_per_customer') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group flex">
                                    <label>Expire In <span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="expires_in" class="default_text number" autocomplete="off" v-model="form.expiryIn = res.expires_in" v-validate="'required|numeric|min_value:0|max_value:99999'">
                                        <div class="up" @click="addCount('expiryIn')"></div>
                                        <div class="down" @click="subtractCount('expiryIn')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('expires_in')">{{ errors.first('expires_in') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <select class="default_select alternate" name="expiry_type">
                                            <option value="" disabled>Choose a Type</option>
                                            <option value="day" :selected="res.expiry_type == 'day' || (!isUnlimited) ? true : false" :disabled="(isUnlimited || res.expiry_type == 'month') ? true : false">Days</option>
                                            <option value="month" :selected="(res.expiry_type == 'month' || isUnlimited) ? true : false">Months</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('expiry_type')">{{ errors.first('expiry_type') | properFormat }}</span></transition>
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
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ao_expiry_if_not_activated')">{{ errors.first('ao_expiry_if_not_activated') | properFormat }}</span></transition>
                                    </div>
                                    <div :class="`form_flex_input ${(!isNotActivated) ? 'not_active' : 'active'}`">
                                        <select class="default_select alternate" name="ao_expiry_if_not_activated_type">
                                            <option value="" disabled>Choose a Type</option>
                                            <option value="day" :selected="res.ao_expiry_if_not_activated_type == 'day'">Days</option>
                                            <option value="month" :selected="res.ao_expiry_if_not_activated_type == 'month'">Months</option>
                                        </select>
                                    </div>
                                </div>
                                <div :class="`form_group flex ${(isNotActivated) ? 'not_active' : 'active'}`">
                                    <label for="ao_fixed_activation_date">Fixed Activation Date</label>
                                    <input type="date" name="ao_fixed_activation_date" autocomplete="off" class="default_text date" v-model="form.ao_fixed_activation_date = res.ao_fixed_activation_date">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
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
</template>

<script>
    import Foot from '../../../../../../components/Foot'
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
                res: [],
                form: {
                    classCount: 0,
                    expiryIn: 0,
                    notActivated: 0,
                    purchaseLimit: 0,
                    ao_fixed_activation_date: null
                }
            }
        },
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        let lastValue = ''
                        for (let i = 1; i < newValue.length; i++) {
                            lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
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
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/packages/class-packages/${me.$route.params.param}`, formData).then(res => {
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
            me.fetchTypes()
            me.$axios.get(`api/packages/class-packages/${me.$route.params.param}`).then(res => {
                me.res = res.data.classPackage
                me.form.purchaseLimit = me.res.por_purchase_limit
                me.form.classCount = me.res.class_count
                me.form.notActivated = me.res.ao_expiry_if_not_activated
                me.isPromo = (me.res.is_promo == 1) ? true : false
                me.isNotActivated = (me.res.ao_activate_on_first_class_booked == 1) ? true : false
                me.isComplimentary = (me.res.por_complimentary_package_mode == 1) ? true : false
                me.isUnlimited = (me.res.class_count_unlimited == 1) ? true : false
            })
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 5]
        }
    }
</script>
