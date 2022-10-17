<template>
  <div class="default_modal">
      <div class="background" @click.once="toggleClose()"></div>
      <div class="confirmation_wrapper">
          <div class="confirmation_text">
              Please confirm if you want to publish this date. Classes under this date will be activated and bookable to the website.
          </div>
          <div class="button_group alternate">
              <div class="form_group">
                  <input type="password" name="curent_user_password" placeholder="Enter your password" class="default_text" v-model="form.password" v-validate="'required'">
                  <transition name="slide"><span class="validation_errors" v-if="errors.has('curent_user_password')">{{ properFormat(errors.first('curent_user_password')) }}</span></transition>
              </div>
              <div class="action_success_btn confirm margin" @click="proceedStatus()">Confirm</div>
          </div>
      </div>
  </div>
</template>

<script>
  export default {
      props: {
          value: {
              type: String,
              default: 0
          }
      },
      data () {
          return {
              form: {
                  password: ''
              }
          }
      },
      methods: {
          toggleClose () {
              const me = this
              me.$store.state.calendarPublishStatus = false
              document.body.classList.remove('no_scroll')
          },
          proceedStatus () {
              const me = this
              me.loader(true)
              let token = me.$cookies.get('70hokcotc3hhhn5')
              let formData = new FormData()
              formData.append('password', me.form.password)
              me.$axios.post('api/users/validate-password', formData, {
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              }).then(res => {
                  if (res.data) {
                      let date = me.value
                      let form_data_publish = new FormData()
                      form_data_publish.append('date', date)
                      form_data_publish.append('studio_id', me.$parent.form.studio_id)
                      me.$axios.post('api/schedules/publish-classes', form_data_publish, {
                          headers: {
                              Authorization: `Bearer ${token}`
                          }
                      }).then(res => {
                          if (res.data) {
                              me.$parent.message = `Successfully pubished this day.`
                              me.$store.state.calendarActionSuccess = true
                              me.$store.state.calendarPublishStatus = false
                              me.$parent.generateCalendar(me.$parent.currentYear, me.$parent.currentMonth, 0, 0)
                              document.body.classList.remove('no_scroll')
                          }
                      }).catch(err => {
                          me.$store.state.errorOverlayStatus = true
                          me.$store.state.errorList = err.response.data.errors
                          me.$store.state.errorStatus = true
                      })
                  }
              }).catch(err => {
                  me.$store.state.errorOverlayStatus = true
                  me.$store.state.errorList = err.response.data.errors
                  me.$store.state.errorStatus = true
                  me.loader(false)
              })
          }
      }
  }
</script>
