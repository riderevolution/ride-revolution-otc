<template>
    <div class="default_modal alternate">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to continue?
            </div>
            <div class="button_group">
                <div class="action_cancel_btn" @click.once="toggleClose(false)">Cancel</div>
                <div class="action_success_btn confirm margin alternate" @click.once="toggleClose(true)">Confirm</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                default: 'cash'
            },
            paymentItemId: {
                default: 0
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    let formData = new FormData
                    formData.append('payment_item_id', me.paymentItemId)
                    formData.append('refund_type', me.value)
                    me.loader(true)
                    me.$axios.post('api/extras/payments/refund', formData).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.$store.state.refundStatus = false
                                me.$store.state.refundConfirmStatus = false
                                me.$store.state.refundSuccessStatus = true
                            }, 500)
                        }
                    }).catch(err => {
                        me.$store.state.errorOverlayStatus = true
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                } else {
                    me.$store.state.refundConfirmStatus = false
                }
            }
        }
    }
</script>
