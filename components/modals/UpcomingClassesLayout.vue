<template>
    <div class="upcoming_classes_layout">
        <div class="background"></div>
        <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>{{ replacer($route.params.slug) }}</span></div>
        <div class="class_layout">
            <div class="layout_header">
                <h2>Thu , May 7, 2019 at 5:30PM: Ride Rev</h2>
                <div class="action_success_btn">Sign In</div>
            </div>
            <div :class="`layout_content layout_${studio}`">
                <div class="seats">
                    <div class="seat_header">
                        <div class="header_image"></div>
                        <h3>Billie Capistrano</h3>
                    </div>
                    <div :class="`seat_boxes ${parent.position} ${parent.layout}`" v-for="(parent, key) in seats" :key="key">
                        <div :class="`seat_position ${(seat.bookings.length > 0 && (seat.bookings[0].user != null && seat.bookings[0].user.id == $route.params.param)) ? 'highlight' : ''} ${(seat.status == 'open') ? 'available' : (seat.status == 'blocked') ? 'comp blocked' : (seat.status == 'reserved') ? (seat.bookings.length > 0 && seat.bookings[0].user != null && seat.bookings[0].user.id != $route.params.param ? 'sign_in' : '') : ''}`" v-for="(seat, key) in parent.data" :key="key">
                            <div class="seat_number">{{ seat.number }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            studio: {
                default: null
            },
            schedule: {
                default: null
            }
        },
        data () {
            return {
                temp: [],
                seats: {
                    left: {
                        position: 'left',
                        data: []
                    },
                    right: {
                        position: 'right',
                        data: []
                    },
                    bottom: {
                        position: 'bottom',
                        data: []
                    },
                    bottom_alt: {
                        position: 'bottom_alt',
                        data: []
                    },
                    bottom_alt_2: {
                        position: 'bottom_alt_2',
                        data: []
                    },
                }
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.upcomingClassesLayoutStatus = false
            }
        },
        mounted () {
            const me = this
            let layout = `layout_${me.studio}`
            me.seats = { left: { position: 'left', layout: layout, data: [] }, right: { position: 'right', layout: layout, data: [] }, bottom: { position: 'bottom', layout: layout, data: [] }, bottom_alt: { position: 'bottom_alt', layout: layout, data: [] }, bottom_alt_2: { position: 'bottom_alt_2', layout: layout, data: [] }, }
            me.$axios.get(`/api/seats?studio_id=${me.studio}&scheduled_date_id=${me.schedule}`).then(res => {
                if (res.data) {
                    me.temp = res.data.seats
                    me.temp.forEach((seat , index) => {
                        switch (seat.position) {
                            case 'left':
                            me.seats.left.data.push(seat)
                            break
                            case 'right':
                            me.seats.right.data.push(seat)
                            break
                            case 'bottom':
                            me.seats.bottom.data.push(seat)
                            break
                            case 'bottom_alt':
                            me.seats.bottom_alt.data.push(seat)
                            break
                            case 'bottom_alt_2':
                            me.seats.bottom_alt_2.data.push(seat)
                            break
                        }
                        me.ctr++
                    })
                }
            }).catch(err => {
                me.$store.state.errorList = err.response.data.errors
                me.$store.state.errorStatus = true
            }).then(() => {
                setTimeout( () => {
                    me.loader(false)
                }, 500)
            })
        }
    }
</script>
