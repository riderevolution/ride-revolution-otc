<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                <div class="text" v-for="(error, key) in $store.state.errorList" :key="key">{{ error }}</div>
            </div>
            <div class="button_group">
                <div class="action_success_btn confirm" @click="toggleClose()">OK</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            toggleClose () {
                const me = this
                if (me.$store.state.errorOverlayStatus) {
                    me.$store.state.errorStatus = false
                    me.$store.state.errorOverlayStatus = false
                } else {
                    if (!me.$store.state.pendingTransactionsStatus || !me.$store.state.customerPackageStatus) {
                        document.body.classList.remove('no_scroll')
                    }
                    me.$store.state.errorStatus = false
                    document.body.classList.remove('no_scroll')
                }
            }
        }
    }
</script>
