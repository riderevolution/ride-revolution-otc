<template>
    <transition name="fade">
        <div class="upcoming_classes_layout alt" v-if="loaded">
            <div class="background"></div>
            <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>{{ replacer($route.params.slug) }}</span></div>
            <div class="layout_parent">
                <div class="rider_layout">
                    <div class="rider_header">
                        <h2>Riders in this class</h2>
                    </div>
                    <div class="rider_content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Bike No.</th>
                                    <th>Customer Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(n, key) in 40" :key="key">
                                    <td>{{ key + 1 }}</td>
                                    <td class="name">Sample Name</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="class_layout">
                    <div class="layout_header">
                        <div class="etc"></div>
                        <div class="info">
                            <h2>{{ $moment(scheduleDate.date).format('MMM DD, YYYY (ddd)') }}</h2>
                            <label>{{ scheduleDate.schedule.start_time }} {{ scheduleDate.schedule.class_type.name }}</label>
                        </div>
                        <div class="class_info">
                            <div class="action_calendar_btn" id="legend_toggler_alt" @click="toggleLegends($event)" src="/icons/info-icon.svg">Legends</div>
                            <div class="overlay">
                                <label>Customer Legend</label>
                                <div class="type_content">
                                    <div class="type" v-for="(data, key) in customerTypes" :key="key">
                                        <img :src="data.images[0].path" />
                                        <div class="type_title">{{ data.name }}</div>
                                    </div>
                                    <div class="type">
                                        <img src="/icons/guest-icon.svg" />
                                        <div class="type_title">Guest</div>
                                    </div>
                                    <div class="type">
                                        <img src="/icons/pending-payment-icon.svg" />
                                        <div class="type_title">Pending Payment</div>
                                    </div>
                                    <div class="type">
                                        <img src="/icons/broken-bike-icon.svg" />
                                        <div class="type_title">Broken Bike</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div :class="`layout_content layout_${studio}`">
                        <div class="seats">
                            <div class="seat_header">
                                <img :src="scheduleDate.schedule.instructor_schedules[0].user.instructor_details.images[0].path" v-if="scheduleDate.schedule.instructor_schedules[0].user.instructor_details.images[0].path != null" />
                                <div class="header_image" v-else>
                                    <div class="overlay">
                                        {{ scheduleDate.schedule.instructor_schedules[0].user.first_name.charAt(0) }}{{ scheduleDate.schedule.instructor_schedules[0].user.last_name.charAt(0) }}
                                    </div>
                                </div>
                                <h3>{{ scheduleDate.schedule.instructor_schedules[0].user.first_name }} {{ scheduleDate.schedule.instructor_schedules[0].user.last_name }}</h3>
                            </div>
                            <div :class="`seat_boxes ${parent.position} ${parent.layout}`" v-for="(parent, key) in seats" :key="key">
                                <div :class="`seat_position ${addSeatClass(seat)}`" v-for="(seat, key) in parent.data" :key="key">
                                    <div class="seat_number">{{ seat.number }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="seat_legends">
                        <div class="legend_title gray"><span></span> Booked</div>
                        <div class="legend_title margin white"><span></span> Available</div>
                        <div class="legend_title margin gradient"><span></span> Blocked/Comp</div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
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
                loaded: false,
                temp: [],
                scheduleDate: [],
                customerTypes: [],
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
            toggleLegends (event) {
                const me = this
                let element = event.target
                if (element.nextElementSibling.classList.contains('active')) {
                    element.nextElementSibling.classList.remove('active')
                } else {
                    element.nextElementSibling.classList.add('active')
                }
            },
            addSeatClass (seat) {
                const me = this
                let result = ''
                if (seat.bookings.length > 0 && (seat.bookings[0].user.id == me.$route.params.param)) {
                    result += 'highlight '
                }
                switch (seat.status) {
                    case 'open':
                        result += 'available'
                        break
                    case 'comp':
                        if (seat.comp.length > 0) {
                            result += 'comp'
                        }
                        break
                    case 'reserved':
                    case 'reserved-guest':
                        if (seat.bookings.length > 0 && (seat.bookings[0].user != null && seat.bookings[0].user.id != me.$route.params.param)) {
                            result += 'sign_in'
                        }
                        break
                    case 'blocked':
                        result += 'comp blocked'
                        break
                    case 'signed-in':
                        result += 'sign_out'
                        break
                    case 'no-show':
                        result += 'no_show'
                        break
                }
                return result
            },
            toggleClose () {
                const me = this
                me.$store.state.classScheduleLayoutStatus = false
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target
                let element = document.getElementById(`legend_toggler_alt`)
                if (element !== target) {
                    if (element.nextElementSibling.classList.contains('active')) {
                        element.nextElementSibling.classList.remove('active')
                    }
                }
            }
        },
        mounted () {
            const me = this
            let layout = `layout_${me.studio}`
            me.seats = { left: { position: 'left', layout: layout, data: [] }, right: { position: 'right', layout: layout, data: [] }, bottom: { position: 'bottom', layout: layout, data: [] }, bottom_alt: { position: 'bottom_alt', layout: layout, data: [] }, bottom_alt_2: { position: 'bottom_alt_2', layout: layout, data: [] }, }
            me.$axios.get(`/api/seats?studio_id=${me.studio}&scheduled_date_id=${me.schedule}`).then(res => {
                if (res.data) {
                    me.scheduleDate = res.data.scheduled_date
                    me.temp = res.data.seats
                    me.temp.forEach((seat, index) => {
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
                    me.$axios.get('api/extras/customer-types').then(res => {
                        me.customerTypes = res.data.customerTypes
                    })
                    me.loaded = true
                }
            }).catch(err => {
                me.$store.state.errorList = err.response.data.errors
                me.$store.state.errorStatus = true
            }).then(() => {
                setTimeout( () => {
                    me.loader(false)
                }, 500)
            })
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
