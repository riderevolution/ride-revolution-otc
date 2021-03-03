<template>
    <div class="default_modal_side">
        <div class="background" @click.once="toggleClose()"></div>
        <div class="side_wrapper">
            <div class="side_header">
                <h2>Choose an action</h2>
            </div>
            <ul class="side_menu">
                <li :id="`item_${key}`" :class="`side_item ${item.class} ${(item.toggled) ? 'active' : ''}`" @click="toggleMenu(item, key)"  v-for="(item, key) in items" :key="key">
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
                selectedType: '',
                seat: '',
                items: [
                    {
                        id: 0,
                        name: 'Reserved',
                        slug: 'reserved',
                        class: '',
                        toggled: false
                    },
                    {
                        id: 1,
                        name: 'Signed In',
                        slug: 'signed-in',
                        class: '',
                        toggled: false
                    },
                    {
                        id: 2,
                        name: 'Cancelled',
                        slug: 'cancelled',
                        class: 'alt',
                        toggled: false
                    }
                ]
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$parent.change_status = false
                document.body.classList.remove('no_scroll')
            },
            toggleMenu (item, unique) {
                const me = this
                me.selectedMenu = false
                me.selectedCount += 1
                me.selectedType = item
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
                let form_data = new FormData(),
                token = me.$cookies.get('70hokcotc3hhhn5')
                form_data.append('status', me.selectedType.slug)
                form_data.append('booking_id', (me.seat.comp.length > 0) ? me.seat.comp[0].id : me.seat.bookings[0].id)
                me.loader(true)
                me.$axios.post('api/bookings/change-status', form_data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            document.body.classList.add('no_scroll')
                            me.$store.state.promptBookerStatus = true
                            if (me.$parent.$refs.plan) {
                                me.$parent.$refs.plan.message = `Changing of status to ${me.selectedType.name} confirmed.`
                            }
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.toggleClose()
                        me.$parent.getSeats()
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            me.seat = me.$store.state.seat
            document.body.classList.add('no_scroll')
        }
    }
</script>
