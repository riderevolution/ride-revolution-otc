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
            <form id="reset_form" class="reset_form" @submit.prevent="submissionSuccess()">
                <div class="form_disclaimer">Please enter your new password.</div>
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
                <div class="button_group alternate">
                    <nuxt-link to="/login" class="action_cancel_btn"><span>Cancel</span></nuxt-link>
                    <button type="submit" name="submit" class="action_success_btn"><span>Submit</span></button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'admin',
        data () {
            return {
                form: {
                    email: 'superadmin@admin.com',
                    type: 0
                }
            }
        },
        mounted () {
            if (this.$cookies.get('70hokcotc3hhhn5') != null && this.$cookies.get('70hokcotc3hhhn5') !== undefined) {
                this.$router.push('/')
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(res => {
                    if (res) {
                        let formData = new FormData(document.getElementById('reset_form'))
                        formData.append('token', me.$route.query.token)
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post('api/forgot-password', formData).then(res => {
                            if (res.data) {
                                me.$store.state.resetSuccessfulStatus = true
                            } else {
                                me.$store.state.errorList.push('Sorry, Something went wrong')
                                me.$store.state.errorStatus = true
                            }
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            me.loader(false)
                        })
                    }
                })
            }
        }
    }
</script>
