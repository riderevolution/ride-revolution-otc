<template>
    <div class="booker_table" v-if="loaded">
        <div class="class_layout">
            <div class="layout_header">
                <h2>{{ $moment(scheduleDate.date).format('ddd, MMM DD, YYYY') }} at {{ scheduleDate.schedule.start_time }}: {{ (scheduleDate.schedule.custom_name != null) ? scheduleDate.schedule.custom_name : scheduleDate.schedule.class_type.name }} - {{ studio.name }}</h2>
            </div>
            <div :class="`layout_content layout_${$route.query.studio_id}`">
                <div class="seats">
                    <div class="seat_header">
                        <img :src="instructorData(scheduleDate, 'image')" v-if="instructorData(scheduleDate, 'image') != null" />
                        <div class="header_image" v-else>
                            <div class="overlay">
                                {{ instructorData(scheduleDate, 'initials') }}
                            </div>
                        </div>
                        <h3>{{ instructorData(scheduleDate, 'name') }}</h3>
                    </div>
                    <div :class="`seat_boxes ${parent.position} ${parent.layout}`" v-for="(parent, key) in seats" :key="key">
                        <div :class="`seat_position ${addSeatClass(seat)}`" v-for="(seat, key) in parent.data" :key="key">
                            <div class="seat_number">{{ seat.number }}</div>
                            <h2 v-if="seat.comp.length > 0">{{ (seat.comp[0].user_id != null) ? `${seat.comp[0].user.first_name} ${seat.comp[0].user.last_name}` : seat.comp[0].email }}</h2>

                            <h2 class="info_link" v-if="seat.bookings.length > 0 && seat.bookings[0].user != null">{{ seat.bookings[0].user.first_name }} {{ seat.bookings[0].user.last_name }}</h2>

                            <h2 v-if="seat.bookings.length > 0 && seat.bookings[0].user == null">{{ seat.bookings[0].guest_first_name }} {{ seat.bookings[0].guest_last_name }}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'print',
        data () {
            return {
                loaded: false,
                studio: [],
                temp: [],
                scheduleDate: [],
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
            addSeatClass (seat) {
                let result = ''
                switch (seat.status) {
                    case 'open':
                        result += 'available'
                        break
                    case 'comp':
                        result += 'comp'
                        break
                    case 'reserved':
                    case 'reserved-guest':
                        result += 'sign_in'
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
            instructorData (data, type) {
                let primary = null,
                    additional = null,
                    result = ''

                if (data) {
                    primary = data.schedule.instructor_schedules.filter((item) => {
                        return item.primary == 1
                    })
                    primary = (primary.length > 0) ? primary[0].user : data.schedule.instructor_schedules[0].user
    
                    additional = data.schedule.instructor_schedules.filter((item, index) => {
                        if (index != 0) {
                            return (!item.substitute && !item.primary)
                        }
                    })
                    additional = (additional.length > 0) ? additional[0].user : null
    
                    if (additional) {
                        if (type == 'name') {
                            result = `${primary.instructor_details.nickname} + ${additional.instructor_details.nickname}`
                        }
                    } else {
                        if (type == 'name') {
                            result = primary.fullname
                        }
                    }

                    if (type == 'image') {
                        result = primary.instructor_details.images[0].path
                    }

                    if (type == 'initials') {
                        result = `${primary.first_name.charAt(0)} ${primary.last_name.charAt(0)}`
                    }
                }

                return result
            },
            async initial () {
                const me = this

                if (me.$route.query.studio_id.length > 0) {
                    await me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                        me.studio = res.data.studio
                    })
                }

                let layout = `layout_${me.$route.query.studio_id}`
                me.seats = { left: { position: 'left', layout: layout, data: [] }, right: { position: 'right', layout: layout, data: [] }, bottom: { position: 'bottom', layout: layout, data: [] }, bottom_alt: { position: 'bottom_alt', layout: layout, data: [] }, bottom_alt_2: { position: 'bottom_alt_2', layout: layout, data: [] }, }
                await me.$axios.get(`/api/seats?studio_id=${me.$route.query.studio_id}&scheduled_date_id=${me.$route.query.scheduled_date_id}`).then(res => {
                    if (res.data) {
                        me.scheduleDate = res.data.scheduled_date
                        me.temp = res.data.seats
                        me.temp.forEach(seat => {
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

                        me.loaded = true
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })

                setTimeout( () => {
                    window.print()
                }, 1000)
            }
        },
        mounted () {
            const me = this
            me.initial()
            window.onafterprint = function(){
                window.close()
            }
        }
    }
</script>
