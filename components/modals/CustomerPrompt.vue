<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to {{ status }} this account?
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
            status: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                confirm: {
                    table_name: '',
                    id: 0,
                    enabled: 0,
                    status: '',
                    type: ''
                }
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    me.loader(true)
                    me.$axios.patch(`api/extras/toggle-status`, me.confirm).then(res => {
                        setTimeout( () => {
                            me.$store.state.customerPromptStatus = false
                            me.notify(`${me.confirm.type.charAt(0).toUpperCase() + me.confirm.type.slice(1)} has been ${me.confirm.status}`)
                            me.$parent.$parent.fetchData()
                            document.body.classList.remove('no_scroll')
                        }, 500)
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                } else {
                    if (me.$parent.value.enabled) {
                        me.$parent.value.enabled = 0
                    } else {
                        me.$parent.value.enabled = 1
                    }
                    me.$store.state.customerPromptStatus = false
                    document.body.classList.remove('no_scroll')
                }
                me.$parent.toggled = false
            }
        }
    }
</script>
