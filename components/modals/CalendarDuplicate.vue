<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">Duplicate {{ (type == 'day') ? 'Day' : (type == 'week' ? 'into Weeks' : 'into Months') }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <transition name="fade">
                    <div class="modal_main_group" v-if="type == 'day'">
                        <div class="form_flex check">
                            <div class="form_group check">
                                <v-ctk v-model="form.target_date" :only-date="true" :no-button="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'target_date'" :name="'target_date'" :label="'Select target date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('target_date')">{{ properFormat(errors.first('target_date')) }}</span></transition>
                            </div>
                            <div class="form_group flex check">
                                <div class="form_check">
                                    <input type="checkbox" id="include_private_class" name="include_private_class" class="action_check">
                                    <label for="include_private_class">Include Private Class</label>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Duplicate</button>
                            </div>
                        </div>
                    </div>
                </transition>
                <transition name="fade">
                    <div class="modal_main_group" v-if="type == 'week'">
                        <div class="form_flex trio">
                            <div class="form_group" v-for="(data, key) in populateWeeks" :key="key">
                                <label class="flex_label">{{ data.name }} {{ data.year }}</label>
                                <div class="form_check" v-for="(week, wkey) in data.weeks" :key="wkey">
                                    <input type="checkbox" :id="`week_${data.month}_${week}`" name="target_weeks[]" :value="`${getWeekRange(data.year, data.month, data.day, wkey)}`" class="action_check">
                                    <label :for="`week_${data.month}_${week}`">{{ convertNumbertoString(wkey) }} Week</label>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Duplicate</button>
                            </div>
                        </div>
                    </div>
                </transition>
                <transition name="fade">
                    <div class="modal_main_group" v-if="type == 'month'">
                        <div class="form_flex trio">
                            <div class="form_group" v-for="(data, key) in populateWeeks" :key="key">
                                <div class="form_check">
                                    <input type="checkbox" :id="`month_${data.month}`" name="target_months[]" :value="`${data.year}-${data.month}-1`" class="action_check">
                                    <label :for="`month_${data.month}`">{{ convertMonthtoAbbrev(data.month) }} {{ data.year }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Duplicate</button>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            yearPicked: {
                default: ''
            },
            monthPicked: {
                default: ''
            },
            datePicked: {
                default: ''
            },
            type: {
                type: String,
                default: 'day'
            }
        },
        data () {
            return {
                form: {
                    target_date: this.$moment(this.datePicked).format('YYYY-MM-DD')
                }
            }
        },
        computed: {
            populateWeeks () {
                const me = this
                let month = me.monthPicked
                let year = me.yearPicked
                let data = []
                for (let m = 1; m < 13; m++) {
                    month = month + 1
                    if (month == 13) {
                        month = 1
                        year = year + 1
                    }
                    data.push(
                        {
                            name: me.$moment(`${year}-${month}`, 'YYYY-MM').format('MMMM'),
                            month: parseInt(me.$moment(`${year}-${month}`, 'YYYY-MM').format('M')),
                            year: parseInt(me.$moment(`${year}-${month}`, 'YYYY-MM').format('YYYY')),
                            weeks: '',
                            day: []
                        }
                    )
                }

                data.forEach((element, index) => {
                    let startDate = 1
                    let nextDate = 0
                    let excess = 0
                    let endDate = me.$moment(`${element.year}-${element.month}`, 'YYYY-MM').daysInMonth()
                    let checkFirstDate = me.$moment(`${element.year}-${element.month}-${1}`, 'YYYY-MM-D').format('d')
                    let checkLastDate = me.$moment(`${element.year}-${element.month}-${endDate}`, 'YYYY-MM-D').format('d')
                    for (let i = 0; i < 6; i++) {
                        for (let j = 0; j < 7; j++) {
                            if (startDate <= endDate) {
                                switch (j) {
                                    case 6:
                                        element.day.push(startDate)
                                        break
                                }
                                if (me.$moment(`${element.year}-${element.month}-${startDate}`, 'YYYY-MM-D').format('d') == j) {
                                    startDate++
                                }
                            } else {
                                if (checkFirstDate == 5 && checkLastDate == 0 || checkFirstDate == 6 && checkLastDate == 1) {
                                    excess = i + 1
                                } else {
                                    excess = i
                                }
                            }
                        }
                    }
                    element.weeks = excess
                    element.day.push(endDate)
                })
                return data
            }
        },
        methods: {
            convertMonthtoAbbrev (value) {
                const me = this
                let name = me.$moment(value, 'M').format('MMM')
                return name
            },
            getWeekRange (year, month, day, unique) {
                const me = this
                let firstDayofWeek = me.$moment(`${year}-${month}-${day[unique]}`, 'YYYY-MM-D').startOf('week').format('YYYY-MM-DD')
                let lastDayofWeek = me.$moment(`${year}-${month}-${day[unique]}`, 'YYYY-MM-D').format('YYYY-MM-DD')
                return `${firstDayofWeek}|||${lastDayofWeek}`
            },
            convertNumbertoString (value) {
                const me = this
                let strings = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth']
                return strings[value]
            },
            toggleClose () {
                const me = this
                me.$store.state.calendarDuplicateStatus = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        me.loader(true)
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('type', me.type)
                        formData.append('origin_date', me.datePicked)
                        formData.append('studio_id', me.$store.state.user.current_studio_id)
                        me.$axios.post('api/schedules/duplicate', formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            if (res.data) {
                                me.$parent.message = `Successfully duplicated this ${(me.type == 'day') ? 'day' : (me.type == 'week' ? 'week' : 'month')}.`
                                me.$store.state.calendarActionSuccess = true
                                me.$store.state.calendarDuplicateStatus = false
                                me.$parent.generateCalendar(me.$parent.currentYear, me.$parent.currentMonth, 0, 0)
                                document.body.classList.remove('no_scroll')
                            }
                        }).catch(err => {
                            me.$store.state.errorOverlayStatus = true
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        document.querySelector('.validation_errors').scrollIntoView({block: 'center', behavior: 'smooth'})
                    }
                })

            }
        }
    }
</script>
