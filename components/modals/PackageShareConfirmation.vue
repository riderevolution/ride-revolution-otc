<template>
  <div class="default_modal">
      <div class="background" @click.once="toggleClose(false)"></div>
      <div class="confirmation_wrapper">
          <div class="confirmation_text mb-10">
              Are you sure you want to unshare this package to {{ data.user.fullname }}?
          </div>
            <div class="form_group">
                <label for="remarks">Notes/Remarks</label>
                <textarea name="remarks" rows="8" id="remarks" class="default_text" v-model="form.remarks" placeholder="Enter remarks"></textarea>
            </div>
          <div class="button_group">
              <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose(false)">Cancel</a>
              <div class="action_success_btn confirm margin alternate" @click.once="toggleClose(true)">Confirm</div>
          </div>
      </div>
  </div>
</template>

<script>
  export default {
      props: {
          data: {
              default: null
          }
      },
      data: () => ({
          form: {
              remarks: ''
          }
      }),
      methods: {
          toggleClose (status) {
              const me = this
              if (status) {
                  let token = me.$cookies.get('70hokcotc3hhhn5')
                  let formData = new FormData()
                  me.loader(true)
                  formData.append('remarks', me.form.remarks)
                  formData.append('receiver_id', me.data.user_id)
                  formData.append('user_package_count_id', me.data.user_package_count_id)
                  formData.append('sender_id', me.$parent.tempData.user_id)
                  me.$axios.post(`api/packages/class-packages/unshare`, formData, {
                      headers: {
                          Authorization: `Bearer ${token}`
                      }
                  }).then(res => {
                      if (res.data) {
                        me.$store.state.packageActionValidateStatus = false
                        setTimeout( () => {
                          if (me.$route.params.slug == 'packages') {
                            document.getElementById('packages').click()
                          }
                          me.$store.state.packageShareConfirmationStatus = false
                          me.$store.state.packageActionPromptStatus = true
                          me.$parent.packagePromptType = 'Unshare'
                          me.$parent.packagePromptMessage = 'You have successfully unshared your package.'
                        }, 500)
                      }
                  }).catch(err => {
                      me.$store.state.errorList = err.response.data.errors
                      me.$store.state.errorStatus = true
                  }).then(() => {
                      setTimeout( () => {
                          me.loader(false)
                      }, 500)
                  })
              } else {
                  me.$store.state.packageShareConfirmationStatus = false
                  document.body.classList.remove('no_scroll')
              }
          }
      }
  }
</script>
