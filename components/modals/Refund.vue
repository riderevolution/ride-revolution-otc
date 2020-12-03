<template>
    <div class="default_modal_side">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="side_wrapper">
            <div class="side_header">
                <h2>Choose an action</h2>
            </div>
            <ul class="side_menu">
                <li :id="`item_${key}`" :class="`side_item ${(item.toggled) ? 'active' : ''}`" @click="toggleMenu(item, key)" v-for="(item, key) in populateMenu" :key="key">
                    <div class="item">{{ item.name }}</div>
                    <svg id="check" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <g transform="translate(-804.833 -312)">
                            <circle class="circle" cx="14" cy="14" r="14" transform="translate(805.833 313)" />
                            <path class="mark" d="M6466.494,185.005l4.85,4.85,9.6-9.6" transform="translate(-5653.091 142.403)" />
                        </g>
                    </svg>
                </li>
                <transition name="slide"><span class="validation_errors" v-if="selectedMenu">Please select an action</span></transition>
            </ul>
            <div class="form_main_group">
                <div class="form_group">
                    <label for="remarks">Remarks</label>
                    <textarea name="remarks" rows="8" id="remarks" v-model="form.remarks" class="default_text unique area" placeholder="Enter remarks"></textarea>
                </div>
            </div>
            <div class="button_group">
                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin alternate" @click="toggleProceed()">Proceed</div>
            </div>
        </div>
        <transition name="fade">
            <refund-confirm :value="form" :paymentItemId="paymentItemId" v-if="$store.state.refundConfirmStatus" />
        </transition>
    </div>
</template>

<script>
    import RefundConfirm from '~/components/modals/RefundConfirm'
    export default {
        components: {
            RefundConfirm
        },
        props: {
            payment: {
                default: null
            },
            paymentItemId: {
                default: 0
            }
        },
        data () {
            return {
                selectedMenu: false,
                selectedCount: 0,
                form: {
                    remarks: '',
                    selectedType: ''
                },
                items: [
                    {
                        id: 0,
                        name: 'Store Credits',
                        value: 'store-credits',
                        toggled: false,
                        excludedMethods: []
                    },
                    {
                        id: 1,
                        name: 'Cash',
                        value: 'cash',
                        toggled: false,
                        excludedMethods: []
                    }
                ]
            }
        },
        computed: {
            populateMenu () {
                const me = this
                let results = []
                me.items.forEach((item, index) => {
                    if (!item.excludedMethods.includes(me.payment.payment_method.method)) {
                        results.push(item)
                    }
                })
                return results
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.refundStatus = false
                document.body.classList.remove('no_scroll')
            },
            toggleMenu (item, unique) {
                const me = this
                me.selectedMenu = false
                me.selectedCount += 1
                me.form.selectedType = item.value
                me.items.forEach((element, index) => {
                    if (item.id == element.id) {
                        element.toggled = true
                    } else {
                        element.toggled = false
                    }
                })
            },
            toggleProceed () {
                const me = this
                if (me.selectedCount > 0) {
                    me.$store.state.refundConfirmStatus = true
                } else {
                    me.selectedMenu = true
                }
            }
        }
    }
</script>
