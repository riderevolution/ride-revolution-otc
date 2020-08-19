<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group">
                <div class="action_success_btn confirm" @click.once="toggleClose()">Confirm</div>
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
                me.$store.state.promptBookerStatus = false
                if (!me.$store.state.onlineAttendanceCustomer) {
                    document.body.classList.remove('no_scroll')
                }
                me.$scrollTo('.validation_errors', {
                    offset: -250
                })
                setTimeout( () => {
                    me.$parent.$refs.plan.message = ''
                }, 10)
            }
        }
    }
</script>
