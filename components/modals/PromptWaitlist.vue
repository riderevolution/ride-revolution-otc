<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to continue?
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
            value: {
                type: String,
                default: null
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    me.loader(true)
                    me.$axios.delete(`api/waitlists/${me.value}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.$parent.actionMessage = 'Successfully removed from waitlist.'
                                me.$store.state.promptBookerActionStatus = true
                            }, 500)
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        me.$store.state.promptWaitlistStatus = false
                        setTimeout( () => {
                            me.$parent.fetchWaitlist(me.$store.state.scheduleID)
                            me.loader(false)
                        }, 500)
                    })
                } else {
                    me.$store.state.promptWaitlistStatus = false
                    document.body.classList.remove('no_scroll')
                }
            }
        }
    }
</script>
