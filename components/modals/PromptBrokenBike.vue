<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group">
                <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose()">Cancel</a>
                <div class="action_success_btn confirm margin" @click.once="toggleSubmit()">Confirm</div>
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
                const me = this
                document.body.classList.remove('no_scroll')
                me.$store.state.promptBrokenBikeStatus = false
            },
            toggleSubmit () {
                const me = this
                document.body.classList.remove('no_scroll')
                me.$store.state.promptBrokenBikeStatus = false
                me.$parent.blockBike()
            }
        }
    }
</script>
