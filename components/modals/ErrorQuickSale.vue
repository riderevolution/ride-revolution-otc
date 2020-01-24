<template>
    <div class="default_modal alternate">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                <div class="text" v-for="(error, key) in $store.state.errorList" :key="key">{{ error }}</div>
            </div>
            <div class="button_group">
                <div class="action_success_btn confirm margin" @click="toggleClose()">OK</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.errorQuickSaleStatus = false
            }
        }
    }
</script>
