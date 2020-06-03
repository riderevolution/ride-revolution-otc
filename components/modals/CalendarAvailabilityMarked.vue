<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <h2 class="confirmation_title">Oops!</h2>
            <div class="confirmation_default">
                You have already been scheduled a class on this date. If you still want to change your schedule please contact the admin.
            </div>
            <div class="confirmation_marked">
                <div class="label">Your classes:</div>
                <div class="marked_dates">
                    <div class="date">Greenbelt 5, 10:00 AM - Ride Rev (50 mins.)</div>
                </div>
                <div class="marked_dates">
                    <div class="date">Greenbelt 5, 10:00 AM - Ride Rev (50 mins.)</div>
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
            schedules: {
                default: null
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.calendarAvailabilityMarkedStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
