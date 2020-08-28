<template>
    <div class="default_modal">
        <div class="background"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                There's a system update that requires you to re-login.
            </div>
            <div class="button_group">
                <div class="action_success_btn alternate" @click.once="toggleClose()">Logout</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.patchNotesStatus = false
                me.logout()
            }
        },
        mounted () {
            document.body.classList.add('no_scroll')
        }
    }
</script>
