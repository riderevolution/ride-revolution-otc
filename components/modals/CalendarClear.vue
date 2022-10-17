<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to clear this {{ (type == 'day') ? 'day' : (type == 'week' ? 'week' : 'month') }}? There might be customers who are booked on these schedules.
            </div>
            <div class="button_group alternate">
                <div class="form_group">
                    <input type="password" name="curent_user_password" placeholder="Enter your password" class="default_text" v-model="form.password" v-validate="'required'">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has('curent_user_password')">{{ properFormat(errors.first('curent_user_password')) }}</span></transition>
                </div>
                <div class="action_success_btn confirm margin" @click="proceedStatus()">Confirm</div>
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
        data () {
            return {
                form: {
                    password: ''
                }
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
                let formData = new FormData()
                formData.append('password', me.form.password)
                me.$axios.post('api/users/validate-password', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        let date = me.value
                        let formDataClear = new FormData()
                        formDataClear.append('type', me.type)
                        formDataClear.append('date', date)
                        formDataClear.append('studio_id', me.$parent.form.studio_id)
                        me.$axios.post('api/schedules/clear', formDataClear, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            if (res.data) {
                                me.$parent.message = `Successfully cleared this ${(me.type == 'day') ? 'day' : (me.type == 'week' ? 'week' : 'month')}.`
                                me.$store.state.calendarActionSuccess = true
                                me.$store.state.calendarClearStatus = false
                                me.$parent.generateCalendar(me.$parent.currentYear, me.$parent.currentMonth, 0, 0)
                                document.body.classList.remove('no_scroll')
                            }
                        }).catch(err => {
                            me.$store.state.errorOverlayStatus = true
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                            me.loader(false)
                        })
                    }
                }).catch(err => {
                    me.$store.state.errorOverlayStatus = true
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                    me.loader(false)
                })
            }
        }
    }
</script>
