<template>
    <div class="default_modal_side">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="side_wrapper">
            <div class="side_header">
                <h2>Choose an availability</h2>
            </div>
            <ul class="side_menu">
                <li id="item_0" :class="`side_item ${(selectedType == 'available') ? 'active' : ''}`" @click="toggleMenu(0, 'available')">
                    <div class="item">Available</div>
                    <svg id="check" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <g transform="translate(-804.833 -312)">
                            <circle class="circle" cx="14" cy="14" r="14" transform="translate(805.833 313)" />
                            <path class="mark" d="M6466.494,185.005l4.85,4.85,9.6-9.6" transform="translate(-5653.091 142.403)" />
                        </g>
                    </svg>
                </li>
                <li id="item_1" :class="`side_item alt_2 ${(selectedType == 'partially-available') ? 'active' : ''}`" @click="toggleMenu(1, 'partially-available')">
                    <div class="item">Partially Available</div>
                    <svg id="check" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <g transform="translate(-804.833 -312)">
                            <circle class="circle" cx="14" cy="14" r="14" transform="translate(805.833 313)" />
                            <path class="mark" d="M6466.494,185.005l4.85,4.85,9.6-9.6" transform="translate(-5653.091 142.403)" />
                        </g>
                    </svg>
                </li>
                <li id="item_2" :class="`side_item alt ${(selectedType == 'unavailable') ? 'active' : ''}`" @click="toggleMenu(2, 'unavailable')">
                    <div class="item">Unavailable</div>
                    <svg id="check" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <g transform="translate(-804.833 -312)">
                            <circle class="circle" cx="14" cy="14" r="14" transform="translate(805.833 313)" />
                            <path class="mark" d="M6466.494,185.005l4.85,4.85,9.6-9.6" transform="translate(-5653.091 142.403)" />
                        </g>
                    </svg>
                </li>
                <transition name="slide"><span class="validation_errors" v-if="selectedMenu">Please select an action</span></transition>
            </ul>
            <div class="button_group">
                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin alternate" @click="toggleProceed()">Proceed</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                selectedMenu: false,
                selectedCount: 0,
                selectedType: ''
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.bookerMenuPromptStatus = false
                document.body.classList.remove('no_scroll')
            },
            toggleMenu (unique, type) {
                const me = this
                me.selectedMenu = false
                me.selectedCount += 1
                me.selectedType = type
            },
            toggleProceed () {
                const me = this
                if (me.selectedCount > 0) {
                    switch (me.selectedType) {
                        case 'available':
                            me.$parent.title = 'Success!'
                            me.$parent.message = 'You have added your available dates.'
                            me.$store.state.calendarAvailabilitySuccessStatus = true
                            break
                    }
                    me.$store.state.bookerMenuPromptStatus = false
                } else {
                    me.selectedMenu = true
                }
            }
        }
    }
</script>
