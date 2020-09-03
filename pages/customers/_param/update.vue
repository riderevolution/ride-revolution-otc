<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/customers/${lastRoute}/details`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Customers</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Update Customer</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                        <div class="form_group_disclaimer">
                            <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>Fields with asterisks(*) are required.</span></div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Customer Overview</h2>
                                <div class="form_photo" @mouseover="tooltip = true" @mouseout="tooltip = false">
                                    <transition name="slide">
                                        <div class="tooltip" v-if="tooltip">
                                            Max dimension: 600x600
                                        </div>
                                    </transition>
                                    <input type="file" id="image" name="image[]" class="action_photo" @change="getFile($event)" v-validate="'image|size:1000|image|ext:jpeg,jpg,png'">
                                    <input type="hidden" name="image_id[]" v-model="res.customer_details.images[0].id" v-if="res.customer_details.images[0].path != null">
                                    <label for="image" :class="`${(previewImage) ? 'active' : ''}`"><span>Upload Photo</span></label>
                                    <img id="preview_image" src="/" v-if="previewImage" />
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('image[]')">{{ properFormat(errors.first('image[]')) }}</span></transition>
                                </div>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="first_name">First Name <span>*</span></label>
                                        <input type="text" name="first_name" autocomplete="off" class="default_text" v-model="res.first_name" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ properFormat(errors.first('first_name')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="last_name">Last Name <span>*</span></label>
                                        <input type="text" name="last_name" autocomplete="off" class="default_text" v-model="res.last_name" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ properFormat(errors.first('last_name')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="email">Email Address <span>*</span></label>
                                        <input type="email" name="email" autocomplete="off" class="default_text" v-model="res.email" v-validate="{required: true, email: true, regex: '^[a-zA-Z0-9-@-_-.]*$', max: 70}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ properFormat(errors.first('email')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="co_contact_number">Contact Number <span>*</span></label>
                                        <input type="text" name="co_contact_number" autocomplete="off" v-model="res.customer_details.co_contact_number" class="default_text" v-validate="'required|numeric|min:7|max:11'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('co_contact_number')">{{ properFormat(errors.first('co_contact_number')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="co_birthdate">Birth Date <span>*</span></label>
                                        <v-ctk v-model="form.birth_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'co_birthdate'" :name="'co_birthdate'" :max-date="$moment().format('YYYY-MM-DD')" :label="'Select birth date'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('co_birthdate')">{{ properFormat(errors.first('co_birthdate')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="co_weight">Weight (in kilograms)</label>
                                        <input type="text" name="co_weight" autocomplete="off" v-model="res.customer_details.co_weight" class="default_text" v-validate="'numeric|min_value:1|max_value:200'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('co_weight')">{{ properFormat(errors.first('co_weight')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Sex <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="female" value="F" name="co_sex" @change="getSizes()" v-validate="'required'" class="action_radio" v-model="form.gender">
                                            <label for="female">Female</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="male" value="M" name="co_sex" @change="getSizes()" v-validate="'required'" class="action_radio" v-model="form.gender">
                                            <label for="male">Male</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('co_sex')">{{ properFormat(errors.first('co_sex')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="profession">Occupation <span>*</span></label>
                                        <select class="default_select alternate" name="profession" v-model="res.customer_details.profession" v-validate="'required'">
                                            <option value="" selected disabled>Choose a Occupation</option>
                                            <option :value="data" v-for="(data, index) in professions">{{ data }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('profession')">{{ properFormat(errors.first('profession')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="co_shoe_size">Shoe Size <span>*</span></label>
                                        <select class="default_select alternate" name="co_shoe_size" v-model="res.customer_details.co_shoe_size" v-validate="'required'">
                                            <option value="" selected disabled>Choose Shoe Size</option>
                                            <option :value="size" v-for="(size, index) in sizes">{{ size }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('co_shoe_size')">{{ properFormat(errors.first('co_shoe_size')) }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Personal Address</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="pa_address">Address Line 1 <span>*</span></label>
                                    <input name="pa_address" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9!@#$&()\\|\'-`.+,/_ |\u00f1]*$', max: 300}" v-model="form.pa_address"/>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_address')">{{ properFormat(errors.first('pa_address')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="pa_address_2">Address Line 2 <b>(Optional)</b></label>
                                    <input name="pa_address_2" class="default_text" v-validate="{regex: '^[a-zA-Z0-9!@#$&()\\|\'-`.+,/_ |\u00f1]*$', max: 300}" v-model="form.pa_address_2"/>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="pa_country_id">Country <span>*</span></label>
                                        <select class="default_select alternate" name="pa_country_id" v-validate="'required'" v-model="form.pa_country" @change="toggleWorld($event, 'state', 'pa')">
                                            <option value="" selected disabled>Choose Country</option>
                                            <option :value="country.id" v-for="(country, key) in pa_countries" :key="key">{{ country.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_country_id')">{{ properFormat(errors.first('pa_country_id')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="pa_state_id">State <span>*</span></label>
                                        <select class="default_select alternate" name="pa_state_id" v-validate="'required'" v-model="form.pa_state">
                                            <option value="" selected disabled>Choose State</option>
                                            <option :value="state.id" v-for="(state, key) in pa_states" :key="key">{{ state.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_state_id')">{{ properFormat(errors.first('pa_state_id')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="pa_city">City <span>*</span></label>
                                        <input type="text" name="pa_city" autocomplete="off" :class="`default_text ${(form.pa_state != '') ? '' : 'disabled'}`" v-validate="{required: true}" v-model="form.pa_city">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_city')">{{ properFormat(errors.first('pa_city')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="pa_zip_code">Zip Code <span>*</span></label>
                                        <input type="text" name="pa_zip_code" autocomplete="off" :class="`default_text ${(form.pa_city != '') ? '' : 'disabled'}`" v-validate="{required: true, numeric: true}" v-model="form.pa_zip_code">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_zip_code')">{{ properFormat(errors.first('pa_zip_code')) }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Billing Address</h2>
                                <div class="form_check">
                                    <input type="checkbox" id="pa_same" name="pa_same" class="action_check" @change="copyPersonal(form.toggled ^= true)">
                                    <label for="pa_same">Same as Personal Address</label>
                                </div>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="ba_address">Address Line 1 <span>*</span></label>
                                    <input name="ba_address" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9!@#$&()\\|\'-`.+,/_ |\u00f1]*$', max: 300}" v-model="form.ba_address"/>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_address')">{{ properFormat(errors.first('ba_address')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="ba_address_2">Address Line 2 <b>(Optional)</b></label>
                                    <input name="ba_address_2" class="default_text" v-validate="{regex: '^[a-zA-Z0-9!@#$&()\\|\'-`.+,/_ |\u00f1]*$', max: 300}" v-model="form.ba_address_2"/>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="ba_country_id">Country <span>*</span></label>
                                        <select class="default_select alternate" name="ba_country_id" v-validate="'required'" v-model="form.ba_country" @change="toggleWorld($event, 'state', 'ba')">
                                            <option value="" selected disabled>Choose Country</option>
                                            <option :value="country.id" v-for="(country, key) in ba_countries" :key="key">{{ country.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_country_id')">{{ properFormat(errors.first('ba_country_id')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="ba_state_id">State <span>*</span></label>
                                        <select class="default_select alternate" name="ba_state_id" v-validate="'required'" v-model="form.ba_state">
                                            <option value="" selected disabled>Choose State</option>
                                            <option :value="state.id" v-for="(state, key) in ba_states" :key="key">{{ state.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_state_id')">{{ properFormat(errors.first('ba_state_id')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="ba_city">City <span>*</span></label>
                                        <input type="text" name="ba_city" autocomplete="off" :class="`default_text ${(form.ba_state != '') ? '' : 'disabled'}`" v-validate="{required: true}" v-model="form.ba_city">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_city')">{{ properFormat(errors.first('ba_city')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="ba_zip_code">Zip Code <span>*</span></label>
                                        <input type="text" name="ba_zip_code" autocomplete="off" :class="`default_text ${(form.ba_city != '') ? '' : 'disabled'}`" v-validate="{required: true, numeric: true}" v-model="form.ba_zip_code">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_zip_code')">{{ properFormat(errors.first('ba_zip_code')) }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Customer Management</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="name">Choose a Type <span>*</span></label>
                                    <select class="default_select alternate" name="type" v-validate="'required'">
                                        <option value="" selected disabled>Choose a Type</option>
                                        <option :value="type.id" :selected="type.id == res.customer_details.customer_type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                    </select>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('type')">{{ properFormat(errors.first('type')) }}</span></transition>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Emergency Contact</h2>
                            </div>
                            <div class="form_main_group alternate">
                                <div class="form_group alternate">
                                    <div class="form_flex">
                                        <div class="form_group">
                                            <label for="ec_full_name">Full Name <span>*</span></label>
                                            <input type="text" name="ec_full_name" autocomplete="off" class="default_text" v-model="res.customer_details.ec_full_name" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_full_name')">{{ properFormat(errors.first('ec_full_name')) }}</span></transition>
                                        </div>
                                        <div class="form_group">
                                            <label for="ec_contact_number">Contact Number <span>*</span></label>
                                            <input type="text" name="ec_contact_number" autocomplete="off" v-model="res.customer_details.ec_contact_number" class="default_text" v-validate="'required|numeric|min:7|max:11'">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_contact_number')">{{ properFormat(errors.first('ec_contact_number')) }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_flex">
                                        <div class="form_group">
                                            <label for="ec_relationship">Relationship <span>*</span></label>
                                            <input type="text" name="ec_relationship" autocomplete="off" v-model="res.customer_details.ec_relationship" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 50}">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_relationship')">{{ properFormat(errors.first('ec_relationship')) }}</span></transition>
                                        </div>
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
                                    <nuxt-link :to="`/customers/${lastRoute}/details`" class="action_cancel_btn">Cancel</nuxt-link>
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
    import Foot from '../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                tooltip: false,
                name: 'Customers',
                access: true,
                loaded: false,
                error: false,
                previewImage: false,
                genderStatus: false,
                hasImage: false,
                lastRoute: '',
                prevRoute: '',
                form: {
                    gender: '',
                    toggled: false,
                    pa_address: '',
                    pa_address_2: '',
                    pa_country: '',
                    pa_state: '',
                    pa_city: '',
                    pa_zip_code: '',
                    ba_address: '',
                    ba_address_2: '',
                    ba_country: '',
                    ba_state: '',
                    ba_city: '',
                    ba_zip_code: '',
                    birth_date: ''
                },
                res: [],
                pa_countries: [],
                pa_states: [],
                ba_countries: [],
                ba_states: [],
                types: [],
                sizes: [],
                professions: ['Accounting/Finance', 'Admin/Human Resources', 'Arts/Media/Communications', 'Building/Construction', 'Information Technology', 'Education/Training', 'Engineering', 'Healthcare', 'Hotel/Restaurant', 'Manufacturing', 'Sales/Marketing', 'Sciences', 'Services', 'Others'],
                studios: []
            }
        },
        methods: {
            getSizes () {
                const me = this
                me.sizes = []
                let ctr = (me.form.gender == 'M') ? 6 : 4
                let cap = (me.form.gender == 'M') ? 17 : 18
                for (let i = 0; i < cap; i++) {
                    me.sizes.push(ctr)
                    if (me.form.gender == 'M' && i > 11) {
                        ctr += 1
                    } else {
                        ctr += 0.5
                    }
                }
            },
            toggleWorld (event, type, category) {
                const me = this
                let country_id = (category == 'pa') ? me.form.pa_country : me.form.ba_country
                me.loader(true)
                switch (type) {
                    case 'state':
                        me.$axios.get(`api/world/states?country_id=${country_id}`).then(res => {
                            if (category == 'pa') {
                                me.pa_states = res.data.states
                            } else {
                                me.ba_states = res.data.states
                            }
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                        })
                        break
                }
            },
            getFile (event) {
                const me = this
                let element = event.target
                if (element.files[0]) {
                    me.previewImage = true
                }
                if (element.files && element.files[0]) {
                    let reader = new FileReader()
                    reader.onload = function () {
                        let image = document.getElementById('preview_image')
                        image.src = reader.result
                    }
                    reader.readAsDataURL(element.files[0])
                }
            },
            copyPersonal (status) {
                const me = this
                if (status) {
                    me.form.ba_address = me.form.pa_address
                    me.form.ba_address_2 = me.form.pa_address_2
                    me.form.ba_country = me.form.pa_country
                    if (me.form.ba_state == '') {
                        me.$axios.get(`api/world/states?country_id=${me.form.pa_country}`).then(res => {
                            me.ba_states = res.data.states
                        })
                    }
                    me.form.ba_state = me.form.pa_state
                    me.form.ba_city = me.form.pa_city
                    me.form.ba_zip_code = me.form.pa_zip_code
                } else {
                    if (me.res.customer_details.ba_state_id != null) {
                        me.form.ba_state = me.res.customer_details.ba_state_id
                    } else {
                        me.form.ba_state = ''
                    }
                    me.form.ba_address = me.res.customer_details.ba_address
                    me.form.ba_address_2 = me.res.customer_details.ba_address_2
                    me.form.ba_city = me.res.customer_details.ba_city
                    me.form.ba_zip_code = me.res.customer_details.ba_zip_code
                }
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/customers/${me.$route.params.param}?otc=1`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Instructor has been Updated')
                                    me.$router.push(`/customers/${me.lastRoute}/details`)
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
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data != 0) {
                        if (res.data.user.staff_details.role_id == 1) {
                            me.loader(true)
                            me.$axios.get('api/extras/customer-types').then(res => {
                                me.types = res.data.customerTypes
                            })
                            me.$axios.get(`api/customers/${me.$route.params.param}`).then(res => {
                                setTimeout( () => {
                                    me.loaded = true
                                    me.previewImage = true
                                    me.res = res.data.user
                                    me.$axios.get('api/world/countries').then(res => {
                                        if (res.data) {
                                            me.pa_countries = res.data.countries
                                            me.ba_countries = res.data.countries
                                            if (me.res.customer_details.pa_country_id != null) {
                                                me.$axios.get(`api/world/states?country_id=${me.res.customer_details.pa_country_id}`).then(res => {
                                                    me.pa_states = res.data.states
                                                    me.form.pa_country = me.res.customer_details.pa_country_id
                                                    me.form.pa_state = me.res.customer_details.pa_state_id
                                                })
                                            }
                                            if (me.res.customer_details.ba_country_id != null) {
                                                me.$axios.get(`api/world/states?country_id=${me.res.customer_details.ba_country_id}`).then(res => {
                                                    me.ba_states = res.data.states
                                                    me.form.ba_country = me.res.customer_details.ba_country_id
                                                    me.form.ba_state = me.res.customer_details.ba_state_id
                                                })
                                            }
                                        }
                                    })

                                    me.form.gender = res.data.user.customer_details.co_sex

                                    me.getSizes()

                                    me.form.pa_address = res.data.user.customer_details.pa_address
                                    me.form.pa_address_2 = res.data.user.customer_details.pa_address_2
                                    me.form.pa_city = res.data.user.customer_details.pa_city
                                    me.form.pa_zip_code = res.data.user.customer_details.pa_zip_code
                                    me.form.ba_address = res.data.user.customer_details.ba_address
                                    me.form.ba_address_2 = res.data.user.customer_details.ba_address_2
                                    me.form.ba_city = res.data.user.customer_details.ba_city
                                    me.form.ba_zip_code = res.data.user.customer_details.ba_zip_code

                                    me.form.birth_date = me.$moment(res.data.user.customer_details.co_birthdate).format('YYYY-MM-DD')

                                }, 500)
                            }).catch(err => {
                                me.$store.state.errorList = err.response.data.errors
                                me.$store.state.errorStatus = true
                            }).then(() => {
                                setTimeout( () => {
                                    me.loader(false)
                                    if (me.res.customer_details.images[0].path != null) {
                                        me.hasImage = true
                                        document.getElementById('preview_image').src = me.res.customer_details.images[0].path
                                    } else {
                                        me.previewImage = false
                                    }
                                }, 500)
                            })
                        } else {
                            me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                        }
                    }
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
