<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <h1 class="header_title">My Account</h1>
                </div>
            </section>
            <section id="content">
                <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">Account Details</h2>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="first_name">First Name <span>*</span></label>
                                    <input type="text" name="first_name" autocomplete="off" class="default_text" autofocus v-validate="'required'" v-model="res.first_name">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ properFormat(errors.first('first_name')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="last_name">Last Name <span>*</span></label>
                                    <input type="text" name="last_name" autocomplete="off" class="default_text" v-validate="'required'" v-model="res.last_name">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ properFormat(errors.first('last_name')) }}</span></transition>
                                </div>
                            </div>
                            <div class="form_group">
                                <label for="email">Email Address <span>*</span></label>
                                <input type="email" name="email" autocomplete="off" class="default_text" v-validate="'required|email'" v-model="res.email">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ properFormat(errors.first('email')) }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="current_password">Current Password</label>
                                <input type="password" name="current_password" autocomplete="off" class="default_text" v-validate="'required|min:8'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('current_password')">{{ properFormat(errors.first('current_password')) }}</span></transition>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="new_password">New Password</label>
                                    <input type="password" name="new_password" autocomplete="off" class="default_text" ref="new_password" v-validate="'min:8'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('new_password')">{{ properFormat(errors.first('new_password')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="new_password_confirmation">New Password Confirmation</label>
                                    <input type="password" name="new_password_confirmation" autocomplete="off" class="default_text" v-validate="'confirmed:new_password'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('new_password_confirmation')">{{ properFormat(errors.first('new_password_confirmation')) }}</span></transition>
                                </div>
                            </div>
                            <div class="form_group_disclaimer">
                                <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>Leave blank if you don't want to change your <b>password</b>.</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                res: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        if (formData.get('current_password').length <= 0) {
                            formData.delete('current_password')
                        }
                        formData = me.toJSON(formData)
                        me.loader(true)
                        me.$axios.patch(`api/staff/update-profile/${me.res.id}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Updated')
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
                                me.loader(false)
                                if (!me.$store.state.errorStatus) {
                                    location.reload()
                                }
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '#default_form',
							offset: -250
						})
                    }
                })
            },
            async fetchData (id) {
                const me = this
                me.$axios.get(`api/staff/${id}`).then(res => {
                    me.res = res.data.user
                })
            }
        },
        async mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData(me.$store.state.user.id)
            }, 250)
        }
    }
</script>
