<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="form_close" @click.once="toggleClose()"></div>
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group alternate">
                <div class="form_group">
                    <input type="password" name="curent_user_password" placeholder="Enter your password" class="default_text" v-model="form.password" v-validate="'required'">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has('curent_user_password')">{{ properFormat(errors.first('curent_user_password')) }}</span></transition>
                </div>
                <div class="action_success_btn confirm margin" @click.once="toggleClose(true)">Confirm</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            message: {
                type: String,
                default: ''
            },
            category: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                form: {
                    password: ''
                }
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    me.$validator.validateAll().then(valid => {
                        if (valid) {
                            let token = me.$cookies.get('70hokcotc3hhhn5')
                            switch (me.category) {
                                case 'purchase-order':
                                    me.loader(true)
                                    let formData = new FormData()
                                    formData.append('password', me.form.password)
                                    me.$axios.post('api/users/validate-password', formData, {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    }).then(res => {
                                        if (res.data) {
                                            setTimeout( () => {
                                                if (document.getElementById('validate').checked) {
                                                    document.getElementById('validate').checked = false
                                                    me.$parent.res.paid = 0
                                                } else {
                                                    document.getElementById('validate').checked = true
                                                    me.$parent.res.paid = 1
                                                }
                                            }, 500)
                                        }
                                    }).catch(err => {
                                        me.$store.state.promptValidateStatus = false
                                        document.body.classList.remove('no_scroll')
                                        me.$store.state.errorList = err.response.data.errors
                                        me.$store.state.errorStatus = true
                                    }).then(() => {
                                        setTimeout( () => {
                                            me.$store.state.promptValidateStatus = false
                                            document.body.classList.remove('no_scroll')
                                            me.loader(false)
                                        }, 500)
                                    })
                                    break
                                }
                        }
                    })
                } else {
                    me.$store.state.promptValidateStatus = false
                    document.body.classList.remove('no_scroll')
                }
            }
        }
    }
</script>
