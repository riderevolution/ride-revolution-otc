<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group">
                <div class="action_success_btn confirm margin" @click.once="toggleSuccess()">Confirm</div>
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
            hasChanged: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.studioChangerPromptStatus = false
                document.body.classList.remove('no_scroll')
            },
            toggleSuccess () {
                const me = this
                if (me.hasChanged) {
                    window.location.reload(true)
                } else {
                    me.$store.state.studioChangerPromptStatus = false
                }
            }
        }
    }
</script>
