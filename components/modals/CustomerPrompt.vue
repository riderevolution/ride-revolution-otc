<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to {{ status }} this account?
            </div>
            <div class="button_group">
                <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose(false)">Cancel</a>
                <div class="action_success_btn confirm margin alternate" @click.once="toggleClose(true)">Confirm</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            status: {
                type: String,
                default: ''
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    me.$parent.isActivated = false
                    me.$store.state.customerPromptStatus = false
                    document.body.classList.remove('no_scroll')
                } else {
                    me.$parent.isActivated = true
                    me.$store.state.customerPromptStatus = false
                    document.body.classList.remove('no_scroll')
                }
                me.$parent.toggled = false
            }
        }
    }
</script>
