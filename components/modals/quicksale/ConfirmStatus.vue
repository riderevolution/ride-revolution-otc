<template>
    <div class="default_modal prio">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                {{ `Are you sure you want to deactivate this ${confirm.type}?` }}
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
        data () {
            return {
                confirm: {
                    table_name: '',
                    id: 0,
                    enabled: 0,
                    type: ''
                }
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.confirmStatus = false
            },
            proceedStatus () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.loader(true)
                me.$axios.patch(`api/extras/toggle-status`, me.confirm, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    setTimeout( () => {
                        me.$store.state.confirmStatus = false
                        me.notify(`${me.confirm.type.charAt(0).toUpperCase() + me.confirm.type.slice(1)} has been Deactivated`)
                        me.$parent.fetchData()
                    }, 300)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 300)
                })
            }
        }
    }
</script>
