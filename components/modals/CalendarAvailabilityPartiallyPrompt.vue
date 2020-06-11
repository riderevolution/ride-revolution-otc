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
            type: {
                default: null
            },
            instructor: {
                default: null
            }
        },
        data () {
            return {
                message: 'Are you sure you want to continue?'
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    me.loader(true)
                    switch (me.type) {
                        case 'marked':
                            let formData = new FormData()
                            formData.append('remarks', document.querySelector('.confirmation_marked #remarks').value)
                            break
                        case 'unmarked':
                            let formData = new FormData(document.querySelector('#default_form.mrk'))
                            break
                    }
                    formData.append('_method', 'PATCH')
                    formData.append('instructor_id', me.instructor.id)
                    formData.append('studio_id', me.$parent.form.studio_id)
                    formData.append('target_date', me.targetDate)
                    me.$axios.post('api/instructor-availabilities', formData).then(res => {
                        if (res.data) {
                            setTimeout( () => {
                                me.$parent.title = 'Success!'
                                switch (me.availabilityStatus) {
                                    case 'available':
                                        me.$parent.message = 'You have added your available dates.'
                                        break
                                    case 'unavailable':
                                        me.$parent.message = 'You have added your unavailable dates.'
                                        break
                                }
                                if (me.type == 'marked') {
                                    me.$store.state.calendarAvailabilityMarkedStatus = false
                                } else {
                                    me.$store.state.calendarAvailabilityUnmarkedStatus = false
                                }
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
                    document.body.classList.remove('no_scroll')
                }
                me.$store.state.calendarAvailabilityPartiallyPromptStatus = false
            }
        }
    }
</script>
