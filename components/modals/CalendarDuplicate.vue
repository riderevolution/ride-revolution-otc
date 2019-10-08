<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
            <div class="modal_wrapper">
                <h2 class="form_title">Duplicate {{ (type == 'day') ? 'Day' : (type == 'week' ? 'into Weeks' : 'into Months') }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <transition name="fade">
                    <div class="modal_main_group" v-if="type == 'day'">
                        <div class="form_flex">
                            <div class="form_group check">
                                <input type="date" name="day_date" autocomplete="off" class="default_text date" v-validate="'required'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('day_date')">{{ errors.first('day_date') }}</span></transition>
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
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
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
                                    <input type="checkbox" :id="`week_${data.month}_${week}`" name="weeks[]" :value="`${data.year}-${data.month}-${week}`" class="action_check" checked>
                                    <label :for="`week_${data.month}_${week}`">{{ convertNumbertoString(wkey) }} Week</label>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
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
                                    <input type="checkbox" :id="`month_${data.month}`" name="months[]" :value="`${data.year}-${data.month}`" class="action_check" checked>
                                    <label :for="`month_${data.month}`">{{ convertMonthtoAbbrev(data.month) }} {{ data.year }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
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
            type: {
                type: String,
                default: 'day'
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
                            weeks: ''
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
                switch (type) {
                    case 'day':

                        break
                    case 'week':

                        break
                    case 'month':

                        break
                }
                me.$store.state.calendarDuplicateStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>