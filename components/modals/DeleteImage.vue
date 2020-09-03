<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper" v-if="$store.state.deleteImageStatus">
            <div class="confirmation_text">
                This image will be deleted from database as you proceed. Are you sure you want to continue?
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
        prop: {
            temp: {
                type: String
            }
        },
        data () {
            return {
                contentID: 0
            }
        },
        methods: {
            proceedDelete () {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.loader(true)
                me.$axios.delete(`api/extras/images/${me.contentID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    me.$parent.fetchImages(me.temp)
                    me.$store.state.deleteImageStatus = false
                    me.loader(false)
                })
            },
            toggleClose () {
                this.$store.state.deleteImageStatus = false
            }
        }
    }
</script>
