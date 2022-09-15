<template lang="">
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>{{ user_package.user.fullname }} - {{ user_package.class_package.name }}</h1>
                            </div>
                            <h2 class="header_subtitle">Package Logs</h2>
                        </div>
                        <div class="actions">
                            <div class="action_btn alternate" @click="getLogs()" v-if="res.results.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.results.data.length > 0"
                                class="hidden me"
                                :data="logsAttributes"
                                :name="`${user_package.user.fullname}-${user_package.class_package.name}-package-logs-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="fetchData(true)">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :max-date="$moment().format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table">
                        <thead>
                            <tr>
                                <th class="stick">#</th>
                                <th class="stick">Action By</th>
                                <th class="stick">User</th>
                                <th class="stick">Message</th>
                                <th class="stick">Remarks</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.results.data.length > 0">
                            <tr v-for="(data, key) in res.results.data" :key="key">
                                <td>{{ key + 1 }}</td>
                                <td>{{ getActionBy(data) }}</td>
                                <td>{{ data.user.fullname }}</td>
                                <td>{{ data.message }}</td>
                                <td>{{ (data.remarks) ? data.remarks : 'N/A' }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="5">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.results.path" :current="res.results.current_page" :last="res.results.last_page" />
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
  import Foot from '~/components/Foot'
  import Pagination from '~/components/Pagination'

  export default {
    components: {
      Foot,
      Pagination
    },
    data: ({ $moment }) => ({
      loaded: false,
      filter: true,
      name: 'Customers',
      res: null,
      user_package: null,
      values: [],
      form: {
        start_date: $moment().subtract(1, 'month').format('YYYY-MM-DD'),
        end_date: $moment().format('YYYY-MM-DD')
      }
    }),
    computed: {
      logsAttributes () {
        return [
          ...this.values.map(value => ({
            'Date Created': this.$moment(value.created_at).format('MMM DD, YYYY hh:mm A'),
            'Action by': this.getActionBy(value),
            'User': value.user.fullname,
            'Message': value.message,
            'Remarks': (value.remarks) ? value.remarks : 'N/A'
          }))
        ]
      }
    },
    methods: {
      getActionBy (value) {
        let result = ''
        if (value.customer_details) {
          result = 'Customer'
        } else {
          result = 'Employee'
        }

        return result
      },
      getLogs () {
        let formData = new FormData(document.getElementById('filter'))
        formData.append('export', 1)
        this.values = []

        this.loader(true)
        this.$axios.post(`api/extras/package-logs/${this.$route.params.package_id}`, formData).then(res => {
            if (res.data) {
                this.values = res.data.results
            }
        }).catch((err) => {

        }).then(() => {
            this.loader(false)
            document.querySelector('.me').click()
        })
      },
      fetchData (filter = false) {
        let formData = null
        if (filter) {
          formData = new FormData(document.getElementById('filter'))
          formData.append('filter', 1)
        }
        
        this.loader(true)
        this.$axios.post(`api/extras/package-logs/${this.$route.params.package_id}`, formData).then(res => {
          this.res = res.data
          this.user_package = res.data.user_package
        }).catch(err => {
          this.$store.state.errorList = err.response.data.errors
          this.$store.state.errorStatus = true
        }).then(() => {
          setTimeout( () => {
            this.loaded = true
            this.loader(false)
          }, 500)
        })
      }
    },
    async mounted () {
      await this.checkPagePermission(this)
      if (this.access) {
        this.fetchData()
      } else {
        this.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
      }
    }
  }
</script>