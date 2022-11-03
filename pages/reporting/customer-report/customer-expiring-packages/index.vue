<template>
  <transition name="fade">
      <div class="content" v-if="loaded">
          <div id="admin" class="cms_dashboard">
              <section id="top_content" class="table">
                  <div class="action_wrapper">
                      <div>
                          <div class="header_title">
                              <h1>Customer Expiring Packages</h1>
                              <span>{{ $moment(form.cut_off).format('MMMM DD, YYYY') }}</span>
                          </div>
                      </div>
                      <div class="actions">
                          <div class="action_btn alternate" @click="getCustomers()">
                              Export
                          </div>
                          <download-csv
                              v-if="res.customers.data.length > 0"
                              class="hidden me"
                              :data="customerExpiringPackagesAttributes"
                              :name="`customer-expiring-packages-${$moment(form.cut_off).format('MM-DD-YY-hh-mm')}.csv`">
                              Export
                          </download-csv>
                      </div>
                  </div>
                  <div class="filter_wrapper">
                      <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                          <div class="form_group alternate">
                              <label for="q">Find a Customer</label>
                              <input type="text" name="q" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate" v-model="form.query">
                          </div>
                          <div class="form_group margin">
                              <label for="cut_off">Cut-off Date <span>*</span></label>
                              <v-ctk v-model="form.cut_off" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'cut_off'" :name="'cut_off'" :label="'Select cut date'" v-validate="'required'" :min-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                              <transition name="slide"><span class="validation_errors" v-if="errors.has('cut_off')">{{ properFormat(errors.first('cut_off')) }}</span></transition>
                          </div>
                          <div class="form_group margin">
                              <label for="to_add">Days to Add</label>
                              <input type="number" name="to_add" autocomplete="off" placeholder="X" class="default_text" v-model="form.to_add">
                          </div>
                          <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                      </form>
                  </div>
              </section>
              <section id="content">
                  <table class="cms_table">
                      <thead>
                          <tr>
                              <th class="stick">Member ID</th>
                              <th class="stick">Customer</th>
                              <th class="stick">Customer Type</th>
                              <th class="stick">Class Package</th>
                              <th class="stick">Class Package Expiration</th>
                              <th class="stick">Sign Up Date</th>
                              <th class="stick">Contact Number</th>
                              <th class="stick">Email Address</th>
                              <th class="stick">Action</th>
                          </tr>
                      </thead>
                      <tbody v-if="res.customers.data.length > 0">
                          <tr v-for="(data, key) in res.customers.data" :key="key">
                              <td>{{ data.customer.member_id }}</td>
                              <td>
                                  <div class="thumb">
                                      <img :src="data.customer.customer_details.images[0].path_resized" v-if="data.customer.customer_details.images[0].path != null" />
                                      <div class="table_image_default" v-else>
                                          <div class="overlay">
                                              {{ data.customer.first_name.charAt(0) }}{{ data.customer.last_name.charAt(0) }}
                                          </div>
                                      </div>
                                      <div class="table_data_link" @click="openWindow(`/customers/${data.customer.id}/packages`)">{{ data.customer.fullname }}</div>
                                  </div>
                              </td>
                              <td>{{ data.customer.customer_details.customer_type.name }}</td>
                              <td>{{ data.class_package.name }}</td>
                              <td>{{ $moment(data.user_package.computed_expiration_date).format('MMMM DD, YYYY') }}</td>
                              <td>{{ $moment(data.customer.created_at).format('MMMM DD, YYYY') }}</td>
                              <td>{{ (data.customer.customer_details.co_contact_number != null) ? data.customer.customer_details.co_contact_number : (data.customer.customer_details.ec_contact_number) ? data.customer.customer_details.ec_contact_number : 'N/A' }}</td>
                              <td>{{ data.customer.email }}</td>
                              <td>
                                  <div class="table_actions">
                                      <a class="table_action_cancel" @click.self="customerStatus(data.customer, 'deactivate')" href="javascript:void(0)" v-if="data.customer.enabled">Deactivate</a>
                                      <a class="table_action_success" @click.self="customerStatus(data.customer, 'activate')" href="javascript:void(0)"  v-else>Activate</a>
                                  </div>
                              </td>
                          </tr>
                      </tbody>
                      <tbody class="no_results" v-else>
                          <tr>
                              <td :colspan="rowCount">No Result(s) Found.</td>
                          </tr>
                      </tbody>
                  </table>
                  <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" />
              </section>
          </div>
          <transition name="fade">
              <foot v-if="$store.state.isAuth" />
          </transition>
          <transition name="fade">
              <customer-prompt :status="promptMessage" ref="enabled" v-if="$store.state.customerPromptStatus" />
          </transition>
      </div>
  </transition>
</template>

<script>
  import CustomerPrompt from '~/components/modals/CustomerPrompt'
  import Pagination from '~/components/Pagination'
  import Foot from '~/components/Foot'

  export default {
      components: {
          CustomerPrompt,
          Pagination,
          Foot
      },
      data () {
          const values = []
          return {
              name: 'Customer Expiring Packages',
              access: true,
              loaded: false,
              filter: true,
              rowCount: 0,
              promptMessage: '',
              res: [],
              values: [],
              total: 0,
              form: {
                  query: '',
                  cut_off: this.$moment().format('YYYY-MM-DD'),
                  to_add: 0
              }
          }
      },
      computed: {
          customerExpiringPackagesAttributes () {
              const me = this
              return [
                  ...me.values.map((value, key) => ({
                      'Member ID': value.customer.member_id,
                      'Customer': value.customer.fullname,
                      'Customer Type': value.customer.customer_details.customer_type.name,
                      'Class Package': value.class_package.name,
                      'Class Package Expiration': me.$moment(value.user_package.computed_expiration_date).format('MMMM DD, YYYY'),
                      'Gender': me.getCustomerDetails(value.customer, 'gender'),
                      'Birthdate': me.$moment(value.customer.customer_details.co_birthdate).format('MMM DD, YYYY'),
                      'Age': -(me.$moment(value.customer.customer_details.co_birthdate).diff(me.$moment(), 'years')),
                      'Contact Number': me.getCustomerDetails(value.customer, 'contact_number'),
                      'Email Address': value.customer.email,
                      'Weight': me.getCustomerDetails(value.customer, 'weight'),
                      'Shoe Size': me.getCustomerDetails(value.customer, 'shoe_size'),
                      'Dumbbell': me.getCustomerDetails(value.customer, 'dumbbell'),
                      'Personal Address': me.getCustomerDetails(value.customer, 'personal'),
                      'Personal Address Region': value.customer.customer_details.personal_state,
                      'Personal Address City': value.customer.customer_details.pa_city,
                      'Billing Address': me.getCustomerDetails(value.customer, 'billing'),
                      'Billing Address Region': value.customer.customer_details.billing_state,
                      'Billing Address City': value.customer.customer_details.ba_city,
                      'Sign Up Date': me.$moment(value.customer.created_at).format('MMMM DD, YYYY')
                  }))
              ]
          }
      },
      methods: {
          customerStatus (data, type) {
              const me = this
              if (data.enabled) {
                  me.promptMessage = 'Deactivate'
              } else {
                  me.promptMessage = 'Activate'
              }
              me.$store.state.customerPromptStatus = true
              setTimeout( () => {
                  me.$refs.enabled.confirm.table_name = 'users'
                  me.$refs.enabled.confirm.id = data.id
                  me.$refs.enabled.confirm.enabled = (type == 'deactivate') ? 0 : 1
                  me.$refs.enabled.confirm.status = (type == 'deactivate') ? 'deactivated' : 'activated'
                  me.$refs.enabled.confirm.type = 'user'
              }, 100)
              document.body.classList.add('no_scroll')
          },
          submissionSuccess () {
              const me = this
              me.loader(true)
              setTimeout( () => {
                  let formData = new FormData(document.getElementById('filter'))

                  me.$axios.post('api/reporting/customers/customer-expiring-packages', formData).then(res => {
                      if (res.data) {
                          setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.customers.total
                          }, 500)
                      }
                  }).catch(err => {
                      me.$store.state.errorList = err.response.data.errors
                      me.$store.state.errorStatus = true
                  }).then(() => {
                      setTimeout( () => {
                          me.rowCount = document.getElementsByTagName('th').length
                          me.loader(false)
                      }, 500)
                  })
              }, 10)
          },
          getCustomerDetails (data, type) {
              const me = this
              let result = ''

              switch (type) {
                  case 'gender':
                      result = (data.customer_details.co_sex) ? (data.customer_details.co_sex == 'F' ? 'Female' : 'Male') : 'N/A'
                      break
                  case 'contact_number':
                      result = (data.customer_details.co_contact_number != null) ? data.customer_details.co_contact_number : (data.customer_details.ec_contact_number) ? data.customer_details.ec_contact_number : 'N/A'
                      break
                  case 'weight':
                      result = (data.customer_details.co_weight) ? data.customer_details.co_weight : 'N/A'
                      break
                  case 'shoe_size':
                      result = (data.customer_details.co_shoe_size) ? data.customer_details.co_shoe_size : 'N/A'
                      break
                  case 'dumbbell':
                      result = (data.customer_details.dumbbell) ? data.customer_details.dumbbell : 'N/A'
                      break
                  case 'personal':
                      if (data.customer_details.pa_address) {
                          result += data.customer_details.pa_address
                          if (data.customer_details.pa_address_2) {
                              result += `, ${data.customer_details.pa_address_2}`
                          }
                          if (data.customer_details.pa_zip_code) {
                              result += `, ${data.customer_details.pa_zip_code}`
                          }
                          if (data.customer_details.personal_state) {
                              result += `, ${data.customer_details.personal_state}`
                          }
                          if (data.customer_details.pa_city) {
                              result += `, ${data.customer_details.pa_city}`
                          }
                          if (data.customer_details.personal_country) {
                              result += `, ${data.customer_details.personal_country}`
                          }
                      } else {
                          result = 'N/A'
                      }
                      break
                  case 'billing':
                      if (data.customer_details.ba_address) {
                          result += data.customer_details.ba_address
                          if (data.customer_details.ba_address_2) {
                              result += `, ${data.customer_details.ba_address_2}`
                          }
                          if (data.customer_details.ba_zip_code) {
                              result += `, ${data.customer_details.ba_zip_code}`
                          }
                          if (data.customer_details.billing_state) {
                              result += `, ${data.customer_details.billing_state}`
                          }
                          if (data.customer_details.ba_city) {
                              result += `, ${data.customer_details.ba_city}`
                          }
                          if (data.customer_details.billing_country) {
                              result += `, ${data.customer_details.billing_country}`
                          }
                      } else {
                          result = 'N/A'
                      }
                      break
              }

              return result
          },
          getCustomers () {
              const me = this
              let formData = new FormData(document.getElementById('filter'))
              me.values = []
              me.loader(true)

              me.$axios.post('api/reporting/customers/customer-expiring-packages?all=1', formData).then(res => {
                  if (res.data) {
                      me.values = res.data.customers
                  }
              }).catch((err) => {

              }).then(() => {
                  me.loader(false)
                  document.querySelector('.me').click()
              })
          },
          openWindow (slug) {
              const me = this
              window.open(`${window.location.origin}${slug}`, '_blank', `location=yes,height=768,width=1280,scrollbars=yes,status=yes,left=${document.documentElement.clientWidth / 2},top=${document.documentElement.clientHeight / 2}`)
          },
          fetchData () {
              const me = this
              me.loader(true)
              let formData = new FormData()

              formData.append('q', me.form.query)
              formData.append('cut_off', me.form.cut_off)
              formData.append('to_add', me.form.to_add)

              me.$axios.post('api/reporting/customers/customer-expiring-packages', formData).then(res => {
                  if (res.data) {
                      setTimeout( () => {
                          me.res = res.data
                          me.total = res.data.customers.total
                          if (!me.loaded) {
                              me.loaded = true
                          }
                      }, 500)
                  }
              }).catch(err => {
                  me.$store.state.errorList = err.response.data.errors
                  me.$store.state.errorStatus = true
              }).then(() => {
                  setTimeout( () => {
                      me.rowCount = document.getElementsByTagName('th').length
                      me.loader(false)
                  }, 500)
              })
          }
      },
      mounted () {
          const me = this
          me.checkPagePermission(me)
          if (me.access) {
              me.fetchData()
          } else {
              me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
          }
          setTimeout( () => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
          }, 500)
      }
  }
</script>
