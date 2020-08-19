<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay alt">
            <div class="modal_wrapper">
                <div class="form_title dsh">
                    <h2>Total Attendance</h2>
                    <div class="view">
                        <label for="month">View</label>
                        <select class="default_select" name="month" v-model="form.month" @change="toggleTargets()">
                            <option :value="n" v-for="(n, key) in 12" :key="key" :selected="n == $moment().format('M')">{{ $moment(n, 'M').format('MMMM') }}</option>
                        </select>
                    </div>
                </div>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="graphs">
                        <div class="radial">
                            <no-ssr>
                                <apexchart height="200" :options="attendanceOptions" :series="attendanceSeries"></apexchart>
                            </no-ssr>
                            <div class="details">
                                <div class="left">
                                    <b class="blue">{{ totalItems(data.bookingsCount) }}</b>
                                    <p>Actual no. of Riders for this Month</p>
                                </div>
                                <div class="right">
                                    <b class="blue">{{ totalItems(data.target) }}</b>
                                    <p>Target no. of Riders for this Month</p>
                                </div>
                            </div>
                        </div>
                        <div class="bar">
                            <no-ssr>
                                <apexchart height="300" :key="ctr" :options="chartOptions" :series="series"></apexchart>
                            </no-ssr>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            data: {
                type: Object/Array,
                default: null
            },
            studio_id: {
                default: 1
            },
            month: {
                default: null
            }
        },
        data () {
            return {
                ctr: 0,
                form: {
                    month: ''
                },
                series: [
                    {
                        name: 'Attendance',
                        data: [1, 0, 5, 10, 50, 30, 10, 50, 0, 20, 1, 0, 5, 10, 50, 30, 10, 50, 0, 20, 1, 0, 5, 10, 50, 30, 10, 50, 0, 20]
                    }
                ],
                chartOptions: {
                    chart: {
                        type: 'bar',
                        height: 350
                    },
                    colors: ['#5686FB'],
                    plotOptions: {
                        bar: {
                            horizontal: false
                        },
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent']
                    },
                    xaxis: {
                        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    },
                    yaxis: {
                        title: {
                            text: 'Actual Attendance'
                        }
                    },
                    fill: {
                        opacity: 1
                    },
                    tooltip: {
                        y: {
                            formatter: function (val) {
                                return val
                            }
                        }
                    }
                },
                attendanceSeries: [],
                totalAttendance: [],
                attendanceOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(86, 134, 251, 0.5)',
                            opacity: 0.5
                        }
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                margin: 15,
                                size: "70%"
                            },
                            track: {
                                background: '#d8f3ff',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#5686fb",
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#5686fb']
                    }
                }
            }
        },
        methods: {
            toggleTargets () {
                const me = this
                me.loader(true)
                let targetFormData = new FormData()
                targetFormData.append('month', me.form.month)
                targetFormData.append('studio_id', me.studio_id)
                me.$axios.post('api/portal-dashboard/targets', targetFormData).then(res => {
                    me.totalAttendance = res.data.totalAttendance

                    me.attendanceSeries = []

                    me.attendanceSeries.push(res.data.totalAttendance.percent)

                    me.series[0].data = res.data.totalAttendance.daysOfTheMonth

                    let endDate = me.$moment(me.form.month, 'M').daysInMonth()
                    let tempLabels = []
                    for (let i = 1; i <= endDate; i++) {
                        console.log(me.$moment(`${me.form.month} ${i}`, 'M D'));
                        tempLabels.push(me.$moment(`${me.form.month} ${i}`, 'M D').format('MMM D'))
                    }
                    me.chartOptions.xaxis.categories = tempLabels
                    me.ctr += 1
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleClose () {
                const me = this
                me.$store.state.dashboardAttendanceStatus = false
                document.body.classList.remove('no_scroll')
            }
        },
        mounted () {
            const me = this
            me.totalAttendance = me.data
            me.form.month = me.month
            me.attendanceSeries.push(me.totalAttendance.percent)
            me.series[0].data = me.totalAttendance.daysOfTheMonth

            let endDate = me.$moment(me.form.month, 'M').daysInMonth()
            let tempLabels = []
            for (let i = 1; i <= endDate; i++) {
                tempLabels.push(me.$moment(`${me.form.month} ${i}`, 'M D').format('MMM D'))
            }
            me.chartOptions.xaxis.categories = tempLabels
        }
    }
</script>
