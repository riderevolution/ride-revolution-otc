<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                This action cannot be undone.
            </div>
            <div class="button_group">
                <div class="action_cancel_btn confirm" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin" @click="proceedDelete()">Proceed</div>
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
            }
        },
        data () {
            return {
                contentID: 0,
                hasUser: false,
            }
        },
        methods: {
            proceedDelete () {
                const me = this
                me.$store.state.deleteStatus = false
                if (me.$parent.isDelete) {
                    me.$parent.isDelete = false
                }
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.delete(`${me.url}/${me.contentID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        if (me.$parent.purchase_order) {
                            me.notify('Content has been Deleted')
                            setTimeout( () => {
                                me.$router.push(`/${me.$parent.prevRoute}/${me.$parent.lastRoute}`)
                            }, 500)
                        } else {
                            me.$parent.fetchData(1)
                        }
                    }
                })
                document.body.classList.remove('no_scroll')
            },
            toggleClose () {
                const me = this
                me.$store.state.deleteStatus = false
                if (me.$parent.isDelete) {
                    me.$parent.isDelete = false
                }
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
