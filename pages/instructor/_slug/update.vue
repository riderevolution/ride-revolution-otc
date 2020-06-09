<template>
    <div class="content">
        <transition name="fade">
            <div id="admin" class="cms_dashboard" v-if="loaded">
                <section id="top_content" class="table">
                    <nuxt-link to="/instructor/details" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Instructors</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Update Instructor</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                        <div class="form_group_disclaimer">
                            <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>Fields with asterisks(*) are required.</span></div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Instructor Overview</h2>
                                <div class="form_photo" @mouseover="tooltip = true" @mouseout="tooltip = false">
                                    <transition name="slide">
                                        <div class="tooltip" v-if="tooltip">
                                            Max dimension: 600x600
                                        </div>
                                    </transition>
                                    <input type="file" id="image" name="image[]" class="action_photo" @change="getFile($event)" v-validate="`${(hasImage) ? '' : 'required|'}image|size:1000|image|ext:jpeg,jpg,png`">
                                    <label for="image" :class="`${(previewImage) ? 'active' : ''}`"><span>Upload Photo</span></label>
                                    <img id="preview_image" src="/" v-if="previewImage" />
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('image[]')">{{ errors.first('image[]') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="first_name">First Name <span>*</span></label>
                                        <input type="text" name="first_name" autocomplete="off" class="default_text" v-model="res.first_name" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ errors.first('first_name') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="last_name">Last Name <span>*</span></label>
                                        <input type="text" name="last_name" autocomplete="off" class="default_text" v-model="res.last_name" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ errors.first('last_name') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="email">Email Address <span>*</span></label>
                                        <input type="email" name="email" autocomplete="off" class="default_text" v-model="res.email" v-validate="{required: true, email: true, regex: '^[a-zA-Z0-9-@-_-.]*$', max: 70}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ errors.first('email') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="io_contact_number">Contact Number <span>*</span></label>
                                        <input type="text" name="io_contact_number" autocomplete="off" v-model="res.instructor_details.io_contact_number" class="default_text" v-validate="'required|numeric|min:7|max:11'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_contact_number')">{{ errors.first('io_contact_number') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="io_birthdate">Birthdate <span>*</span></label>
                                        <input type="date" name="io_birthdate" autocomplete="off" v-model="res.instructor_details.io_birthdate" class="default_text date" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_birthdate')">{{ errors.first('io_birthdate') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="io_weight">Weight (in kilograms)</label>
                                        <input type="text" name="io_weight" autocomplete="off" v-model="res.instructor_details.io_weight" class="default_text" v-validate="'numeric|min_value:1|max_value:200'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_weight')">{{ errors.first('io_weight') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Sex <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="female" value="F" name="io_sex" v-validate="'required'" class="action_radio" :checked="res.instructor_details.io_sex == 'female'">
                                            <label for="female">Female</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="male" value="M" name="io_sex" v-validate="'required'" class="action_radio" :checked="res.instructor_details.io_sex == 'male'">
                                            <label for="male">Male</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_sex')">{{ errors.first('io_sex') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="profession">Occupation <span>*</span></label>
                                        <select class="default_select alternate" name="profession" v-model="res.instructor_details.profession" v-validate="'required'">
                                            <option value="" selected disabled>Choose a Occupation</option>
                                            <option :value="data" v-for="(data, index) in professions">{{ data }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('profession')">{{ errors.first('profession') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="io_shoe_size">Shoe Size <span>*</span></label>
                                        <select class="default_select alternate" name="io_shoe_size" v-model="res.instructor_details.io_shoe_size" v-validate="'required'">
                                            <option value="" selected disabled>Choose Shoe Size</option>
                                            <option :value="size" v-for="(size, index) in sizes">{{ size }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_shoe_size')">{{ errors.first('io_shoe_size') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="io_nickname">Nickname <span>*</span></label>
                                        <input type="text" name="io_nickname" autocomplete="off" v-model="res.instructor_details.nickname" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 30}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_nickname')">{{ errors.first('io_nickname') | properFormat }}</span></transition>
                                    </div>
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
                                        <label for="password">Password</label>
                                        <input type="password" name="password" autocomplete="off" class="default_text" ref="password" v-validate="{regex: '^[a-zA-Z0-9-|/!|/@]*$', min: 8}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('password')">{{ errors.first('password') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="password_confirmation">Password Confirmation</label>
                                        <input type="password" name="password_confirmation" autocomplete="off" class="default_text" v-validate="{regex: '^[a-zA-Z0-9-|/!|/@]*$', confirmed: 'password'}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('password_confirmation')">{{ errors.first('password_confirmation') | properFormat }}</span></transition>
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
                                    <label for="pa_address">Address <span>*</span></label>
                                    <input type="text" name="pa_address" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ -.]*$'}" v-model="form.pa_address">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_address')">{{ errors.first('pa_address') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="pa_city">City <span>*</span></label>
                                    <input type="text" name="pa_city" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ -.]*$', max: 30}" v-model="form.pa_city">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_city')">{{ errors.first('pa_city') | properFormat }}</span></transition>
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
                                    <label for="ba_address">Address <span>*</span></label>
                                    <input type="text" name="ba_address" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ -.]*$'}" v-model="form.ba_address">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_address')">{{ errors.first('ba_address') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="ba_city">City <span>*</span></label>
                                    <input type="text" name="ba_city" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ -.]*$', max: 30}" v-model="form.ba_city">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_city')">{{ errors.first('ba_city') | properFormat }}</span></transition>
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
                                            <input type="text" name="ec_full_name" autocomplete="off" class="default_text" v-model="res.instructor_details.ec_full_name" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_full_name')">{{ errors.first('ec_full_name') | properFormat }}</span></transition>
                                        </div>
                                        <div class="form_group">
                                            <label for="ec_contact_number">Contact Number <span>*</span></label>
                                            <input type="text" name="ec_contact_number" autocomplete="off" v-model="res.instructor_details.ec_contact_number" class="default_text" v-validate="'required|numeric|min:7|max:11'">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_contact_number')">{{ errors.first('ec_contact_number') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_flex">
                                        <div class="form_group">
                                            <label for="ec_relationship">Relationship <span>*</span></label>
                                            <input type="text" name="ec_relationship" autocomplete="off" v-model="res.instructor_details.ec_relationship" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 50}">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_relationship')">{{ errors.first('ec_relationship') | properFormat }}</span></transition>
                                        </div>
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
                                    <nuxt-link to="/instructor/details" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        layout: 'ins',
        data () {
            return {
                tooltip: false,
                loaded: false,
                error: false,
                previewImage: false,
                genderStatus: false,
                hasImage: false,
                form: {
                    toggled: false,
                    pa_address: '',
                    pa_city: '',
                    ba_address: '',
                    ba_city: ''
                },
                res: [],
                professions: ['Accounting/Finance', 'Admin/Human Resources', 'Arts/Media/Communications', 'Building/Construction', 'Information Technology', 'Education/Training', 'Engineering', 'Healthcare', 'Hotel/Restaurant', 'Manufacturing', 'Sales/Marketing', 'Sciences', 'Services', 'Others'],
                studios: []
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
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = ''
                        let lastValue = ''
                        if (newValue[0] != 'io' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                            firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                        for (let i = 1; i < newValue.length; i++) {
                            if (newValue[i] != 'id') {
                                lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                            }
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
                    return `The ${newValue}`
                }
            }
        },
        methods: {
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
                    me.form.ba_city = me.form.pa_city
                } else {
                    me.form.ba_address = ''
                    me.form.ba_city = ''
                }
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/instructors/${me.res.id}`, formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Instructor has been Updated')
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$router.push('/instructor/details')
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
            }
        },
        async mounted () {
            const me = this
            let token = me.$cookies.get('token')
            if (me.$route.params.slug == undefined) {
                me.$nuxt.error({ statusCode: 404, message: 'Page Not Found' })
            } else {
                me.loader(true)
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    me.$axios.get(`api/instructors/${res.data.user.id}`).then(res => {
                        setTimeout( () => {
                            me.loaded = true
                            me.previewImage = true
                            me.res = res.data.user
                            me.form.pa_address = me.res.instructor_details.pa_address
                            me.form.pa_city = me.res.instructor_details.pa_city
                            me.form.ba_address = me.res.instructor_details.ba_address
                            me.form.ba_city = me.res.instructor_details.ba_city
                        }, 500)
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                            if (me.res.instructor_details.images.length > 0) {
                                me.hasImage = true
                                document.getElementById('preview_image').src = me.res.instructor_details.images[0].path
                            }
                        }, 500)
                    })
                }).catch(err => {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                    me.loader(false)
                })
            }
        }
    }
</script>
