<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <h2 class="confirmation_title">Success!</h2>
            <div class="confirmation_default">
                Your gift card has now been redeemed. You now have credits in your account.
            </div>
            <div class="button_group">
                <nuxt-link :to="`/customers/${customer.id}/packages`" class="action_success_btn confirm" @click.native="toggleClose()">Cancel</nuxt-link>
                <div class="action_success_btn confirm margin alternate" @click="toggleClose()">Book a Ride</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            customer: {
                default: null
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.redeemgGiftCardSuccessStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
