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
        <transition name="fade">
            <refund-confirm :value="form" :paymentItemId="paymentItemId" v-if="$store.state.refundConfirmStatus" />
        </transition>
    </div>
</template>

<script>
    import RecurringCancelSuccess from '~/components/modals/RecurringCancelSuccess'
    export default {
        components: {
            RecurringCancelSuccess
        },
        props: {
            payment: {
                default: null
            },
            paymentItemId: {
                default: 0
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
                if (me.selectedCount > 0) {
                    me.$store.state.refundConfirmStatus = true
                } else {
                    me.selectedMenu = true
                }
            }
        }
    }
</script>
