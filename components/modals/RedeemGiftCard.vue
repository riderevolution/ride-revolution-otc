<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay assign" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">Redeem </h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group alternate">
                    <div class="form_group">
                        <label for="gift_card_no">Gift Card No. <span>*</span></label>
                        <input type="text" name="gift_card_no" autocomplete="off" class="default_text" v-validate="{required: true}">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('gift_card_no')">{{ errors.first('gift_card_no') | properFormat }}</span></transition>
                    </div>
                    <div class="form_group">
                        <label for="pin">Pin <span>*</span></label>
                        <input type="text" name="pin" autocomplete="off" class="default_text" v-validate="{required: true}">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('pin')">{{ errors.first('pin') | properFormat }}</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Redeem</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            customer: {
                default: null
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
            toggleClose () {
                const me = this
                me.$store.state.redeemGiftCardStatus = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        me.loader(true)
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('customer_id', me.customer.id)
                        me.$axios.post('api/gift-cards/redeem', formData).then(res => {
                            if (res.data) {
                                me.$store.state.redeemGiftCardStatus = false
                                setTimeout( () => {
                                    me.$store.state.redeemgGiftCardSuccessStatus = true
                                }, 500)
                            }
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
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            }
        }
    }
</script>
