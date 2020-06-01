<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="icon">
                <svg id="modal_check_icon" xmlns="http://www.w3.org/2000/svg" width="109.5" height="109.5" viewBox="0 0 109.5 109.5"> <g transform="translate(-1011 -119)"> <g class="icon_1" transform="translate(1011 119)"> <circle class="icon_3" cx="54.75" cy="54.75" r="54.75" /> <circle class="icon_4" cx="54.75" cy="54.75" r="53.75" /> </g> <path class="icon_2" d="M1030.386,155.744l15.777,15.777,30.289-30.289" transform="translate(15.701 18.006)" /> </g> </svg>
            </div>
            <h2 class="confirmation_title">{{ title }}</h2>
            <div class="confirmation_default">
                {{ message }}
            </div>
            <div class="button_group">
                <div class="action_success_btn confirm" @click="toggleClose()">Done</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            message: {
                default: ''
            },
            title: {
                default: ''
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.calendarAvailabilitySuccessStatus = false
                document.body.classList.remove('no_scroll')
                me.$parent.generateCalendar(me.$parent.currentYear, me.$parent.currentMonth, 0, 0)
            }
        }
    }
</script>
