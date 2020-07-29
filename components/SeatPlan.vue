<template>
    <div class="plan_wrapper">
        <seat-plan-box v-for="(seat, key) in seats" :data="seat.data" :position="seat.position" :layout="seat.layout" :total="ctr" :key="key" v-if="hasFetchSeat && !onlineClass" />
        <div class="no_results" v-if="!hasFetchSeat">
            Please select a studio before viewing classes.
        </div>
        <div class="no_results" v-if="hasFetchSeat && onlineClass">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            <div class="cta">
                <div class="action_btn alternate" @click="toggleOnlineAttendance()">Update Online Attendance</div>
            </div>
        </div>
    </div>
</template>

<script>
    import SeatPlanBox from './SeatPlanBox'
    export default {
        components: {
            SeatPlanBox
        },
        props: {
            onlineClass: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                assignType: 0,
                ctr: 0,
                temp: [],
                hasCustomer: false,
                hasCancel: false,
                message: '',
                hasFetchSeat: false,
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
            toggleOnlineAttendance () {
                const me = this
                me.$store.state.onlineAttendanceLayoutStatus = true
                document.body.classList.add('no_scroll')
            },
            fetchSeats (schedule_id, id) {
                const me = this
                let layout = `layout_${id}`
                me.seats = { left: { position: 'left', layout: layout, data: [] }, right: { position: 'right', layout: layout, data: [] }, bottom: { position: 'bottom', layout: layout, data: [] }, bottom_alt: { position: 'bottom_alt', layout: layout, data: [] }, bottom_alt_2: { position: 'bottom_alt_2', layout: layout, data: [] }, }
                if (schedule_id != null) {
                    me.loader(true)
                    me.$axios.get(`api/seats?studio_id=${id}&scheduled_date_id=${schedule_id}`).then(res => {
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
                            me.hasFetchSeat = true
                        }, 500)
                    })
                } else {
                    me.hasFetchSeat = false
                }
            }
        }
    }
</script>
