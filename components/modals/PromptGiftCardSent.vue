<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group">
                <div class="action_success_btn confirm margin" @click.once="toggleClose()">Okay</div>
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
            }
        },
        methods: {
            toggleClose () {
                this.$parent.promptGiftCardSent = false
                this.$store.state.customerSendGiftCardStatus = false
                document.body.classList.remove('no_scroll')
                document.querySelector('.nonsense').scrollIntoView({block: 'center', behavior: 'smooth'})
            }
        }
    }
</script>
