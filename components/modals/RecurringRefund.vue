<template>
    <div class="default_modal_side">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="side_wrapper">
            <div class="side_header">
                <h2>Are you sure you want to cancel {{ user_package_count.class_package.name }} subscription?</h2>
            </div>
            <div class="form_main_group">
                <div class="form_group">
                    <label for="reasons">Reason</label>
                    <textarea name="reasons" rows="8" id="reasons" v-model="form.reasons" class="default_text unique area" placeholder="Enter reasons"></textarea>
                </div>
            </div>
            <div class="button_group">
                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin alternate" @click="toggleProceed()">Proceed</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            user_package_count: {
                type: Object/Array,
                default: null
            }
        },
        data () {
            return {
                form: {
                    reasons: ''
                }
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$parent.recurring = false
                document.body.classList.remove('no_scroll')
            },
            toggleProceed () {
                const me = this
                let token = me.$cookies.get('70hokc3hhhn5')
                me.loader(true)
                let formData = new FormData()
                formData.append('paypal_subscription_id', me.user_package_count.paypal_subscription_id)
                formData.append('reason', me.form.reason)
                me.$axios.post('api/paypal/cancel-subscription', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        if (me.$route.params.slug == 'transactions') {
                            document.getElementById('transactions').click()
                        }
                        me.$parent.recurring = false
                        me.$parent.recurring_cancel = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorOverlayStatus = true
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            }
        }
    }
</script>
