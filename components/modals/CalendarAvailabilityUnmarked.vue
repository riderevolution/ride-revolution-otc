<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionCreateSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title alt">{{ $moment().format('ddd, MMM DD, YYYY') }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_flex_radio_alternate new" v-for="(n, key) in 3" :key="key">
                        <label>Test</label>
                        <div class="radio_wrapper">
                            <div class="form_radio">
                                <input type="radio" :id="`status_${key}_av`" value="Yes" :name="`status_${key}`" class="action_radio">
                                <label :for="`status_${key}_av`">Available</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" :id="`status_${key}_uav`" value="No" :name="`status_${key}`" class="action_radio">
                                <label :for="`status_${key}_uav`">Unavailable</label>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Add Availability</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
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
                me.$store.state.calendarAvailabilityUnmarkedStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
