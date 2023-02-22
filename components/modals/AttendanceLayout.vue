<template>
    <transition name="fade">
        <div class="upcoming_classes_layout table" v-if="loaded">
            <div class="background"></div>
            <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>Booker</span></div>
            <div class="table_layout">
                <h2>{{ customer.first_name }}'s Class Attendance</h2>
                <div class="actions">
                    <div class="total">Total: {{ res.classHistory.length }}</div>
                    <div class="cms_table_toggler">
                        <div :class="`status ${(classesHistoryStatus == 'all') ? 'active' : ''}`" @click="initial('all')">All</div>
                        <div :class="`status ${(classesHistoryStatus == 'completed') ? 'active' : ''}`" @click="initial('completed')">Completed</div>
                        <div :class="`status ${(classesHistoryStatus == 'no-show') ? 'active' : ''}`" @click="initial('no-show')">No Show</div>
                        <div :class="`status ${(classesHistoryStatus == 'cancelled') ? 'active' : ''}`" @click="toggleClassesHistory('cancelled')">Cancelled</div>
                        <div :class="`status ${(classesHistoryStatus == 'late-cancelled') ? 'active' : ''}`" @click="toggleClassesHistory('late-cancelled')">Late Cancelled</div>
                    </div>
                </div>
                <div class="cms_table_scroll">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th>Date &amp; Time</th>
                                <th>Bike No.</th>
                                <th>Class</th>
                                <th>Studio</th>
                                <th>Instructor</th>
                                <th>Guests</th>
                                <th>Status</th>
                                <th>Series ID</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.classHistory.length > 0">
                            <tr v-for="(data, key) in res.classHistory" :key="key">
                                <td>{{ formatClassDate(data.created_at, true) }}</td>
                                <td>{{ data.seat.number }}</td>
                                <td>{{ (data.scheduled_date.schedule.custom_name != null) ? data.scheduled_date.schedule.custom_name : data.scheduled_date.schedule.class_type.name }}</td>
                                <td>{{ data.scheduled_date.schedule.studio.name }}</td>
                                <td>
                                    <div class="thumb">
                                        <img :src="data.instructor.user.instructor_details.images[0].path_resized" />
                                        <nuxt-link class="table_data_link" :to="`/instructors/${data.instructor.id}/class-schedules`">{{ data.instructor.user.first_name }} {{ data.instructor.user.last_name }}</nuxt-link>
                                    </div>
                                </td>
                                <td>
                                    <div class="table_select" v-if="data.guestBookings && data.guestBookings.length > 0">
                                        <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">{{ data.guestBookings.length }} Guests</div>
                                        <div class="overlay">
                                            <ul>
                                                <li v-for="(subData, key) in data.guestBookings" :key="key" v-line-clamp="1">{{ subData.seat.number }} - {{ subData.guest_first_name }} {{ subData.guest_last_name }}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <p v-else>N/A</p>
                                </td>
                                <td class="alt">{{ checkStatus(data) }}</td>
                                <td>
                                    <p>{{ data.class_package.name }}</p>
                                    <p class="id">{{ data.class_package.sku_id }}</p>
                                    <p
                                        :class="[
                                            'table_violator',
                                            (data.shared) ? 'pink' : 'blue'
                                        ]"
                                    >
                                        {{ (data.shared) ? 'Shared By' : 'Owned By' }}: {{ data.user_package_count.user.fullname }}
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        props: {
            customer: {
                default: null
            }
        },
        data () {
            return {
                classesHistoryStatus: 'all',
                loaded: false,
                rowCount: 0,
                res: []
            }
        },
        methods: {
            toggleGuest (event) {
                const me = this
                let element = event.target
                if (element.nextElementSibling.classList.contains('active')) {
                    element.nextElementSibling.classList.remove('active')
                } else {
                    element.nextElementSibling.classList.add('active')
                }
            },
            toggleClose () {
                const me = this
                me.$store.state.attendanceLayoutStatus = false
                document.body.classList.remove('no_scroll')
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target
                if (me.loaded) {
                    for (let i = 0; i <= me.res.classHistory.length; i++) {
                        let element = document.getElementById(`table_select_${i}`)
                        if (element !== target) {
                            if (element) {
                                if (element.nextElementSibling) {
                                    if (element.nextElementSibling.classList.contains('active')) {
                                        element.nextElementSibling.classList.remove('active')
                                    }
                                }
                            }
                        }
                    }
                }
            },
            formatClassDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('M/D/YY (ddd) h:mm A')
                    } else {
                        return this.$moment(value).format('MMMM DD, YYYY')
                    }
                }
            },
            checkStatus (data) {
                const me = this
                let result = ''
                if (data.deleted_at != null) {
                    result = 'Cancelled'
                }
                switch (data.status) {
                    case 'signed-in':
                        result = 'Completed'
                        break
                    case 'no-show':
                        result = 'No Show'
                        break
                    case 'reserved':
                        result = 'Reserved'
                        break
                    case 'cancelled':
                        result = 'Cancelled'
                        break
                    case 'late-cancelled':
                        result = 'Late Cancelled'
                        break
                }
                return result
            },
            initial (status) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.customer.id}/class-history?classHistoryStatus=${status}`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.customer
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
                        me.classesHistoryStatus = status
                        me.loader(false)
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            me.initial('all')
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
