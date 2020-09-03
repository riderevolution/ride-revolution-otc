<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to cancel this class?
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
            scheduled_date_id: {
                type: Number,
                default: null
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    me.loader(true)
                    me.$axios.delete(`api/schedules/${me.scheduled_date_id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.$parent.cancel = false
                                me.$parent.actionMessage = 'Schedule has been successfully cancelled'
                                me.$store.state.promptBookerActionStatus = true
                            }, 500)
                        }
                    }).catch(err => {
                        me.$store.state.errorOverlayStatus = true
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            document.querySelectorAll('.content_wrapper .class_accordion').forEach((value, index) => {
                                value.classList.remove('toggled')
                                value.querySelector('.accordion_content').style.height = 0
                            })
                            if (me.$parent.studio.online_class) {
                                document.getElementById('online').click()
                            } else {
                                setTimeout(() => {
                                    if (me.$parent.$refs.plan) {
                                        me.$parent.$refs.plan.fetchSeats(null, me.$parent.studioID)
                                        document.querySelector('.plan_wrapper').style.transform = `matrix(0.4, 0, 0, 0.4, ${me.$parent.customWidth}, ${me.$parent.customHeight})`
                                    }
                                }, 10)
                            }
                            me.loader(false)
                        }, 500)
                    })

                } else {
                    me.$parent.scheduledDateID = 0
                    me.$store.state.scheduleID = 0
                    me.$parent.cancel = false
                    document.body.classList.remove('no_scroll')
                }
            }
        },
        mounted () {
            document.body.classList.add('no_scroll')
        }
    }
</script>
