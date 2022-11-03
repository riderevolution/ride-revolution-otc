<template>
	<transition name="fade">
		<div class="content" v-if="loaded">
			<div id="admin" class="cms_dashboard">
				<section id="top_content" class="table">
					<nuxt-link :to="`/admin/${prevRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(prevRoute) }}</span></nuxt-link>
					<div class="action_wrapper">
						<h1 class="header_title">Add a Role</h1>
					</div>
				</section>
				<section id="content">
					<form id="default_form" @submit.prevent="submissionSuccess()">
						<div class="form_wrapper">
							<div class="form_header_wrapper">
								<h2 class="form_title">Role Details</h2>
							</div>
							<div class="form_main_group">
								<div class="form_group">
									<label for="display_name">Role Name <span>*</span></label>
									<input type="text" name="display_name" autocomplete="off" class="default_text" v-validate="'required|min:2|max:100'">
									<transition name="slide"><span class="validation_errors" v-if="errors.has('display_name')">{{ properFormat(errors.first('display_name')) }}</span></transition>
								</div>
								<div class="form_flex select_all">
									<label class="flex_label alternate">Select permissions under this role <span>*</span></label>
									<div class="form_flex_radio">
										<div class="form_radio">
											<input type="radio" id="admin_access" value="1" name="permission_admin" v-validate="'required'" class="action_radio">
											<label for="admin_access">Dashboard (Admin)</label>
										</div>
										<div class="form_radio">
											<input type="radio" id="front_desk" value="0" name="permission_admin" v-validate="'required'" class="action_radio">
											<label for="front_desk">Dashboard (Front Desk)</label>
										</div>
										<transition name="slide"><span class="validation_errors" v-if="errors.has('permission_admin')">{{ properFormat(errors.first('permission_admin')) }}</span></transition>
									</div>
								</div>
								<div class="form_flex start">
									<div class="form_check select_all">
										<div :class="`custom_action_check ${(checkPermissions) ? 'checked' : ''}`" @click.prevent="toggleSelectAllPermissions($event)">Select All</div>
									</div>
									<div class="form_group">
										<div class="form_check" v-for="(permission, key) in permissionsPages" :key="key">
											<input type="checkbox" :id="`permission_page_${key}`" name="permissions[]" :class="`action_check ${permission.class}`" v-model="permission.checked" :checked="permission.checked" v-if="!permission.parent">
											<label :for="`permission_page_${key}`" :class="`${(permission.parent) ? 'parent' : ''}`">{{ permission.name }}</label>
										</div>
										<transition name="slide"><span class="validation_errors" v-if="hasPermissions">The Permissions field is required</span></transition>
									</div>
									<div class="form_group">
										<div class="form_check" v-for="(permission, key) in permissionsReporting" :key="key">
											<input type="checkbox" :id="`permission_reporting_${key}`" name="permissions[]" :class="`action_check ${permission.class}`" v-model="permission.checked" :checked="permission.checked" v-if="!permission.parent">
											<label :for="`permission_reporting_${key}`" :class="`${(permission.parent) ? 'parent' : ''}`">{{ permission.name }}</label>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="form_footer_wrapper">
							<div class="form_flex">
								<div class="form_check">
									<input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
									<label for="enabled">Activate</label>
								</div>
								<div class="button_group">
									<nuxt-link :to="`/admin/${prevRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
									<button type="submit" name="submit" class="action_btn alternate margin">Save</button>
								</div>
							</div>
						</div>
					</form>
				</section>
			</div>
			<foot v-if="$store.state.isAuth" />
		</div>
	</transition>
</template>

<script>
	import Foot from '../../../../components/Foot'
	export default {
		components: {
			Foot
		},
		data () {
			return {
				name: 'Users and Roles',
				loaded: false,
				access: true,
				hasPermissions: false,
				permissionsPages: [
					{
						"name": "Booker",
						"class": "parent",
						"checked": true
					},
					{
						"name": "Scheduler",
						"class": "parent",
						"checked": true
					},
					{
						"name": "Class Schedule",
						"class": "child",
						"checked": true
					},
					{
						"name": "Instructor Availability",
						"class": "child",
						"checked": true
					},
					{
						"name": "Customers",
						"class": "parent",
						"checked": true
					},
					{
						"name": "Instructors",
						"class": "parent",
						"checked": true
					},
					{
						"name": "Retail",
						"class": "parent",
						"checked": true,
						"parent": true
					},
					{
						"name": "Suppliers",
						"class": "child",
						"checked": true
					},
					{
						"name": "Inventory",
						"class": "child",
						"checked": true
					},
					{
						"name": "Physical Count",
						"class": "child",
						"checked": true
					},
					{
						"name": "Purchase Order",
						"class": "child",
						"checked": true
					},
					{
						"name": "Products",
						"class": "child",
						"checked": true
					},
					{
						"name": "Product Categories",
						"class": "child",
						"checked": true
					},
					{
						"name": "Promotions",
						"class": "child",
						"checked": true
					},
					{
						"name": "Physical Gift Cards",
						"class": "child",
						"checked": true
					},
					{
						"name": "Studio Receiving",
						"class": "parent",
						"checked": false
					},
					{
						"name": "Admin Configuration",
						"class": "parent",
						"checked": true,
						"parent": true
					},
					{
						"name": "Users and Roles",
						"class": "child",
						"checked": true
					},
					{
						"name": "Classes and Packages",
						"class": "child",
						"checked": true
					},
					{
						"name": "Configuration",
						"class": "child",
						"checked": true
					}
				],
				permissionsReporting: [
					{
						"name": "Customer Report",
						"class": "parent",
						"checked": true,
						"parent": true
					},
					{
						"name": "Customer Accounts",
						"class": "child",
						"checked": true
					},
					{
						"name": "Customer Sign Ups",
						"class": "child",
						"checked": true
					},
					{
						"name": "Non Returning Customers",
						"class": "child",
						"checked": true
					},
					{
						"name": "Outstanding Credits",
						"class": "child",
						"checked": true
					},
					{
						"name": "Customer Retention",
						"class": "child",
						"checked": true
					},
					{
						"name": "Customer Payable",
						"class": "child",
						"checked": true
					},
					{
						"name": "Customer Expiring Packages",
						"class": "child",
						"checked": true
					},
					{
						"name": "No Ride Activity",
						"class": "child",
						"checked": true
					},
					{
						"name": "Top Riders",
						"class": "child",
						"checked": true
					},
					{
						"name": "Class Report",
						"class": "parent",
						"checked": true,
						"parent": true
					},
					{
						"name": "Attendance Summary",
						"class": "child",
						"checked": true
					},
					{
						"name": "Attendance with Revenue",
						"class": "child",
						"checked": true
					},
					{
						"name": "Attendance by Schedule",
						"class": "child",
						"checked": true
					},
					{
						"name": "Attendance by Timeslot",
						"class": "child",
						"checked": true
					},
					{
						"name": "Attendance Export",
						"class": "child",
						"checked": true
					},
					{
						"name": "Attendance by Month",
						"class": "child",
						"checked": true
					},
					{
						"name": "Summary of Instructor Subbing per Period",
						"class": "child",
						"checked": true
					},
					{
						"name": "Instructor Attendance Summary",
						"class": "child",
						"checked": true
					},
					{
						"name": "Class Package Report",
						"class": "parent",
						"checked": true,
						"parent": true
					},
					{
						"name": "Remaining Class Package Value",
						"class": "child",
						"checked": true
					},
					{
						"name": "Revenue From Class Package Expiration",
						"class": "child",
						"checked": true
					},
					{
						"name": "Average Time to Utilize Packages",
						"class": "child",
						"checked": true
					},
					{
						"name": "Earned Package Revenue",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales Report",
						"class": "parent",
						"checked": true,
						"parent": true
					},
					{
						"name": "Sales & Transactions",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales by Payment Type",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales by Class Package",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales by Subscription",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales by Products",
						"class": "child",
						"checked": true
					},
					{
						"name": "Store Credits Report",
						"class": "child",
						"checked": true
					},
					{
						"name": "Revenue Summary",
						"class": "child",
						"checked": true
					},
					{
						"name": "Promotions Redeemed",
						"class": "child",
						"checked": true
					},
					{
						"name": "Gift Cards Report",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales by Customer",
						"class": "child",
						"checked": true
					},
					{
						"name": "Sales Export",
						"class": "child",
						"checked": true
					},
					{
						"name": "Inventory Value Report",
						"class": "parent",
						"checked": true
					}
				],
				res: [],
				lastRoute: '',
				prevRoute: '',
			}
		},
		computed: {
			checkPermissions () {
				const me = this
				let count = 0
				let result = false
				me.permissionsPages.forEach((data, index) => {
					if (data.checked) {
						count++
					}
				})
				me.permissionsReporting.forEach((data, index) => {
					if (data.checked) {
						count++
					}
				})
				if (count == me.permissionsPages.length + me.permissionsReporting.length) {
					result = true
				} else {
					result = false
				}
				return result
			}
		},
		methods: {
			toggleSelectAllPermissions (event) {
				const me = this
				if (me.checkPermissions) {
					me.permissionsPages.forEach((data, index) => {
						data.checked = false
					})
					me.permissionsReporting.forEach((data, index) => {
						data.checked = false
					})
				} else {
					me.permissionsPages.forEach((data, index) => {
						data.checked = true
					})
					me.permissionsReporting.forEach((data, index) => {
						data.checked = true
					})
				}
				if (event.target.classList.contains('checked')) {
					event.target.classList.remove('checked')
				} else {
					event.target.classList.add('checked')
				}
			},
			submissionSuccess () {
				const me = this
				let ctr = 0
				me.$validator.validateAll().then(valid => {
					me.permissionsPages.forEach((data, index) => {
						if (data.checked) {
							ctr++
						}
					})
					me.permissionsReporting.forEach((data, index) => {
						if (data.checked) {
							ctr++
						}
					})
					me.hasPermissions = (ctr > 0) ? false : true
					if (valid && !me.hasPermissions) {
						let token = me.$cookies.get('70hokcotc3hhhn5')
						let formData = new FormData(document.getElementById('default_form'))
						let permissions = []
						me.permissionsPages.forEach((data, index) => {
							permissions.push(data)
						})
						me.permissionsReporting.forEach((data, index) => {
							permissions.push(data)
						})
						formData.append('permissions_pages', JSON.stringify(me.permissionsPages))
						formData.append('permissions_reporting', JSON.stringify(me.permissionsReporting))
						me.loader(true)
						me.$axios.post('api/roles', formData, {
							headers: {
								Authorization: `Bearer ${token}`
							}
						}).then(res => {
							setTimeout( () => {
								if (res.data) {
									me.notify('Content has been created')
									me.$router.push(`/admin/${me.prevRoute}`)
								}
							}, 500)
						}).catch(err => {
							me.$store.state.errorList = err.response.data.errors
							me.$store.state.errorStatus = true
						}).then(() => {
							setTimeout( () => {
								me.loader(false)
							}, 500)
							document.body.classList.remove('no_scroll')
						})
					} else {
						me.$scrollTo('.validation_errors', {
							offset: -250
						})
					}
				})
			},
		},
		async mounted () {
			const me = this
			await me.checkPagePermission(me)
			if (me.access) {
				me.loaded = true
			} else {
				me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
			}
			me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
			me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
		}
	}
</script>
