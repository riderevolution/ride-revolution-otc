<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ (isUser == 1) ? `This will ${(confirm.status == 'Activated') ? 'activate' : 'deactivate'} the users made by this account. Are you sure you want to ${(confirm.status == 'Activated') ? 'activate' : 'deactivate'} this account?` : `Are you sure you want to ${(confirm.status == 'Activated') ? 'activate this ' : 'deactivate this '} ${confirm.type}?` }}
            </div>
            <div class="button_group">
                <div class="action_cancel_btn confirm" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin" @click="proceedStatus()">Proceed</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            url: {
                type: String,
                default: ''
            },
            status: {
                type: Number,
                default: 1
            },
            packageStatus: {
                default: null
            },
            isUser: {
                default: 0
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
            toggleClose () {
                const me = this
                me.$store.state.confirmStatus = false
                document.body.classList.remove('no_scroll')
                me.$parent.isUser = 0
            },
            proceedStatus () {
                const me = this
                me.loader(true)
                me.$axios.patch(`api/extras/toggle-status`, me.confirm).then(res => {
                    setTimeout( () => {
                        me.$store.state.confirmStatus = false
                        me.notify(`${me.confirm.type.charAt(0).toUpperCase() + me.confirm.type.slice(1)} has been ${me.confirm.status}`)
                        if (me.packageStatus != null) {
                            me.$parent.fetchData(me.status, me.packageStatus)
                        } else {
                            me.$parent.fetchData(me.status)
                        }
                    }, 300)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 300)
                    document.body.classList.remove('no_scroll')
                })
            }
        }
    }
</script>
