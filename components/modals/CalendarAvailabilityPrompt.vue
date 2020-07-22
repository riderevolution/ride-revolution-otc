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
            targetDate: {
                default: null
            },
            instructor: {
                default: null
            },
            availabilityStatus: {
                default: 'available'
            }
        },
        data () {
            return {
                message: 'Are you sure you want to add this to your schedule?'
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    me.loader(true)
                    let formData = new FormData(document.getElementById('default_form'))
                    formData.append('studio_id', me.$parent.form.studio_id)
                    formData.append('instructor_id', me.instructor.id)
                    formData.append('target_date', me.targetDate)
                    formData.append('availability_status', me.availabilityStatus)
                    me.$axios.post('api/instructor-availabilities', formData).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.$parent.title = 'Success!'
                                switch (me.availabilityStatus) {
                                    case 'available':
                                        me.$parent.message = 'You have added your available dates.'
                                        break
                                    case 'partially-available':
                                        me.$parent.message = 'You have added your partially available dates.'
                                        break
                                    case 'unavailable':
                                        me.$parent.message = 'You have added your unavailable dates.'
                                        break
                                }
                                me.$store.state.calendarAvailabilityPromptStatus = false
                                me.$store.state.calendarAvailabilityActionStatus = false
                                me.$store.state.calendarAvailabilitySuccessStatus = true
                            }, 500)
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorOverlayStatus = true
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                } else {
                    me.$store.state.calendarAvailabilityPromptStatus = false
                }
            }
        }
    }
</script>
