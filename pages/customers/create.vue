<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Add New Customer</h1>
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
                            <div class="form_photo">
                                <input type="file" id="image" name="image[]" class="action_photo" @change="getFile($event)" v-validate="'image'">
                                <label for="image" :class="`${(previewImage) ? 'active' : ''}`"><span>Upload Photo</span></label>
                                <img id="preview_image" src="/" v-if="previewImage" />
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('image[]')">{{ errors.first('image[]') }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="first_name">First Name <span>*</span></label>
                                    <input type="text" name="first_name" autocomplete="off" class="default_text" v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ errors.first('first_name') }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="last_name">Last Name <span>*</span></label>
                                    <input type="text" name="last_name" autocomplete="off" class="default_text" v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ errors.first('last_name') }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="email">Email Address <span>*</span></label>
                                    <input type="email" name="email" autocomplete="off" class="default_text" v-validate="'required|email'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ errors.first('email') }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="co_contact_number">Contact Number <span>*</span></label>
                                    <input type="text" name="co_contact_number" autocomplete="off" class="default_text" v-validate="'required|numeric'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('co_contact_number')">{{ errors.first('co_contact_number') }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="co_birthdate">Birthdate <span>*</span></label>
                                    <input type="date" name="co_birthdate" autocomplete="off" class="default_text date" v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('co_birthdate')">{{ errors.first('co_birthdate') }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="co_weight">Weight (in kilograms)</label>
                                    <input type="text" name="co_weight" autocomplete="off" class="default_text" v-validate="'numeric'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('co_weight')">{{ errors.first('co_weight') }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_flex_radio">
                                    <label class="radio_label">Sex <span>*</span></label>
                                    <div class="form_radio">
                                        <input type="radio" id="female" value="F" name="co_sex" class="action_radio">
                                        <label for="female">Female</label>
                                    </div>
                                    <div class="form_radio">
                                        <input type="radio" id="male" value="M" name="co_sex" class="action_radio">
                                        <label for="male">Male</label>
                                    </div>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('co_sex')">{{ errors.first('co_sex') }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="occupation_id">Occupation</label>
                                    <select class="default_select alternate" name="occupation_id" v-validate="'required'">
                                        <option value="" selected disabled>Choose a Occupation</option>
                                        <option :value="occupation.id" v-for="(occupation, index) in occupations">{{ occupation.name }}</option>
                                    </select>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('occupation_id')">{{ errors.first('occupation_id') }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <transition name="fade">
                                    <div class="form_group">
                                        <label for="co_shoe_size">Shoe Size <span>*</span></label>
                                        <select class="default_select alternate" name="co_shoe_size" v-validate="'required'">
                                            <option value="" selected disabled>Choose Shoe Size</option>
                                            <option :value="size" v-for="(size, index) in sizes">{{ size }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('co_shoe_size')">{{ errors.first('co_shoe_size') }}</span></transition>
                                    </div>
                                </transition>
                            </div>
                        </div>
                    </div>
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Password</h2>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="password">Password <span>*</span></label>
                                    <input type="password" name="password" autocomplete="off" class="default_text" ref="password" v-validate="'required|min:8'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('password')">{{ errors.first('password') }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="password_confirmation">Password Confirmation <span>*</span></label>
                                    <input type="password" name="password_confirmation" autocomplete="off" class="default_text" v-validate="'required|confirmed:password'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('password_confirmation')">{{ errors.first('password_confirmation') }}</span></transition>
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
                                <label for="pa_address_1">Address Line 1 <span>*</span></label>
                                <input type="text" name="pa_address_1" autocomplete="off" class="default_text" v-validate="'required'" v-model="form.pa_address_1">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_address_1')">{{ errors.first('pa_address_1') }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="pa_address_2">Address Line 2</label>
                                <input type="text" name="pa_address_2" autocomplete="off" class="default_text" v-model="form.pa_address_2">
                            </div>
                            <div class="form_group">
                                <label for="pa_city">City</label>
                                <input type="text" name="pa_city" autocomplete="off" class="default_text" v-model="form.pa_city">
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
                                <label for="ba_address_1">Address Line 1</label>
                                <input type="text" name="ba_address_1" autocomplete="off" class="default_text" v-model="form.ba_address_1">
                            </div>
                            <div class="form_group">
                                <label for="ba_address_2">Address Line 2</label>
                                <input type="text" name="ba_address_2" autocomplete="off" class="default_text" v-model="form.ba_address_2">
                            </div>
                            <div class="form_group">
                                <label for="ba_city">City</label>
                                <input type="text" name="ba_city" autocomplete="off" class="default_text" v-model="form.ba_city">
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
                                    <option :value="type.id" :selected="type.id == 38" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('type')">{{ errors.first('type') }}</span></transition>
                            </div>
                        </div>
                    </div>
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Health Waiver <span>*</span></h2>
                        </div>
                        <div class="form_main_group alternate">
                            <div class="form_group">
                                <div class="form_group_header">Terms &amp; Conditions</div>
                                <div class="form_group_body">
                                    I acknowledge and fully understand that I will be engaging in activities that involve risk of serious injury, including permanent disability or death, or severe social and economic losses which might result not only from my own actions, inactions or negligence, but action, inaction or negligence of others.<br><br> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.<br><br> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu <br><br> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.<br><br> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu <br><br>
                                </div>
                            </div>
                        </div>
                        <div class="form_main_group alternate">
                            <div class="form_group">
                                <div class="form_group_header">Medical History</div>
                                <transition name="slide"><span class="validation_errors" v-if="error">Please choose yes or no</span></transition>
                                <div class="form_flex_radio_alternate" v-for="(history, key) in histories" :key="key">
                                    <label>{{ history.title }}</label>
                                    <div class="radio_wrapper">
                                        <div class="form_radio">
                                            <input type="radio" :id="`history_${key}_yes`" value="Yes" :name="`history_${key}`" class="action_radio" @change="toggleMedical(key, 1)">
                                            <label :for="`history_${key}_yes`">Yes</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" :id="`history_${key}_no`" value="No" :name="`history_${key}`" class="action_radio" @change="toggleMedical(key, 0)">
                                            <label :for="`history_${key}_no`">No</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_main_group alternate">
                            <div class="form_group alternate">
                                <div class="form_group_header">Emergency Contact</div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="ec_full_name">Full Name</label>
                                        <input type="text" name="ec_full_name" autocomplete="off" class="default_text" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_full_name')">{{ errors.first('ec_full_name') }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="ec_contact_number">Contact Number</label>
                                        <input type="text" name="ec_contact_number" autocomplete="off" class="default_text" v-validate="'required|numeric'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_contact_number')">{{ errors.first('ec_contact_number') }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="ec_relationship">Relationship</label>
                                        <input type="text" name="ec_relationship" autocomplete="off" class="default_text" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_relationship')">{{ errors.first('ec_relationship') }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group">
                                    <label for="signature">Signature <span>*</span></label>
                                    <input type="text" name="signature" autocomplete="off" placeholder="Enter your full name" class="default_text" v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('signature')">{{ errors.first('signature') }}</span></transition>
                                </div>
                                <div class="form_check">
                                    <input type="checkbox" id="acknowledge" name="acknowledge" class="action_check" v-validate="'required'">
                                    <label for="acknowledge">I acknowledge and fully understand the terms and conditions stated above and that all information stated are true.</label>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('acknowledge')">{{ errors.first('acknowledge') }}</span></transition>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_check">
                            <input type="checkbox" id="i_agree" name="i_agree" class="action_check" v-validate="'required'">
                            <label for="i_agree">I agree to the <a href="javascript:void(0)" target="_blank">Terms &amp; Conditions</a> and <a href="javascript:void(0)" target="_blank">Privacy Policy</a> of Ride Revolution.</label>
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('i_agree')">{{ errors.first('i_agree') }}</span></transition>
                        </div>
                        <div class="form_check">
                            <input type="checkbox" id="newsletter_subscription" name="newsletter_subscription" class="action_check">
                            <label for="newsletter_subscription">Subscribe to newsletter</label>
                        </div>
                        <div class="form_flex">
                            <div class="form_check">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <nuxt-link :to="`/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
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
    import Foot from '../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                error: false,
                previewImage: false,
                genderStatus: false,
                lastRoute: '',
                prevRoute: '',
                form: {
                    toggled: false,
                    pa_address_1: '',
                    pa_address_2: '',
                    pa_city: '',
                    ba_address_1: '',
                    ba_address_2: '',
                    ba_city: '',
                    medical_history: []
                },
                histories: [],
                types: [],
                occupations: []
            }
        },
        computed: {
            sizes () {
                const me = this
                let ctr = 5
                let sizes = []
                for (let i = 0; i < 35; i++) {
                    ctr += 0.5
                    sizes.push(ctr)
                }
                return sizes
            }
        },
        methods: {
            getFile (event) {
                const me = this
                let element = event.target
                if (element.files[0]) {
                    me.previewImage = true
                } else {
                    me.previewImage = false
                }
                if (element.files && element.files[0]) {
                    let reader = new FileReader()
                    reader.onload = function () {
                        let image = document.getElementById('preview_image')
                        image.src = reader.result
                    }
                    reader.readAsDataURL(element.files[0])
                } else {
                    let image = document.getElementById('preview_image')
                    image.src = ''
                }
            },
            toggleMedical (key, status) {
                const me = this
                me.error = false
                me.form.medical_history = me.histories
                me.form.medical_history[key].value = status
            },
            copyPersonal (status) {
                const me = this
                if (status) {
                    me.form.ba_address_1 = me.form.pa_address_1
                    me.form.ba_address_2 = me.form.pa_address_2
                    me.form.ba_city = me.form.pa_city
                } else {
                    me.form.ba_address_1 = ''
                    me.form.ba_address_2 = ''
                    me.form.ba_city = ''
                }
            },
            submissionSuccess () {
                const me = this
                if (me.form.medical_history.length == me.histories.length) {
                    me.error = false
                } else {
                    me.error = true
                }
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        if (formData.get('acknowledge') != null && formData.get('i_agree') != null) {
                            formData.append('medical_history', JSON.stringify(me.form.medical_history))
                            me.loader(true)
                            me.$axios.post('api/customers', formData).then(res => {
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
                                        me.$router.push(`/${me.lastRoute}`)
                                    }
                                    me.loader(false)
                                }, 500)
                            })
                        }
                    } else {
                        me.$scrollTo('.validation_errors', {
							offset: -250
						})
                    }
                })
            }
        },
        mounted () {
            const me = this
            me.$axios.get('api/extras/customer-types').then(res => {
                me.types = res.data.customerTypes
            })
            me.$axios.get('api/extras/occupations').then(res => {
                me.occupations = res.data.occupations
            })
            me.$axios.get('api/extras/medical-history-questions').then(res => {
                me.histories = res.data.medicalHistoryQuestions
            })
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
