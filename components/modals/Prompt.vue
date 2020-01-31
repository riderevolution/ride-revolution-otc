<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose((hasChange || hasCancel) ? true : false, false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group">
                <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose((hasChange || hasCancel) ? true : false, false)" v-if="hasCancel">Cancel</a>
                <div class="action_success_btn confirm margin" @click.once="toggleClose(true, true)">Confirm</div>
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
            hasCancel: {
                type: Boolean,
                default: false
            },
            hasChange: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            toggleClose (status, confirm) {
                const me = this
                if (status && me.hasCancel && confirm) {
                    me.$parent.prompt = false
                    me.$parent.submissionSuccess()
                    document.body.classList.remove('no_scroll')
                    me.$store.state.promptStatus = false
                    setTimeout( () => {
                        me.$parent.$refs.plan.hasCancel = false
                    }, 10)
                } else if (status && me.hasChange) {
                    me.$store.state.promptStatus = false
                    setTimeout( () => {
                        me.$store.state.changeStudioStatus = false
                        document.body.classList.remove('no_scroll')
                    }, 250)
                } else {
                    me.$store.state.promptStatus = false
                    setTimeout( () => {
                        me.$parent.$refs.plan.hasCancel = false
                    }, 10)
                    me.$parent.prompt = true
                    me.$store.state.promptStatus = false
                    document.body.classList.remove('no_scroll')
                }
            }
        }
    }
</script>
