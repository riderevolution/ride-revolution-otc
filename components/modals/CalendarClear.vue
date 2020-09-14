<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to clear this {{ (type == 'day') ? 'day' : (type == 'week' ? 'week' : 'month') }}?
            </div>
            <div class="button_group">
                <div class="action_cancel_btn confirm" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin" @click="proceedStatus()">Clear Schedule</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: String,
                default: 0
            },
            type: {
                type: String,
                default: 'day'
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.calendarClearStatus = false
                document.body.classList.remove('no_scroll')
            },
            proceedStatus () {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let date = me.value
                let formData = new FormData()
                formData.append('type', me.type)
                formData.append('date', date)
                formData.append('studio_id', me.$parent.form.studio_id)
                me.$axios.post('api/schedules/clear', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        me.$parent.generateCalendar(me.$parent.currentYear, me.$parent.currentMonth, 0, 0)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
                me.$store.state.calendarClearStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
