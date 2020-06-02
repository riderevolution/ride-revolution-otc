<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ message }}
            </div>
            <div class="button_group">
                <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose(false)">Go Back</a>
                <div class="action_success_btn confirm margin" @click.once="toggleClose(true)">Confirm</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            message: {
                default : 'Are you sure you want to add this to your schedule?'
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    me.$parent.title = 'Success!'
                    switch (me.$parent.availabilityStatus) {
                        case 'available':
                            me.$parent.message = 'You have added your available dates.'
                            break
                        case 'unavailable':
                            me.$parent.message = 'You have added your unavailable dates.'
                            break
                    }
                    me.$store.state.calendarAvailabilitySuccessStatus = true
                } else {
                    document.body.classList.remove('no_scroll')
                }
                me.$store.state.calendarAvailabilityPromptStatus = false
            }
        }
    }
</script>
