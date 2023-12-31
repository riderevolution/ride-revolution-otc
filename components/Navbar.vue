<template>
    <div :class="`navbar_container${(hasToggleThirdLevel) ? ' toggled' : (isHovered) ? ' toggled' : ''}`" @focus="resetHoverToggle()" @mouseover="resetHoverToggle()" @mouseleave="resetLeaveToggle()">
        <div class="navbar">
            <nuxt-link to="/" class="logo">
                <img src="/logo.png" />
                <div class="logo_title">
                    Ride <br/>
                    Revolution
                </div>
            </nuxt-link>
            <transition name="slide_alt">
                <ul class="nav_list" v-if="!hasToggleThirdLevel">
                    <li class="item_wrapper" v-for="(navItem, parent_key) in navItems" :key="parent_key" v-if="navItem.access">
                        <nuxt-link :class="`nav_item ${navItem.class} ${(navItem.subItems) ? 'nav_parent' : ''}`" :to="navItem.link" v-if="navItem.hasLink" @click.native.self="resetToggle()">{{ navItem.title }}</nuxt-link>
                        <nuxt-link :event="''" :class="`nav_item ${navItem.class} ${(navItem.subItems) ? 'nav_parent' : ''}`" :to="navItem.link" v-else @click.native.self="toggleChild($event)">{{ navItem.title }}</nuxt-link>
                        <div class="sub_wrapper" v-if="navItem.subItems">
                            <ul class="sub_nav_list" v-for="(subItem, sub_key) in navItem.subItems" :key="sub_key" v-if="subItem.access">
                                <li :class="`sub_item_wrapper ${(subItem.hasChild) ? 'child' : ''}`">
                                    <nuxt-link :class="{'sub_nav_item': true, 'inactive': ($route.path == subItem.inactive_on) }" :to="subItem.link" @click.native.self="resetToggle()" v-if="!subItem.hasChild">{{ subItem.title }}</nuxt-link>
                                    <nuxt-link :class="{'sub_nav_item': true, 'inactive': ($route.path == subItem.inactive_on) }" :event="''" :to="subItem.link" @click.native.self="toggleSubChild(subItem)" v-else>{{ subItem.title }}</nuxt-link>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </transition>
            <div class="nav_back" v-if="hasToggleThirdLevel" @click="back()">Back</div>
            <ul class="nav_list alt" v-if="hasToggleThirdLevel">
                <li class="child_item_wrapper" v-for="(navItem, child_key) in thirdNavItems" :key="child_key" v-if="navItem.access">
                    <nuxt-link class="nav_child_item" :to="navItem.link" @click.native.self="resetToggle()">{{ navItem.title }}</nuxt-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                hasToggleThirdLevel: false,
                thirdNavItems: null,
                navItems: [
                    {
                        title: 'Dashboard',
                        link: '/',
                        hasLink: true,
                        class: 'dashboard',
                        image: '/icons/navbar/dashboard-unselected.png'
                    },
                    {
                        title: 'Booker',
                        link: '/booker',
                        hasLink: true,
                        class: 'booker',
                        image: '/icons/navbar/booker-unselected.png'
                    },
                    {
                        title: 'Scheduler',
                        link: '/scheduler',
                        hasLink: true,
                        class: 'scheduler nav_parent_alt',
                        image: '/icons/navbar/scheduler-unselected.png'
                    },
                    {
                        title: 'Customers',
                        link: '/customers',
                        hasLink: true,
                        class: 'customers nav_parent_alt',
                        image: '/icons/navbar/customers-unselected.png'
                    },
                    {
                        title: 'Instructors',
                        link: '/instructors',
                        hasLink: true,
                        class: 'instructors nav_parent_alt',
                        image: '/icons/navbar/instructors-unselected.png'
                    },
                    {
                        title: 'Retail',
                        link: '/retail',
                        hasLink: false,
                        class: 'supplies',
                        image: '/icons/navbar/supplies-unselected.png',
                        subItems: [
                            {
                                title: 'Suppliers',
                                link: '/retail/suppliers'
                            },
                            {
                                title: 'Inventory',
                                link: '/retail/inventory'
                            },
                            {
                                title: 'Purchase Order',
                                link: '/retail/purchase-order'
                            },
                            {
                                title: 'Products',
                                link: '/retail/products'
                            },
                            {
                                title: 'Product Categories',
                                link: '/retail/product-categories'
                            },
                            {
                                title: 'Promotions',
                                link: '/retail/promotions'
                            },
                            {
                                title: 'Physical Gift Cards',
                                link: '/retail/physical-gift-cards'
                            }
                        ]
                    },
                    {
                        title: 'Studio Receiving',
                        link: '/studio-receiving',
                        hasLink: true,
                        class: 'supplies',
                        image: '/icons/navbar/supplies-unselected.png'
                    },
                    {
                        title: 'Reporting',
                        link: '/reporting',
                        hasLink: false,
                        class: 'reporting',
                        image: '/icons/navbar/reporting-unselected.png',
                        subItems: [
                            {
                                title: 'Customer Report',
                                link: '/reporting/customer-report',
                                hasChild: true,
                                subChildren: [
                                    {
                                        title: 'Customer Accounts',
                                        link: '/reporting/customer-report/customer-accounts'
                                    },
                                    {
                                        title: 'Non Returning Customers',
                                        link: '/reporting/customer-report/non-returning-customers'
                                    },
                                    {
                                        title: 'Outstanding Credits',
                                        link: '/reporting/customer-report/outstanding-credits'
                                    },
                                    {
                                        title: 'Customer Payable',
                                        link: '/reporting/customer-report/customer-payable'
                                    },
                                    {
                                        title: 'Customer Retention',
                                        link: '/reporting/customer-report/customer-retention'
                                    },
                                    {
                                        name: "Customer Expiring Packages",
                                        link: '/reporting/customer-report/customer-expiring-packages'
                                    },
                                    {
                                        name: "No Ride Activity",
                                        link: '/reporting/customer-report/no-ride-activity'
                                    },
                                    {
                                        title: 'Top Riders',
                                        link: '/reporting/customer-report/top-riders'
                                    }
                                ]
                            },
                            {
                                title: 'Class Report',
                                link: '/reporting/class-report',
                                hasChild: true,
                                subChildren: [
                                    {
                                        title: 'Attendance Summary',
                                        link: '/reporting/class-report/attendance-summary'
                                    },
                                    {
                                        title: 'Attendance with Revenue',
                                        link: '/reporting/class-report/attendance-with-revenue'
                                    },
                                    // {
                                    //     title: 'Attendance by Schedule',
                                    //     link: '/reporting/class-report/attendance-by-schedule'
                                    // },
                                    {
                                        title: 'Attendance by Timeslot',
                                        link: '/reporting/class-report/attendance-by-timeslot'
                                    },
                                    {
                                        title: 'Attendance by Month',
                                        link: '/reporting/class-report/attendance-by-month'
                                    },
                                    {
                                        title: 'Summary of Instructor Subbing per Period',
                                        link: '/reporting/class-report/summary-of-instructor-subbing-per-period'
                                    },
                                    {
                                        title: 'Instructor Attendance Summary',
                                        link: '/reporting/class-report/instructor-attendance-summary'
                                    },
                                    {
                                        title: 'Attendance Export',
                                        link: '/reporting/class-report/attendance-export'
                                    }
                                ]
                            },
                            {
                                title: 'Class Package Report',
                                link: '/reporting/class-package-report',
                                hasChild: true,
                                subChildren: [
                                    {
                                        title: 'Remaining Class Package Value',
                                        link: '/reporting/class-package-report/remaining-class-package-value'
                                    },
                                    {
                                        title: 'Revenue From Class Package Expiration',
                                        link: '/reporting/class-package-report/revenue-from-class-package-expiration'
                                    },
                                    {
                                        title: 'Average Time to Utilize Packages',
                                        link: '/reporting/class-package-report/average-time-to-utilize-packages'
                                    },
                                    {
                                        title: 'Earned Package Revenue',
                                        link: '/reporting/class-package-report/earned-package-revenue'
                                    },
                                ]
                            },
                            {
                                title: 'Sales Report',
                                link: '/reporting/sales-report',
                                hasChild: true,
                                subChildren: [
                                    {
                                        title: 'Sales & Transactions',
                                        link: '/reporting/sales-report/sales-and-transactions'
                                    },
                                    {
                                        title: 'Sales by Payment Type',
                                        link: '/reporting/sales-report/sales-by-payment-type'
                                    },
                                    {
                                        title: 'Sales by Class Package',
                                        link: '/reporting/sales-report/sales-by-class-package'
                                    },
                                    {
                                        title: 'Sales by Subscription',
                                        link: '/reporting/sales-report/sales-by-subscription'
                                    },
                                    {
                                        title: 'Sales by Products',
                                        link: '/reporting/sales-report/sales-by-products'
                                    },
                                    {
                                        title: 'Store Credits Report',
                                        link: '/reporting/sales-report/store-credits-report'
                                    },
                                    {
                                        title: 'Revenue Summary',
                                        link: '/reporting/sales-report/revenue-summary'
                                    },
                                    {
                                        title: 'Promotions Redeemed',
                                        link: '/reporting/sales-report/promotions-redeemed'
                                    },
                                    {
                                        title: 'Gift Cards Report',
                                        link: '/reporting/sales-report/gift-cards-report'
                                    },
                                    {
                                        title: 'Sales by Customer',
                                        link: '/reporting/sales-report/sales-by-customer'
                                    },
                                    {
                                        title: 'Sales Export',
                                        link: '/reporting/sales-report/sales-export'
                                    }
                                ]
                            },
                            {
                                title: 'Inventory Value Report',
                                link: '/reporting/inventory-value-report',
                                hasChild: false,
                            }
                        ]
                    },
                    {
                        title: 'Admin',
                        link: '/admin',
                        hasLink: false,
                        class: 'admin',
                        image: '/icons/navbar/admin-unselected.png',
                        subItems: [
                            {
                                title: 'Users and Roles',
                                link: '/admin/users-and-roles'
                            },
                            {
                                title: 'Classes and Packages',
                                link: '/admin/classes-and-packages'
                            },
                            {
                                title: 'Configuration',
                                link: '/admin/configuration'
                            },
                        ]
                    }
                ],
                isHovered: false
            }
        },
        methods: {
            resetHoverToggle () {
                const me = this
                me.isHovered = true
                const elements = document.querySelectorAll('.nav_list .toggled .sub_wrapper')
                if (me.isHovered) {
                    document.querySelector('.navbar_container').classList.add('toggled')
                    // document.querySelector('.admin_flex .content').classList.add('toggled')
                    elements.forEach((element, index) => {
                        setTimeout( () => {
                            const length = element.querySelectorAll('.sub_nav_list').length
                            const height = 46
                            const currentHeight = height * length
                            element.style.height = `${currentHeight}px`
                        }, 300)
                    })
                }
            },
            resetLeaveToggle () {
                const me = this
                const elements = document.querySelectorAll('.nav_list .toggled .sub_wrapper')
                document.querySelector('.navbar_container').classList.remove('toggled')
                // document.querySelector('.admin_flex .content').classList.remove('toggled')
                elements.forEach((element, index) => {
                    setTimeout( () => {
                        const length = element.querySelectorAll('.sub_nav_list').length
                        const height = element.querySelector('.sub_nav_list').scrollHeight
                        const currentHeight = height * length
                        element.style.height = `${currentHeight}px`
                    }, 500)
                })
                me.isHovered = false
            },
            resetToggle () {
                document.querySelector('.navbar_container').classList.remove('toggled')
                // document.querySelector('.admin_flex .content').classList.remove('toggled')
            },
            toggleChild (event) {
                const me = this
                const target = event.target
                if (!target.parentNode.classList.contains('toggled')) {
                    target.nextElementSibling.style.height = `${target.nextElementSibling.scrollHeight}px`
                    target.parentNode.classList.add('toggled')
                } else {
                    target.nextElementSibling.style.height = 0
                    target.parentNode.classList.remove('toggled')
                }
            },
            toggleSubChild (data) {
                const me = this
                document.querySelector('.navbar_container').classList.add('toggled')
                if (data.hasChild) {
                    me.thirdNavItems = data.subChildren
                    me.hasToggleThirdLevel = true
                }
            },
            back () {
                const me = this
                me.thirdNavItems = null
                me.hasToggleThirdLevel = false
                setTimeout( () => {
                    me.checkHeightViewport()
                }, 500)
            },
            checkHeightViewport () {
                const me = this
                let heightToDeduct = document.querySelector('.navbar_container .navbar .logo')
                if (document.documentElement && document.documentElement.clientHeight) {
                    document.querySelector('.navbar_container .navbar .nav_list').style.maxHeight = `${document.documentElement.clientHeight - heightToDeduct.scrollHeight}px`
                }
            }
        },
        mounted () {
            const me = this
            me.checkHeightViewport()
            if (me.$store.state.user.staff_details != null) {
                me.getNavItems(this)
            }
        },
        beforeMount () {
            window.addEventListener('load', this.checkHeightViewport)
            window.addEventListener('resize', this.checkHeightViewport)
        },
        beforeDestroy () {
            window.removeEventListener('resize', this.checkHeightViewport)
            window.removeEventListener('load', this.checkHeightViewport)
        }
    }
</script>
