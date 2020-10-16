<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <div class="form_title">
                    Select a Refund<br />
                    <span>You're subscription will end at <b>{{ $moment().format('MMMM DD, YYYY hh:mm A') }}</b></span>
                </div>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group alternate">
                    <div class="form_flex_button">
                        <div :id="`refund_${key}`" class="flex_button" :class="{ active: data.toggled }" v-for="(data, key) in refunds" :key="key" @click="selectRefund(data, key)">
                            {{ data.name }}
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check default">
                            </div>
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Continue</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                refunds: [
                    {
                        unique: 'no-refund',
                        name: 'No Refund',
                        toggled: false
                    },
                    {
                        unique: 'half-refund',
                        name: 'Half Refund',
                        toggled: false
                    },
                    {
                        unique: 'full-refund',
                        name: 'Full Refund',
                        toggled: false
                    }
                ],
                unique_key: 0
            }
        },
        methods: {
            selectRefund (data, unique) {
                const me = this
                me.toggleOthers()
                me.unique_key = unique
                data.toggled = true
            },
            toggleOthers () {
                const me = this
                if (me.refunds[me.unique_key]) {
                    me.refunds[me.unique_key].toggled = false
                }
            },
            toggleClose () {
                const me = this
                me.$parent.recurring = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this

            }
        },
        mounted () {
            document.body.classList.add('no_scroll')
        }
    }
</script>
