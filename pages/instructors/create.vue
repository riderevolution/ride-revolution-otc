<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Add New Instructor</h1>
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
                                    <input type="file" id="image" name="image[]" class="action_photo" @change="getFile($event)" v-validate="'required|image|size:1000|image|ext:jpeg,jpg,png'">
                                    <label for="image" :class="`${(previewImage) ? 'active' : ''}`"><span>Upload Photo</span></label>
                                    <img id="preview_image" src="/" v-if="previewImage" />
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('image[]')">{{ errors.first('image[]') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_main_group">
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="first_name">First Name <span>*</span></label>
                                        <input type="text" name="first_name" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ errors.first('first_name') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="last_name">Last Name <span>*</span></label>
                                        <input type="text" name="last_name" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ errors.first('last_name') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="email">Email Address <span>*</span></label>
                                        <input type="email" name="email" autocomplete="off" class="default_text" v-validate="{required: true, email: true, regex: '^[a-zA-Z0-9-@-_-.]*$', max: 70}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ errors.first('email') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="io_contact_number">Contact Number <span>*</span></label>
                                        <input type="text" name="io_contact_number" autocomplete="off" class="default_text" v-validate="'required|numeric|min:7|max:11'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_contact_number')">{{ errors.first('io_contact_number') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="io_birthdate">Birth Date <span>*</span></label>
                                        <v-ctk v-model="form.birth_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'io_birthdate'" :name="'io_birthdate'" :max-date="$moment().format('YYYY-MM-DD')" :label="'Select birth date'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_birthdate')">{{ errors.first('io_birthdate') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="io_weight">Weight (in kilograms)</label>
                                        <input type="text" name="io_weight" autocomplete="off" class="default_text" v-validate="'numeric|min_value:1|max_value:200'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_weight')">{{ errors.first('io_weight') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Sex <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="female" value="F" name="io_sex" v-validate="'required'" class="action_radio">
                                            <label for="female">Female</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="male" value="M" name="io_sex" v-validate="'required'" class="action_radio">
                                            <label for="male">Male</label>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_sex')">{{ errors.first('io_sex') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="profession">Occupation <span>*</span></label>
                                        <select class="default_select alternate" name="profession" v-validate="'required'">
                                            <option value="" selected disabled>Choose a Occupation</option>
                                            <option :value="data" v-for="(data, index) in professions">{{ data }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('profession')">{{ errors.first('profession') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="io_shoe_size">Shoe Size <span>*</span></label>
                                        <select class="default_select alternate" name="io_shoe_size" v-validate="'required'">
                                            <option value="" selected disabled>Choose Shoe Size</option>
                                            <option :value="size" v-for="(size, index) in sizes">{{ size }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('io_shoe_size')">{{ errors.first('io_shoe_size') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="io_nickname">Nickname <span>*</span></label>
                                        <input type="text" name="io_nickname" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 30}">
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
                                        <label for="password">Password <span>*</span></label>
                                        <input type="password" name="password" autocomplete="off" class="default_text" ref="password" v-validate="{required: true, regex: '^[a-zA-Z0-9-|/!|/@]*$', min: 8}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('password')">{{ errors.first('password') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="password_confirmation">Password Confirmation <span>*</span></label>
                                        <input type="password" name="password_confirmation" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9-|/!|/@]*$', confirmed: 'password'}">
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
                                    <label for="pa_address">Address Line 1 <span>*</span></label>
                                    <input name="pa_address" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9!@#$&()\\|\'-`.+,/_ |\u00f1]*$', max: 300}" v-model="form.pa_address"/>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_address')">{{ errors.first('pa_address') | properFormat }}</span></transition>
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
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_country_id')">{{ errors.first('pa_country_id') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="pa_state_id">State <span>*</span></label>
                                        <select class="default_select alternate" name="pa_state_id" v-validate="'required'" v-model="form.pa_state">
                                            <option value="" selected disabled>Choose State</option>
                                            <option :value="state.id" v-for="(state, key) in pa_states" :key="key">{{ state.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_state_id')">{{ errors.first('pa_state_id') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="pa_city">City <span>*</span></label>
                                        <input type="text" name="pa_city" autocomplete="off" :class="`default_text ${(form.pa_state != '') ? '' : 'disabled'}`" v-validate="{required: true}" v-model="form.pa_city">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_city')">{{ errors.first('pa_city') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="pa_zip_code">Zip Code <span>*</span></label>
                                        <input type="text" name="pa_zip_code" autocomplete="off" :class="`default_text ${(form.pa_city != '') ? '' : 'disabled'}`" v-validate="{required: true, numeric: true}" v-model="form.pa_zip_code">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pa_zip_code')">{{ errors.first('pa_zip_code') | properFormat }}</span></transition>
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
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_address')">{{ errors.first('ba_address') | properFormat }}</span></transition>
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
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_country_id')">{{ errors.first('ba_country_id') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="ba_state_id">State <span>*</span></label>
                                        <select class="default_select alternate" name="ba_state_id" v-validate="'required'" v-model="form.ba_state">
                                            <option value="" selected disabled>Choose State</option>
                                            <option :value="state.id" v-for="(state, key) in ba_states" :key="key">{{ state.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_state_id')">{{ errors.first('ba_state_id') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="ba_city">City <span>*</span></label>
                                        <input type="text" name="ba_city" autocomplete="off" :class="`default_text ${(form.ba_state != '') ? '' : 'disabled'}`" v-validate="{required: true}" v-model="form.ba_city">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_city')">{{ errors.first('ba_city') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="ba_zip_code">Zip Code <span>*</span></label>
                                        <input type="text" name="ba_zip_code" autocomplete="off" :class="`default_text ${(form.ba_city != '') ? '' : 'disabled'}`" v-validate="{required: true, numeric: true}" v-model="form.ba_zip_code">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('ba_zip_code')">{{ errors.first('ba_zip_code') | properFormat }}</span></transition>
                                    </div>
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
                                        <b>Functions and Activities</b><br>
                                        It is my understanding that participating in the programs and recreational and other activities of Ride revolution is a privilege. Prior to my participation in such activities, I acknowledge that there are certain risks associated with the activities, including, by way of example, physical injury due to activity‑related accidents, physical injury due to transportation‑related accidents, illness, or even death. In addition, I acknowledge that there may be other risks inherent in these activities of which I may not be presently aware.
                                        <br><br>
                                        <b>Release of Liability</b><br>
                                        By signing this Permission/Waiver Form, I expressly warrant that the child named above is capable of withstanding both the physical and mental demands of the activities discussed above. I also expressly assume all risks of the child participating in the activities, whether such risks are known or unknown to me at this time. I further release Ride Revolution and its ministers, leaders, employees, volunteers, and agents from any claim that my child may have or that I may have against them as a result of injury or illness incurred during the course of participation in the activities. This release of liability shall exclude any gross claims of negligence. This release of liability is also intended to cover all claims that members of the child's or my family or estate, heirs, representatives, or assigns may have against Ride Revolution or its ministers, leaders, employees, volunteers, or agents.
                                        <br><br>
                                        I further agree to indemnify and hold harmless Ride Revolution and its ministers, leaders, employees, volunteers, or agents from any and all claims arising from my participation in its activities and programs, or as a result of injury or illness of my child during such activities.
                                        <br><br>
                                        <b>First Aid and Emergency Medical Treatment</b><br>
                                        I recognize that there may be occasions where the child named above may be in need of first aid or emergency medical treatment as a result of an accident, illness, or other health condition or injury. I do hereby give permission for agents of Ride Revolution to seek and secure any needed medical attention or treatment for the child named above, including hospitalization, if in the agent's opinion such need arises. In doing so I agree to pay all fees and costs arising from this action to obtain medical treatment.
                                        <br><br>
                                        I give permission for attending physician(s) and other medical personnel to administer any needed medical treatment, including surgery and, again, I agree to pay for the medical treatment.
                                        <br><br>
                                        <b>Special Events and Field Trips</b><br>
                                        I understand that the child named above may be participating in local service projects and fellowship events during facility youth events. I understand that during this period my child/ward may take part in activities such as: minor yard work, cleaning, painting, and other activities consistent with the purposes of the facility.
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
                                            <label for="ec_full_name">Full Name <span>*</span></label>
                                            <input type="text" name="ec_full_name" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_full_name')">{{ errors.first('ec_full_name') | properFormat }}</span></transition>
                                        </div>
                                        <div class="form_group">
                                            <label for="ec_contact_number">Contact Number <span>*</span></label>
                                            <input type="text" name="ec_contact_number" autocomplete="off" class="default_text" v-validate="'required|numeric|min:7|max:11'">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_contact_number')">{{ errors.first('ec_contact_number') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_flex">
                                        <div class="form_group">
                                            <label for="ec_relationship">Relationship <span>*</span></label>
                                            <input type="text" name="ec_relationship" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 50}">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('ec_relationship')">{{ errors.first('ec_relationship') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_group">
                                        <label for="signature">Signature <span>*</span></label>
                                        <input type="text" name="signature" autocomplete="off" placeholder="Enter your full name" class="default_text" v-validate="{required: true, regex: '^[a-zA-Z0-9_ ]*$', max: 100}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('signature')">{{ errors.first('signature') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_check">
                                        <input type="checkbox" id="acknowledge" name="acknowledge" class="action_check" v-validate="'required'">
                                        <label for="acknowledge">I acknowledge and fully understand the terms and conditions stated above and that all information stated are true.</label>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('acknowledge')">{{ errors.first('acknowledge') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_check">
                                <input type="checkbox" id="i_agree" name="i_agree" class="action_check" v-validate="'required'">
                                <label for="i_agree">I agree to the <a href="http://riderev.designbluemanila.ph/" target="_blank">Terms &amp; Conditions</a> and <a href="http://riderev.designbluemanila.ph/" target="_blank">Privacy Policy</a> of Ride Revolution.</label>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('i_agree')">{{ errors.first('i_agree') | properFormat }}</span></transition>
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
    </transition>
</template>

<script>
    import Foot from '../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Instructors',
                access: true,
                loaded: false,
                tooltip: false,
                error: false,
                previewImage: false,
                genderStatus: false,
                lastRoute: '',
                prevRoute: '',
                form: {
                    toggled: false,
                    pa_address: '',
                    pa_address_2: '',
                    pa_country: 174,
                    pa_state: '',
                    pa_city: '',
                    pa_zip_code: '',
                    ba_address: '',
                    ba_address_2: '',
                    ba_country: 174,
                    ba_state: '',
                    ba_city: '',
                    ba_zip_code: '',
                    medical_history: []
                },
                histories: [],
                pa_countries: [],
                pa_states: [],
                ba_countries: [],
                ba_states: [],
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
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('.')
                if (newValue.length > 1) {
                    newValue = newValue[1].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].split('_')
                        if (newValue.length > 1) {
                            let firstValue = ''
                            let lastValue = ''
                            if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
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
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
                    if (message[0].split('file').length > 1) {
                        message = message[0].split('file')[1]
                        return `The ${newValue} field${message}`
                    } else {
                        return `The ${newValue}`
                    }
                }
            }
        },
        methods: {
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
            toggleMedical (key, status) {
                const me = this
                let ctr = 0
                me.form.medical_history = me.histories
                me.form.medical_history[key].value = status
                me.form.medical_history[key].checked = true
                me.histories.forEach((history, index) => {
                    if (history.checked) {
                        ctr++
                    }
                })
                if (me.error) {
                    if (ctr == me.histories.length) {
                        me.error = false
                    }
                }
            },
            copyPersonal (status) {
                const me = this
                if (status) {
                    me.form.ba_address = me.form.pa_address
                    me.form.ba_address_2 = me.form.pa_address_2
                    me.form.ba_country = me.form.pa_country
                    me.form.ba_state = me.form.pa_state
                    me.form.ba_city = me.form.pa_city
                    me.form.ba_zip_code = me.form.pa_zip_code
                } else {
                    me.form.ba_address = ''
                    me.form.ba_address_2 = ''
                    me.form.ba_country = ''
                    me.form.ba_state = ''
                    me.form.ba_city = ''
                    me.form.ba_zip_code = ''
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
                            me.$axios.post('api/instructors', formData).then(res => {
                                setTimeout( () => {
                                    if (res.data) {
                                        me.notify('Content has been Added')
                                        me.$router.push(`/${me.lastRoute}`)
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
                        }
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
                me.$axios.get('api/extras/medical-history-questions').then(res => {
                    if (res.data) {
                        res.data.medicalHistoryQuestions.forEach((history, index) => {
                            history.checked = false
                            me.histories.push(history)
                        })
                    }
                })
                me.$axios.get('api/world/countries').then(res => {
                    if (res.data) {
                        me.pa_countries = res.data.countries
                        me.ba_countries = res.data.countries
                        me.$axios.get(`api/world/states?country_id=${me.form.pa_country}`).then(res => {
                            me.pa_states = res.data.states
                            me.ba_states = res.data.states
                        })
                    }
                })
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
