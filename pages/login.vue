<template>
    <div id="login_container" class="login_content">
        <div class="cms_login">
            <div class="logo">
                <img src="/logo.png" width="65px" />
                <div class="logo_title">
                    Ride <br/>
                    Revolution
                </div>
            </div>
            <form id="login_form" class="login_form" @submit.prevent="submissionSuccess()">
                <div id="step_1" :class="`step ${(step != 1) ? 'overlay' : ''}`">
                    <transition name="slide">
                        <div v-if="step == 1">
                            <div class="button_label">Please choose a user type</div>
                            <div class="buttons">
                                <div :class="`site_btn alternate ${(userType == 0) ? 'active' : ''}`" @click="toggleUserType(0)"><span>Staff</span></div>
                                <div :class="`site_btn alternate ${(userType == 2) ? 'active' : ''}`" @click="toggleUserType(2)"><span>Instructor</span></div>
                            </div>
                            <div class="button_group">
                                <button type="button" :class="`action_success_btn alternate ${(userType == null) ? 'disabled' : ''}`" @click="toggleStep('next')"><span>Continue</span></button>
                            </div>
                        </div>
                    </transition>
                </div>
                <div id="step_2" :class="`step ${(step != 2) ? 'overlay' : ''}`">
                    <transition name="slide">
                        <div v-if="step == 2">
                            <div class="form_group" v-if="userType == 0">
                                <label for="studio_id">Studio <span>*</span></label>
                                <select class="default_select alternate" name="studio_id" v-validate="'required'" @change="selectStudio($event)">
                                    <option value="" selected disabled>Choose a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('studio_id')">{{ errors.first('studio_id') }}</span></transition>
                            </div>
                            <transition name="fade">
                                <div v-if="hasStudio || userType == 2">
                                    <div class="form_group">
                                        <label for="email">Email Address</label>
                                        <input type="text" name="email" autocomplete="off" class="default_text" v-model="form.email" v-validate="'required|email'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ errors.first('email') }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="password">Password</label>
                                        <input type="password" name="password" autocomplete="off" class="default_text" v-model="form.password" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('password')">{{ errors.first('password') }}</span></transition>
                                        <nuxt-link to="/forgot-password" class="action_forgot_text">Forgot your password?</nuxt-link>
                                    </div>
                                </div>
                            </transition>
                            <div class="button_group alternate">
                                <div class="action_cancel_btn" @click="toggleStep('prev')">Back</div>
                                <button type="submit" name="submit" :class="`action_success_btn alternate ${(hasStudio || userType == 2) ? '' : 'disabled'}`"><span>Login</span></button>
                            </div>
                        </div>
                    </transition>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                userType: null,
                step: 1,
                form: {
                    email: '',
                    password: '',
                    type: 0,
                    studio_id: 0
                },
                hasStudio: false,
                studios: []
            }
        },
        methods: {
            toggleUserType (value) {
                const me = this
                me.userType = value
                if (me.userType == 0) {
                    me.form.email = 'superadmin@admin.com'
                    me.form.password = '@F1r33x1t'
                } else {
                    me.form.email = 'bea@riderevolution.ph'
                    me.form.password = 'password'
                }
            },
            toggleStep (type) {
                const me = this
                switch (type) {
                    case 'next':
                        me.step = 2
                        break
                    case 'prev':
                        me.step = 1
                        me.userType = null
                        break
                }
            },
            selectStudio (event) {
                const me = this
                me.hasStudio = true
                me.form.studio_id = event.target.value
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(res => {
                    if (res) {
                        me.loader(true)
                        me.form.type = me.userType
                        me.$axios.post('api/login', me.form).then(res => {
                            if (res.data) {
                                me.$cookies.set('70hokcotc3hhhn5', res.data.token)
                                me.$store.state.isAuth = true
                                me.$store.state.token = res.data.token
                                me.validateToken()
                                if (me.userType == 0) {
                                    me.$router.push('/')
                                } else {
                                    me.$router.push('/instructor/class-schedules')
                                }
                            } else {
                                me.$store.state.errorList.push('Sorry, Something went wrong')
                                me.$store.state.errorStatus = true
                            }
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            me.loader(false)
                        })
                    }
                })
            },
            fetchData () {
                const me = this
                me.$axios.get('api/studios?enabled=1').then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
            }
        },
        mounted () {
            const me = this
            if (me.$cookies.get('70hokcotc3hhhn5') != null && me.$cookies.get('70hokcotc3hhhn5') !== undefined) {
                me.$router.push('/')
            }
            me.fetchData()
        }
    }
</script>
