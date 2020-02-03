<template>
    <div class="default_modal_side">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="side_wrapper">
            <div class="side_header">
                <h2>Choose an action</h2>
            </div>
            <ul class="side_menu">
                <li id="item_0" class="side_item" @click="toggleMenu('comp', 0)">
                    <div class="item">Comp</div>
                    <svg id="check" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <g transform="translate(-804.833 -312)">
                            <circle class="circle" cx="14" cy="14" r="14" transform="translate(805.833 313)" />
                            <path class="mark" d="M6466.494,185.005l4.85,4.85,9.6-9.6" transform="translate(-5653.091 142.403)" />
                        </g>
                    </svg>
                </li>
                <li id="item_1" class="side_item" @click="toggleMenu('block', 1)">
                    <div class="item">Block</div>
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
                <div href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</div>
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
            toggleMenu (type, unique) {
                const me = this
                let items = document.querySelectorAll('.side_menu .side_item')
                me.selectedMenu = false
                me.selectedCount += 1
                me.selectedType = type
                document.getElementById(`item_${unique}`).classList.add('active')
                items.forEach((element, index) => {
                    if (unique != index) {
                        document.getElementById(`item_${index}`).classList.remove('active')
                    }
                })
            },
            toggleProceed () {
                const me = this
                if (me.selectedCount > 0) {
                    switch (me.selectedType) {
                        case 'comp':
                            me.$parent.assignType = 0
                            if (me.$store.state.seat.status == 'comp') {
                                me.$store.state.removeAssignStatus = true
                            } else {
                                me.$store.state.assignStatus = true
                            }
                            break
                        case 'block':
                            me.$parent.brokenMessage = 'Are you sure you want to continue?'
                            me.$store.state.promptBrokenBikeStatus = true
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
