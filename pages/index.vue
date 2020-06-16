<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Dashboard</h1>
                        </div>
                        <h2 class="header_subtitle">Greenbelt Branch</h2>
                    </div>
                    <div class="actions">
                        <div class="action_buttons">
                            <nuxt-link to="/booker" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Check-in Rider</nuxt-link>
                        </div>
                    </div>
                </div>
            </section>
            <section id="content">
                <div class="target_wrapper">
                    <div class="left">
                        <div class="target_header">
                            <h2>Targets</h2>
                            <div class="view">
                                <label for="month">View</label>
                                <select class="default_select" name="month">
                                    <option :value="n" v-for="(n, key) in 12" :key="key" :selected="n == $moment().format('M')">{{ $moment(n, 'M').format('MMMM') }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="target_content">
                            <div class="column">
                                <div class="column_header">
                                    <h2>Total Attendance</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="attendanceOptions" :series="attendanceSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <b class="blue">2,000</b>
                                        <p>Actual no. of Riders for this Month</p>
                                        <b class="blue">3,000</b>
                                        <p>Target no. of Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="column_header">
                                    <h2>Package Sales</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="packageSalesOptions" :series="packageSalesSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <p>Rate of Package Sales Sold Based on this Month's Target</p>
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="column_header">
                                    <h2>First Time Riders</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="firstTimeRidersOptions" :series="firstTimeRidersSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <b class="green">50</b>
                                        <p>Total First Time Riders this Month</p>
                                        <b class="green">200</b>
                                        <p>Target no. of Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                            <div class="column">
                                <div class="column_header">
                                    <h2>Returning Riders</h2>
                                </div>
                                <div class="column_content">
                                    <div class="content_left">
                                        <no-ssr>
                                            <apexchart :options="returningRidersOptions" :series="returningRidersSeries"></apexchart>
                                        </no-ssr>
                                    </div>
                                    <div class="content_right">
                                        <b class="violet">850</b>
                                        <p>Actual no. of Returning Riders for this Month</p>
                                        <b class="violet">1,500</b>
                                        <p>Target no. of Returning Riders for this Month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right">
                        <div class="table_notepad">
                            <h2 class="footer_title">Notepad</h2>
                            <div class="notepad_text">
                                <textarea name="notepad" rows="10"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                attendanceSeries: [85],
                packageSalesSeries: [85],
                firstTimeRidersSeries: [85],
                returningRidersSeries: [85],
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
                                background: '#445e91',
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
                },
                packageSalesOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(251, 201, 24, 0.5)',
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
                                background: '#6f6a3e',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#fbc918",
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#fbc918']
                    }
                },
                firstTimeRidersOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(56, 176, 157, 0.5)',
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
                                background: '#36706d',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#38b09d",
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#38b09d']
                    }
                },
                returningRidersOptions: {
                    chart: {
                        height: 150,
                        type: "radialBar",
                        dropShadow: {
                            enabled: true,
                            top: 0,
                            left: 0,
                            blur: 3,
                            color: 'rgba(174, 131, 255, 0.5)',
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
                                background: '#685d93',
                            },
                            dataLabels: {
                                showOn: "always",
                                name: {
                                    show: false,
                                },
                                value: {
                                    color: "#ae83ff",
                                    fontSize: "30px",
                                    show: true,
                                    fontFamily: 'SFProDisplay-Bold'
                                }
                            }
                        }
                    },
                    fill: {
                        colors: ['#ae83ff']
                    }
                }
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                document.querySelector('.target_wrapper .right .table_notepad textarea').style.maxHeight = `${document.querySelector('.target_wrapper .left').offsetHeight}px`
            }, 200);
        }
    }
</script>
