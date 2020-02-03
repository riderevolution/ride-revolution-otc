<template>
    <div class="plan_wrapper">
        <seat-plan-box v-for="(seat, key) in seats" :data="seat.data" :position="seat.position" :layout="seat.layout" :total="ctr" :key="key" v-if="hasFetchSeat" />
        <div class="no_results" v-if="!hasFetchSeat">
            Please select a studio before viewing classes.
        </div>
    </div>
</template>

<script>
    import SeatPlanBox from './SeatPlanBox'
    export default {
        components: {
            SeatPlanBox
        },
        data () {
            return {
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
            toggleOverlays (e) {
                const me = this
                let target = e.target
                for (let i = 1; i < me.ctr + 1; i++) {
                    let element = document.getElementById(`seat_menu_${i}`)
                    if (element !== null) {
                        if (element !== target && element !== target.parentNode.parentNode.parentNode.previousElementSibling) {
                            if (element.nextElementSibling !== null) {
                                if (element.nextElementSibling.classList.contains('active')) {
                                    element.nextElementSibling.classList.remove('active')
                                }
                            }
                        }
                    }
                }
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
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
