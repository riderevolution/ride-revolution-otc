<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <h2 class="confirmation_title">Are you sure you want to sign this person out?</h2>
            <!-- <div class="confirmation_default">
                This person won’t be able to ride this class once they’re signed out. You can log them back in anytime before the class starts.
            </div> -->
            <div class="button_group">
                <div class="action_cancel_btn" @click.once="toggleClose(false)">Cancel</div>
                <div class="action_success_btn confirm margin alternate" @click.once="toggleClose(true)">Continue</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    let formData = new FormData()
                    me.$axios.post(`api/bookings/sign-out/${me.$store.state.bookingID}`, formData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            me.$parent.getSeats()
                            console.log("<(o )___\n ( ._> /\n  `---'")
                        }
                    })
                }
                me.$store.state.bookingID = 0
                me.$store.state.promptSignOutStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
