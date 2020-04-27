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
                    <transition name="slide"><span class="validation_errors" v-if="errors.has('curent_user_password')">{{ errors.first('curent_user_password') | properFormat }}</span></transition>
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
            toggleClose (status) {
                const me = this
                if (status) {
                    me.$validator.validateAll().then(valid => {
                        if (valid) {
                            let token = me.$cookies.get('token')
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
                                                me.$store.state.promptValidateStatus = false
                                                document.body.classList.remove('no_scroll')
                                            }, 500)
                                        }
                                    }).catch(err => {
                                        me.$store.state.promptValidateStatus = false
                                        document.body.classList.remove('no_scroll')
                                        me.$store.state.errorList = err.response.data.errors
                                        me.$store.state.errorStatus = true
                                    }).then(() => {
                                        setTimeout( () => {
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
